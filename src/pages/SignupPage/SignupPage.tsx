import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../components/Header/Header";
import { Input } from "../../components/Input/Input";
import { Button } from "../../components/Button/Button";
import { supabase } from "../../lib/supabaseClient";
import { validateEmail, validateNickname, validatePassword } from "../../lib/validation";
import styles from "../LoginPage/AuthPage.module.css";

/**
 * design.md §2, FR-001 — Header/Input/Button만 재사용한 단순 회원가입 폼.
 * 닉네임(display_name)은 user metadata로 전달해 handle_new_user 트리거가 profiles에 채운다.
 * spec.md에 따라 이메일 이중 확인 절차는 없음 — 가입 성공 시 즉시 세션이 생겨 /questions로 이동한다.
 */
export function SignupPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    const nErr = validateNickname(nickname);
    setEmailError(eErr);
    setPasswordError(pErr);
    setNicknameError(nErr);
    setFormError(null);
    if (eErr || pErr || nErr) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { display_name: nickname.trim() } },
      });
      if (error) {
        setFormError("회원가입에 실패했습니다. 이미 가입된 이메일인지 확인해주세요.");
        return;
      }
      navigate("/questions", { replace: true });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div data-theme="light" className={styles.page}>
      <Header activeNav="main" right={null} />
      <div className={`content-max ${styles.body}`}>
        <h1 className={`${styles.heading} type-page-title`}>회원가입</h1>
        <p className={styles.desc}>이메일, 비밀번호, 닉네임을 입력해 회원가입하세요.</p>

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
        <Input
          label="닉네임"
          value={nickname}
          onChange={setNickname}
          placeholder="다른 회원에게 보일 이름"
          maxLength={30}
          showCount={false}
          error={nicknameError ?? undefined}
          disabled={submitting}
        />
        {formError && (
          <p className={styles.formError} role="alert">
            {formError}
          </p>
        )}

        <div className={styles.actions}>
          <Button as="link" variant="secondary" to="/login">
            로그인
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={submitting}>
            {submitting ? "가입 중..." : "회원가입"}
          </Button>
        </div>
      </div>
    </div>
  );
}
