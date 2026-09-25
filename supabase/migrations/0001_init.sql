-- ============================================================================
-- 기록용 SQL — 이 파일은 실행하기 위한 것이 아니다.
--
-- Supabase 프로젝트에는 "수업 자료" SQL로 이미 이 스키마·트리거·RLS가 적용되어 있다
-- (tasks.md T052~T054). 이 파일은 실제 SQL Editor에 적용한 원문과 같게 다시 작성한
-- 기록이며, DB를 다시 만들거나 변경하지 않는다.
--
-- contracts/database.md(설계 계약) 대비 실제 적용본의 핵심 차이:
--   - questions.user_id, answers.admin_id는 public.profiles(id)가 아니라 auth.users(id)를
--     직접 참조한다 — questions/answers와 profiles 사이에는 직접 FK가 없다. 이 때문에
--     PostgREST embed(select("*, profiles(display_name)"))가 관계를 찾지 못해 실패했고,
--     앱 코드(questionsRepository)는 profiles를 별도 쿼리로 조회하도록 수정되었다.
--   - 함수 이름: set_question_answered → mark_question_answered, current_role() → is_admin()
--     (boolean 반환, RLS에서 `role = 'admin'` 비교를 함수 안에 캡슐화).
--   - RLS 정책 이름과 grant 구성도 계약과 다르며, 아래 내용이 실제 적용본이다.
-- ============================================================================

-- ---------- 1. Tables ----------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null,
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title varchar(100) not null
    check (char_length(trim(title)) between 1 and 100),
  content text not null
    check (char_length(trim(content)) between 1 and 5000),
  status text not null default 'pending' check (status in ('pending', 'answered')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null unique references public.questions(id) on delete cascade,
  admin_id uuid not null references auth.users(id) on delete restrict,
  content text not null
    check (char_length(trim(content)) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index questions_user_id_idx on public.questions(user_id);
create index questions_created_at_idx on public.questions(created_at desc);

-- ---------- 2. Triggers ----------

-- 2.1 회원가입 시 profile 자동 생성. display_name은 raw_user_meta_data에서 가져오고,
-- role은 항상 'member'로 고정한다(관리자 승격은 SQL 직접 실행으로만 — 브라우저에서 바꿀 수 없음).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    'member'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2.2 답변 등록 시 질문 상태 자동 전환
create or replace function public.mark_question_answered()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.questions
     set status = 'answered', updated_at = now()
   where id = new.question_id;
  return new;
end;
$$;

create trigger on_answer_created
  after insert on public.answers
  for each row execute function public.mark_question_answered();

-- ---------- 3. 관리자 판별 함수 (RLS 재귀 방지) ----------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ---------- 4. RLS ----------

alter table public.profiles enable row level security;
alter table public.questions enable row level security;
alter table public.answers enable row level security;

-- profiles: 본인 행만 조회(관리자 전체 조회는 0002 파일의 보강 정책이 담당)
create policy "users can read own profile" on public.profiles
  for select using (auth.uid() = id);

-- questions: 본인 질문 또는 관리자만 조회(FR-006, FR-007, FR-016)
create policy "users can read own questions or admin can read all" on public.questions
  for select using (auth.uid() = user_id or public.is_admin());

-- questions: 회원만 자신의 이름으로 생성 가능(FR-004)
create policy "users can create own questions" on public.questions
  for insert with check (auth.uid() = user_id);

-- questions: 답변 대기 상태의 본인 질문만 수정 가능(FR-013, FR-015)
create policy "users can update pending own questions" on public.questions
  for update using (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id);

-- questions: 답변 대기 상태의 본인 질문만 삭제 가능(FR-014, FR-015)
create policy "users can delete pending own questions" on public.questions
  for delete using (auth.uid() = user_id and status = 'pending');

-- answers: 질문 작성자 본인 또는 관리자만 조회
create policy "question owner or admin can read answer" on public.answers
  for select using (
    exists (
      select 1 from public.questions q
      where q.id = question_id
        and (q.user_id = auth.uid() or public.is_admin())
    )
  );

-- answers: 관리자만 생성 가능, 본인 admin_id로만(FR-009, FR-017)
create policy "admin can create answer" on public.answers
  for insert with check (public.is_admin() and admin_id = auth.uid());

-- answers: 관리자만 수정 가능(FR-011)
create policy "admin can update answer" on public.answers
  for update using (public.is_admin())
  with check (public.is_admin());

-- answers: DELETE 정책 없음 = 기본 거부. spec.md에 답변 삭제 기능이 없다.
-- profiles: UPDATE 정책·grant 없음 = 기본 거부. 앱에서 프로필 수정 기능 자체가 없고,
-- role 변경은 SQL 직접 실행으로만 한다(헌법·plan.md §11).

-- ---------- 5. Grants ----------

grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.questions to authenticated;
grant select, insert, update on public.answers to authenticated;
