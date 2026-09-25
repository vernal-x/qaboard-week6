import styles from "./StatusFilter.module.css";

export type StatusFilterValue = "all" | "pending" | "answered";

const OPTIONS: { value: StatusFilterValue; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "pending", label: "답변 대기" },
  { value: "answered", label: "답변 완료" },
];

/** FR-022, Clarifications Q3 — 세그먼트 필터. 활성 탭은 배경+글자 굵기로 이중 표시(헌법 IX). */
export function StatusFilter({
  value,
  onChange,
}: {
  value: StatusFilterValue;
  onChange(value: StatusFilterValue): void;
}) {
  return (
    <div className={styles.segment} role="group" aria-label="답변 상태 필터">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={value === opt.value}
          className={`${styles.item} ${value === opt.value ? styles.active : ""}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
