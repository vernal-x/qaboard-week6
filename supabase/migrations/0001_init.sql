-- ============================================================================
-- 기록용 SQL — 이 파일은 실행하기 위한 것이 아니다.
--
-- Supabase 프로젝트에는 "수업 자료" SQL로 이미 이 스키마·트리거·RLS가 적용되어 있다
-- (tasks.md T052~T054). 이 파일은 contracts/database.md(설계 계약)와 실제 적용본을
-- 문서상에서 대조할 수 있도록 남기는 기록이며, DB를 다시 만들거나 변경하지 않는다.
--
-- contracts/database.md 대비 실제 적용본에서 이름이 다른 식별자(사용자 확인):
--   - 답변 등록 시 질문 상태 전환 함수/트리거: contracts는 set_question_answered로 명명했으나
--     실제로는 mark_question_answered로 적용됨(동작은 동일 — INSERT on answers 후
--     해당 questions.status를 'answered'로 갱신).
--   - 관리자 판별 함수: contracts는 current_role() text 반환으로 명명했으나
--     실제로는 is_admin() boolean 반환으로 적용됨(RLS에서의 의미는 동일 —
--     public.current_role() = 'admin'  ≡  public.is_admin()).
--   - handle_new_user 트리거는 이름·동작 모두 contracts/database.md와 동일하게 적용됨.
--
-- 아래 본문은 contracts/database.md §1~§4를 실제 적용된 이름으로 다시 표기한 것이며,
-- 정확한 원문과 대조가 필요하면 Supabase 대시보드의 SQL Editor에서 직접 확인할 것.
-- ============================================================================

-- ---------- 1. Tables (contracts/database.md §1과 동일) ----------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null,
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title varchar(100) not null
    check (char_length(btrim(title)) between 1 and 100),
  content text not null
    check (char_length(btrim(content)) between 1 and 5000),
  status text not null default 'pending' check (status in ('pending', 'answered')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null unique references public.questions(id) on delete cascade,
  admin_id uuid not null references public.profiles(id),
  content text not null
    check (char_length(btrim(content)) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index questions_user_id_idx on public.questions(user_id);
create index questions_status_idx on public.questions(status);

-- ---------- 2. Triggers ----------

-- 2.1 회원가입 시 profile 자동 생성 (contracts/database.md §2.1과 이름·동작 동일)
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
-- (contracts/database.md §2.2의 set_question_answered와 동작 동일, 실제 적용명은 mark_question_answered)
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
-- (contracts/database.md §3의 current_role() text와 동작 동일, 실제 적용명은 is_admin() boolean)
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

-- ---------- 4. RLS ----------

alter table public.profiles enable row level security;
alter table public.questions enable row level security;
alter table public.answers enable row level security;

-- profiles: 본인 행만 조회 (관리자 전체 조회는 0002 파일의 추가 정책으로 보강됨)
create policy profiles_select_self on public.profiles
  for select using (auth.uid() = id);

-- profiles: 본인 행만 수정, role 컬럼은 앱에서 절대 바꾸지 않는다(role 변경은 SQL 직접 실행)
create policy profiles_update_self on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- questions: 본인 질문 또는 관리자만 조회(FR-006, FR-007, FR-016)
create policy questions_select on public.questions
  for select using (auth.uid() = user_id or public.is_admin());

-- questions: 회원만 자신의 이름으로 생성 가능(FR-004). 관리자는 질문 작성 기능이 없음.
create policy questions_insert on public.questions
  for insert with check (auth.uid() = user_id and not public.is_admin());

-- questions: 답변 대기 상태의 본인 질문만 수정 가능(FR-013, FR-015)
create policy questions_update_own_pending on public.questions
  for update using (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id);

-- questions: 답변 대기 상태의 본인 질문만 삭제 가능(FR-014, FR-015)
create policy questions_delete_own_pending on public.questions
  for delete using (auth.uid() = user_id and status = 'pending');

-- answers: 질문 작성자 본인 또는 관리자만 조회
create policy answers_select on public.answers
  for select using (
    exists (
      select 1 from public.questions q
      where q.id = question_id
        and (q.user_id = auth.uid() or public.is_admin())
    )
  );

-- answers: 관리자만 생성 가능, 본인 admin_id로만(FR-009, FR-017)
create policy answers_insert on public.answers
  for insert with check (public.is_admin() and admin_id = auth.uid());

-- answers: 관리자만 수정 가능(FR-011). 어느 관리자든 답변을 수정할 수 있다.
create policy answers_update on public.answers
  for update using (public.is_admin())
  with check (public.is_admin());

-- answers: DELETE 정책 없음 = 기본 거부. spec.md에 답변 삭제 기능이 없다.
