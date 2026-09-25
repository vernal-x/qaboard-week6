import type { ReactNode } from "react";
import styles from "./PageHeader.module.css";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** 답변 상태 배지 등, 제목 옆에 나란히 붙는 요소(design.md §13). */
  badge?: ReactNode;
  /**
   * 호출부가 전달하는 추가 클래스(주로 margin-bottom 등 외부 여백 지정용).
   * 컴포넌트 자체는 외부 margin을 갖지 않는다 — CTA와 나란히 놓이는 컨텍스트(예: 리스트
   * 페이지 타이틀 행)에서 margin이 flex 정렬을 틀어지게 만들 수 있기 때문이다.
   */
  className?: string;
}

/**
 * design.md §8 Page Header 규칙의 유일한 구현체.
 * QuestionListPage와 QuestionDetailPage에 각각 인라인으로 중복돼 있던
 * "h1(type-page-title) + p(type-page-sub)" 마크업을 여기 하나로 통합한다.
 */
export function PageHeader({ title, subtitle, badge, className }: PageHeaderProps) {
  // design.md 승인 값(d-title-row) — 배지와 subtitle이 함께 오는 경우(관리자 질문상세)만
  // title-row→subtitle 28px, subtitle→field 20px로 별도 관리한다. 배지 없이 subtitle만
  // 오는 경우(질문 리스트)는 기존 page-title/page-sub의 6px 관계를 그대로 쓴다.
  const hasBadgeAndSubtitle = Boolean(badge) && Boolean(subtitle);
  return (
    <div className={className ? `${styles.header} ${className}` : styles.header}>
      <div className={`${styles.titleRow} ${hasBadgeAndSubtitle ? styles.titleRowSpaced : ""}`}>
        <h1 className={`${styles.title} type-page-title`}>{title}</h1>
        {badge}
      </div>
      {subtitle && (
        <p
          className={`${styles.subtitle} type-page-sub ${hasBadgeAndSubtitle ? styles.subtitleSpaced : ""}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
