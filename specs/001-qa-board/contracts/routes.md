# Routes Contract: React Router

**Feature**: 001-qa-board · design.md §5(화면 간 이동)를 실제 라우트로 옮긴 것. Claude Design
목업의 앵커 ID(`#detail-desktop-write` 등)는 프레임 구분용이었을 뿐 실제 라우트가 아니며, 아래
경로로 대체된다.

| 경로 | 페이지 | 접근 | 설명 |
|---|---|---|---|
| `/` | MainPage | 전체(비회원 포함) | design.md §9 Hero. 로그인 상태에 따라 CTA 목적지 분기 |
| `/login` | LoginPage | 비회원만 의미 있음(로그인 상태면 통과 가능) | FR-002 |
| `/signup` | SignupPage | 비회원만 | FR-001 |
| `/questions` | QuestionListPage | 회원/관리자(`ProtectedRoute`) | 역할에 따라 "내 질문"/"문의 관리" 렌더(design.md §6) |
| `/questions/new` | QuestionDetailPage(모드=작성) | 회원만 | FR-004 |
| `/questions/:id` | QuestionDetailPage(모드=상세/수정/답변) | 회원 본인 소유 또는 관리자 | FR-008, FR-013, FR-009 |

## 리다이렉트 규칙 (FR-018, Clarifications Q4)

- 비회원이 `/questions`, `/questions/new`, `/questions/:id` 접근 → `/login`으로 리다이렉트하며
  `location.state = { from: <원래 경로> }` 보존.
- 로그인 성공 시 `from`이 있으면 그 경로로, 없으면 `/questions`로 이동.
- 회원이 타인의 질문 `id`로 접근 → 데이터 자체가 RLS에 의해 조회되지 않으므로(빈 결과) "찾을 수
  없음" 오류 상태(`ErrorState`)를 보여준다(FR-016, Edge Case).
- 일반 회원이 관리자 전용 동작(답변 작성)을 URL 조작으로 시도해도 RLS가 거부하므로 UI는 실패
  응답을 오류 상태로 표시한다(FR-017).

## `/questions/:id`의 모드 파생 규칙

페이지 컴포넌트는 별도 상태 없이 다음 값들로부터 모드를 계산한다:

```ts
type Mode =
  | 'member-pending' | 'member-saving' | 'member-error' | 'member-done'
  | 'admin-answer' | 'admin-edit';

function deriveMode(role: Role, question: Question, form: FormState): Mode { /* ... */ }
```

- `role === 'member'` + `question.status === 'pending'` → `member-pending`(편집 가능, design.md §13)
- 저장 요청 진행 중(`form.saving`) → `member-saving`
- 마지막 저장 시도가 검증 실패(`form.error`) → `member-error`
- `role === 'member'` + `question.status === 'answered'` → `member-done`(읽기 전용)
- `role === 'admin'` + `question.status === 'pending'` → `admin-answer`
- `role === 'admin'` + `question.status === 'answered'` → `admin-edit`

새 라우트나 새 페이지 컴포넌트를 추가하지 않고 조건부 렌더링만으로 design.md §3이 요구한
"화면이 새로 생기지 않는다"를 지킨다.
