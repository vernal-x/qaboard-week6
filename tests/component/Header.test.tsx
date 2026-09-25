import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import { Header } from "../../src/components/Header/Header";

describe("Header", () => {
  it("메인 페이지에서는 '메인' nav가 링크가 아닌 텍스트로 렌더된다", () => {
    render(
      <MemoryRouter>
        <Header activeNav="main" right={{ kind: "login" }} />
      </MemoryRouter>,
    );
    const main = screen.getByText("메인");
    expect(main.tagName).toBe("SPAN");
    expect(screen.getByRole("link", { name: "질문 목록" })).toBeInTheDocument();
  });

  it("로그인 상태에서는 사용자 이름과 로그아웃 버튼을 보여준다", () => {
    const onLogout = vi.fn();
    render(
      <MemoryRouter>
        <Header activeNav="questions" right={{ kind: "user", name: "lemontea", onLogout }} />
      </MemoryRouter>,
    );
    expect(screen.getAllByText("lemontea 님").length).toBeGreaterThan(0);
    expect(screen.getAllByText("로그아웃").length).toBeGreaterThan(0);
  });
});
