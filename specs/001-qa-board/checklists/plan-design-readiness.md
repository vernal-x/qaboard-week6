# Plan & Design Readiness Checklist: QANOW 질문-답변 게시판

**Purpose**: 구현(`/speckit-implement`)을 시작하기 전에 `spec.md`, `design.md`, `plan.md` 세
문서의 요구사항 작성 품질(완전성·명확성·일관성·측정 가능성·추적성)을 검증한다.
**Created**: 2026-09-25
**Feature**: [spec.md](../spec.md) · [design.md](../design.md) · [plan.md](../plan.md)

**Note**: 이 커스텀 체크리스트는 `/speckit-checklist` 명령으로 생성되었다.
**Review Ownership**: 이 체크리스트는 리뷰어 소유의 요구사항 품질 검토 산출물이다. 항목을
`[x]`로 표시하는 것은 리뷰어가 해당 요구사항 품질 기준이 충족되었다고 판단했다는 뜻이며,
구현 작업이 완료되었다는 뜻이 아니다.
**Marker Semantics**: `[x]`는 요구사항 자체의 품질이 검토·충족되었음을 의미한다.

## 사용자 역할과 데이터 범위

- [ ] CHK001 비회원/회원/관리자 세 역할의 권한 차이가 spec.md 한 곳에서 표나 목록으로 일관되게
      정리되어 있는가, 아니면 여러 절에 흩어져 상호 참조가 필요한가? [Consistency, Spec §권한]
- [ ] CHK002 "회원"·"관리자"라는 용어가 spec.md·design.md·plan.md 전체에서 동일한 의미로
      일관되게 쓰이는가? [Consistency]
- [ ] CHK003 관리자 계정 생성 방식(사전 시딩 vs 셀프서비스 승격)이 spec.md의 가정과 plan.md의
      역할 모델 사이에서 서로 모순되지 않게 명시되어 있는가? [Consistency, Spec §Assumptions, Plan §11]
- [ ] CHK004 회원의 질문 목록 범위("본인 질문만")와 관리자의 범위("전체 질문")가 각각 어떤
      데이터 조건으로 판별되는지까지 구체적으로 정의되어 있는가? [Clarity, Spec §FR-006, §FR-007]
- [ ] CHK005 관리자가 다른 관리자가 작성한 답변을 수정할 수 있는지(관리자 간 소유권 유무)가
      spec.md 자체에 명시되어 있는가, 아니면 plan.md의 가정에만 존재하는가? [Gap, Plan §12]

## 답변 전후 수정·삭제 규칙

- [ ] CHK006 "답변 등록 전"과 "등록 후"를 가르는 상태 값이 spec.md와 data-model.md 양쪽에서
      동일하게 정의되어 있는가? [Consistency, Spec §FR-012, Data-Model]
- [ ] CHK007 답변 완료 후 회원이 수정·삭제를 시도했을 때, 사용자에게 보일 문구와 실제 차단
      계층(UI만인지 데이터 계층까지인지)이 모두 명시되어 있는가? [Completeness, Spec §FR-015, Plan §12]
- [ ] CHK008 관리자가 이미 등록된 답변을 재수정할 수 있는 횟수나 이력 보존 여부에 대한
      요구사항이 존재하는가, 아니면 암묵적으로 무제한으로 가정되는가? [Gap, Spec §FR-011]

## 권한 없는 접근 처리

- [ ] CHK009 비회원이 보호된 화면에 접근했을 때의 동작(리다이렉트 대상, 로그인 후 복귀 여부)이
      spec.md와 plan.md의 라우트 계약 사이에서 일치하는가? [Consistency, Spec §FR-018, Plan Contracts §Routes]
- [ ] CHK010 회원이 다른 회원의 질문에 접근했을 때 보여줄 화면이 "오류 상태"인지 "권한 없음
      상태"인지 하나로 명확히 정의되어 있는가? [Ambiguity, Spec §FR-016]
- [ ] CHK011 일반 회원이 답변 작성 API를 직접 호출하는 시나리오에 대해 UI 요구사항과 데이터
      계층(RLS) 요구사항이 모두 문서화되어 있는가? [Completeness, Spec §FR-017, Plan §12]

## 입력 길이와 빈 값 처리

- [ ] CHK012 제목·내용·답변 각각의 길이 제한과 "공백만 입력" 처리 방식이 세 필드 모두 동일한
      형식(trim 후 글자 수 범위)으로 일관되게 기술되어 있는가? [Consistency, Spec §FR-005, §FR-010]
- [ ] CHK013 길이 제한 위반 시 사용자에게 보일 오류 문구의 형식이 예시로 제시되어 있는가, 아니면
      "오류를 안내한다"는 서술에만 그치는가? [Clarity, Spec §FR-005, Design.md §12]
- [ ] CHK014 붙여넣기 등으로 최대 길이를 초과 입력했을 때 입력 시점 차단인지 제출 시점 검증인지
      처리 방식이 명시되어 있는가? [Gap]

## 성공 기준의 측정 가능성

- [ ] CHK015 "별도 설명 없이 이해한다"(SC-001), "검색·필터 없이 완료한다"(SC-004) 같은 성공
      기준이 관찰 가능한 행동이나 측정 방법과 함께 정의되어 있는가? [Measurability, Spec §SC-001, §SC-004]
- [ ] CHK016 SC-002의 "3분 이내" 기준을 누가·어떤 환경에서 측정하는지가 정의되어 있는가?
      [Measurability, Spec §SC-002]
- [ ] CHK017 SC-006·SC-007의 "100% 차단/거부" 기준을 검증할 구체적 테스트 시나리오 목록이
      spec.md 또는 quickstart.md에 존재하는가? [Traceability, Spec §SC-006, §SC-007, Quickstart]

## 제외 범위(Scope Boundary)

- [ ] CHK018 MVP 제외 목록(파일 첨부·댓글·검색·페이지네이션·소셜 로그인·통계 대시보드) 각
      항목이 "기능 자체 없음"인지 "화면에 진입점만 없음"인지 모호함 없이 기술되어 있는가?
      [Clarity, Spec §Assumptions]
- [ ] CHK019 답변 삭제 기능이 제외 목록에 명시적으로 나열되어 있지 않은데도, spec.md 전체에서
      "삭제"가 질문에만 적용됨이 일관되게 유지되는가? [Consistency, Gap]

## 세 핵심 화면의 정보 구조(design.md)

- [ ] CHK020 메인/질문 리스트/질문 페이지 각각의 정보 구조(요소 우선순위·필수 콘텐츠)가
      화면별로 구분되어 정의되어 있는가? [Completeness, Design.md §3, §4]
- [ ] CHK021 질문 페이지의 각 모드(신규 작성/답변 대기/저장 중/입력 오류/답변 완료, 관리자
      답변 작성/수정)별로 어떤 필드가 편집 가능한지가 표로 애매함 없이 정의되어 있는가?
      [Clarity, Design.md §13]
- [ ] CHK022 design.md의 화면 간 이동 그래프와 plan.md 라우트 계약이 항목 대 항목으로
      대응되는가, 빠진 이동 경로는 없는가? [Consistency, Design.md §5, Plan Contracts §Routes]

## 디자인 토큰 → CSS 구현 계획

- [ ] CHK023 design.md의 디자인 토큰(색상·라운드·폰트) 표가 plan.md의 CSS 변수 선언과 1:1
      대응되는가, 누락된 토큰(예: 그림자 값)은 없는가? [Completeness, Design.md §15, Plan §3]
- [ ] CHK024 다크(메인)·라이트(내부) 두 테마 전환 메커니즘이 plan.md에 하나의 방식으로
      확정되어 있는가, 여러 대안이 병기된 채로 남아 있지 않은가? [Clarity, Plan §3, Research §4]

## 메인 Hero 시각 효과 구현 범위

- [ ] CHK025 Aurora Gradient·Grid Glow·Floating Card 각각의 구현 수단이 plan.md에 명시되어
      구현 범위가 특정 기술로 한정되는가? [Clarity, Design.md §10, Plan §5]
- [ ] CHK026 Hero 시각 효과가 텍스트 대비·성능을 해치지 않아야 한다는 요구사항에 대해, 구현
      후 확인할 구체적 기준(대비비, 렌더링 비용 등)이 수치로 정의되어 있지 않은 점이 의도된
      것인지 명시되어 있는가? [Gap, Design.md §10, 헌법 VI]

## prefers-reduced-motion 대응

- [ ] CHK027 reduced-motion 사용자에게 "완성된 최종 상태를 즉시 표시"한다는 요구사항이
      spec.md·design.md·plan.md 세 문서에서 동일한 방식(기본 상태=최종 상태)으로 일관되게
      기술되어 있는가? [Consistency, Design.md §22, Plan §7]
- [ ] CHK028 메인 페이지 외 화면에 향후 애니메이션이 추가될 경우를 대비한 reduced-motion
      원칙이 문서화되어 있는가, 아니면 "현재는 메인 페이지에만 애니메이션이 있다"는 상태에만
      의존하는가? [Gap]

## Loading, Empty, Error, Unauthorized 상태

- [ ] CHK029 4개 상태 각각에 대해 회원 뷰와 관리자 뷰의 차이(예: 빈 목록의 CTA 유무)가
      상태별로 빠짐없이 정의되어 있는가? [Completeness, Design.md §14, Spec §Clarifications Q5]
- [ ] CHK030 "저장 중" 상태의 중복 제출 방지 요구사항이 UI 비활성화 수준인지 서버 측 재확인까지
      포함하는지 명확히 구분되어 있는가? [Clarity, Spec §FR-020]
- [ ] CHK031 design.md의 "권한 없음" 상태 카드와 spec.md FR-018의 리다이렉트 요구사항이 서로
      다른 처리 방식처럼 보이는 부분을 plan.md가 어떻게 조정하는지 명시되어 있는가?
      [Conflict, Design.md §14, Plan §8]

## 회원과 관리자 UI 차이

- [ ] CHK032 리스트 페이지 제목("내 질문"/"문의 관리"), 기본 필터, CTA 유무 등 회원/관리자
      차이 항목들이 구현자가 놓치기 어려운 하나의 표로 정리되어 있는가? [Completeness, Design.md §6]
- [ ] CHK033 질문 상세 페이지에서 관리자에게만 보이는 "질문자 · {닉네임}" 메타 정보의 표시
      위치·조건이 모호함 없이 정의되어 있는가? [Clarity, Design.md §8, §13]

## Mock 구현 → /design-sync → Supabase 연결 순서

- [ ] CHK034 "/design-sync는 UI Mock 완료 직후, Supabase 연결 이전에 실행한다"는 순서가
      plan.md와 quickstart.md 사이에서 모순 없이 일치하는가? [Consistency, Plan §16, Quickstart]
- [ ] CHK035 `/design-sync`의 동기화 범위(공통 컴포넌트 + 3 핵심 페이지, 로그인/회원가입·
      개발자 도구 제외)가 근거와 함께 명시되어 있는가, "전체 동기화"처럼 모호하게 남아 있지
      않은가? [Clarity, Plan §16]
- [ ] CHK036 Mock 데이터 단계에서 "충분히 검증됨"을 판단할 구체적 시나리오 목록(역할별·상태별
      화면)이 존재하는가? [Measurability, Quickstart §1단계]

## Supabase 연결 순서 및 개발용 장치 제거

- [ ] CHK037 개발 전용 역할 전환 스위치를 Supabase 연결 시점에 "제거한다"는 요구사항이, 제거
      누락을 감지할 방법과 함께 정의되어 있는가? [Gap, Plan §9, §17]
- [ ] CHK038 Supabase 연결 이후에만 유효한 검증 시나리오(RLS 우회 시도 등)와 Mock 단계
      시나리오가 중복 없이 명확히 분리되어 있는가? [Consistency, Quickstart §1단계, §3단계]

## 잔여 모호성 및 추적성

- [ ] CHK039 spec.md·design.md·plan.md 세 문서 사이에서 요구사항 ID(FR/SC) 참조 표기 방식이
      일관되어, plan.md만 보고도 원 요구사항을 역추적할 수 있는가? [Traceability]
- [ ] CHK040 세 문서에 `[NEEDS CLARIFICATION]`으로 남아 있는 항목이 없는가, 있다면 구현
      시작 전 반드시 해소해야 할 항목으로 별도 표시되어 있는가? [Gap, Traceability]

## Notes

- 항목은 리뷰가 요구사항 품질 기준을 충족한다고 판단했을 때만 `[x]`로 표시한다.
- 아직 확인·수정·리뷰가 필요한 항목은 체크하지 않은 채로 둔다.
- `/speckit-implement`는 이 체크리스트의 체크 상태를 게이트로 참고할 뿐 마커를 수정하지 않는다.
- `checklists/requirements.md`는 `/speckit-specify`·`/speckit-clarify`가 관리하는 별도 생명주기의
  내장 체크리스트이며 이 문서와 무관하다.
