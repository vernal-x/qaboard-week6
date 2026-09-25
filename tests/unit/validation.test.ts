import { describe, expect, it } from "vitest";
import { validateAnswer, validateContent, validateTitle } from "../../src/lib/validation";

describe("validateTitle (FR-005)", () => {
  it("공백만 입력하면 거부한다", () => {
    expect(validateTitle("   ")).not.toBeNull();
  });
  it("100자 이하는 통과한다", () => {
    expect(validateTitle("a".repeat(100))).toBeNull();
  });
  it("101자는 거부한다", () => {
    expect(validateTitle("a".repeat(101))).not.toBeNull();
  });
});

describe("validateContent (FR-005)", () => {
  it("5000자는 통과, 5001자는 거부한다", () => {
    expect(validateContent("a".repeat(5000))).toBeNull();
    expect(validateContent("a".repeat(5001))).not.toBeNull();
  });
});

describe("validateAnswer (FR-010)", () => {
  it("빈 값은 거부한다", () => {
    expect(validateAnswer("")).not.toBeNull();
  });
  it("정상 값은 통과한다", () => {
    expect(validateAnswer("영업일 기준 3일 이내 환불됩니다.")).toBeNull();
  });
});
