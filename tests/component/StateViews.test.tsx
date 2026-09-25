import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingState } from "../../src/components/StateViews/LoadingState";
import { EmptyState } from "../../src/components/StateViews/EmptyState";
import { ErrorState } from "../../src/components/StateViews/ErrorState";

describe("StateViews", () => {
  it("LoadingState는 rows 개수만큼 스켈레톤을 렌더한다", () => {
    const { container } = render(<LoadingState rows={4} />);
    expect(container.querySelectorAll("[class*='skeletonBar']")).toHaveLength(4);
  });

  it("EmptyState는 관리자에게 CTA를 보여주지 않는다(Clarifications Q5)", () => {
    // eslint-disable-next-line jsx-a11y/aria-role -- EmptyState의 role은 ARIA 속성이 아닌 도메인 prop(contracts/components.md)
    render(<EmptyState role="admin" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("해당 상태의 질문이 없습니다.")).toBeInTheDocument();
  });

  it("EmptyState는 회원에게 onCreate가 있으면 CTA를 보여준다", () => {
    const onCreate = vi.fn();
    // eslint-disable-next-line jsx-a11y/aria-role -- 위와 동일한 이유로 오탐 처리
    render(<EmptyState role="member" onCreate={onCreate} />);
    screen.getByRole("button", { name: "질문 작성하기" }).click();
    expect(onCreate).toHaveBeenCalledOnce();
  });

  it("ErrorState의 다시 시도 버튼은 onRetry를 호출한다", () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);
    screen.getByRole("button", { name: "다시 시도" }).click();
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
