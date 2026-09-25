import { createClient } from "@supabase/supabase-js";

// plan.md §17, tasks.md T052 — Supabase 클라이언트 단일 인스턴스.
// 키 이름은 VITE_SUPABASE_ANON_KEY가 아니라 VITE_SUPABASE_PUBLISHABLE_KEY를 사용한다(사용자 지정).
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL ?? "",
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "",
);
