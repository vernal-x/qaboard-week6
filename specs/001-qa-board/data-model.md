# Phase 1 Data Model: QANOW

**Feature**: 001-qa-board · 전체 SQL 정의(테이블/제약/트리거/RLS)는
[`contracts/database.md`](./contracts/database.md)를 단일 소스로 삼는다. 이 문서는 엔티티·필드·
관계·검증 규칙·상태 전이만 요약한다.

## Entities

### profiles

| 필드 | 타입 | 제약/기본값 | 설명 |
|---|---|---|---|
| `id` | uuid | PK, `references auth.users(id) on delete cascade` | Supabase Auth 사용자와 1:1 |
| `email` | text | not null | FR-001 |
| `display_name` | text | not null | 닉네임(Clarifications Q2), 관리자 목록에서 작성자 표시 |
| `role` | text | not null, `check (role in ('member','admin'))`, default `'member'` | FR-003, §11 |
| `created_at` | timestamptz | default `now()` | |

관계: `questions.user_id`, `answers.admin_id`가 각각 `profiles.id`를 참조.

### questions

| 필드 | 타입 | 제약/기본값 | 설명 |
|---|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `user_id` | uuid | not null, `references profiles(id) on delete cascade` | FR-006 |
| `title` | varchar(100) | not null, `check (char_length(btrim(title)) between 1 and 100)` | FR-005 |
| `content` | text | not null, `check (char_length(btrim(content)) between 1 and 5000)` | FR-005 |
| `status` | text | not null, `check (status in ('pending','answered'))`, default `'pending'` | FR-012 |
| `created_at` | timestamptz | default `now()` | |
| `updated_at` | timestamptz | default `now()` | 수정/답변 등록 시 갱신(트리거) |

관계: 정확히 한 `profiles`(작성자)에 속함. `answers`와 0..1 관계(질문당 답변 최대 1건).

### answers

| 필드 | 타입 | 제약/기본값 | 설명 |
|---|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `question_id` | uuid | not null, **unique**, `references questions(id) on delete cascade` | 질문당 답변 1건(spec.md Assumptions) |
| `admin_id` | uuid | not null, `references profiles(id)` | FR-009 |
| `content` | text | not null, `check (char_length(btrim(content)) between 1 and 5000)` | FR-010 |
| `created_at` | timestamptz | default `now()` | |
| `updated_at` | timestamptz | default `now()` | FR-011 수정 시 갱신 |

## 상태 전이 (questions.status)

```
pending --(answers INSERT 트리거)--> answered
```

- `pending → answered`: 관리자가 `answers`에 행을 추가하면 트리거(`contracts/database.md`
  `set_question_answered`)가 자동으로 전환한다(FR-012). 앱 코드가 직접 `status`를 쓰지 않는다.
- `answered` 상태에서는 RLS의 `questions` UPDATE/DELETE 정책이 `status = 'pending'`을 요구하므로
  회원의 수정·삭제 요청이 DB 레벨에서 거부된다(FR-015).
- 역방향 전이(`answered → pending`)는 없음 — 답변 삭제 기능이 spec.md에 없으므로 설계하지 않는다.

## 파생 뷰(선택, 앱 편의용)

관리자 목록 화면(design.md §11)은 `questions` + `profiles.display_name` 조인을 한 번에 가져와야
하므로, `questionsRepository.listAll()`은 다음과 같은 조인 쿼리를 사용한다(뷰로 만들지 않고
쿼리 레벨에서 처리 — 헌법 XI):

```sql
select q.*, p.display_name as nickname
from questions q
join profiles p on p.id = q.user_id
order by q.created_at desc;
```

## 검증 규칙 요약 (클라이언트 ↔ DB 이중화)

| 필드 | 규칙 | 클라이언트 | DB |
|---|---|---|---|
| 질문 제목 | trim 후 1~100자 | `validateTitle()` | `questions` CHECK |
| 질문 내용 | trim 후 1~5000자 | `validateContent()` | `questions` CHECK |
| 답변 내용 | trim 후 1~5000자 | `validateAnswer()` | `answers` CHECK |
