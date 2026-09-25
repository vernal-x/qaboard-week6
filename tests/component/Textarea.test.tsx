import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Textarea } from "../../src/components/Textarea/Textarea";

describe("Textarea", () => {
  it("입력값 길이에 따라 글자수 카운터를 보여준다", () => {
    render(<Textarea label="내용" value="안녕하세요" onChange={() => {}} maxLength={5000} />);
    expect(screen.getByText("5 / 5000")).toBeInTheDocument();
  });

  it("error가 있으면 카운터 대신 오류 문구를 보여준다", () => {
    render(
      <Textarea label="답변" value="" onChange={() => {}} maxLength={5000} error="답변을 입력해주세요." />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("답변을 입력해주세요.");
    expect(screen.queryByText("0 / 5000")).not.toBeInTheDocument();
  });
});
