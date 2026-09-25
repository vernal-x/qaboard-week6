import styles from "./Input.module.css";

export interface InputProps {
  label: string;
  value: string;
  onChange?(value: string): void;
  placeholder?: string;
  /** 네이티브 input type. 시각 규칙은 동일(design.md §19), 입력 동작만 바뀐다. 기본값 "text". */
  type?: "text" | "email" | "password";
  readOnly?: boolean;
  disabled?: boolean;
  error?: string;
  maxLength: number;
  showCount?: boolean;
  id?: string;
}

/** design.md §12/§13/§19 — readOnly는 테두리·배경 제거, error는 has-error + role="alert". */
export function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  readOnly,
  disabled,
  error,
  maxLength,
  showCount = true,
  id,
}: InputProps) {
  const inputId = id ?? `input-${label}`;
  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={`${styles.label} type-label`}>
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        className={`${styles.input} ${error ? styles.hasError : ""} ${readOnly ? styles.readOnly : ""}`}
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        maxLength={maxLength}
        onChange={(e) => onChange?.(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />
      {error ? (
        <p id={`${inputId}-error`} className={styles.errorText} role="alert">
          {error}
        </p>
      ) : (
        !readOnly &&
        showCount && (
          <p className={styles.charCount}>
            {value.trim().length} / {maxLength}
          </p>
        )
      )}
    </div>
  );
}
