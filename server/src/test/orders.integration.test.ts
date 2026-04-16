import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../app.js";
import { prisma } from "../lib/prisma.js";

function uniqueEmail(tag: string) {
  return `${tag}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

async function registerAdminCookie() {
  const email = uniqueEmail("admin-orders");
  const response = await request(app).post("/api/auth/register").send({
    name: "Admin Orders Tester",
    email,
    password: "password123",
  });
  expect(response.status).toBe(201);

  await prisma.user.update({
    where: { email },
    data: { role: "admin" },
  });

  return response.headers["set-cookie"][0].split(";")[0];
}

async function registerCustomerCookie() {
  const email = uniqueEmail("customer-orders");
  const response = await request(app).post("/api/auth/register").send({
    name: "Customer Orders Tester",
    email,
    password: "password123",
  });
  expect(response.status).toBe(201);
  return response.headers["set-cookie"][0].split(";")[0];
}

describe("admin orders list", () => {
  it("rejects unauthenticated admin order list requests", async () => {
    const response = await request(app).get("/api/admin/orders?page=1&pageSize=10");
    expect(response.status).toBe(401);
  });

  it("rejects non-admin admin order list requests", async () => {
    const cookie = await registerCustomerCookie();
    const response = await request(app)
      .get("/api/admin/orders?page=1&pageSize=10")
      .set("Cookie", cookie);
    expect(response.status).toBe(403);
  });

  it("returns paginated admin orders", async () => {
    const cookie = await registerAdminCookie();
    const response = await request(app)
      .get("/api/admin/orders?page=1&pageSize=10")
      .set("Cookie", cookie);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      items: expect.any(Array),
      page: 1,
      pageSize: 10,
      totalCount: expect.any(Number),
      totalPages: expect.any(Number),
    });
  });

  it("filters by status", async () => {
    const cookie = await registerAdminCookie();
    const response = await request(app)
      .get("/api/admin/orders?page=1&pageSize=10&status=pending")
      .set("Cookie", cookie);

    expect(response.status).toBe(200);
    for (const order of response.body.items) {
      expect(order.status).toBe("pending");
    }
  });
});
