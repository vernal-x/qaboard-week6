# Implementation Plan: QANOW 질문-답변 게시판

**Branch**: `001-qa-board` | **Date**: 2026-09-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-qa-board/spec.md`, design brief from
`specs/001-qa-board/design-brief.md`, confirmed design record from `specs/001-qa-board/design.md`,
project constitution from `.specify/memory/constitution.md`.

## Summary

React + Vite + TypeScript SPA, 별도 백엔드 서버 없이 Supabase(Auth·PostgreSQL·RLS)만으로 구현한다.
`design.md`에 확정된 세 화면(메인/질문 리스트/질문 페이지)과 그 공통 컴포넌트 규칙을 그대로
React 컴포넌트로 옮기되, **UI를 Mock Data로 먼저 완성 → `/design-sync`로 디자인 시스템과 맞춤
확인 → 그다음 Supabase를 연결**하는 순서로 진행한다. 개발 중에만 보이는 역할 전환 스위치로 로그인
없이 비회원/회원/관리자 세 화면을 모두 검증하고, Supabase 연결 시점에 이 스위치를 제거한다.

## Technical Context

**Language/Version**: TypeScript 5.x, React 18, Node.js 20 LTS(개발 환경)

**Primary Dependencies**: Vite 5, React Router 6, `@supabase/supabase-js` v2. 상태 관리 라이브러리는
별도로 두지 않고 React Context + hooks로 충분(헌법 XI 단순한 MVP 우선 — Redux/Zustand 등은
현재 규모에서 정당화되지 않음).

**Storage**: Supabase PostgreSQL(관리형). 로컬 개발은 Supabase CLI의 로컬 스택(`supabase start`)
또는 호스티드 개발 프로젝트 중 택1 — §17에서 두 경로 모두 문서화.

**Testing**: Vitest + React Testing Library(단위/컴포넌트), Playwright(E2E, 데스크톱·모바일 뷰포트),
axe-core(자동 접근성 점검). 헌법 XIII(테스트·빌드 실패 시 미완료)에 따라 CI 게이트로 사용.

**Target Platform**: 브라우저(데스크톱·모바일 웹, 반응형). 네이티브 앱 없음.

**Project Type**: 단일 프론트엔드 웹 앱(별도 백엔드 없음 — Supabase가 유일한 서버 측 구성요소).

**Performance Goals**: spec.md에 정량적 성능 목표가 없어 표준 SPA 수준을 기본값으로 채택 —
브로드밴드 기준 초기 상호작용 가능 시점 3초 이내, 라우트 전환 200ms 이내 체감. 정식 성능
예산은 이번 MVP 범위 밖(Assumptions).

**Constraints**: 별도 백엔드 서버 금지(Supabase 클라이언트 SDK만 사용), 오프라인 미지원, 파일
업로드 없음(spec.md MVP 제외 목록과 일치).

**Scale/Scope**: 3 핵심 화면 + 로그인/회원가입 2개 보조 화면, 역할 2종(회원/관리자) + 비회원,
수업용 MVP 규모(동시 사용자 수십~수백 명 가정, 별도 스케일 목표 없음).

## Constitution Check

*GATE: Phase 0 이전에 통과해야 하며, Phase 1 설계 후 재확인한다.*

| 원칙 | 상태 | 근거 |
|---|---|---|
| I. 역할 기반 권한 분리 | PASS | §11 역할 모델 + `profiles.role`, RLS 전 정책이 역할별로 분리(§12) |
| II. 권한의 데이터 계층 강제 | PASS | 모든 접근 제어를 Supabase RLS로 최종 강제(§12), UI는 보조 수단일 뿐 |
| III. 사용자 입력 검증 | PASS | 클라이언트 검증 + DB `CHECK` 제약 이중화(§13) |
| IV. 명세 범위 엄수 | PASS | design.md에 없는 화면·기능 추가 금지를 구조 결정에 명시(§1,§2) |
| V. 핵심 화면 일관성 | PASS | 공통 컴포넌트(Header/Button/Input/Textarea/Badge/QuestionCard) 단일 구현으로 3화면 공유(§4) |
| VI. 성능 우선 시각 효과 | PASS | Aurora/Grid는 CSS만 사용, JS 애니메이션 라이브러리 도입 없음(§5) |
| VII. 모션 접근성 | PASS | 모든 키프레임을 `prefers-reduced-motion` 미디어쿼리로 게이팅(§7) |
| VIII. 키보드 조작 가능성 | PASS | 네이티브 `button`/`a` 사용, `:focus-visible` 스타일 추가(§4, §21 design.md 갭 보완) |
| IX. 텍스트 병행 상태 표시 | PASS | Badge 컴포넌트가 항상 dot+텍스트 렌더링(§4) |
| X. 반응형 시나리오 완결성 | PASS | Playwright E2E를 데스크톱·모바일 뷰포트 양쪽에서 실행(§14) |
| XI. 단순한 MVP 우선 | PASS | 상태 관리 라이브러리·리포지토리 추상화 등을 최소화(본 섹션 상단) |
| XII. 요구사항-디자인 추적성 | PASS | 아래 각 섹션에 FR/SC ID와 design.md 섹션 번호를 병기 |
| XIII. 품질 게이트 | PASS | §14 테스트 전략이 CI 게이트로 tsc/eslint/vitest/playwright 통과를 요구 |

위반 없음 — Complexity Tracking 표는 비움.

## Project Structure

### Documentation (this feature)

```text
specs/001-qa-board/
├── spec.md
├── design-brief.md
├── design.md
├── plan.md              # 이 문서
├── research.md           # Phase 0 산출물
├── data-model.md         # Phase 1 산출물
├── quickstart.md         # Phase 1 산출물
├── contracts/            # Phase 1 산출물
│   ├── routes.md
│   ├── database.md
│   └── components.md
└── tasks.md              # /speckit-tasks 산출물 (이 명령에서 생성하지 않음)
```

### Source Code (repository root)

별도 백엔드가 없으므로 단일 프로젝트 구조를 사용한다(템플릿의 "Option 1: Single project"를
Vite/React 프런트엔드에 맞게 구체화).

```text
qaboard/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example                  # VITE_DATA_SOURCE, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── supabase/
│   └── migrations/
│       └── 0001_init.sql         # contracts/database.md의 SQL 그대로
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── router.tsx                 # contracts/routes.md 구현
│   ├── styles/
│   │   ├── tokens.css             # design.md §15 디자인 토큰 → CSS 변수
│   │   └── global.css             # reset, 타이포그래피 유틸리티
│   ├── lib/
│   │   ├── supabaseClient.ts
│   │   └── validation.ts          # 제목/내용/답변 검증 규칙(§13)
│   ├── types/
│   │   └── database.ts            # profiles/questions/answers 타입(data-model.md)
│   ├── auth/
│   │   ├── AuthProvider.tsx        # §9 인증 상태 관리
│   │   ├── useAuth.ts
│   │   └── DevRoleSwitcher.tsx     # Mock 세션 전용, Supabase 연결 후 제거(§9, §15)
│   ├── data/
│   │   ├── mock/
│   │   │   ├── mockProfiles.ts
│   │   │   ├── mockQuestions.ts
│   │   │   └── mockAnswers.ts
│   │   ├── questionsRepository.ts  # mock/supabase 스위치 지점(§15)
│   │   └── answersRepository.ts
│   ├── components/
│   │   ├── Header/
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Textarea/
│   │   ├── Badge/
│   │   ├── QuestionCard/
│   │   ├── StatusFilter/          # 세그먼트 필터
│   │   ├── FloatingCard/          # 메인 Hero 전용 장식 컴포넌트
│   │   └── StateViews/            # Loading/Empty/ErrorState/Unauthorized
│   ├── pages/
│   │   ├── MainPage/
│   │   ├── QuestionListPage/
│   │   ├── QuestionDetailPage/    # 작성/상세/수정/답변 통합(FR-021)
│   │   ├── LoginPage/
│   │   └── SignupPage/
│   └── routes/
│       └── ProtectedRoute.tsx
└── tests/
    ├── unit/                      # validation.ts, repository 스위치
    ├── component/                 # 공통 컴포넌트 + 페이지, Mock Data 기반
    └── e2e/                       # Playwright, 데스크톱·모바일 뷰포트
```

**Structure Decision**: 단일 Vite 프런트엔드 프로젝트. 백엔드 로직은 Supabase
(Auth/PostgreSQL/RLS/트리거)에 위임하므로 별도 `backend/` 디렉터리를 두지 않는다. `supabase/`는
스키마·정책·트리거의 유일한 소스이며 애플리케이션 코드와 함께 버전 관리한다.

## Implementation Approach

### 1. 전체 디렉터리 구조

위 "Project Structure"의 트리를 그대로 따른다. 경계 원칙: `pages/`는 라우트 단위 조립만 하고
시각 규칙은 전부 `components/`에 있다(design.md §4 Header 규칙, §19 버튼/입력창/카드/배지 규칙을
컴포넌트 하나에만 구현해 재사용). `data/`는 화면 코드가 Supabase/Mock을 직접 알지 못하게 하는
유일한 경계다.

### 2. 페이지와 공통 컴포넌트 구조

| 페이지 | 라우트(contracts/routes.md) | 사용하는 공통 컴포넌트 | design.md 참조 |
|---|---|---|---|
| MainPage | `/` | Header, Button, Badge, FloatingCard | §4(레이아웃), §9, §10 |
| QuestionListPage | `/questions` | Header, Button, StatusFilter, QuestionCard, StateViews | §4, §11, §14 |
| QuestionDetailPage | `/questions/new`, `/questions/:id` | Header, Button, Input, Textarea, Badge, StateViews | §4, §12, §13, §14 |
| LoginPage | `/login` | Header, Input, Button | spec.md FR-002 — design.md에 별도 시각 규칙 없음, 공통 컴포넌트만 재사용한 단순 폼 |
| SignupPage | `/signup` | Header, Input, Button | spec.md FR-001 — 위와 동일 |

QuestionDetailPage 하나가 FR-021의 5개 모드(신규 작성/답변 대기/저장 중/입력 오류/답변 완료,
관리자 답변 작성/수정 포함 총 7개 상태 조합)를 조건부 렌더링으로 처리한다. 모드는 URL(`/new` vs
`/:id`) + 조회한 질문의 `status` + 현재 사용자 역할로 파생되는 값이며, 별도 페이지 컴포넌트를
만들지 않는다(design.md §3 "화면이 새로 생기는 것이 아니다").

### 3. 디자인 토큰을 CSS 변수로 구현하는 방법

`src/styles/tokens.css`에 design.md §15 표를 **한 글자도 재해석하지 않고** 그대로 옮긴다:

```css
:root {
  --font-body: "IBM Plex Sans KR", sans-serif;
  --font-mono: "IBM Plex Mono", monospace;
  --bg-dark: #05070c; --surface-dark: #0b0f1a; --surface-dark-2: #10162a; --card-dark: #141b2e;
  --border-dark: rgba(255,255,255,.08); --border-dark-strong: rgba(255,255,255,.16);
  --ink-dark: #f4f6fb; --ink-dark-muted: #9aa5c0;
  --bg-light: #f2f4fa; --surface-light: #ffffff; --border-light: #e1e5f0;
  --ink-light: #14181f; --ink-light-muted: #5c6478;
  --accent-blue: #4f7bff; --accent-violet: #9a5bff;
  --accent-gradient: linear-gradient(120deg, #4f7bff, #9a5bff);
  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 14px;
  --content-max: 1120px;
}
```

Claude Design 목업의 `.on-dark`/`.on-light` 테마 클래스 패턴을 그대로 유지한다: 각 페이지 최상위
요소에 `data-theme="dark"`(MainPage) 또는 `data-theme="light"`(나머지)를 두고, 컴포넌트 CSS는
`[data-theme="dark"] .badge-pending { ... }` 형태로 분기한다 — `shared.css`의
`.on-dark .qn-badge-pending, .qn-badge-pending.on-dark` 이중 선택자 패턴을 CSS Modules에서도
그대로 재현해, 부모 테마 속성만으로 하위 전체가 자동 전환되게 한다(§17 헌법 V 재확인).
CSS는 컴포넌트별 CSS Module(`Button.module.css` 등)로 분리하고, 토큰 값만 `tokens.css`에서
가져와 하드코딩 색상이 컴포넌트 파일에 존재하지 않게 한다.

### 4. Header, Button, Input, Textarea, Badge, QuestionCard 구조

- **Header** (`components/Header`): props `{ variant: 'dark'|'light', active: 'main'|'questions',
  right: 'login' | { name: string; onLogout(): void } | null, mobileMenu?: ReactNode }`. 데스크톱은
  로고+네비+우측 슬롯, 모바일은 로고+햄버거(design.md §7). 로고는 `Link to="/"`(현재 페이지가
  메인이면 `span`).
- **Button** (`components/Button`): props `{ variant: 'primary'|'secondary'|'danger'|'ghost',
  size?: 'md'|'sm', as?: 'button'|Link, to?, disabled?, loading?: boolean }`. `loading`이면 라벨을
  "저장 중..." 등으로 교체하고 `disabled`를 강제해 FR-020 저장 중 상태를 컴포넌트 레벨에서
  보장한다(design.md §13).
- **Input / Textarea**: props `{ label, value, onChange, placeholder?, readOnly?, disabled?,
  error?: string, maxLength, currentLength }`. `error`가 있으면 `.has-error` 클래스 + 하단
  `role="alert"` 오류 텍스트를 렌더링(FR-005, FR-010). `readOnly`는 design.md §13에서 확정한
  대로 테두리·배경을 제거하는 전용 스타일을 쓴다(편집 가능한 입력창과 절대 같은 모양을 쓰지
  않는다 — 이전 검토에서 발견된 HIGH 이슈 재발 방지).
- **Badge**: props `{ tone: 'pending'|'done', children? }`. 항상 `<span class="dot" />` + 텍스트를
  함께 렌더링하며 색상만으로 상태를 구분하는 사용을 컴포넌트 레벨에서 원천 차단한다(FR-020,
  헌법 IX).
- **QuestionCard**(design.md §11의 리스트 행): props `{ title, status, date, nickname?: string,
  href }`. 전체가 `Link`이며 우측 chevron은 장식(`aria-hidden`), `nickname`이 있으면(관리자 뷰)
  메타 라인에 추가로 표시.

### 5. 메인 Hero와 Aurora/Grid/Floating Card 구현 방법

design.md §10의 수치를 그대로 CSS로 옮긴다: Hero 컨테이너에 `::before`(두 겹 `radial-gradient` +
`blur(70px)`)와 `::after`(1px 격자 반복 + `mask-image`로 하단 페이드)를 순수 CSS로 구현하고, JS
애니메이션 라이브러리는 쓰지 않는다(헌법 VI). `FloatingCard` 컴포넌트가 질문/답변 카드 2장과
커넥터 선을 받아 데스크톱에서는 절대 위치, 모바일에서는 정적 스택으로 배치한다(같은 컴포넌트,
CSS 미디어 쿼리로만 배치 전환 — 별도 모바일 전용 컴포넌트를 만들지 않는다, 헌법 XI).

### 6. 데스크톱과 모바일 반응형

Claude Design 목업의 고정 폭(1440/390)은 검토용 프레임이었을 뿐, 실제 구현은 유동형(fluid)
레이아웃으로 만든다: 브레이크포인트 1개(`max-width: 640px`)로 design.md §20의 규칙(Header
76→64px, Hero 2단→1단, 리스트 타이틀 행 row→column, 상세 페이지 액션 버튼 column-reverse+전체
폭 등)을 미디어 쿼리로 구현한다. `--content-max`(1120px)는 `margin:0 auto`로 큰 화면에서 콘텐츠
폭을 제한하고, 640px 이하에서는 좌우 패딩만 48px→20px로 줄어든다(고정 폭이 아니므로 그 사이
뷰포트도 자연스럽게 흐른다). Playwright E2E를 1440px, 390px 두 뷰포트에서 실행해 SC-005(데스크톱·
모바일 모두 핵심 시나리오 완료)를 검증한다.

### 7. prefers-reduced-motion 처리

design.md §22와 동일하게, Hero 진입 애니메이션(`fadeUp`/`fadeIn`)의 **기본 상태를 이미
`opacity:1; transform:none`으로 두고**, `@media (prefers-reduced-motion: no-preference)` 블록
안에서만 키프레임을 적용한다. 이렇게 하면 별도의 JS 분기 없이 CSS만으로 헌법 VII을 만족한다.
다른 컴포넌트(리스트/질문 페이지)는 애초에 진입 애니메이션이 없으므로 추가 처리가 불필요하다.

### 8. Loading, Empty, Error, Unauthorized 상태

`components/StateViews`에 4개를 각각 별도 컴포넌트로 만들고(design.md §14), 화면마다
재구현하지 않는다:

- `LoadingState`: QuestionCard 자리 수만큼 스켈레톤 바(design.md 쇼케이스와 동일한 시각).
- `EmptyState({ role, onCreate? })`: 회원은 문구+"질문 작성하기" 버튼, 관리자는 문구만
  (Clarifications Q5) — `onCreate`를 안 넘기면 버튼을 렌더링하지 않는 방식으로 강제한다.
- `ErrorState({ onRetry })`: 문구 + "다시 시도" 버튼.
- `UnauthorizedRedirect`: 렌더링 대신 `ProtectedRoute`가 `<Navigate to="/login" state={{ from }}
  replace />`로 즉시 리다이렉트하고, 로그인 성공 후 `from`으로 복귀한다(FR-018, Clarifications
  Q4). design.md에는 "권한 없음" 문구 카드도 있었지만 실제 동작은 스펙이 요구하는 리다이렉트이므로,
  그 카드는 리다이렉트가 걸리기 전 짧은 순간(세션 확인 중)에만 노출되는 로딩성 화면으로 취급한다.

각 페이지는 데이터 훅의 상태(`loading | empty | error | success`)를 그대로 이 컴포넌트에 매핑할
뿐, 페이지마다 상태 텍스트를 새로 만들지 않는다.

### 9. 인증 상태 관리

`AuthProvider`가 `{ user, profile, role: 'guest'|'member'|'admin', loading }`를 Context로
제공한다. 내부적으로 두 데이터 소스 중 하나를 쓴다(`VITE_DATA_SOURCE` 환경변수):

- **Mock 세션**(`mock`): `DevRoleSwitcher`가 로컬 상태(react state, `sessionStorage`에 임시 보존)로
  `role`을 바꾸면 `AuthProvider`가 그에 맞는 Mock `profile`을 즉시 제공한다. 실제 Supabase 호출은
  전혀 일어나지 않는다. `DevRoleSwitcher`는 `import.meta.env.DEV && dataSource === 'mock'`일 때만
  렌더링되며, 화면 좌측 하단에 앱 셸과 시각적으로 분리된 개발자 도구 스타일(design.md의 어떤
  화면 규칙도 재사용하지 않음 — 확정 디자인이 아니므로)로 표시한다. **Supabase 연결 단계에서
  이 컴포넌트와 관련 로직을 완전히 삭제한다**(§15, §16에서 시점 명시).
- **Supabase 세션**(`supabase`): `supabase.auth.onAuthStateChange`를 구독해 `user`를 얻고,
  `profiles` 테이블에서 `role`을 조회한다. 로그아웃/토큰 만료 시 자동으로 `guest`로 전환된다.

`ProtectedRoute`는 `role === 'guest'`면 로그인으로 리다이렉트하고, `requireAdmin` prop이 있으면
`role !== 'admin'`일 때 질문 목록(회원 뷰)으로 되돌린다.

### 10. questions, answers, profiles 데이터 구조

data-model.md에 전체 스키마를 기술한다. 요약:

- `profiles(id uuid pk → auth.users.id, email text, display_name text, role text
  check in ('member','admin') default 'member')`
- `questions(id uuid pk, user_id uuid → profiles.id, title varchar(100), content text,
  status text check in ('pending','answered') default 'pending', created_at, updated_at)`
- `answers(id uuid pk, question_id uuid unique → questions.id, admin_id uuid → profiles.id,
  content text, created_at, updated_at)`

`question_id unique`는 "질문 하나에 답변은 최대 한 건"(spec.md Assumptions)을 DB 레벨에서
강제한다.

### 11. 회원과 관리자 역할 모델

`profiles.role`이 유일한 역할 저장소다(비회원은 세션이 없는 상태로 별도 컬럼 없이 표현). 앱은
역할을 절대 클라이언트에서 계산하지 않고 `profiles` 조회 결과만 신뢰한다. 관리자 계정은
spec.md Assumptions대로 앱 내 가입 플로우로 만들 수 없다 — 일반 회원가입 후 운영자가 SQL로
`role`을 승격한다(quickstart.md에 절차 기술). 회원→관리자 승격을 앱에서 셀프서비스로 제공하는
UI는 만들지 않는다(헌법 IV, spec.md 관리자 기능 목록에 없음).

### 12. RLS 정책

contracts/database.md에 전체 SQL을 둔다. 핵심 설계: `profiles`를 자기 자신에서 재귀 조회하는
정책을 피하기 위해 `SECURITY DEFINER` 함수 `public.current_role()`을 하나 두고, 모든 정책이 이
함수를 통해 역할을 확인한다(무한 재귀 방지, PostgreSQL RLS 모범 사례). 질문 수정/삭제 정책은
`USING` 절에 `status = 'pending'`을 포함시켜 답변 완료 후에는 행 자체가 정책에 안 걸리게
한다(FR-015를 UI가 아니라 DB가 거부하도록 — 헌법 II).

### 13. 입력 검증

`src/lib/validation.ts`에 순수 함수로 구현하고 Input/Textarea가 이를 호출한다:

```ts
validateTitle(v: string): string | null   // trim 후 1~100자, FR-005
validateContent(v: string): string | null // trim 후 1~5000자, FR-005
validateAnswer(v: string): string | null  // trim 후 1~5000자, FR-010
```

같은 규칙을 `contracts/database.md`의 `CHECK` 제약으로 중복 적용해 클라이언트를 우회한 직접
API 호출도 막는다(SC-007, 헌법 III).

### 14. 테스트 전략

| 계층 | 도구 | 대상 |
|---|---|---|
| 단위 | Vitest | `validation.ts`, 리포지토리 스위치 로직 |
| 컴포넌트 | Vitest + Testing Library + axe-core | Header/Button/Input/Textarea/Badge/QuestionCard/StateViews, Mock Data로 렌더 |
| E2E | Playwright(1440px, 390px 뷰포트) | 회원 질문 등록→답변 확인, 관리자 답변 처리, 비회원 리다이렉트, 답변 후 수정 불가, RLS 우회 시도 거부 |

CI 게이트(헌법 XIII): `tsc --noEmit` → `eslint` → `vitest run` → `playwright test` 모두 통과해야
`tasks.md`의 해당 작업을 완료로 표시한다. Playwright의 RLS 관련 시나리오는 Supabase 연결 이후
단계에서만 활성화된다(§16).

### 15. Mock Data 기반 UI 우선 구현 방법

`src/data/questionsRepository.ts`(및 `answersRepository.ts`)가 유일한 데이터 접근 경계다:

```ts
export interface QuestionsRepository {
  listMine(): Promise<Question[]>;
  listAll(filter?: Status): Promise<Question[]>;
  getById(id: string): Promise<Question | null>;
  create(input): Promise<Question>;
  update(id, input): Promise<Question>;
  remove(id): Promise<void>;
}
export const questionsRepository: QuestionsRepository =
  import.meta.env.VITE_DATA_SOURCE === 'supabase' ? supabaseQuestionsRepository : mockQuestionsRepository;
```

`mock/*.ts`의 샘플 데이터는 design.md에 실제로 쓰인 문구(예: "환불 절차가 어떻게 되나요?")를
그대로 재사용해, UI가 Claude Design 목업과 눈으로 바로 비교 가능하게 한다. 이 단계에서는
`.env.local`에 Supabase 키가 전혀 없어도 `npm run dev`만으로 세 핵심 화면과 회원/관리자 뷰,
5개 상태(로딩/빈목록/오류/권한없음/저장중)를 `DevRoleSwitcher`로 모두 확인할 수 있다.

### 16. UI 구현 이후 /design-sync를 실행하는 시점과 범위

**시점**: Mock Data 기반으로 3 핵심 화면 + 공통 컴포넌트 + 5개 상태가 모두 구현되고, 위 "테스트
전략"의 컴포넌트 테스트가 통과한 직후, **Supabase 연동을 시작하기 전**에 1회 실행한다. 이유:
`/design-sync`는 완성된 시각 결과물을 Claude Design 프로젝트에 반영하는 작업이며, 이후 Supabase
연동은 데이터 흐름만 바꾸고 시각적 결과물은 바꾸지 않아야 하므로(같은 컴포넌트를 그대로 재사용)
디자인 동기화를 더 미룰 이유가 없다. 반대로 먼저 Supabase를 붙이면 디자인 피드백이 데이터 로직과
뒤섞여 변경 비용이 커진다.

**범위**: `components/`(Header, Button, Input, Textarea, Badge, QuestionCard, StatusFilter,
FloatingCard, StateViews)와 `pages/`의 3 핵심 화면(MainPage, QuestionListPage,
QuestionDetailPage)만 동기화한다. LoginPage/SignupPage(§2에서 "새 시각 규칙 없음"으로 명시)와
`DevRoleSwitcher`(Mock 전용, 확정 디자인이 아님)는 동기화 대상에서 제외한다.

### 17. 로컬 실행 방법

**Mock 단계** (Supabase 계정 불필요):

```bash
npm install
cp .env.example .env.local        # VITE_DATA_SOURCE=mock 유지
npm run dev                        # http://localhost:5173
# 화면 좌하단 DevRoleSwitcher로 비회원/회원/관리자 전환하며 3화면 확인
npm run test:unit && npm run test:component
```

**Supabase 연결 단계**:

```bash
supabase login && supabase link --project-ref <project-ref>   # 또는 supabase start(로컬 스택)
supabase db push                   # supabase/migrations/0001_init.sql 적용
# .env.local 갱신
#   VITE_DATA_SOURCE=supabase
#   VITE_SUPABASE_URL=...
#   VITE_SUPABASE_ANON_KEY=...
npm run dev
# 회원가입 1회 진행 후 Supabase 대시보드(SQL Editor)에서
#   update profiles set role = 'admin' where email = '<관리자 이메일>';
npm run test:e2e                   # Playwright, RLS 시나리오 포함
```

이 시점부터 `DevRoleSwitcher`와 `mock/*.ts`, `VITE_DATA_SOURCE=mock` 분기 코드를 저장소에서
삭제한다(§9).

## Complexity Tracking

위반 없음 — 표 비움.
