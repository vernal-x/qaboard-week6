import type { Profile } from "../../types/database";

/**
 * 컴포넌트 테스트 전용 고정 프로필(tests/component/testUtils.tsx → AuthProvider `initialRole`).
 * Phase 5(Supabase 연결) 이후 프로덕션 코드에서는 더 이상 참조하지 않는다(DevRoleSwitcher는
 * tasks.md T058로 제거됨). id 값은 mockQuestions.ts의 기존 질문 소유자 id와 맞춰져 있으므로
 * QuestionDetailPage의 "본인 소유" 단위 테스트가 이 값에 의존한다 — 임의로 바꾸지 않는다.
 */
export const mockProfiles: Record<"member" | "admin", Profile> = {
  member: { id: "u-member-1", email: "lemontea@example.com", displayName: "lemontea", role: "member" },
  admin: { id: "u-admin-1", email: "admin@example.com", displayName: "관리자", role: "admin" },
};
