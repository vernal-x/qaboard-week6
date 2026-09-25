import { Link } from "react-router-dom";
import { Badge } from "../Badge/Badge";
import type { QuestionStatus } from "../../types/database";
import styles from "./QuestionCard.module.css";

export interface QuestionCardProps {
  title: string;
  status: QuestionStatus;
  date: string;
  nickname?: string;
  href: string;
}

/** design.md §11 — 행 전체가 링크, 상태는 항상 dot+텍스트(Badge)로 표시. */
export function QuestionCard({ title, status, date, nickname, href }: QuestionCardProps) {
  return (
    <Link to={href} className={styles.row}>
      <div className={styles.main}>
        <p className={styles.title}>{title}</p>
        <p className={styles.meta}>
          {nickname && <span>{nickname}</span>}
          <span>{date}</span>
        </p>
      </div>
      <Badge tone={status === "answered" ? "answered" : "pending"} />
      <span className={styles.chevron} aria-hidden="true">
        ›
      </span>
    </Link>
  );
}
