import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../../../src/auth/AuthProvider";
import { QuestionDetailPage } from "../../../src/pages/QuestionDetailPage/QuestionDetailPage";
import type { AuthRole } from "../../../src/types/database";

function renderDetail(path: string, role: AuthRole) {
  return render(
    <AuthProvider initialRole={role}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/questions/new" element={<QuestionDetailPage />} />
          <Route path="/questions/:id" element={<QuestionDetailPage />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe("QuestionDetailPage 모드 파생 (FR-021, contracts/routes.md)", () => {
  it("/questions/new + 회원 → 신규 작성 모드", async () => {
    renderDetail("/questions/new", "member");
    expect(await screen.findByRole("heading", { name: "질문 작성" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "등록하기" })).toBeInTheDocument();
  });

  it("답변 대기 질문 + 회원 → 수정/삭제 가능한 상세 모드", async () => {
    renderDetail("/questions/q-2", "member");
    expect(await screen.findByRole("heading", { name: "질문 상세" })).toBeInTheDocument();
    expect(screen.getByText("답변 대기")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "삭제하기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "저장하기" })).toBeInTheDocument();
  });

  it("답변 완료 질문 + 회원 → 읽기 전용 모드(수정/삭제 버튼 없음)", async () => {
    renderDetail("/questions/q-1", "member");
    expect(await screen.findByText("답변 완료")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "삭제하기" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "저장하기" })).not.toBeInTheDocument();
    expect(
      screen.getByText("영업일 기준 3일 이내 환불됩니다. 결제하신 수단으로 그대로 환불되며, 진행 상황은 마이페이지에서 확인하실 수 있어요."),
    ).toBeInTheDocument();
  });

  it("답변 대기 질문 + 관리자 → 답변 작성 모드", async () => {
    renderDetail("/questions/q-2", "admin");
    expect(await screen.findByRole("button", { name: "답변 등록" })).toBeInTheDocument();
    expect(screen.getByText(/질문자 · /)).toBeInTheDocument();
  });

  it("답변 완료 질문 + 관리자 → 답변 수정 모드로 자동 진입(design.md §5 갭 보완, T040)", async () => {
    renderDetail("/questions/q-1", "admin");
    expect(await screen.findByRole("button", { name: "답변 수정" })).toBeInTheDocument();
  });

  it("존재하지 않는 질문 id → 오류 상태(spec.md Edge Case, T082)", async () => {
    renderDetail("/questions/does-not-exist", "member");
    expect(await screen.findByText("질문을 찾을 수 없어요.")).toBeInTheDocument();
  });

  it("다른 회원의 질문 id로 접근 → 오류 상태(FR-016)", async () => {
    renderDetail("/questions/q-5", "member"); // q-5는 u-haneul 소유
    expect(await screen.findByText("질문을 찾을 수 없어요.")).toBeInTheDocument();
  });
});
