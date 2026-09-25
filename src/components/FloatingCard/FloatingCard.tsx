import { Badge } from "../Badge/Badge";
import styles from "./FloatingCard.module.css";

export interface FloatingCardProps {
  question: string;
  answer: string;
}

/** design.md §10 — Aurora Hero 위의 질문/답변 플로팅 카드 + 커넥터. 순수 CSS로만 구현(헌법 VI). */
export function FloatingCard({ question, answer }: FloatingCardProps) {
  return (
    <div className={styles.visual}>
      <div className={`${styles.card} ${styles.cardQ}`}>
        <span className={`${styles.chip} ${styles.chipQ}`}>Q</span>
        <p className={styles.text}>{question}</p>
        <Badge tone="pending" />
      </div>
      <div className={styles.connector} />
      <div className={`${styles.card} ${styles.cardAns}`}>
        <span className={`${styles.chip} ${styles.chipAns}`}>A</span>
        <p className={styles.text}>{answer}</p>
        <Badge tone="answered" />
      </div>
    </div>
  );
}
