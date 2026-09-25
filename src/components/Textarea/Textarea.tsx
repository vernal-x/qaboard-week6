import styles from "./Textarea.module.css";

export interface TextareaProps {
  label: string;
  value: string;
  onChange?(value: string): void;
  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;
  error?: string;
  maxLength: number;
  showCount?: boolean;
  id?: string;
}

/** Input과 동일한 readOnly/error 규칙(design.md §13, §19). */
export function Textarea({
  label,
  value,
  onChange,
  placeholder,
  readOnly,
  disabled,
  error,
  maxLength,
  showCount = true,
  id,
}: TextareaProps) {
  const areaId = id ?? `textarea-${label}`;
  return (
    <div className={styles.field}>
      <label htmlFor={areaId} className={`${styles.label} type-label`}>
        {label}
      </label>
      <textarea
        id={areaId}
        className={`${styles.textarea} ${error ? styles.hasError : ""} ${readOnly ? styles.readOnly : ""}`}
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        maxLength={maxLength}
        onChange={(e) => onChange?.(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${areaId}-error` : undefined}
      />
      {error ? (
        <p id={`${areaId}-error`} className={styles.errorText} role="alert">
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
