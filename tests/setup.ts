import "@testing-library/jest-dom/vitest";
import { expect } from "vitest";
import { toHaveNoViolations } from "jest-axe";

// tasks.md T084 — 공통 컴포넌트 테스트가 쓰는 axe 매처를 한 곳에서 등록한다.
expect.extend(toHaveNoViolations);
