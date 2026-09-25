<!--
Sync Impact Report
- Version change: (unversioned template) → 1.0.0
- Rationale: Initial ratification. Prior file only contained unfilled placeholder tokens (never
  ratified), so this is treated as the constitution's first concrete version rather than an
  amendment.
- Modified principles: none (n/a — first version)
- Added sections:
  - Core Principles I–XIII (역할 기반 권한 분리, 데이터 계층 권한 강제, 사용자 입력 검증,
    명세 범위 엄수, 핵심 화면 일관성, 성능 우선 시각 효과, 모션 접근성, 키보드 조작 가능성,
    텍스트 병행 상태 표시, 반응형 시나리오 완결성, 단순한 MVP 우선, 요구사항-디자인 추적성,
    품질 게이트)
  - 적용 범위 (Section 2)
  - 개발 워크플로우 (Section 3)
  - Governance
- Removed sections: none
- Deferred / TODO placeholders: none
- Templates requiring follow-up review (not modified by this command):
  - .specify/templates/plan-template.md — verify its Constitution Check gate references these
    13 principles instead of the generic 5-principle example set.
  - .specify/templates/spec-template.md — verify accessibility/keyboard/motion requirements are
    captured as testable acceptance criteria where relevant.
  - .specify/templates/tasks-template.md — verify each task can carry a traceability reference
    per Principle XII.
-->

# QANOW Constitution
<!-- QANOW: 회원/관리자 역할을 가진 질의응답(Q&A) 게시판 서비스 -->

## Core Principles

### I. 역할 기반 권한 분리 (Role-Based Access Separation)
**규칙**: 회원(User)과 관리자(Admin)의 권한 및 가능한 행동은 명확히 구분되어 정의되어야 한다
(MUST). 관리자 전용 기능(질문/답변 삭제, 사용자 제재, 공지 관리 등)은 회원 역할로는 수행할 수
없어야 한다.

**이유**: 권한 경계가 모호하면 일반 회원이 관리 기능에 접근하거나 관리자가 필요한 조치를 적시에
취하지 못하는 사고로 이어진다.

**검토 기준**: 각 기능 명세에 필요한 역할(회원/관리자)이 명시되어 있는가? 역할별 접근 제어에
대한 테스트 케이스(허용/거부 양쪽)가 존재하는가?

### II. 권한의 데이터 계층 강제 (Server-Side Authorization Enforcement)
**규칙**: 권한 검사는 UI에서 버튼이나 메뉴를 숨기는 것으로 끝나서는 안 되며, API 또는 DB
(예: RLS 정책) 계층에서 최종적으로 강제되어야 한다(MUST).

**이유**: UI 레벨의 권한 제어만으로는 직접적인 API 호출이나 브라우저 개발자 도구를 통한 우회를
막을 수 없어 실질적인 보안이 되지 못한다.

**검토 기준**: 모든 쓰기 작업 및 민감한 조회 작업에 서버/DB 정책 검증이 존재하는가? UI를
거치지 않고 API를 직접 호출했을 때도 권한 밖 요청이 거부되는가?

### III. 사용자 입력 검증 (Input Validation)
**규칙**: 질문 작성, 답변 작성, 회원가입 등 모든 사용자 입력은 클라이언트와 서버 양쪽에서
형식·길이·필수값을 검증해야 한다(MUST).

**이유**: 검증되지 않은 입력은 데이터 무결성 훼손, XSS/인젝션 등 보안 취약점, 그리고 잘못된
사용자 경험으로 직결된다.

**검토 기준**: 각 입력 필드에 대한 검증 규칙이 명세에 정의되어 있는가? 클라이언트 검증과는
독립적으로 서버 측 검증이 존재하는가?

### IV. 명세 범위 엄수 (Spec-Scope Discipline)
**규칙**: 명세(spec)에 정의되지 않은 기능을 임의로 추가해서는 안 된다(MUST NOT). 새로운 기능이
필요하다고 판단되면 구현에 앞서 먼저 명세를 갱신해야 한다.

**이유**: 범위를 벗어난 임의 구현은 요구사항 추적성을 깨뜨리고, MVP 일정 관리와 품질 보증을
어렵게 만든다.

**검토 기준**: 구현된 기능 각각이 spec.md의 항목과 매핑되는가? PR에 명세와 매핑되지 않는 코드가
포함되어 있지 않은가?

### V. 핵심 화면 일관성 (Core Screen Consistency)
**규칙**: 명세에서 정의한 세 핵심 화면은 동일한 정보 구조(헤더, 내비게이션, 상태 표시 패턴)와
디자인 언어(컴포넌트, 타이포그래피, 간격 체계)를 공유해야 한다(MUST).

**이유**: 화면마다 서로 다른 패턴을 사용하면 사용자가 매번 새로 학습해야 하고, 디자인/코드
유지보수 비용이 커진다.

**검토 기준**: 세 화면의 레이아웃과 컴포넌트가 동일한 디자인 시스템에서 파생되었는가? 신규 화면
리뷰 시 기존 패턴과의 불일치가 없는가?

### VI. 성능 우선 시각 효과 (Performance-Safe Visual Effects)
**규칙**: 메인 페이지의 배경 효과, 애니메이션, 장식 요소는 핵심 콘텐츠의 가독성이나 로딩·렌더링
성능을 저하시켜서는 안 된다(MUST NOT).

**이유**: 화려한 시각 효과가 실제 사용자의 정보 탐색 속도와 체감 성능을 해치면 게시판 서비스
본연의 가치(빠르고 명확한 정보 접근)를 훼손한다.

**검토 기준**: 시각 효과 적용 전후로 핵심 성능 지표(예: LCP, CLS)가 허용 범위 내인가? 텍스트와
배경의 명도 대비가 가독성 기준을 만족하는가?

### VII. 모션 접근성 (Reduced-Motion Accessibility)
**규칙**: 모든 애니메이션·트랜지션은 `prefers-reduced-motion` 설정을 감지하여, 이를 활성화한
사용자에게는 모션을 축소하거나 제거해야 한다(MUST).

**이유**: 전정 장애 등으로 모션에 민감한 사용자를 배려하지 않으면 접근성 요구를 위반하고 실제
사용에 불편이나 불쾌감을 초래한다.

**검토 기준**: 모든 애니메이션 구현에 `prefers-reduced-motion` 미디어쿼리 또는 동등한 처리가
존재하는가?

### VIII. 키보드 조작 가능성 (Keyboard Operability)
**규칙**: 질문 작성, 답변 작성, 검색, 로그인 등 주요 행동은 마우스 없이 키보드만으로 시작부터
끝까지 수행 가능해야 한다(MUST).

**이유**: 키보드 사용자와 스크린리더 사용자를 배제하지 않기 위한 최소한의 접근성 요건이다.

**검토 기준**: 주요 플로우를 Tab/Enter/Space만으로 완결할 수 있는가? 포커스 이동 순서가
논리적이고 포커스 표시가 시각적으로 명확한가?

### IX. 텍스트 병행 상태 표시 (Text-Paired Status Indication)
**규칙**: 답변 채택 여부, 처리 상태 등 상태 정보는 색상만으로 구분하지 않고 텍스트 또는
아이콘+라벨을 함께 제공해야 한다(MUST).

**이유**: 색맹이나 저시력 사용자는 색상만으로 상태를 구분할 수 없다.

**검토 기준**: 색상으로 구분되는 모든 상태 표시에 텍스트 레이블이 동반되는가?

### X. 반응형 시나리오 완결성 (Cross-Device Scenario Completion)
**규칙**: 핵심 사용자 시나리오(질문 등록, 답변 작성, 질문 열람 등)는 데스크톱과 모바일 뷰포트
모두에서 처음부터 끝까지 완료 가능해야 한다(MUST).

**이유**: 모바일에서 플로우가 중간에 끊기면 상당수의 실사용자가 서비스를 이용할 수 없게 된다.

**검토 기준**: 각 핵심 시나리오에 대해 데스크톱/모바일 양쪽의 E2E 테스트 또는 수동 검증 기록이
존재하는가?

### XI. 단순한 MVP 우선 (Simplicity-First MVP)
**규칙**: 검증되지 않은 확장성이나 미래 요구를 가정한 구조를 미리 도입하지 않고, 현재 명세를
만족하는 가장 단순한 구조를 우선한다(MUST).

**이유**: 과도한 추상화나 선제적 확장은 MVP 단계에서 개발 속도를 늦추고 버그가 발생할 표면을
넓힌다.

**검토 기준**: 도입된 추상화나 레이어가 현재 spec의 요구사항으로 정당화되는가? "향후를 위해"라는
이유만으로 추가된 코드가 없는가?

### XII. 요구사항-디자인 추적성 (Requirement & Design Traceability)
**규칙**: 모든 구현 Task는 어떤 요구사항(spec)과 어떤 디자인 근거(plan/design 문서)에서
비롯되었는지 추적 가능해야 한다(MUST).

**이유**: 추적성이 없으면 왜 그 코드가 존재하는지 알 수 없어 유지보수, 회귀 영향 분석, 감사가
불가능해진다.

**검토 기준**: tasks.md의 각 Task가 spec 항목 및 디자인 문서에 대한 참조를 포함하는가?

### XIII. 품질 게이트: 실패한 작업은 완료가 아니다 (Quality Gate — No Green, No Done)
**규칙**: 테스트가 실패하거나 빌드가 실패한 작업은 완료(Done)로 처리해서는 안 된다(MUST NOT).

**이유**: 실패 상태를 완료로 처리하면 깨진 기능이 배포되거나 후속 작업의 기반이 되어 문제가
누적된다.

**검토 기준**: Task를 완료 처리하기 전 테스트 스위트와 빌드가 모두 통과했는가? 통과 결과(CI
로그, 실행 스크린샷 등)가 함께 기록되어 있는가?

## 적용 범위
<!-- Section 2: 이 헌법이 다루는 대상과 경계 -->

이 헌법은 QANOW 질의응답 게시판의 다음 영역에 적용된다: (1) 회원과 관리자의 권한 모델, (2)
명세(spec.md)에서 정의하는 핵심 화면 및 사용자 시나리오, (3) 해당 화면에서 발생하는 접근성·성능
관련 UX 품질 기준. 세 핵심 화면의 구체적인 명칭과 범위는 각 기능의 spec.md에서 정의하며, 이
헌법은 그 화면들이 지켜야 할 일관성·접근성·성능 기준(원칙 V~X)을 규정한다. 이 헌법은 MVP 범위의
단순성(원칙 XI)을 기본값으로 하며, 범위 확장은 반드시 명세 갱신을 통해서만 이루어진다(원칙 IV).

## 개발 워크플로우
<!-- Section 3: spec → plan → tasks → implement 흐름에서의 준수 방식 -->

모든 기능은 `speckit-specify` → `speckit-plan` → `speckit-tasks` → `speckit-implement` 순서를
따른다. `plan` 단계에서는 Constitution Check 게이트를 통해 해당 기능이 13개 원칙과 충돌하지
않는지 검토해야 하며, 충돌이 불가피한 경우 그 사유를 문서화해야 한다. `tasks` 단계에서 생성되는
각 Task는 원칙 XII에 따라 관련 spec 항목과 디자인 근거를 명시해야 한다. 코드 리뷰 및 PR 병합
전에는 원칙 I~III(권한/입력 검증), VII~X(접근성/반응형), XIII(품질 게이트) 위반 여부를 확인해야
하며, 위반 사항이 있는 PR은 병합할 수 없다.

## Governance

이 헌법은 QANOW 프로젝트의 다른 모든 관행과 문서보다 우선한다. 개정은 다음 절차를 따른다:

- 개정은 PR(또는 동등한 변경 제안)로 제출되며, 변경 사유와 영향받는 원칙을 명시해야 한다.
- 버전 관리는 시맨틱 버저닝을 따른다: MAJOR는 기존 원칙의 제거나 하위 호환 불가능한 재정의,
  MINOR는 신규 원칙 추가나 기존 원칙의 실질적 확장, PATCH는 표현 수정이나 오탈자 정정 등
  비의미적 변경에 사용한다.
- 모든 개정에는 Sync Impact Report(버전 변경 내역, 추가/삭제/수정된 섹션, 후속 조치가 필요한
  템플릿)를 이 파일 상단에 HTML 주석으로 기록해야 한다.
- 모든 PR과 코드 리뷰는 이 헌법의 원칙 준수 여부를 확인해야 하며, 복잡성(추상화, 의존성 추가
  등)은 원칙 XI에 따라 정당화되어야 한다.
- 런타임 개발 시 세부 가이드가 필요한 경우 각 기능의 `plan.md` 및 `tasks.md`를 참조한다.

**Version**: 1.0.0 | **Ratified**: 2026-09-25 | **Last Amended**: 2026-09-25
