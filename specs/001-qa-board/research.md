# Phase 0 Research: QANOW 구현

**Feature**: 001-qa-board · 이 문서는 `plan.md` Technical Context에서 발생한 기술 선택의 근거를
기록한다. `plan.md`에는 NEEDS CLARIFICATION으로 남긴 항목이 없었으므로, 아래는 "합리적 기본값"으로
확정한 결정들의 근거를 검토용으로 남긴다.

## 1. 상태 관리: Context + hooks vs Redux/Zustand

- **Decision**: 별도 전역 상태 라이브러리를 쓰지 않는다. `AuthProvider`(인증) 외에는 각 페이지가
  자체 데이터 훅(`useQuestions`, `useQuestionDetail`)으로 서버 상태를 들고 있는다.
- **Rationale**: 화면이 3개 + 보조 2개뿐이고 전역으로 공유해야 하는 상태는 인증/역할뿐이다(헌법
  XI 단순한 MVP 우선). Redux/Zustand는 이 규모에서 보일러플레이트만 늘린다.
- **Alternatives considered**: Zustand(가볍지만 이 규모에선 Context로 충분), React Query(서버
  상태 캐싱에 유용하지만 리스트 하나·상세 하나뿐인 MVP에서는 과설계로 판단, 필요해지면 나중에
  리포지토리 계층 위에 얹기 쉬움).

## 2. RLS 재귀 방지: SECURITY DEFINER 함수

- **Decision**: `profiles.role`을 확인하는 모든 RLS 정책이 `public.current_role()`이라는
  `SECURITY DEFINER` 함수를 통해서만 역할을 조회한다.
- **Rationale**: `profiles` 테이블의 SELECT 정책이 `profiles`를 스스로 다시 쿼리하면(예:
  `role = (select role from profiles where id = auth.uid())`) PostgreSQL이 정책 평가 중 같은
  테이블에 재진입하면서 성능 저하나 예기치 않은 동작을 유발할 수 있다는 것이 Supabase/PostgREST
  커뮤니티의 공통된 권고다. `SECURITY DEFINER` 함수는 호출자의 RLS를 우회해 스칼라 값 하나만
  돌려주므로 안전하게 재사용할 수 있다.
- **Alternatives considered**: JWT 커스텀 클레임에 role을 심어 `auth.jwt()`에서 바로 읽는 방법(더
  빠르지만 role 변경 시 재로그인이 필요해 관리자 승격 절차(§11)와 궁합이 나쁨 — 이번 MVP에서는
  제외).

## 3. Mock/Supabase 전환: 리포지토리 인터페이스 하나

- **Decision**: `QuestionsRepository`/`AnswersRepository` 인터페이스 하나씩만 두고, 구현체를
  환경변수로 스위치한다(plan.md §15).
- **Rationale**: "Mock Data로 먼저 검증 → Supabase 연결"이라는 요구를 만족하는 가장 단순한 방법.
  어댑터가 하나뿐이라 헌법 XI(단순한 MVP 우선)를 위반하지 않는다.
- **Alternatives considered**: MSW(Mock Service Worker)로 네트워크 레벨을 가로채는 방법(Supabase
  JS SDK 호출을 가짜 HTTP로 가로채야 해서 설정이 더 복잡함 — 이번 규모에는 과함).

## 4. 테마 전환: `data-theme` 속성 vs 페이지별 CSS 중복

- **Decision**: 앱 루트 각 페이지 컨테이너에 `data-theme="dark"|"light"`를 두고, 컴포넌트 CSS
  Module은 `:global([data-theme='dark']) .badge[data-tone='pending'] { ... }` 형태로 분기한다.
- **Rationale**: Claude Design 목업의 `shared.css`가 `.on-dark`/`.on-light` 조상 선택자로 같은
  컴포넌트를 재사용한 패턴을 그대로 재현해야 design.md와의 추적성(헌법 XII)이 깨지지 않는다.
- **Alternatives considered**: 컴포넌트마다 `DarkButton`/`LightButton`처럼 변형별로 별도 컴포넌트를
  만드는 방법 — design.md §7이 "같은 컴포넌트 규칙을 공유하고 색만 바뀐다"고 명시했으므로 기각.

## 5. 반응형 전략: 고정 두 폭(1440/390) vs 유동형 + 단일 브레이크포인트

- **Decision**: 실제 구현은 유동형 레이아웃 + `max-width:640px` 브레이크포인트 하나로 만든다.
- **Rationale**: Claude Design의 1440px/390px 프레임은 "검토용 정적 목업"이었을 뿐, spec.md
  SC-005(데스크톱·모바일 모두 완결)는 특정 두 폭만을 요구하지 않는다. 유동형으로 만들어야 그
  사이의 실제 기기 폭에서도 깨지지 않는다.
- **Alternatives considered**: 목업과 동일하게 1440/390 두 고정 폭만 지원 — 실제 브라우저 창
  크기는 그 사이 값을 많이 가지므로 기각.

## 6. 테스트 도구: Vitest+RTL+Playwright vs Jest+Cypress

- **Decision**: Vite 프로젝트와 설정 공유가 쉬운 Vitest(단위/컴포넌트) + Playwright(E2E, 다중
  브라우저·다중 뷰포트 기본 지원)를 채택.
- **Rationale**: Vite 생태계와의 설정 중복 최소화, Playwright의 뷰포트 프리셋으로 SC-005 검증이
  간단해짐.
- **Alternatives considered**: Jest(Vite와 별도 트랜스폼 설정 필요, 이유 없이 도구를 늘리는 셈),
  Cypress(뷰포트 전환은 가능하나 Playwright 대비 다중 브라우저 병렬 실행이 더 무겁다는 평가로
  제외).

## 7. 관리자 계정 생성: 셀프서비스 승격 vs 수동 SQL

- **Decision**: 관리자 승격은 앱 UI로 제공하지 않고, 회원가입 후 운영자가 Supabase SQL Editor에서
  `role`을 직접 변경한다(quickstart.md).
- **Rationale**: spec.md Assumptions가 "관리자 계정은 사전에 생성, 자체 관리자 가입 절차는 MVP
  범위 아님"이라 명시했다(헌법 IV 명세 범위 엄수).
- **Alternatives considered**: 관리자 초대 코드/화면 — 명세에 없는 기능이라 기각.
