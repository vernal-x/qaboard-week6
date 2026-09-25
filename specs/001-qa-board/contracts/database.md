# Database Contract: Supabase Schema, Triggers, RLS

**Feature**: 001-qa-board · 이 SQL이 `supabase/migrations/0001_init.sql`의 내용이 된다. 실제
파일 작성은 구현 단계(`tasks.md`)에서 하며, 여기서는 계약(스키마·정책 문언)을 고정한다.

> **구현 시점 기록(tasks.md T052~T054)**: 실제 Supabase 프로젝트에는 이 계약과 의미는 같지만
> 세부사항이 다른 "수업 자료" SQL이 이미 적용되어 있다. 실제 적용본 기록은
> `supabase/migrations/0001_init.sql`, `0002_admin_profiles_read_policy.sql`을 최신 기준으로
> 참고할 것(기록용 — 실행 대상 아님). DB는 이 계약의 의도를 만족하는 것으로 확인되었으며
> 재생성하지 않는다. 아래 §1~§4 본문은 `/speckit-plan` 단계에서 고정한 원래 설계 계약이며,
> 실제 적용본과 다음 두 가지가 다르다:
>
> - **FK 대상**: 이 문서의 §1은 `questions.user_id`/`answers.admin_id`가 `public.profiles(id)`를
>   참조한다고 적었지만, 실제 적용본은 둘 다 `auth.users(id)`를 직접 참조한다(`answers.admin_id`는
>   `on delete restrict`). `questions`/`answers`와 `profiles` 사이에는 직접 FK가 없다.
> - **작성자 닉네임 조회 방식**: 위 FK 차이 때문에 PostgREST embed(`select("*, profiles(display_name))")`)가
>   "관계를 찾을 수 없음" 오류로 실패한 적이 있다(관리자 목록·질문 상세에서 재현). 앱 코드
>   (`questionsRepository`)는 이를 embed 대신 `profiles`를 `user_id`로 필터링하는 **별도 쿼리**로
>   조회해 합치는 방식으로 수정되어 있다.
>
> 함수·정책 이름도 다르다 — `set_question_answered` → `mark_question_answered`,
> `current_role()` → `is_admin()`(boolean 반환), RLS 정책 이름 전체가 실제 적용본 고유의 이름을
> 쓴다(`supabase/migrations/0001_init.sql` 참고). 관리자가 모든 `profiles`를 읽을 수 있는 보강
> 정책도 추가로 적용됨(`0002_admin_profiles_read_policy.sql`).

## 1. Tables

```sql
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
```

## 2. Triggers

### 2.1 회원가입 시 profile 자동 생성

```sql
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
```

`display_name`(닉네임, FR-001)은 `supabase.auth.signUp({ ..., options: { data: { display_name } }
})` 호출 시 `raw_user_meta_data`로 전달되어야 한다. 값이 없으면 이메일 앞부분으로 대체(방어적
기본값 — 트리거가 실패해 가입 자체가 막히는 것을 방지).

### 2.2 답변 등록 시 질문 상태 자동 전환

```sql
create or replace function public.set_question_answered()
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
  for each row execute function public.set_question_answered();
```

## 3. 역할 조회용 SECURITY DEFINER 함수 (RLS 재귀 방지, research.md §2)

```sql
create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;
```

## 4. RLS

```sql
alter table public.profiles enable row level security;
alter table public.questions enable row level security;
alter table public.answers enable row level security;

-- profiles: 본인 또는 관리자만 조회(관리자 목록에 닉네임 표시, FR-007)
create policy profiles_select on public.profiles
  for select using (auth.uid() = id or public.current_role() = 'admin');

-- profiles: 본인 행만 수정, role 컬럼은 앱에서 절대 바꾸지 않는다(§11 — role 변경은 SQL 직접 실행)
create policy profiles_update_self on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- questions: 본인 질문 또는 관리자만 조회(FR-006, FR-007, FR-016)
create policy questions_select on public.questions
  for select using (auth.uid() = user_id or public.current_role() = 'admin');

-- questions: 회원만 자신의 이름으로 생성 가능(FR-004). 관리자는 질문 작성 기능이 없음(spec.md).
create policy questions_insert on public.questions
  for insert with check (auth.uid() = user_id and public.current_role() = 'member');

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
        and (q.user_id = auth.uid() or public.current_role() = 'admin')
    )
  );

-- answers: 관리자만 생성 가능, 본인 admin_id로만(FR-009, FR-017이 일반 회원의 답변 작성을 차단)
create policy answers_insert on public.answers
  for insert with check (public.current_role() = 'admin' and admin_id = auth.uid());

-- answers: 관리자만 수정 가능(FR-011). 어느 관리자든 답변을 수정할 수 있다(spec.md가 관리자
-- 간 소유권을 구분하지 않으므로 — Assumptions에 명시된 가정)
create policy answers_update on public.answers
  for update using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- answers: DELETE 정책 없음 = 기본 거부. spec.md에 답변 삭제 기능이 없다.
```

## 5. 계약 검증 체크리스트 (구현 후 실제로 테스트해야 하는 것)

- [ ] 회원 A가 회원 B의 질문 `id`로 `select`/`update`/`delete`를 직접 호출해도 결과가 빈 배열/거부인가(FR-016)
- [ ] 일반 회원 토큰으로 `answers` `insert`를 직접 호출하면 거부되는가(FR-017)
- [ ] 답변이 이미 있는 질문에 회원이 `update`/`delete`를 직접 호출하면 거부되는가(FR-015)
- [ ] `answers` insert 후 해당 `questions.status`가 자동으로 `answered`로 바뀌는가(FR-012)
- [ ] 신규 가입 직후 `profiles`에 행이 자동 생성되고 `display_name`이 채워지는가(FR-001)
- [ ] 제목 101자, 내용/답변 5001자 또는 공백만 입력한 값이 DB insert에서 거부되는가(FR-005, FR-010)
