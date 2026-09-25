import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "../../components/Header/Header";
import { Input } from "../../components/Input/Input";
import { Button } from "../../components/Button/Button";
import { supabase } from "../../lib/supabaseClient";
import { validateEmail, validatePassword } from "../../lib/validation";
import styles from "./AuthPage.module.css";

/**
 * design.md §2, FR-002 — Header/Input/Button만 재사용한 단순 로그인 폼.
 * 로그인 성공 시 ProtectedRoute가 남긴 `location.state.from`이 있으면 그 경로로,
 * 없으면 `/questions`로 이동한다(FR-018, contracts/routes.md).
 */
export function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    setFormError(null);
    if (eErr || pErr) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        setFormError("이메일 또는 비밀번호가 올바르지 않습니다.");
        return;
      }
      navigate(from ?? "/questions", { replace: true });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div data-theme="light" className={styles.page}>
      <Header activeNav="main" right={null} />
      <div className={`content-max ${styles.body}`}>
        <h1 className={`${styles.heading} type-page-title`}>로그인</h1>
        <p className={styles.desc}>이메일과 비밀번호를 입력해 로그인하세요.</p>

        <Input
          label="이메일"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          maxLength={255}
          showCount={false}
          error={emailError ?? undefined}
          disabled={submitting}
        />
        <Input
          label="비밀번호"
          type="password"
          value={password}
          onChange={setPassword}
          maxLength={128}
          showCount={false}
          error={passwordError ?? undefined}
          disabled={submitting}
        />
        {formError && (
          <p className={styles.formError} role="alert">
            {formError}
          </p>
        )}

        <div className={styles.actions}>
          <Button as="link" variant="secondary" to="/signup">
            회원가입
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={submitting}>
            {submitting ? "로그인 중..." : "로그인"}
          </Button>
        </div>
      </div>
    </div>
  );
}
