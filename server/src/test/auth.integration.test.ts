import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../app.js";

describe("auth session contract", () => {
  it("sets a session cookie on login and returns the session user", async () => {
    const email = `session-${Date.now()}@example.com`;

    const registerResponse = await request(app).post("/api/auth/register").send({
      name: "Session User",
      email,
      password: "password123",
    });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.headers["set-cookie"]).toBeDefined();

    const cookie = registerResponse.headers["set-cookie"][0].split(";")[0];

    const sessionResponse = await request(app)
      .get("/api/auth/session")
      .set("Cookie", cookie);

    expect(sessionResponse.status).toBe(200);
    expect(sessionResponse.body.user.email).toBe(email);
  });
});
