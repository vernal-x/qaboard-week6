import { Button } from "../Button/Button";
import styles from "./StateViews.module.css";

export interface EmptyStateProps {
  role: "member" | "admin";
  onCreate?(): void;
}

/** Clarifications Q5 — 회원은 CTA 있음, 관리자는 문구만(onCreate를 안 넘기면 버튼 생략). */
export function EmptyState({ role, onCreate }: EmptyStateProps) {
  return (
    <div className={styles.card}>
      <p className={styles.desc}>
        {role === "member" ? (
          <>
            아직 등록한 질문이 없어요.
            <br />
            첫 질문을 남겨보세요.
          </>
        ) : (
          "해당 상태의 질문이 없습니다."
        )}
      </p>
      {role === "member" && onCreate && (
        <Button variant="primary" size="sm" onClick={onCreate}>
          질문 작성하기
        </Button>
      )}
    </div>
  );
}
