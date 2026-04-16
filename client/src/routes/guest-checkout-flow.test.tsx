import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { ThemeProvider } from "../context/ThemeContext";
import { router as appRoutes } from "./index";

beforeAll(() => {
      window.matchMedia = window.matchMedia ?? ((query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addEventListener: () => {},
            removeEventListener: () => {},
            addListener: () => {},
            removeListener: () => {},
            dispatchEvent: () => false,
      } as unknown as MediaQueryList));
});

vi.mock("../services/auth", () => ({
      getSession: vi.fn().mockResolvedValue(null),
      loginUser: vi.fn(),
      registerUser: vi.fn(),
      logoutUser: vi.fn(),
}));

describe("guest checkout flow", () => {
      it("allows cart access without auth", async () => {
            const router = createMemoryRouter(appRoutes.routes, {
                  initialEntries: ["/cart"],
            });

            render(
                  <ThemeProvider>
                        <AuthProvider>
                              <CartProvider>
                                    <RouterProvider router={router} />
                              </CartProvider>
                        </AuthProvider>
                  </ThemeProvider>,
            );

            await waitFor(() => {
                  expect(screen.getByText(/Cart atelier/i)).toBeTruthy();
            });
      });
});
