import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Button } from "../../src/components/Button/Button";

describe("Button", () => {
  it("loading이면 클릭이 비활성화된다(FR-020 저장 중)", () => {
    const onClick = vi.fn();
    render(
      <Button variant="primary" loading onClick={onClick}>
        저장 중...
      </Button>,
    );
    const btn = screen.getByRole("button", { name: "저장 중..." });
    expect(btn).toBeDisabled();
  });

  it("as='link'이면 실제 라우터 링크로 렌더된다", () => {
    render(
      <MemoryRouter>
        <Button as="link" variant="primary" to="/questions/new">
          질문 작성하기
        </Button>
      </MemoryRouter>,
    );
    const link = screen.getByRole("link", { name: "질문 작성하기" });
    expect(link).toHaveAttribute("href", "/questions/new");
  });
});
