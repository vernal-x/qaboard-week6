# QANOW 디자인 명세 (Design Spec)

**Feature**: 001-qa-board
**근거 문서**: `spec.md`, `design-brief.md`, `.specify/memory/constitution.md`
**대조 대상**: Claude Design 프로젝트 `12542e46-719c-4b05-b323-08c71aec59f6`의 확정본
`01 Main Page.dc.html`, `02 Question List Page.dc.html`, `03 Question Detail Page.dc.html`,
`shared.css` (2026-09-25, 검토 피드백 10건 HIGH + 2건 MEDIUM 반영 이후 버전, etag 확인 완료)
**작성일**: 2026-09-25
**성격**: 이 문서는 Claude Design에서 이미 확정된 실제 마크업·CSS·상호작용 구조를 그대로
기술한 기록이며, 새로운 디자인 해석이나 임의 각색을 포함하지 않는다. React/CSS 구현
코드는 이 문서에서 다루지 않는다.

---

## 1. 디자인 콘셉트와 목표

QANOW는 "시안 A — Dark Aurora" 방향으로 확정되었다. 메인 페이지는 어두운 네이비 Hero에
블루·바이올렛 오로라 그라데이션과 미세 그리드로 강한 첫인상을 주고(FR-019, SC-001), 질문
리스트·질문 페이지는 밝은 라이트 서페이스로 전환해 가독성과 작업 효율을 우선한다(design-brief.md
§2). 두 톤은 `shared.css`의 `on-dark`/`on-light` 테마 클래스로 같은 컴포넌트 규칙(Header, 버튼,
입력창, 배지)을 공유하며 색상만 바뀐다 — 헌법 원칙 **V. 핵심 화면 일관성**을 코드 수준에서
보장하는 방식이다.

## 2. 브랜드 이름과 핵심 문구

- 서비스명: **QANOW** (로고 워드마크, `IBM Plex Mono` 700, 19px, letter-spacing 0.04em)
- 메인 문구: "질문은 빠르게, 답변은 명확하게." (`m-h1`)
- 보조 문구: "궁금한 점을 남기면 관리자가 확인하고 답변해드립니다." (`m-sub`)
- 주요 CTA: "질문 작성하기" / 보조 CTA: "내 질문 확인하기"
- 이용 흐름 라벨: "질문 작성 → 관리자 확인 → 답변 확인" (FR-019)

## 3. 세 핵심 화면의 정보 구조

| 화면 | 파일 | 정보 구조 |
|---|---|---|
| 메인 페이지 | `01 Main Page.dc.html` | Header → Hero(카피+CTA+플로팅 카드) → 이용 흐름 3단계 → 상태 배지 예시 → (모바일) 하단 고정 CTA |
| 질문 리스트 페이지 | `02 Question List Page.dc.html` | Header → Page Header(제목+부제+CTA) → 상태 필터 세그먼트 → 질문 행 목록 → (관리자 데스크톱) 상태 쇼케이스 |
| 질문 페이지 | `03 Question Detail Page.dc.html` | Header → 뒤로가기 → Page Header(제목+배지) → 제목 필드 → 내용 필드 → 답변 영역(모드별로 배너/읽기전용 박스/편집 textarea) → 액션 버튼 |

질문 페이지는 FR-021에 따라 **하나의 레이아웃**을 공유하며 5개 모드로 구현되어 있다(회원: 신규
작성 · 답변 대기 · 저장 중 · 입력 오류 · 답변 완료, 관리자: 답변 작성 · 답변 수정). 모드마다
화면이 새로 생기는 것이 아니라 같은 `.d-body` 구조 안에서 필드의 편집 가능 여부와 액션 버튼만
달라진다.

## 4. 화면별 레이아웃

**메인 페이지**: `.m-page`(배경 `--bg-dark`) 안에 데스크톱 프레임(`id="main-desktop"`, 1440px)과
모바일 프레임(`id="main-mobile"`, 390px)이 순서대로 존재. Header(`content-max` 래퍼) → `section.m-hero`
(`content-max m-hero-row`, 데스크톱 `flex-direction:row` gap 56px / 모바일 `column` gap 40px) →
`section.m-flow`(배경 `--surface-dark-2`) → `section.m-badges-section`. 모바일 전용 `.m-sticky-cta`가
프레임 최하단에 고정 배치.

> **승인 디자인 대비 의도된 변경**: `.m-flow-steps`는 Claude Design 목업에서
> `align-items: center`이나, React 구현에서는 `align-items: flex-start`를 사용한다. 실제 브라우저에서
> "이용 흐름" 3단계의 설명 문구 길이가 서로 달라 `align-items:center`를 쓰면 짧은 항목(3단계)이
> 세로 중앙 정렬되며 아래로 처져 보이는 문제가 확인되어, 사용자 지시로 상단 기준 정렬로 고정했다.
> 목업(`01 Main Page.dc.html`, `shared.css`)은 아직 이 값으로 갱신되지 않았다.

**질문 리스트 페이지**: 프레임 4개(`list-desktop-member`, `list-desktop-admin`, `list-mobile-member`,
`list-mobile-admin`) + 관리자 데스크톱 프레임에만 `.l-showcase` 섹션이 추가로 존재. 각 프레임은
Header → `content-max l-body`(`.l-title-row` → `.l-filter-row.qn-segment` → `.l-list`) 구조.

**질문 페이지**: 10개 프레임(데스크톱 7 + 모바일 3)이 각각 독립 `.qn-frame`이며, 내부는 Header →
`.d-body`(max-width 720px, `content-max` 안에서 중앙 정렬) → `.d-back` → `.d-title-row` → 순차적
`.qn-field` 목록 → `.d-actions`.

## 5. 화면 간 이동

모든 프레임에 고유 `id`가 있고, 로고·네비게이션·CTA·리스트 행·뒤로가기 링크가 실제 `href`로
연결되어 있다(design-brief.md §9).

- 로고 "QANOW": 메인 페이지 자신은 `<span>`(비링크), 리스트/질문 페이지에서는
  `01%20Main%20Page.dc.html`로 링크.
- 헤더 nav "메인": 현재 화면이 메인이면 비활성 텍스트, 그 외 화면에서는 메인 페이지로 링크.
  nav "질문 목록": 현재 화면에 따라 `list-desktop-member`/`list-desktop-admin`(또는 모바일 대응)
  앵커로 링크.
- 메인 페이지 1차 CTA "질문 작성하기" → `03 Question Detail Page.dc.html#detail-desktop-write`
  (모바일은 `#detail-mobile-write`). 2차 CTA "내 질문 확인하기" → 리스트 회원 뷰.
- 리스트 회원 뷰 CTA/행: CTA → 작성 프레임. 행은 상태에 따라
  `#detail-desktop-done`(답변 완료) 또는 `#detail-desktop-pending`(답변 대기)으로 분기.
- 리스트 관리자 뷰 행: 상태와 무관하게 전부 `#detail-desktop-admin-answer`로 연결된다 — **알려진
  단순화**: "답변 수정" 프레임(`#detail-desktop-admin-edit`)은 어떤 화면에서도 링크되지 않는
  고립 프레임이며, React 구현 단계에서 "답변 완료" 상태의 관리자 행은 답변 수정 프레임으로 가도록
  라우팅을 보완해야 한다.
- 질문 페이지의 "취소"/뒤로가기/"질문 목록으로"는 모두 자신이 속한 역할의 리스트 프레임(회원→
  `list-*-member`, 관리자→`list-*-admin`)으로 돌아간다.
- "등록하기", "저장하기", "삭제하기", "답변 등록", "답변 수정" 등 데이터 변경 버튼은 `<button>`이며
  href가 없다 — 목업 단계에서 실제 네비게이션이 아닌 액션이기 때문이다.

## 6. 회원과 관리자 상태 차이

| 항목 | 회원 | 관리자 |
|---|---|---|
| 리스트 페이지 제목 | "내 질문" | "문의 관리" |
| 사용자 표시 | "{닉네임} 님" | "관리자" |
| 리스트 범위 | 본인 질문만(FR-006) | 전체 질문(FR-007) |
| 리스트 기본 필터 | "전체" | "답변 대기" |
| 리스트 행 메타 | 등록일시만 | 닉네임 + 등록일시 |
| 리스트 CTA | "질문 작성하기" 있음 | 없음 |
| 빈 목록 문구/CTA | "첫 질문을 남겨보세요" + CTA | "해당 상태의 질문이 없습니다"(CTA 없음) |
| 질문 페이지 조작 | 답변 전 수정/삭제, 답변 후 읽기 전용 | 답변 작성/수정, 질문 내용은 항상 읽기 전용 |
| 질문 페이지 메타 | 없음 | "질문자 · {닉네임}" 표시 |

## 7. Header와 Navigation 규칙

`shared.css`의 `.qn-header`: `display:flex; justify-content:space-between; height:76px`(모바일
64px). 좌측 `.qn-logo`, 중앙~우측 `.qn-nav`(gap 32px), 우측 끝은 화면 성격에 따라 셋 중 하나:
메인 페이지 = `.qn-btn-ghost`("로그인"), 리스트/질문 페이지 = `.qn-user`(닉네임/관리자 + 로그아웃
텍스트), 모바일 전 화면 공통 = `.qn-burger`(20px 폭 바 3개, gap 5px — 실제 드롭다운 메뉴는 이번
목업에 구현되어 있지 않음, design-brief.md §17의 "상단 앱바 + 햄버거" 결정만 반영됨). 활성 nav
항목은 `border-bottom:2px solid var(--accent-blue)` + `font-weight:500`로 표시한다.

## 8. Page Header 규칙

리스트 페이지: `.l-title-row`(데스크톱 `flex row justify-content:space-between`, 모바일 `column`)
안에 `h1.qn-page-title`(32px/700, 모바일 23px) + `p.qn-page-sub`(14px, muted) + (회원만) 우측
정렬 primary CTA. 질문 페이지: `.d-title-row`(`flex align-items:center gap:14px`) 안에
`h1.qn-page-title`(margin-bottom 0으로 배지와 한 줄 정렬) + 상태 배지. 관리자 프레임에는 배지 아래
`p.qn-page-sub`로 "질문자 · {닉네임}" 한 줄이 추가된다.

## 9. 메인 Hero 구조

`.m-hero`(`position:relative; overflow:hidden; padding:88px 0 96px`, 모바일 `40px 0 56px`) 안에
`.m-hero-row`(데스크톱 2단 flex row, 모바일 1단 column)가 있고 좌측 `.m-hero-copy`(eyebrow → h1 →
sub → CTA 2개 → mini-flow 캡션), 우측(모바일은 하단) `.m-hero-visual`(플로팅 Q/A 카드 + 커넥터)로
구성된다. eyebrow는 `border-left:2px solid var(--accent-blue)`로 강조된 라벨 텍스트.

## 10. Aurora Gradient, Grid Glow, Floating Card 효과

- **Aurora**: `.m-hero::before` — `position:absolute; inset:-30%`에
  `radial-gradient(60% 50% at 78% 18%, rgba(110,130,255,.38), transparent 62%),
  radial-gradient(50% 42% at 92% 62%, rgba(178,96,255,.3), transparent 65%)` 두 겹을 얹고
  `filter: blur(70px)`로 흐림. 우상단~우하단에 치우쳐 있어 좌측 정렬된 헤드라인/CTA와 겹치지
  않는다(헌법 원칙 **VI. 성능 우선 시각 효과**).
- **Grid Glow**: `.m-hero::after` — 1px 간격선을 42px 격자(`background-size:42px 42px`)로 반복하되
  `rgba(255,255,255,.035)`로 매우 옅게, `mask-image: linear-gradient(180deg, rgba(0,0,0,.9),
  transparent 85%)`로 Hero 하단에서 자연스럽게 사라지도록 처리.
- **Floating Card**: `.m-card`(bg `--card-dark`, border `--border-dark-strong`, radius 14px, 폭
  300px)를 `.m-card-q`(top:0,left:0)와 `.m-card-ans`(bottom:0,right:0)로 대각 배치하고,
  `.m-connector`(2px 굵기, `var(--accent-gradient)`, `rotate(34deg)`, `box-shadow`로 은은한 발광)로
  둘을 잇는다. 모바일은 `position:static`으로 전환되어 세로 스택 + 짧은 세로 커넥터로 단순화된다.
  카드 안에는 실제 질문("환불 절차가 어떻게 되나요?")·답변 예시 텍스트와 상태 배지가 들어간다.

## 11. 질문 리스트 카드(행) 구조

`a.qn-row`(행 전체가 링크): `display:flex; align-items:center; gap:16px; padding:18px 20px;
border-radius:6px; border:1px solid` — `.qn-row-main`(제목 1줄 ellipsis 데스크톱 / 모바일은 줄바꿈
허용 + 메타: 회원은 날짜만, 관리자는 닉네임+날짜) → 상태 배지(dot + 텍스트) → `.qn-row-chevron`
("›", hover 없이도 클릭 가능함을 시각적으로 암시). 카드형이 아닌 얇은 보더 행(row) 형태이며 그림자
없음 — 헌법 원칙 **XI. 단순한 MVP 우선**, "과도한 카드·그림자 회피" 규칙 준수.

## 12. 질문 작성 폼 구조

신규 작성 모드(`#detail-desktop-write`, `#detail-mobile-write`): 배지 없이 `h1 "질문 작성"`만
표시 → `qn-field`(제목: `input` placeholder + `0/100` 카운터) → `qn-field`(내용: `textarea`
placeholder + `0/5000` 카운터) → `.d-actions`("취소" 링크 + "등록하기" 버튼). **입력 오류**
변형(`#detail-desktop-error`)은 같은 구조에서 제목 `input`에 `.has-error`(빨간 테두리)와
`p.qn-error-text`("제목은 공백을 제외하고 1자 이상 100자 이하로 입력해주세요.")가 추가되고
"등록하기"가 `disabled` 처리된다(FR-005).

## 13. 질문 상세와 답변 영역 구조

동일한 `.qn-field` 순서(제목 → 내용 → 답변)를 모드별로 다르게 채운다:

- **회원 · 답변 대기**(`#detail-desktop-pending`): 제목/내용 `input`/`textarea`는 편집 가능,
  답변 자리에는 `.qn-banner`("관리자가 아직 답변하지 않았어요..."). 액션: "삭제하기"(danger) +
  "저장하기"(primary).
- **회원 · 저장 중**(`#detail-desktop-saving`): 위와 동일한 필드에 `disabled` 속성 추가, 액션
  버튼도 `disabled` + 주 버튼 텍스트가 "저장 중..."으로 바뀜(FR-020).
- **회원 · 답변 완료**(`#detail-desktop-done`): 제목/내용에 `readonly`(테두리·배경 제거된 텍스트
  형태), 답변 자리에는 `.d-answer-box`(테두리 있는 실제 답변 텍스트) + `.qn-banner`("답변이
  완료되어... 수정/삭제 불가", FR-015). 액션은 "질문 목록으로" 하나뿐.
- **관리자 · 답변 작성**(`#detail-desktop-admin-answer`): 제목/내용 `readonly`(질문은 항상 읽기
  전용), 답변 자리는 빈 `textarea`(placeholder "답변을 입력하세요") + `0/5000` 카운터. 액션:
  "답변 등록"(FR-009).
- **관리자 · 답변 수정**(`#detail-desktop-admin-edit`): 위와 동일하되 답변 `textarea`에 기존 답변이
  채워져 있고 액션이 "답변 수정"(FR-011).

## 14. Loading, Empty, Error, Unauthorized 상태

FR-020이 요구하는 5개 상태 중 로딩·빈 목록·오류·권한 없음은 `02 Question List Page.dc.html`의
관리자 데스크톱 프레임에만 존재하는 `.l-showcase` 섹션(5개 `.qn-state-card`)에 압축 전시되어
있다: LOADING(스켈레톤 바 3개), 빈 목록·회원(문구+CTA), 빈 목록·관리자(문구만,
Clarifications Q5), 오류(문구+"다시 시도"), 권한 없음(문구+"로그인하기"). 저장 중 상태는 질문
페이지의 별도 프레임(§13)으로, 입력 오류 상태도 질문 페이지의 별도 프레임(§12)으로 시각화되어
있다. **모든 상태 예시는 이번 목업에서 하나의 대표 프레임에만 존재**하며, 각 화면·역할·브레이크
포인트 조합 전체에 반복 배치되어 있지는 않다 — React 구현 시 모든 조합에 적용되어야 한다.

## 15. 디자인 토큰 (`shared.css` `:root`)

```
--font-body: "IBM Plex Sans KR", sans-serif;
--font-mono: "IBM Plex Mono", monospace;

--bg-dark: #05070c;            --bg-light: #f2f4fa;
--surface-dark: #0b0f1a;       --surface-light: #ffffff;
--surface-dark-2: #10162a;
--card-dark: #141b2e;
--border-dark: rgba(255,255,255,.08);      --border-light: #e1e5f0;
--border-dark-strong: rgba(255,255,255,.16);
--ink-dark: #f4f6fb;           --ink-light: #14181f;
--ink-dark-muted: #9aa5c0;     --ink-light-muted: #5c6478;

--accent-blue: #4f7bff;
--accent-violet: #9a5bff;
--accent-gradient: linear-gradient(120deg, #4f7bff, #9a5bff);

--radius-sm: 6px;  --radius-md: 10px;  --radius-lg: 14px;
--content-max: 1120px;
```

## 16. 타이포그래피 계층

| 요소 | 크기 / 굵기 | 폰트 |
|---|---|---|
| 로고 | 19px / 700 | Mono |
| Hero H1 | 60px(모바일 32px) / 700, letter-spacing -0.02em | Body |
| Hero eyebrow | 12px, letter-spacing .14em | Mono |
| Hero sub | 18px(모바일 15px) | Body |
| 이용 흐름 번호 | 30px / 700 | Mono |
| 이용 흐름 제목/설명 | 17px·13.5px | Body |
| Page Title | 32px(모바일 23px) / 700 | Body |
| Page Sub | 14px | Body |
| 리스트 행 제목 | 15.5px / 500 | Body |
| 필드 라벨 | 13px / 600 | Body |
| 입력창/텍스트에어리어 | 15px | Body |
| 글자수 카운터 / 오류 텍스트 | 12px·12.5px | Body |
| 배지 | 13px / 500 | Body |

## 17. 색상 역할

- **Dark 표면(메인 Hero 전용)**: 배경 `--bg-dark`/`--surface-dark`, 텍스트 `--ink-dark`(본문)·
  `--ink-dark-muted`(보조).
- **Light 표면(리스트·질문 페이지)**: 배경 `--bg-light`, 카드/입력창 `--surface-light`, 텍스트
  `--ink-light`/`--ink-light-muted`.
- **강조색**: `--accent-blue`/`--accent-violet` 그라데이션은 오직 primary CTA, 활성 nav/필터 밑줄,
  플로팅 카드 커넥터·done 배지에만 사용 — 본문·배경 전체에는 사용하지 않는다(design-brief.md §11).
- **답변 대기 배지**: dark `#f3c98a`/light `#93590a` (앰버 계열, 텍스트 항상 동반).
- **답변 완료 배지**: dark `#cdd8ff`(그라데이션 배경)/light `#3547c9`.
- **오류/위험**: `#c53a2c`(입력 오류 테두리·텍스트, 삭제 버튼 텍스트).

## 18. 간격과 최대 콘텐츠 폭

`--content-max: 1120px`를 `.content-max`(`margin:0 auto; padding:0 48px`, 모바일 `0 20px`)로
적용해 1440px 프레임 안에서도 콘텐츠가 가장자리에 붙지 않게 한다. 질문 페이지 본문은 그 안에서
다시 `max-width:720px`로 좁혀 읽기 폭을 제한한다(design-brief.md §13). 프레임 자체 폭은 데스크톱
1440px, 모바일 390px 고정.

## 19. 버튼·입력창·카드·배지 규칙

- **버튼**: `min-height:48px`(sm/ghost는 40px), radius 10px, primary=그라데이션 채움+흰 텍스트,
  secondary/danger=아웃라인, `disabled`는 `opacity:.55`.
- **입력창**: `min-height:48px`(textarea 180px), radius 6px, 테두리+배경 명확. `readonly`는 테두리·
  배경을 제거해 일반 텍스트처럼 보이게 하고(§13 참고), `disabled`는 `opacity:.6`로 저장 중임을
  표시, `.has-error`는 빨간 테두리+연한 배경.
- **행/카드**: radius 6px, 1px 보더, 그림자는 프레임 레벨에만 낮은 불투명도로 적용(카드 자체에는
  무거운 그림자 없음).
- **배지**: 항상 dot(`currentColor`) + 텍스트 조합, radius 7px.

## 20. 데스크톱과 모바일 반응형 규칙

`.frame-desktop`(1440px) / `.frame-mobile`(390px) 두 프레임을 모든 화면에 대해 나란히 제작. 모바일
전환 규칙: Header 76→64px, Hero 2단→1단 스택, 플로팅 카드 절대배치→정적 스택, 이용 흐름 행→열
(화살표 90도 회전), 리스트 타이틀 행 flex-row→column, 리스트 CTA는 상단 버튼 대신 하단
`.m-sticky-cta` 고정 바로 대체, 질문 페이지 액션 버튼 `column-reverse`+전체 폭. `content-max` 좌우
패딩 48→20px.

## 21. 키보드 포커스와 접근성

모든 상호작용 요소가 네이티브 `<a>`/`<button>`(리스트 행 전체 포함)로 구현되어 Tab 키만으로
접근 가능하다(헌법 원칙 **VIII. 키보드 조작 가능성**). `disabled` 버튼/입력창은 자동으로 포커스
순서에서 제외되어 "저장 중" 상태의 중복 제출 방지와 자연스럽게 맞물린다. **현재 목업에는 커스텀
`:focus-visible` 스타일이 정의되어 있지 않다** — 이는 React 구현 단계에서 반드시 추가해야 할
항목이며(§24 참고), `--accent-blue` 기반 아웃라인을 제안한다.

## 22. prefers-reduced-motion 규칙

애니메이션은 `01 Main Page.dc.html`에만 존재한다: `@media (prefers-reduced-motion: no-preference)`
블록 안에서만 `mFadeUp`/`mFadeIn` 키프레임이 적용되고, 기본 상태(쿼리 밖)는 이미
`opacity:1; transform:none`이므로 모션을 줄이도록 설정한 사용자는 애니메이션 없이 완성된 레이아웃을
바로 본다(헌법 원칙 **VII**). `02`/`03` 화면은 애초에 애니메이션이 없어 별도 처리가 필요 없다.

## 23. 금지할 디자인 패턴

design-brief.md §19와 실제 빌드를 대조한 결과, 다음이 금지되며 현재 목업에서도 확인되지 않았다:
과도한 Glassmorphism(반투명 블러 카드 — 카드들은 solid 배경만 사용), 모든 요소에 pill 수준의
과도한 radius(최대 14px로 제한), spec.md에 없는 기능(검색창, 페이지네이션, 댓글 입력창, 소셜 로그인
버튼, 통계 위젯, 파일 첨부 — 어디에도 존재하지 않음), 색상 점만으로 상태를 표시하는 배지(모든
배지가 dot+텍스트), Hero의 시각 효과가 내부 화면까지 번지는 것(Light 화면에는 aurora/grid가 전혀
적용되지 않음).

## 24. 구현 후 시각 검증 항목

React/CSS로 옮긴 뒤 아래를 스크린샷 또는 실제 브라우저로 확인한다.

1. 메인 Hero의 오로라·그리드가 헤드라인·CTA의 텍스트 대비를 해치지 않는가 (§10, 헌법 VI)
2. 리스트 페이지 제목이 회원 "내 질문" / 관리자 "문의 관리"로 다르게 보이는가 (§6)
3. 상태 필터의 활성 탭이 배경색+굵은 글씨로 시각적으로 구분되는가 (§11, 헌법 IX)
4. 모바일(390px)에서 리스트·질문 페이지 콘텐츠가 좌우 20px 여백을 유지하는가 (§18, §20)
5. 답변 완료 상태의 제목/내용이 편집 가능한 입력창과 명확히 다르게(테두리 없음) 보이는가 (§13)
6. 저장 중 상태에서 모든 입력/버튼이 비활성으로 보이고 중복 제출이 불가능한가 (§13, FR-020)
7. 입력 오류 상태에서 오류 테두리와 오류 문구가 함께 노출되는가 (§12, FR-005)
8. 로고·nav·CTA·행 클릭 시 §5에 기술한 대상 화면으로 실제로 이동하는가 — 특히 관리자의 "답변
   완료" 행이 답변 수정 화면으로 가도록 §5의 알려진 단순화가 보완되었는가
9. `prefers-reduced-motion: reduce` 환경에서 메인 페이지가 애니메이션 없이 완성된 레이아웃으로
   즉시 표시되는가 (§22)
10. 키보드 Tab만으로 각 화면의 모든 링크/버튼/행에 순서대로 도달하고, 포커스 표시가 보이는가
    (§21 — 특히 focus-visible 스타일 추가 여부)
11. 데스크톱 1440px 기준 화면에서 `--content-max`(1120px) 밖으로 콘텐츠가 퍼지지 않는가 (§18)
12. spec.md에 없는 기능(검색·페이지네이션·댓글·소셜 로그인·통계·파일 첨부)이 구현본에도 추가되지
    않았는가 (§23, 헌법 IV)
