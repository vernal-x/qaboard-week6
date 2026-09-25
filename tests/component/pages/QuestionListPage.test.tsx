import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { QuestionListPage } from "../../../src/pages/QuestionListPage/QuestionListPage";
import { renderWithProviders } from "../testUtils";

describe("QuestionListPage (FR-006, FR-007, US1/US2)", () => {
  it("회원 뷰는 '내 질문' 제목과 CTA를 보여준다", async () => {
    renderWithProviders(<QuestionListPage />, { role: "member" });
    expect(await screen.findByText("내 질문")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "질문 작성하기" }).length).toBeGreaterThan(0);
    // 본인 질문만 보이는지(u-member-1 소유 4건 중 하나)
    expect(await screen.findByText("환불 절차가 어떻게 되나요?")).toBeInTheDocument();
  });

  it("관리자 뷰는 '문의 관리' 제목이고 CTA가 없다(design.md §6)", async () => {
    renderWithProviders(<QuestionListPage />, { role: "admin" });
    expect(await screen.findByText("문의 관리")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "질문 작성하기" })).not.toBeInTheDocument();
    // 관리자 기본 필터는 "답변 대기" — pending 상태 질문(예: 쿠폰 문의)이 보여야 한다
    expect(await screen.findByText("쿠폰은 중복 사용이 가능한가요?")).toBeInTheDocument();
  });
});
