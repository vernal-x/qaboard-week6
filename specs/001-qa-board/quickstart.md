# Quickstart: QANOW 검증 가이드

**Feature**: 001-qa-board · 이 문서는 실행 가능한 검증 시나리오만 담는다. 스키마는
[`contracts/database.md`](./contracts/database.md), 라우트는 [`contracts/routes.md`](./contracts/routes.md),
컴포넌트 계약은 [`contracts/components.md`](./contracts/components.md) 참조.

## 0. 사전 준비

```bash
node -v   # 20.x
npm install
```

## 1단계 — Mock Data로 UI 검증 (Supabase 계정 불필요)

```bash
cp .env.example .env.local     # VITE_DATA_SOURCE=mock 그대로 둔다
npm run dev                     # http://localhost:5173
```

검증 시나리오 (모두 `DevRoleSwitcher`로 역할만 바꿔가며 확인, 로그인 불필요):

| # | 시나리오 | 역할 | 기대 결과 | 근거 |
|---|---|---|---|---|
| 1 | `/` 접속 | 비회원 | Hero 문구·이용 흐름·CTA 노출, "질문 작성하기" 클릭 시 `/login`으로 이동 | SC-001, FR-019 |
| 2 | `/questions` 접속 | 회원 | 제목 "내 질문", 본인 질문만, CTA 있음, 상태 필터 기본 "전체" | FR-006, design.md §6 |
| 3 | `/questions` 접속 | 관리자 | 제목 "문의 관리", 전체 질문 + 닉네임 컬럼, CTA 없음, 필터 기본 "답변 대기" | FR-007, design.md §6 |
| 4 | `/questions/new`에서 제목 101자 입력 후 저장 | 회원 | 오류 상태 노출, 저장 버튼 비활성 | FR-005 |
| 5 | 답변 대기 질문 상세 진입 | 회원 | 제목/내용 편집 가능, "삭제하기"/"저장하기" 노출 | FR-013, FR-014 |
| 6 | 답변 완료 질문 상세 진입 | 회원 | 제목/내용 읽기 전용(테두리 없음), 수정/삭제 버튼 없음 | FR-015 |
| 7 | 답변 대기 질문 상세 진입 | 관리자 | 질문 읽기 전용 + 답변 작성 textarea + "답변 등록" | FR-009 |
| 8 | 질문 목록을 빈 배열로 바꿔서 확인(mock 데이터 임시 비움) | 회원/관리자 | 회원은 CTA 있는 빈 목록, 관리자는 문구만 | Clarifications Q5 |
| 9 | 브라우저 폭을 640px 이하로 축소 | 전체 | Header 축소, Hero 1단, 리스트/상세 액션 버튼 전체 폭 | design.md §20, SC-005 |
| 10 | OS 설정에서 "동작 줄이기" 활성화 후 `/` 재접속 | 비회원 | Hero 요소가 애니메이션 없이 즉시 완전한 상태로 표시 | 헌법 VII |

```bash
npm run test:unit
npm run test:component
```

두 커맨드가 모두 통과해야 이 단계를 완료로 표시한다(헌법 XIII).

## 2단계 — `/design-sync` 실행

plan.md §16에 명시한 범위(공통 컴포넌트 + 3 핵심 페이지, Login/Signup·DevRoleSwitcher 제외)로
1회 실행하고, Claude Design 프로젝트와 시각적으로 어긋나는 부분이 없는지 확인한다.

## 3단계 — Supabase 연결

```bash
supabase login
supabase link --project-ref <project-ref>      # 또는 로컬 스택: supabase start
supabase db push                                # contracts/database.md → 0001_init.sql 적용
```

`.env.local` 갱신:

```
VITE_DATA_SOURCE=supabase
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

```bash
npm run dev
```

검증 시나리오(Playwright, 실제 Supabase 대상):

| # | 시나리오 | 기대 결과 | 근거 |
|---|---|---|---|
| 11 | 회원가입(닉네임 입력) 즉시 `/questions` 진입 | `profiles` 행이 자동 생성되고 닉네임이 반영됨 | FR-001, 트리거 §2.1 |
| 12 | Supabase SQL Editor에서 `update profiles set role='admin' where email='...'` 실행 후 재로그인 | 관리자 화면으로 전환됨 | §11 |
| 13 | 회원 A가 회원 B의 질문 상세 URL을 직접 입력 | 데이터 없음(오류 상태), 수정 불가 | FR-016 |
| 14 | 개발자 도구로 `answers` insert를 회원 토큰으로 직접 호출 | 요청 거부(RLS) | FR-017 |
| 15 | 관리자가 답변 등록 | 같은 질문의 `status`가 자동으로 `answered`로 바뀌고 회원 화면에 즉시 반영 | FR-012 |
| 16 | 답변 완료 후 회원이 수정 시도 | UI에서 버튼 자체가 없고, API를 직접 호출해도 RLS가 거부 | FR-015 |

```bash
npm run test:e2e
```

전부 통과해야 Supabase 연동 단계를 완료로 표시한다. 이 시점에 `DevRoleSwitcher`와 mock 데이터
소스 분기 코드를 저장소에서 삭제한다(plan.md §9, §17).
