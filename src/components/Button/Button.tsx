import { Link } from "react-router-dom";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface CommonProps {
  variant: ButtonVariant;
  size?: "md" | "sm";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

interface ButtonAsButton extends CommonProps {
  as?: "button";
  to?: undefined;
  type?: "button" | "submit";
  onClick?(): void;
}

interface ButtonAsLink extends CommonProps {
  as: "link";
  to: string;
  onClick?(): void;
}

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/** design.md §19 버튼 규칙 — variant/size/loading/disabled 조합. */
export function Button(props: ButtonProps) {
  const { variant, size = "md", loading, disabled, fullWidth, children } = props;
  const className = [
    styles.btn,
    styles[variant],
    size === "sm" ? styles.sm : "",
    fullWidth ? styles.full : "",
  ]
    .filter(Boolean)
    .join(" ");

  const isDisabled = Boolean(disabled || loading);

  if (props.as === "link") {
    if (isDisabled) {
      return (
        <span className={className} aria-disabled="true">
          {children}
        </span>
      );
    }
    return (
      <Link to={props.to} className={className} onClick={props.onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      className={className}
      disabled={isDisabled}
      onClick={props.onClick}
    >
      {children}
    </button>
  );
}
