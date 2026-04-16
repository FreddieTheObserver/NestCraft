import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AuthProvider, useAuth } from "./AuthContext";

vi.mock("../services/auth", () => ({
      getSession: vi.fn().mockResolvedValue({
            user: {
                  id: 1,
                  name: "Session User",
                  email: "session@example.com",
                  role: "customer",
            },
      }),
      loginUser: vi.fn(),
      registerUser: vi.fn(),
      logoutUser: vi.fn(),
}));

function Probe() {
      const { isAuthenticated, user, isInitializing } = useAuth();
      if (isInitializing) {
            return <div>initializing</div>;
      }
      return <div>{isAuthenticated ? user?.email : "guest"}</div>;
}

describe("AuthProvider", () => {
      it("bootstraps the session user from the backend", async () => {
            render(
                  <AuthProvider>
                        <Probe />
                  </AuthProvider>,
            );

            await waitFor(() => {
                  expect(screen.getByText("session@example.com")).toBeInTheDocument();
            });
      });
});
