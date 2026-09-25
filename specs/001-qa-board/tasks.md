---

description: "Task list for QANOW (001-qa-board) implementation"
---

# Tasks: QANOW 질문-답변 게시판

**Input**: `plan.md`, `spec.md`, `design.md`, `data-model.md`, `contracts/`, `research.md`,
`quickstart.md` (모두 `specs/001-qa-board/`)

**Organization 안내**: 사용자가 이번 작업에서 명시적으로 요청한 8개 Phase(프로젝트 설정 →
디자인 시스템 → 화면+Mock → Claude Design 동기화 → Supabase → 회원 기능 → 관리자 기능 → 최종
검증)를 최상위 구조로 사용한다. 각 Task에는 가능한 경우 해당하는 spec.md 사용자 스토리 라벨
(`[US1]`~`[US4]`, spec.md의 P1~P4에 대응)을 붙였다. Setup/디자인 시스템/동기화/Supabase 기반/
최종 검증처럼 특정 스토리에 속하지 않는 Task는 라벨을 생략한다.

**Format**: `- [ ] T0xx [P?] [USn?] 설명 — 파일 경로` + 하위에 `요구사항` / `design.md` / `검증`
세 줄. `[P]`는 다른 파일을 건드리며 선행 Task 완료 없이 병렬 진행 가능함을 뜻한다.

**변경 이력**: `/speckit-analyze` 결과(E1 HIGH, F1/E2/E3 MEDIUM)를 반영해 T035의 스토리 라벨을
`[US1]→[US3]`로 정정하고, T039·T040의 검증 항목에 FR-010(답변 길이 검증) 오류 상태를 추가했다.
기존 Task ID는 변경하지 않는다는 원칙에 따라, 신규로 필요해진 Task는 T081~T083으로 번호를 이어
붙이되 각각 소속 Phase(Phase 3: T081·T082, Phase 8: T083) 본문 위치에는 논리적으로 맞게
삽입했다 — 그래서 문서 안에서 T041 다음에 T081·T082가, T077 다음에 T083·T078 순서로 나온다.

---

## Phase 1: 프로젝트 설정

**목적**: 저장소를 실제로 실행·빌드·테스트할 수 있는 상태로 만든다. 이후 모든 Phase의 전제조건.

- [X] T001 Vite + React + TypeScript 프로젝트 스캐폴딩 — `package.json`, `tsconfig.json`,
      `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`
  - 요구사항: plan.md Technical Context(React 18, Vite 5, TS 5)
  - design.md: —
  - 검증: `npm run dev`로 빈 페이지가 5173 포트에서 뜬다
- [X] T002 [P] ESLint + Prettier 설정 — `.eslintrc.cjs`, `.prettierrc`
  - 요구사항: 헌법 XIII(품질 게이트)
  - design.md: —
  - 검증: `npm run lint` 통과(에러 0건)
- [X] T003 [P] Vitest + React Testing Library 설정 — `vitest.config.ts`, `tests/setup.ts`
  - 요구사항: plan.md §14 테스트 전략
  - design.md: —
  - 검증: 더미 테스트 1건이 `npm run test:unit`으로 통과
- [X] T004 [P] Playwright 설정(데스크톱 1440px·모바일 390px 프로젝트 2개) — `playwright.config.ts`
  - 요구사항: SC-005, plan.md §14
  - design.md: §20
  - 검증: `npx playwright test --list`가 두 프로젝트를 출력
- [X] T005 npm scripts 정리 — `package.json`(`dev`,`build`,`lint`,`test:unit`,`test:component`,`test:e2e`)
  - 요구사항: 헌법 XIII
  - design.md: —
  - 검증: 6개 스크립트 모두 개별 실행 시 오류 없이 종료(테스트 파일이 없으면 "no tests" 상태로 통과)
- [X] T006 [P] 환경 변수 템플릿 작성 — `.env.example`(`VITE_DATA_SOURCE`,`VITE_SUPABASE_URL`,`VITE_SUPABASE_ANON_KEY`)
  - 요구사항: plan.md §15,§17
  - design.md: —
  - 검증: `cp .env.example .env.local` 후 `VITE_DATA_SOURCE=mock`으로 앱이 기동됨
- [X] T007 React Router 라우터 골격 구성 — `src/router.tsx`(5개 경로 placeholder 컴포넌트)
  - 요구사항: contracts/routes.md
  - design.md: §5
  - 검증: 5개 경로(`/`,`/login`,`/signup`,`/questions`,`/questions/:id`)로 직접 이동 시 404 없음

**Checkpoint**: 저장소 clone 후 `npm install && npm run dev`만으로 빈 라우트 셸이 뜬다.

---

## Phase 2: 디자인 시스템 기반

**목적**: 세 화면이 재사용할 토큰·전역 스타일·공통 컴포넌트를 먼저 완성한다. Phase 3의 모든
화면 Task가 이 Phase의 산출물에 의존하므로 반드시 먼저 끝낸다.

- [X] T008 [P] CSS 디자인 토큰 작성 — `src/styles/tokens.css`(design.md §15 표를 그대로 `:root` 변수로)
  - 요구사항: plan.md §3
  - design.md: §15, §17
  - 검증: 색상/라운드/폰트 변수 개수가 design.md §15 목록과 1:1 일치(수동 대조)
- [X] T009 [P] 전역 스타일/리셋 작성 — `src/styles/global.css`(box-sizing, body margin 등)
  - 요구사항: plan.md §3
  - design.md: §18(간격/최대 콘텐츠 폭)
  - 검증: `.content-max` 유틸리티가 1120px에서 중앙 정렬됨을 브라우저에서 확인
- [X] T010 [P] 타이포그래피 스케일 클래스 작성 — `src/styles/typography.css`
  - 요구사항: —
  - design.md: §16
  - 검증: 로고/HeroH1/PageTitle/Label 등 표의 각 항목이 대응 클래스명으로 존재
- [X] T011 다크/라이트 테마 분기 메커니즘 구현 — `src/styles/theme.css` + `data-theme` 속성 규칙
  - 요구사항: research.md §4
  - design.md: §7, §17
  - 검증: 같은 Badge 컴포넌트가 `data-theme="dark"`/`"light"` 조상 아래서 색상만 바뀌고 마크업은 동일
- [X] T012 [P] Header 컴포넌트 구현 — `src/components/Header/Header.tsx`, `Header.module.css`
  - 요구사항: FR-002, FR-018
  - design.md: §7
  - 검증: `theme`,`activeNav`,`right` 세 조합(로그인 전/로그인 후/모바일)을 스토리북 없이 임시
    페이지에서 렌더 확인
- [X] T013 [P] Button 컴포넌트 구현 — `src/components/Button/Button.tsx`, `.module.css`
  - 요구사항: FR-020(저장 중 disabled)
  - design.md: §19, contracts/components.md
  - 검증: `variant` 4종·`loading`·`disabled` 조합 렌더 시 `min-height:48px`(sm=40px) 유지
- [X] T014 [P] Input 컴포넌트 구현 — `src/components/Input/Input.tsx`, `.module.css`
  - 요구사항: FR-005
  - design.md: §12, §13, §19
  - 검증: `readOnly` 시 테두리·배경 제거, `error` prop 전달 시 `.has-error` + `role="alert"` 텍스트 렌더
- [X] T015 [P] Textarea 컴포넌트 구현 — `src/components/Textarea/Textarea.tsx`, `.module.css`
  - 요구사항: FR-010
  - design.md: §13, §19
  - 검증: Input과 동일한 readOnly/error 동작 확인
- [X] T016 [P] Badge 컴포넌트 구현 — `src/components/Badge/Badge.tsx`, `.module.css`
  - 요구사항: FR-020, 헌법 IX
  - design.md: §11, §17
  - 검증: `tone` 값과 무관하게 dot+텍스트가 항상 함께 렌더링(스냅샷 또는 수동 확인)
- [X] T017 [P] LoadingState 컴포넌트 구현 — `src/components/StateViews/LoadingState.tsx`
  - 요구사항: FR-020
  - design.md: §14
  - 검증: `rows` prop 개수만큼 스켈레톤 바 렌더
- [X] T018 [P] EmptyState 컴포넌트 구현 — `src/components/StateViews/EmptyState.tsx`
  - 요구사항: Clarifications Q5
  - design.md: §14
  - 검증: `role='admin'`이면 CTA 버튼이 렌더되지 않음(단위 테스트로 고정)
- [X] T019 [P] ErrorState 컴포넌트 구현 — `src/components/StateViews/ErrorState.tsx`
  - 요구사항: FR-020
  - design.md: §14
  - 검증: `onRetry` 클릭 시 콜백 1회 호출(단위 테스트)
- [X] T020 ProtectedRoute 및 Unauthorized 리다이렉트 구현 — `src/routes/ProtectedRoute.tsx`
  - 요구사항: FR-018, Clarifications Q4
  - design.md: §14
  - 검증: 비로그인 상태로 `/questions` 접근 시 `/login`으로 이동하고 `state.from`이 보존됨
- [X] T021 키보드 `:focus-visible` 전역 스타일 정의 — `src/styles/global.css`
  - 요구사항: 헌법 VIII
  - design.md: §21(목업에 커스텀 focus-visible 스타일이 없다고 기록된 갭 보완)
  - 검증: 키보드 Tab으로 Button/Input/QuestionCard 이동 시 `--accent-blue` 기반 아웃라인이
    마우스 클릭 시에는 나타나지 않음(포커스 방식 구분 확인)
- [X] T022 [P] 공통 컴포넌트 단위 테스트 작성 — `tests/component/{Header,Button,Input,Textarea,Badge,StateViews}.test.tsx`
  - 요구사항: 헌법 XIII
  - design.md: §21(axe-core로 접근성 위반 0건 포함)
  - 검증: `npm run test:component` 전체 통과, axe 위반 0건

**Checkpoint**: `tokens.css`만 바꿔서 전체 컴포넌트의 색상이 함께 바뀜을 확인할 수 있어야 한다
(디자인 토큰이 실제로 유일한 색상 소스인지 검증).

---

## Phase 3: 세 핵심 화면과 Mock Data

**목적**: Mock Data만으로 회원가입/로그인 없이 세 핵심 화면과 회원·관리자 뷰, 5개 상태를 모두
검증 가능하게 만든다. **이 Phase가 끝나야 Phase 4(design-sync)로 넘어간다.**

- [X] T023 [P] Mock 데이터 정의 — `src/data/mock/mockProfiles.ts`, `mockQuestions.ts`, `mockAnswers.ts`
  - 요구사항: data-model.md
  - design.md: §12, §13 예시 문구("환불 절차가 어떻게 되나요?" 등) 재사용
  - 검증: Mock 데이터 타입이 `src/types/database.ts`와 일치(tsc 오류 없음)
- [X] T024 QuestionsRepository 인터페이스 + mock 구현체 — `src/data/questionsRepository.ts`
  - 요구사항: FR-006, FR-007
  - design.md: —
  - 검증: `listMine()`/`listAll()`이 role별로 §data-model.md 파생 뷰와 동일한 필드를 반환
- [X] T025 AnswersRepository 인터페이스 + mock 구현체 — `src/data/answersRepository.ts`
  - 요구사항: FR-009, FR-011
  - design.md: —
  - 검증: `create()` 호출 시 mock `questions` 배열의 해당 항목 `status`가 `answered`로 바뀜(트리거
    동작을 mock에서도 재현)
- [X] T026 AuthProvider(Mock 세션) 구현 — `src/auth/AuthProvider.tsx`, `useAuth.ts`
  - 요구사항: plan.md §9
  - design.md: —
  - 검증: 초기 상태 `role==='guest'`, 아래 T027 스위치로 값이 바뀜을 확인
- [X] T027 [DevRoleSwitcher] 개발용 역할 전환 컴포넌트 구현 — `src/auth/DevRoleSwitcher.tsx`
  - 요구사항: plan.md §9, §15(사용자 명시 요청 — Mock 세션 전용, Supabase 연결 후 제거 예정)
  - design.md: — (확정 디자인 아님, 화면 좌하단에 별도 스타일로 표시)
  - 검증: `VITE_DATA_SOURCE=mock`에서만 렌더되고, 비회원/회원/관리자 전환 시 `useAuth()`의 role이
    즉시 바뀜
- [X] T028 [US4] MainPage Hero 레이아웃/카피/CTA 구현 — `src/pages/MainPage/MainPage.tsx`, `.module.css`
  - 요구사항: FR-019, SC-001
  - design.md: §9
  - 검증: 비회원으로 CTA "질문 작성하기" 클릭 시 `/login`, 회원으로는 `/questions/new`로 이동
- [X] T029 [US4] FloatingCard 컴포넌트 + Aurora/Grid Glow CSS 구현 — `src/components/FloatingCard/FloatingCard.tsx`, `MainPage.module.css`
  - 요구사항: 헌법 VI
  - design.md: §10
  - 검증: 순수 CSS(`::before`/`::after`)로만 구현되어 JS 애니메이션 의존성이 `package.json`에
    추가되지 않음
- [X] T030 [US4] 이용 흐름 3단계 + 상태 배지 예시 섹션 구현 — `src/pages/MainPage/MainPage.tsx`
  - 요구사항: FR-019
  - design.md: §9
  - 검증: "질문 작성 → 관리자 확인 → 답변 확인" 3단계와 배지 예시 2종(dot+텍스트) 렌더
- [X] T031 [US1] QuestionListPage 회원 뷰 구현 — `src/pages/QuestionListPage/QuestionListPage.tsx`
  - 요구사항: FR-006, FR-022, Clarifications Q3
  - design.md: §6, §11, §14
  - 검증: 제목 "내 질문", 상태 필터 3종 전환 시 목록이 필터링됨, 빈 목록 시 CTA 노출
- [X] T032 [US2] QuestionListPage 관리자 뷰 분기 구현 — 동일 파일 내 role 분기
  - 요구사항: FR-007
  - design.md: §6
  - 검증: 제목 "문의 관리", 닉네임 컬럼 노출, CTA 버튼 없음, 기본 필터 "답변 대기"
- [X] T033 [US1] QuestionDetailPage 통합 레이아웃 + 모드 파생 로직 구현 — `src/pages/QuestionDetailPage/QuestionDetailPage.tsx`
  - 요구사항: FR-021
  - design.md: §3, §13, contracts/routes.md(`deriveMode`)
  - 검증: `/questions/new`·pending·answered 3가지 URL/데이터 조합에서 올바른 모드가 계산됨(단위
    테스트)
- [X] T034 [US1] 신규 작성 모드 구현 — 동일 파일
  - 요구사항: FR-004, FR-005
  - design.md: §12
  - 검증: 제목/내용 입력 후 "등록하기" 클릭 시 `questionsRepository.create()` 호출, 성공 시
    상세(pending) 모드로 전환
- [X] T035 [US3] 답변 대기(수정 가능) 모드 구현 — 동일 파일
  - 요구사항: FR-013, FR-014
  - design.md: §13
  - 검증: "저장하기"로 수정, "삭제하기"로 삭제 후 목록으로 이동
- [X] T036 [US1] 저장 중 상태 구현 — 동일 파일
  - 요구사항: FR-020
  - design.md: §13
  - 검증: 저장 요청 중 모든 필드/버튼이 `disabled`, 버튼 라벨이 "저장 중..."으로 바뀜
- [X] T037 [US1] 입력 오류 상태 구현 — 동일 파일 + `src/lib/validation.ts`
  - 요구사항: FR-005, FR-010
  - design.md: §12
  - 검증: 제목 0자/101자, 내용/답변 0자/5001자 입력 시 `.has-error`+오류 문구 노출, 저장 버튼
    비활성화
- [X] T038 [US3] 답변 완료(읽기 전용) 모드 구현 — 동일 파일
  - 요구사항: FR-015
  - design.md: §13
  - 검증: 제목/내용이 테두리 없는 읽기 전용으로 렌더, 수정/삭제 버튼이 DOM에 존재하지 않음(조건부
    렌더 자체를 제거 — disabled만으로 처리하지 않음)
- [X] T039 [US2] 관리자 답변 작성 모드 구현 — 동일 파일
  - 요구사항: FR-009, FR-010(분석 결과 E2 반영 — 답변 필드 길이 검증 오류 상태 포함)
  - design.md: §13
  - 검증: 질문 필드 readOnly, 답변 textarea만 편집 가능, "답변 등록" 클릭 시
    `answersRepository.create()` 호출; 답변 0자 또는 5001자 입력 시 `Textarea`의 `error` prop으로
    오류 문구가 표시되고 "답변 등록" 버튼이 비활성화됨(T014/T015의 공통 오류 스타일 재사용,
    design.md에 없는 새 오류 프레임을 추가하지 않고 기존 컴포넌트 규칙만 적용)
- [X] T040 [US2] 관리자 답변 수정 모드 구현 + 답변 완료 질문 열람 시 자동 진입 연결 — 동일 파일
  - 요구사항: FR-011, FR-010(분석 결과 E2 반영)
  - design.md: §5(Claude Design 검토에서 "고립 프레임"으로 기록된 연결 누락을 실제 구현에서
    반드시 연결 — 사용자 명시 요청), §13
  - 검증: 관리자가 `status==='answered'`인 질문 상세로 진입하면 별도 URL 분기 없이 자동으로
    답변 수정 모드(textarea에 기존 답변 prefill)가 렌더됨을 단위 테스트로 고정; 수정 중 답변을
    0자 또는 5001자로 바꾸면 T039와 동일한 오류 표시 + "답변 수정" 버튼 비활성화
- [X] T041 [US2] 관리자 리스트 행 링크를 상태별로 분기 — `src/pages/QuestionListPage/QuestionListPage.tsx`
  - 요구사항: FR-011
  - design.md: §5(Claude Design 검토 시 "관리자 행이 상태와 무관하게 답변 작성으로만 연결"되던
    단순화를 실제 구현에서 해소)
  - 검증: 답변 대기 행 클릭 → 답변 작성 모드, 답변 완료 행 클릭 → 답변 수정 모드(T040과 함께
    E2E로 확인)
- [X] T081 [US1] QuestionListPage에 로딩·오류 상태 실제 연결 (분석 결과 E1 반영) —
      `src/pages/QuestionListPage/QuestionListPage.tsx`
  - 요구사항: FR-020
  - design.md: §14
  - 검증: mock `questionsRepository`가 지연 응답을 반환하는 동안 `LoadingState`가 렌더되고, 오류를
    반환하도록 임시 설정하면 `ErrorState`로 전환되며 "다시 시도" 클릭 시 재조회가 일어남(회원·관리자
    두 뷰 모두)
- [X] T082 [US1] QuestionDetailPage에 로딩·오류 상태 실제 연결 및 존재하지 않는 질문 id 처리
      (분석 결과 E1 반영) — `src/pages/QuestionDetailPage/QuestionDetailPage.tsx`
  - 요구사항: FR-020, spec.md Edge Case("삭제되었거나 존재하지 않는 질문의 상세 URL 접근")
  - design.md: §14
  - 검증: mock `questionsRepository.getById()`가 조회 중일 때 `LoadingState`, 존재하지 않는
    id를 반환할 때 `ErrorState`("찾을 수 없음")가 렌더됨을 Mock 단계(Phase 3, Supabase 연결 전)에서
    단위 테스트로 고정 — 기존 T073(Supabase 단계 검증)과 별개로 Mock 단계 자체에서도 이 시나리오를
    확인한다
- [X] T042 데스크톱/모바일 반응형 CSS 전 화면 적용 — 각 페이지 `.module.css`(브레이크포인트 640px)
  - 요구사항: SC-005
  - design.md: §20
  - 검증: 뷰포트 390px에서 Header 축소, Hero 1단, 리스트 타이틀 column, 상세 액션 버튼 전체 폭
    적용을 브라우저 개발자 도구로 확인
- [X] T043 [US4] prefers-reduced-motion 처리 — `src/pages/MainPage/MainPage.module.css`
  - 요구사항: 헌법 VII
  - design.md: §22
  - 검증: 기본 상태가 이미 `opacity:1;transform:none`이고, OS "동작 줄이기" 해제 시에만 진입
    애니메이션이 보임(미디어 쿼리 토글로 확인)
- [X] T044 [P] 3화면 Mock 기반 컴포넌트/통합 테스트 작성 — `tests/component/pages/*.test.tsx`
  - 요구사항: 헌법 XIII
  - design.md: quickstart.md 1단계 시나리오 1~10 매핑
  - 검증: `npm run test:component` 전체 통과

**Gate — Phase 4 진입 조건**: quickstart.md 1단계의 시나리오 1~10을 `DevRoleSwitcher`로 모두
수동 검증하고, `npm run test:unit && npm run test:component`가 통과해야 Phase 4로 넘어간다.

---

## Phase 4: Claude Design 동기화와 UI 수정

**목적**: Mock UI가 승인된 Claude Design 결과(`design.md`)와 실제로 같은지 확인하고 어긋난
부분을 고친다. **Supabase 연결(Phase 5)은 이 Phase가 끝난 뒤에만 시작한다.**

- [ ] T045 `/design-sync` 실행 전 코드 구조 검사 — `src/components/`, `src/pages/` 디렉터리가
      plan.md §16 동기화 범위와 정확히 일치하는지 점검(LoginPage/SignupPage/DevRoleSwitcher가
      대상에서 빠졌는지 확인)
  - 요구사항: plan.md §16
  - design.md: —
  - 검증: 동기화 대상 파일 목록을 체크리스트로 정리해 빠짐/초과가 없음을 확인
- [ ] T046 `/design-sync` 실행 — 공통 컴포넌트 + 디자인 토큰 동기화
  - 요구사항: plan.md §16
  - design.md: 전체
  - 검증: 동기화 실행 결과 로그에 Header/Button/Input/Textarea/Badge/QuestionCard/StatusFilter/
    FloatingCard/StateViews가 모두 포함됨
- [ ] T047 `/design-sync` 실행 — MainPage/QuestionListPage/QuestionDetailPage 3 핵심 페이지 동기화
  - 요구사항: plan.md §16
  - design.md: 전체
  - 검증: 동기화 결과가 Claude Design 프로젝트(`01/02/03`)에 반영됨
- [ ] T048 승인된 Claude Design과 구현 화면 비교 — 데스크톱·모바일 스크린샷을 나란히 대조
  - 요구사항: design.md §24 검증 항목 1~12
  - design.md: §24
  - 검증: 12개 항목 각각에 대해 일치/불일치 기록표 작성
- [ ] T049 CRITICAL·HIGH 시각 문제 수정 — T048에서 발견된 차이 보정
  - 요구사항: 헌법 V, VI
  - design.md: §24
  - 검증: 재스크린샷 후 T048 기록표의 모든 CRITICAL/HIGH 항목이 "일치"로 갱신됨
- [ ] T050 이전 Claude Design 검토(HIGH 10건·MEDIUM 2건) 수정 사항이 구현에도 반영됐는지 대조
  - 요구사항: FR-006, FR-007, FR-015, FR-020, FR-005
  - design.md: §6(제목 구분), §13(readonly 스타일), §11(필터 active 표시)
  - 검증: "내 질문"/"문의 관리" 제목 구분, readonly 필드 무테두리, 필터 active 텍스트+배경 강조가
    모두 구현에 존재
- [ ] T051 디자인 회귀 검증 — 컴포넌트 테스트 재실행 + 시각 비교로 회귀 없음 확인
  - 요구사항: 헌법 XIII
  - design.md: —
  - 검증: `npm run test:component` 재통과 + T048 스크린샷 대조표에 신규 불일치 없음

**Gate — Phase 5 진입 조건**: T051까지 완료, 회귀 없음 확인.

---

## Phase 5: Supabase 기반

**목적**: 실제 인증·데이터·권한 계층을 연결한다. Phase 4가 끝난 뒤에만 시작.

- [X] T052 Supabase 클라이언트 설정 — `src/lib/supabaseClient.ts`, `.env.local` 값 채움
  - 요구사항: plan.md §17
  - design.md: —
  - 검증: `supabase.auth.getSession()` 호출이 오류 없이 반환
- [X] T053 초기 마이그레이션 작성 — `supabase/migrations/0001_init.sql`(테이블+트리거)
  - 요구사항: contracts/database.md §1~§2
  - design.md: —
  - 검증: `supabase db push` 성공, `profiles`/`questions`/`answers` 테이블 존재 확인
- [X] T054 RLS 정책 작성 및 적용 — 동일 마이그레이션 파일에 `contracts/database.md` §3~§4 SQL 추가
  - 요구사항: FR-006, FR-007, FR-009, FR-013~FR-017
  - design.md: —
  - 검증: contracts/database.md §5 체크리스트 6개 항목을 SQL Editor에서 직접 실행해 모두 통과
- [X] T055 관리자 역할 판별 로직 구현 — `src/auth/AuthProvider.tsx`가 Supabase 세션에서
      `profiles.role` 조회
  - 요구사항: plan.md §9, §11
  - design.md: —
  - 검증: `role='admin'`으로 SQL 승격 후 재로그인하면 `useAuth().role === 'admin'`
- [X] T056 QuestionsRepository/AnswersRepository의 Supabase 구현체 작성 — 동일 파일에 구현체 추가
  - 요구사항: plan.md §15
  - design.md: —
  - 검증: `VITE_DATA_SOURCE=supabase`로 전환해도 Phase 3의 UI 코드 변경 없이 동일하게 동작
- [ ] T057 계약 검증 체크리스트 실행 — contracts/database.md §5 전체를 Playwright로 자동화
  - 요구사항: FR-012, FR-015, FR-016, FR-017
  - design.md: —
  - 검증: `tests/e2e/rls.spec.ts` 신규 작성 후 전부 통과
- [X] T058 [DevRoleSwitcher 제거] 개발용 역할 전환 컴포넌트 및 mock 분기 코드 삭제 — `src/auth/DevRoleSwitcher.tsx` 삭제, `AuthProvider`/`App.tsx`의 관련 조건부 렌더 제거
  - 요구사항: plan.md §9, §17(사용자 명시 요청)
  - design.md: —
  - 검증: 저장소에서 `DevRoleSwitcher` 문자열 검색 결과가 0건
- [X] T059 제거 확인(빌드 산출물 검사) — `npm run build` 후 `dist/` 번들에 `DevRoleSwitcher` 관련
      코드가 남아있지 않은지 확인
  - 요구사항: plan.md §9, §17(사용자 명시 요청 — "제거 확인" 별도 Task)
  - design.md: —
  - 검증: `grep -r "DevRoleSwitcher" dist/`가 결과 없음(빌드 시 완전히 제외됨)

**Gate**: T058·T059 완료 후에만 Phase 6/7의 실제 기능이 "프로덕션에서 안전"한 것으로 간주한다.

---

## Phase 6: 회원 기능

**목적**: 회원 관점의 전체 흐름을 Supabase에 연결한다.

- [X] T060 [US1] 회원가입 페이지 구현 — `src/pages/SignupPage/SignupPage.tsx`(Header/Input/Button만
      재사용, design.md에 없는 새 시각 규칙 추가 금지)
  - 요구사항: FR-001
  - design.md: §2("spec.md의 로그인·회원가입 화면은 공통 컴포넌트만 재사용한 단순 폼")
  - 검증: 닉네임 필드 포함 3개 입력으로 가입 성공 시 `/questions`로 이동
- [X] T061 [US1] 로그인 페이지 구현 — `src/pages/LoginPage/LoginPage.tsx`(동일 근거)
  - 요구사항: FR-002
  - design.md: §2
  - 검증: 로그인 성공 시 `location.state.from`(있으면) 또는 `/questions`로 이동
- [X] T062 [US1] 회원가입 시 닉네임 메타데이터 전달 및 profile 자동 생성 확인
  - 요구사항: FR-001
  - design.md: —
  - 검증: 가입 직후 `profiles` 테이블에 `display_name`이 채워진 행이 자동 생성됨(트리거 T053 동작)
- [X] T063 [US1] 자신의 질문 목록 조회 Supabase 연결 — `QuestionListPage` 회원 뷰
  - 요구사항: FR-006
  - design.md: §6
  - 검증: 다른 회원 계정으로 가입한 질문이 목록에 보이지 않음
- [X] T064 [US1] 질문 작성 기능 Supabase 연결
  - 요구사항: FR-004, FR-005
  - design.md: §12
  - 검증: 등록 직후 목록에 "답변 대기" 배지로 즉시 반영
- [X] T065 [US3] 질문 수정 기능 Supabase 연결(답변 전에만)
  - 요구사항: FR-013, FR-015
  - design.md: §13
  - 검증: 답변 완료 질문에 대해 API를 직접 호출해도 RLS가 거부(개발자 도구로 확인)
- [X] T066 [US3] 질문 삭제 기능 Supabase 연결(답변 전에만)
  - 요구사항: FR-014, FR-015
  - design.md: §13
  - 검증: 삭제 후 목록에서 즉시 사라짐, 답변 완료 질문은 삭제 버튼 자체가 없음(T038)
- [X] T067 [US1] 답변 확인 기능 Supabase 연결
  - 요구사항: FR-008, FR-012
  - design.md: §13
  - 검증: 관리자가 답변 등록 후 회원이 새로고침하면 답변 완료 모드로 전환되어 답변 내용이 보임
- [X] T068 로그아웃 기능 구현 — `Header`의 `qn-user` 로그아웃 액션
  - 요구사항: FR-002
  - design.md: §7
  - 검증: 로그아웃 후 보호된 경로 접근 시 다시 `/login`으로 리다이렉트

---

## Phase 7: 관리자 기능

**목적**: 관리자 관점의 전체 흐름을 Supabase에 연결한다.

- [X] T069 [US2] 전체 질문 목록 조회 Supabase 연결(닉네임 조인) — `QuestionListPage` 관리자 뷰
  - 요구사항: FR-007
  - design.md: §6, data-model.md 파생 뷰
  - 검증: 여러 회원이 작성한 질문이 닉네임과 함께 모두 노출
- [X] T070 [US2] 답변 작성 기능 Supabase 연결
  - 요구사항: FR-009, FR-012
  - design.md: §13
  - 검증: 등록 즉시 해당 질문 `status`가 `answered`로 바뀌고 회원 화면에도 반영(T067과 연동 확인)
- [X] T071 [US2] 답변 수정 기능 Supabase 연결(T040의 자동 진입 모드와 연결)
  - 요구사항: FR-011
  - design.md: §5, §13
  - 검증: 답변 완료 질문을 열면 기존 답변이 채워진 수정 모드로 진입, 수정 후 저장 시 내용 갱신
- [ ] T072 [US2] 권한 검증 — 일반 회원 세션으로 답변 insert 시도 시 처리 확인
  - 요구사항: FR-017
  - design.md: §14(오류 상태)
  - 검증: 개발자 도구에서 회원 토큰으로 `answers` insert 직접 호출 시 RLS 거부, UI는 오류 상태로
    안내
- [ ] T073 [US2] 권한 검증 — 회원이 타인 질문 id로 접근 시 처리 확인
  - 요구사항: FR-016
  - design.md: §14
  - 검증: 타인의 질문 상세 URL 직접 입력 시 데이터 없이 오류 상태만 노출(제목/내용 미노출)

---

## Phase 8: 테스트와 최종 검증

**목적**: spec.md의 성공 기준과 헌법 게이트를 전부 확인하고 마무리한다.

- [ ] T074 Playwright E2E 시나리오 전체 실행 — `tests/e2e/*.spec.ts`(quickstart.md 2·3단계
      시나리오 11~16)
  - 요구사항: SC-001~SC-007
  - design.md: —
  - 검증: `npm run test:e2e` 전체 통과
- [ ] T075 접근성 최종 점검 — 키보드 Tab만으로 3화면 전체 내비게이션, axe-core 위반 0건
  - 요구사항: 헌법 VIII
  - design.md: §21
  - 검증: 수동 Tab 내비게이션 기록 + axe 리포트 위반 0건
- [ ] T076 반응형 최종 확인 — Playwright 1440px/390px 두 프로젝트로 핵심 시나리오 재실행
  - 요구사항: SC-005
  - design.md: §20
  - 검증: 두 뷰포트 모두 그린
- [ ] T077 prefers-reduced-motion 최종 확인 — `reduce` 설정에서 MainPage 렌더 확인
  - 요구사항: 헌법 VII
  - design.md: §22
  - 검증: Playwright `--reduced-motion=reduce` 옵션으로 스크린샷 비교, 애니메이션 흔적 없음
- [ ] T083 SC-002("가입~첫 질문 등록 3분 이내") 측정 시나리오 설계 및 실행 (분석 결과 E3 반영)
  - 요구사항: SC-002
  - design.md: —
  - 검증: 신규 참가자(또는 최초 사용 시나리오로 재현 가능한 테스터) 최소 3인을 대상으로 "회원가입
    시작 → 첫 질문 등록 완료" 구간을 타이머로 측정하고, 전원 3분 이내 완료 여부를 기록한 결과표를
    남긴다 — Playwright로 자동 타이밍을 재는 보조 스크립트를 추가해도 되지만, 최종 판정은 실제
    사용자 조작 기준으로 한다(T078의 SC-002 항목이 이 결과를 인용하도록 연결)
- [ ] T078 spec.md 성공 기준(SC-001~SC-007) 전체 재확인 및 결과 기록
  - 요구사항: SC-001~SC-007
  - design.md: —
  - 검증: 7개 기준 각각에 대해 pass/fail과 근거(테스트 ID)를 표로 정리 — SC-002는 T083의 측정
    결과를 그대로 인용한다
- [ ] T079 CI 게이트 실행 — `tsc --noEmit` → `lint` → `test:unit` → `test:component` → `test:e2e`
      순차 실행
  - 요구사항: 헌법 XIII("테스트와 빌드가 실패한 작업은 완료 처리하지 않는다")
  - design.md: —
  - 검증: 5개 명령 모두 종료 코드 0
- [ ] T080 실행 문서 최종 정리 — `quickstart.md` 절차와 실제 npm scripts/명령이 일치하는지 대조
  - 요구사항: —
  - design.md: —
  - 검증: quickstart.md의 모든 커맨드를 처음부터 그대로 실행했을 때 문서와 동일한 결과가 나옴

---

## Dependencies (Phase 순서)

```
Phase 1 (설정)
  → Phase 2 (디자인 시스템, 모든 화면의 전제)
    → Phase 3 (3 화면 + Mock)  ── Gate: quickstart 1단계 시나리오 1~10 통과 ──
      → Phase 4 (design-sync + UI 수정)  ── Gate: 회귀 없음 확인 ──
        → Phase 5 (Supabase 기반)  ── Gate: DevRoleSwitcher 제거·제거확인(T058,T059) ──
          → Phase 6 (회원 기능) ─┐
          → Phase 7 (관리자 기능) ┴→ Phase 8 (최종 검증)
```

Phase 6과 Phase 7은 서로 독립적인 파일을 주로 건드리므로(회원 전용 흐름 vs 관리자 전용 흐름)
Phase 5 완료 후 병렬로 진행할 수 있다. 단, T071(관리자 답변 수정)은 T067(회원 답변 확인)이 만든
데이터 흐름을 검증에 함께 쓰므로 두 Phase의 마지막 통합 확인은 순차로 한다.

## Parallel Execution 예시

- Phase 2: T008~T010(토큰/전역/타이포), T012~T019(Header/Button/Input/Textarea/Badge/StateViews
  3종)는 서로 다른 파일이므로 모두 동시 진행 가능.
- Phase 3: T023(Mock 데이터)와 T027(DevRoleSwitcher)은 T026(AuthProvider) 완료 후 병렬 가능.
- Phase 6/7: T060~T068(회원)과 T069~T073(관리자)은 Phase 5 완료 후 서로 다른 개발자가 동시 진행
  가능.

## Implementation Strategy

1. **MVP 우선순위**: spec.md 우선순위(P1 질문 등록·확인 → P2 관리자 답변 → P3 수정·삭제 →
   P4 메인 페이지)를 그대로 따르되, 이번 Task 분해는 사용자가 지정한 8-Phase 구조를 그대로
   따른다 — Phase 3 안에서 US1(T031,T033~T037)을 가장 먼저 완성하고, US4(메인, T028~T030),
   US2(T032,T039~T041), US3(T038)를 이어서 완성하는 순서를 권장한다.
2. **점진적 배포 지점**: Phase 3 종료(Mock UI 완성) → Phase 4 종료(디자인 확정) → Phase 5 종료
   (실 데이터 연결, 개발용 장치 제거) 세 지점이 각각 안전하게 멈출 수 있는 지점이다.
3. 각 Phase 종료 시 해당 Phase의 "Gate"/"Checkpoint" 문구에 적힌 조건을 만족해야 다음 Phase로
   넘어간다(헌법 XIII).

---

## Phase 9: Convergence

**목적**: `/speckit-converge`가 spec.md/plan.md/tasks.md 대비 현재 코드를 재평가해 찾아낸,
기존 Task로 아직 추적되지 않는 잔여 작업. (`tests/e2e/` 부재로 `npm run test:e2e`가
"No tests found"로 실패하는 문제 등은 이미 T057·T074·T083이 추적 중이라 여기 중복 생성하지
않았다.)

- [X] T084 axe-core(또는 동급 접근성 자동 검증 도구)를 devDependency로 설치하고
      `tests/component/{Header,Button,Input,Textarea,Badge}.test.tsx` 등 공통 컴포넌트 테스트에
      실제 위반 검사를 추가해 0건을 확인 per tasks.md T022 (contradicts)
  - 요구사항: plan.md §14("컴포넌트 | Vitest + Testing Library + axe-core"), 헌법 XIII
  - design.md: §21
  - 검증: `package.json`에 axe 관련 패키지가 존재하고, 해당 테스트가 실제로 접근성 위반을
    검사한 뒤 0건으로 통과함(현재는 T022가 완료로 표시되어 있으나 axe-core가 프로젝트에
    설치된 적이 없어 이 검증이 실제로 수행되지 않았다)

---

## Phase 10: Convergence

**목적**: T084 완료 후 재평가한 잔여 작업. Phase 8(T057, T072~T080, T083)과 중복되지 않는
항목만 담는다.

- [X] T085 `QuestionCard`/`StateViews`에 대한 axe-core 접근성 검사를 추가 per plan.md §14 (partial)
  - 요구사항: plan.md §14("컴포넌트 | Vitest + Testing Library + axe-core | Header/Button/Input/
    Textarea/Badge/QuestionCard/StateViews")
  - design.md: §21
  - 검증: `tests/component/QuestionCard.test.tsx`(신규)와 `tests/component/StateViews.test.tsx`에
    T084와 동일한 `axe(container)` → `toHaveNoViolations()` 검사가 추가되어 통과함(T084는 plan.md
    §14가 명시한 7개 컴포넌트 중 5개만 처리했고, `QuestionCard`는 테스트 파일 자체가 없었다)
