import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../../src/auth/AuthProvider";
import type { AuthRole } from "../../src/types/database";

export function renderWithProviders(
  ui: ReactElement,
  { route = "/", role = "guest" }: { route?: string; role?: AuthRole } = {},
) {
  return render(
    <AuthProvider initialRole={role}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </AuthProvider>,
  );
}
