import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Badge } from "../../src/components/Badge/Badge";

describe("Badge", () => {
  it("항상 텍스트를 동반한다 — 색상만으로 상태를 표시하지 않는다(헌법 IX)", () => {
    const { container: pendingContainer } = render(<Badge tone="pending" />);
    expect(pendingContainer).toHaveTextContent("답변 대기");

    const { container: doneContainer } = render(<Badge tone="answered" />);
    expect(doneContainer).toHaveTextContent("답변 완료");
  });

  it("children prop을 받지 않아 텍스트 없는 배지를 만들 수 없다", () => {
    // @ts-expect-error Badge는 children을 받지 않는다(설계 의도)
    render(<Badge tone="pending">커스텀</Badge>);
  });
});
