import styles from "./Badge.module.css";

export type BadgeTone = "pending" | "answered";

/**
 * 헌법 IX / design.md §11 — 색상만으로 상태를 전달하지 않는다. children을 받지 않고
 * tone에서 텍스트를 고정 파생시켜, 항상 dot + 텍스트가 함께 렌더되도록 강제한다.
 */
export function Badge({ tone }: { tone: BadgeTone }) {
  const label = tone === "answered" ? "답변 완료" : "답변 대기";
  return (
    <span className={`${styles.badge} ${tone === "answered" ? styles.answered : styles.pending}`}>
      <span className={styles.dot} />
      {label}
    </span>
  );
}
