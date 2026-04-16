import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../app.js";
import { prisma } from "../lib/prisma.js";

function uniqueEmail(tag: string) {
  return `${tag}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

async function registerAndGetCookie(input: {
  name: string;
  email: string;
  password: string;
}) {
  const response = await request(app).post("/api/auth/register").send(input);
  expect(response.status).toBe(201);
  const setCookie = response.headers["set-cookie"];
  expect(setCookie).toBeDefined();
  return setCookie[0].split(";")[0];
}

describe("auth session contract", () => {
  it("sets an opaque session cookie on register and loads the session user", async () => {
    const email = uniqueEmail("session");
    const cookie = await registerAndGetCookie({
      name: "Session User",
      email,
      password: "password123",
    });

    expect(cookie.startsWith("nestcraft_session=")).toBe(true);
    const token = cookie.split("=")[1];
    expect(token.length).toBeGreaterThanOrEqual(32);
    expect(token.includes(".")).toBe(false);

    const sessionResponse = await request(app)
      .get("/api/auth/session")
      .set("Cookie", cookie);

    expect(sessionResponse.status).toBe(200);
    expect(sessionResponse.body.user.email).toBe(email);
    expect(sessionResponse.body.user.role).toBe("customer");
  });

  it("returns 401 when no cookie is sent", async () => {
    const response = await request(app).get("/api/auth/session");
    expect(response.status).toBe(401);
  });

  it("returns 401 when the cookie is unknown or tampered", async () => {
    const response = await request(app)
      .get("/api/auth/session")
      .set("Cookie", "nestcraft_session=not-a-real-session-id");
    expect(response.status).toBe(401);
  });

  it("invalidates the session server-side on logout so copied cookies stop working", async () => {
    const cookie = await registerAndGetCookie({
      name: "Logout User",
      email: uniqueEmail("logout"),
      password: "password123",
    });

    const copiedCookie = cookie;

    const logoutResponse = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", cookie);
    expect(logoutResponse.status).toBe(204);

    const sessionResponse = await request(app)
      .get("/api/auth/session")
      .set("Cookie", copiedCookie);
    expect(sessionResponse.status).toBe(401);
  });

  it("authorizes admin endpoints against the fresh DB role, not the cookie", async () => {
    const email = uniqueEmail("role");
    const cookie = await registerAndGetCookie({
      name: "Promotable User",
      email,
      password: "password123",
    });

    const beforePromotion = await request(app)
      .get("/api/admin/products?page=1&pageSize=5")
      .set("Cookie", cookie);
    expect(beforePromotion.status).toBe(403);

    await prisma.user.update({
      where: { email },
      data: { role: "admin" },
    });

    const afterPromotion = await request(app)
      .get("/api/admin/products?page=1&pageSize=5")
      .set("Cookie", cookie);
    expect(afterPromotion.status).not.toBe(403);
    expect(afterPromotion.status).not.toBe(401);
  });
});
