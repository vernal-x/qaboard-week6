import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Input } from "../../src/components/Input/Input";

describe("Input", () => {
  it("error가 있으면 오류 문구를 role=alert로 보여준다", () => {
    render(
      <Input label="제목" value="" onChange={() => {}} maxLength={100} error="제목을 입력해주세요." />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("제목을 입력해주세요.");
  });

  it("readOnly면 글자수 카운터를 보여주지 않는다(design.md §13)", () => {
    render(<Input label="제목" value="환불 절차가 어떻게 되나요?" maxLength={100} readOnly />);
    expect(screen.queryByText(/\/ 100/)).not.toBeInTheDocument();
  });
});
