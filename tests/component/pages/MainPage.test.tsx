import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { MainPage } from "../../../src/pages/MainPage/MainPage";
import { renderWithProviders } from "../testUtils";

describe("MainPage (FR-019, SC-001, US4)", () => {
  it("비회원에게는 CTA가 로그인 화면으로 연결된다", () => {
    renderWithProviders(<MainPage />, { role: "guest" });
    const cta = screen.getByRole("link", { name: "질문 작성하기" });
    expect(cta).toHaveAttribute("href", "/login");
  });

  it("회원에게는 CTA가 질문 작성 화면으로 연결된다", () => {
    renderWithProviders(<MainPage />, { role: "member" });
    const cta = screen.getByRole("link", { name: "질문 작성하기" });
    expect(cta).toHaveAttribute("href", "/questions/new");
  });

  it("이용 흐름 3단계와 상태 배지 예시가 노출된다", () => {
    renderWithProviders(<MainPage />, { role: "guest" });
    // 미니 플로우 캡션과 이용 흐름 섹션에 각각 한 번씩 등장하므로 getAllByText로 확인한다.
    expect(screen.getAllByText("질문 작성").length).toBeGreaterThan(0);
    expect(screen.getAllByText("관리자 확인").length).toBeGreaterThan(0);
    expect(screen.getAllByText("답변 확인").length).toBeGreaterThan(0);
    expect(screen.getAllByText("답변 대기").length).toBeGreaterThan(0);
    expect(screen.getAllByText("답변 완료").length).toBeGreaterThan(0);
  });
});
