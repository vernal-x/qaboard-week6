import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import type { AuthRole, Profile, Role } from "../types/database";
import { mockProfiles } from "../data/mock/mockProfiles";
import { supabase } from "../lib/supabaseClient";

export interface AuthContextValue {
  role: AuthRole;
  profile: Profile | null;
  loading: boolean;
  logout(): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * plan.md §9/§11, tasks.md T055 — Supabase 세션에서 `profiles.role`을 조회해 회원/관리자를
 * 판별한다. `initialRole`은 컴포넌트 테스트 전용 진입점이다(tests/component/testUtils.tsx) —
 * 값을 넘기면 Supabase 호출 없이 고정 프로필로 즉시 렌더된다. 프로덕션 코드(App.tsx)는 이 prop을
 * 절대 넘기지 않으므로 브라우저에서 역할을 바꿀 수 있는 경로가 없다
 * (DevRoleSwitcher는 tasks.md T058로 제거됨).
 */
export function AuthProvider({
  children,
  initialRole,
}: {
  children: ReactNode;
  initialRole?: AuthRole;
}) {
  const isTestMode = initialRole !== undefined;

  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(!isTestMode);

  useEffect(() => {
    if (isTestMode) return;
    let active = true;

    async function loadProfile(userId: string) {
      const { data } = await supabase
        .from("profiles")
        .select("id, email, display_name, role")
        .eq("id", userId)
        .single();
      if (!active) return;
      setProfile(
        data
          ? {
              id: data.id as string,
              email: data.email as string,
              displayName: data.display_name as string,
              role: data.role as Role,
            }
          : null,
      );
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session) {
        loadProfile(data.session.user.id).finally(() => {
          if (active) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        setLoading(true);
        loadProfile(newSession.user.id).finally(() => {
          if (active) setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [isTestMode]);

  const role: AuthRole = isTestMode ? initialRole! : !session ? "guest" : (profile?.role ?? "guest");

  const resolvedProfile: Profile | null = isTestMode
    ? initialRole === "guest"
      ? null
      : mockProfiles[initialRole as "member" | "admin"]
    : profile;

  const value = useMemo<AuthContextValue>(
    () => ({
      role,
      profile: resolvedProfile,
      loading: isTestMode ? false : loading,
      logout: () => {
        if (isTestMode) return;
        void supabase.auth.signOut();
      },
    }),
    [role, resolvedProfile, loading, isTestMode],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within <AuthProvider>");
  }
  return ctx;
}
