import { render, screen, waitFor } from "@testing-library/react";
import {
      MemoryRouter,
      Route,
      Routes,
      createMemoryRouter,
      RouterProvider,
} from "react-router-dom";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { ThemeProvider } from "../context/ThemeContext";
import CheckoutPage from "../pages/CheckoutPage";
import LoginPage from "../pages/LoginPage";
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
                  expect(screen.getByText(/Cart atelier/i)).toBeInTheDocument();
            });
      });

      it("redirects a guest from checkout intent to login with return state", async () => {
            render(
                  <ThemeProvider>
                        <AuthProvider>
                              <CartProvider>
                                    <MemoryRouter initialEntries={["/checkout"]}>
                                          <Routes>
                                                <Route path="/checkout" element={<CheckoutPage />} />
                                                <Route path="/login" element={<LoginPage />} />
                                          </Routes>
                                    </MemoryRouter>
                              </CartProvider>
                        </AuthProvider>
                  </ThemeProvider>,
            );

            expect(await screen.findByText(/Sign in/i)).toBeInTheDocument();
      });
});
