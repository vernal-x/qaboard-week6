// FR-005, FR-010 — trim 후 길이 검증. contracts/database.md의 DB CHECK 제약과 동일한 규칙.

export function validateTitle(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length < 1) return "제목을 입력해주세요.";
  if (trimmed.length > 100) return "제목은 공백을 제외하고 100자 이하로 입력해주세요.";
  return null;
}

export function validateContent(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length < 1) return "내용을 입력해주세요.";
  if (trimmed.length > 5000) return "내용은 공백을 제외하고 5000자 이하로 입력해주세요.";
  return null;
}

export function validateAnswer(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length < 1) return "답변을 입력해주세요.";
  if (trimmed.length > 5000) return "답변은 공백을 제외하고 5000자 이하로 입력해주세요.";
  return null;
}

export function trimmedLength(value: string): number {
  return value.trim().length;
}

// FR-001, FR-002 — 로그인/회원가입 폼 검증.
export function validateEmail(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length < 1) return "이메일을 입력해주세요.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "올바른 이메일 형식으로 입력해주세요.";
  return null;
}

export function validatePassword(value: string): string | null {
  if (value.length < 6) return "비밀번호는 6자 이상 입력해주세요.";
  return null;
}

export function validateNickname(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length < 1) return "닉네임을 입력해주세요.";
  if (trimmed.length > 30) return "닉네임은 30자 이하로 입력해주세요.";
  return null;
}
