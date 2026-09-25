import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

/**
 * FR-018, Clarifications Q4 — 비회원은 로그인으로 리다이렉트, state.from을 보존한다.
 * Supabase 세션 조회가 끝나기 전(`loading`)에는 role이 일시적으로 "guest"로 보일 수 있으므로,
 * 그 사이에 잘못 리다이렉트하지 않도록 로딩 중에는 아무것도 판단하지 않는다(T055).
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { role, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (role === "guest") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
