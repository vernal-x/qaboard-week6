-- ============================================================================
-- 기록용 SQL — 이 파일은 실행하기 위한 것이 아니다.
--
-- 사용자가 0001에 더해 추가로 적용한 정책 기록: 관리자가 모든 profiles를 읽을 수 있도록
-- is_admin()을 사용하는 보강 정책. 관리자 목록 화면(design.md §11)이 작성자 닉네임을
-- 조인해 보여줘야 하므로(FR-007) 필요하다. 0001의 profiles_select_self(본인만 조회)와
-- 이 정책은 OR로 함께 적용된다(Postgres RLS는 같은 command의 여러 정책을 OR로 평가).
-- ============================================================================

create policy "admin can read all profiles" on public.profiles
  for select using (public.is_admin());
