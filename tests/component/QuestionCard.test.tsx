import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { axe } from "jest-axe";
import { QuestionCard } from "../../src/components/QuestionCard/QuestionCard";

describe("QuestionCard", () => {
  it("제목·상태·날짜를 보여주고 행 전체가 링크다(design.md §11)", () => {
    render(
      <MemoryRouter>
        <QuestionCard
          title="환불 절차가 어떻게 되나요?"
          status="pending"
          date="2026.09.20"
          nickname="lemontea"
          href="/questions/q-1"
        />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: /환불 절차가 어떻게 되나요\?/ })).toHaveAttribute(
      "href",
      "/questions/q-1",
    );
    expect(screen.getByText("답변 대기")).toBeInTheDocument();
    expect(screen.getByText("lemontea")).toBeInTheDocument();
  });

  it("접근성 위반이 없다(tasks.md T085)", async () => {
    const { container } = render(
      <MemoryRouter>
        <QuestionCard
          title="환불 절차가 어떻게 되나요?"
          status="answered"
          date="2026.09.20"
          nickname="lemontea"
          href="/questions/q-1"
        />
      </MemoryRouter>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
