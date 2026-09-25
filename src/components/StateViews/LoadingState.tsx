import styles from "./StateViews.module.css";

export function LoadingState({ rows = 3 }: { rows?: number }) {
  return (
    <div className={styles.card} role="status" aria-live="polite" aria-label="불러오는 중">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={styles.skeletonBar}
          style={{ width: `${70 - i * 12}%` }}
        />
      ))}
    </div>
  );
}
