# Component Contract: 공통 컴포넌트 Props

**Feature**: 001-qa-board · design.md §4/§7/§8/§11/§19를 TypeScript 인터페이스로 고정한다. 이
문서에 없는 prop이나 variant를 구현 중에 추가하지 않는다(새로 필요해지면 이 계약부터 갱신).

```ts
// Header — design.md §7
interface HeaderProps {
  theme: 'dark' | 'light';               // MainPage=dark, 나머지=light
  activeNav: 'main' | 'questions';
  right:
    | { kind: 'login' }                                    // 비회원, 메인 페이지
    | { kind: 'user'; name: string; onLogout(): void }      // 로그인 상태
    | null;                                                  // 모바일에서는 항상 burger로 대체
}

// Button — design.md §19
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'md' | 'sm';                    // 기본 md(48px), sm=40px
  loading?: boolean;                     // true면 disabled 강제 + 라벨을 "저장 중..." 등으로 교체
  disabled?: boolean;
  as?: 'button' | 'link';
  to?: string;                           // as='link'일 때 React Router 목적지
  onClick?(): void;
}

// Input / Textarea — design.md §12, §13, §19
interface FieldProps {
  label: string;
  value: string;
  onChange?(value: string): void;
  placeholder?: string;
  readOnly?: boolean;                    // 답변 완료 상태 — 테두리/배경 제거 스타일 강제 적용
  disabled?: boolean;                    // 저장 중 상태
  error?: string;                        // 있으면 has-error 스타일 + role="alert" 오류 텍스트
  maxLength: number;                     // 100 또는 5000
  showCount?: boolean;                   // 기본 true, readOnly일 때는 false
}

// Badge — design.md §11, 헌법 IX(색상만으로 상태 전달 금지)
interface BadgeProps {
  tone: 'pending' | 'done';
  // children을 받지 않는다 — 텍스트는 tone에서 고정 파생("답변 대기"/"답변 완료")해
  // 호출부가 실수로 dot 없는 순수 색상 표시를 만들 수 없게 한다.
}

// QuestionCard — design.md §11 (리스트 행)
interface QuestionCardProps {
  title: string;
  status: 'pending' | 'answered';
  date: string;                          // 표시용으로 이미 포맷된 문자열
  nickname?: string;                     // 있으면 관리자 뷰(작성자 표시)
  href: string;                          // React Router 경로, contracts/routes.md 참조
}

// StateViews — design.md §14
interface LoadingStateProps { rows?: number }              // 기본 3~4
interface EmptyStateProps {
  role: 'member' | 'admin';
  onCreate?(): void;                     // role==='member'일 때만 전달 — 관리자는 CTA 없음
}
interface ErrorStateProps { onRetry(): void }

// FloatingCard — design.md §10 (MainPage 전용 장식)
interface FloatingCardProps {
  question: string;
  answer: string;
}
```

각 컴포넌트는 `theme`을 직접 받지 않고 가장 가까운 조상의 `data-theme` 속성(research.md §4)을
CSS로만 읽는다 — JS로 테마를 prop-drilling하지 않는다.
