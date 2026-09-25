import { Button } from "../Button/Button";
import styles from "./StateViews.module.css";

export interface ErrorStateProps {
  message?: string;
  onRetry(): void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className={styles.card} role="alert">
      <p className={styles.desc}>{message ?? "문제가 발생했어요. 다시 시도해주세요."}</p>
      <Button variant="secondary" size="sm" onClick={onRetry}>
        다시 시도
      </Button>
    </div>
  );
}
