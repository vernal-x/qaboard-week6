import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../Button/Button";
import styles from "./Header.module.css";

interface HeaderRightLogin {
  kind: "login";
}
interface HeaderRightUser {
  kind: "user";
  name: string;
  onLogout(): void;
}
export type HeaderRight = HeaderRightLogin | HeaderRightUser | null;

export interface HeaderProps {
  activeNav: "main" | "questions";
  right: HeaderRight;
}

/**
 * design.md §7 Header/Navigation 규칙.
 * 모바일 드롭다운 메뉴는 design.md 목업에는 없었지만(§7 "실제 드롭다운 메뉴는 구현되어 있지
 * 않음"), 실제 앱에서는 내비게이션이 반드시 동작해야 하므로 같은 nav 항목을 토글로 보여주는
 * 최소한의 동작만 추가했다(새로운 시각 규칙 없이 기존 항목을 그대로 재사용).
 */
export function Header({ activeNav, right }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={`content-max ${styles.inner}`}>
        {activeNav === "main" ? (
          <span className={`${styles.logo} type-logo`}>QANOW</span>
        ) : (
          <Link to="/" className={`${styles.logo} type-logo`}>
            QANOW
          </Link>
        )}

        <nav className={styles.nav} aria-label="주요 내비게이션">
          <NavItem to="/" label="메인" active={activeNav === "main"} />
          <NavItem to="/questions" label="질문 목록" active={activeNav === "questions"} />
        </nav>

        <div className={styles.right}>
          {right?.kind === "login" && (
            <Button as="link" variant="ghost" size="sm" to="/login">
              로그인
            </Button>
          )}
          {right?.kind === "user" && (
            <div className={styles.user}>
              <span className={styles.userName}>{right.name} 님</span>
              <button type="button" className={styles.userAction} onClick={right.onLogout}>
                로그아웃
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          className={styles.burger}
          aria-label="메뉴 열기"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span className={styles.burgerBar} />
          <span className={styles.burgerBar} />
          <span className={styles.burgerBar} />
        </button>
      </div>

      {mobileOpen && (
        <div className={styles.mobilePanel}>
          <NavItem to="/" label="메인" active={activeNav === "main"} onNavigate={() => setMobileOpen(false)} />
          <NavItem
            to="/questions"
            label="질문 목록"
            active={activeNav === "questions"}
            onNavigate={() => setMobileOpen(false)}
          />
          {right?.kind === "login" && (
            <Button
              as="link"
              variant="ghost"
              size="sm"
              to="/login"
              onClick={() => setMobileOpen(false)}
            >
              로그인
            </Button>
          )}
          {right?.kind === "user" && (
            <div className={styles.user}>
              <span className={styles.userName}>{right.name} 님</span>
              <button
                type="button"
                className={styles.userAction}
                onClick={() => {
                  setMobileOpen(false);
                  right.onLogout();
                }}
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

function NavItem({
  to,
  label,
  active,
  onNavigate,
}: {
  to: string;
  label: string;
  active: boolean;
  onNavigate?: () => void;
}) {
  if (active) {
    return (
      <span aria-current="page" className={`${styles.navItem} ${styles.navItemActive}`}>
        {label}
      </span>
    );
  }
  return (
    <Link to={to} className={styles.navItem} onClick={onNavigate}>
      {label}
    </Link>
  );
}
