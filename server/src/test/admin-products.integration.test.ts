import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../app.js";
import { prisma } from "../lib/prisma.js";

function uniqueEmail(tag: string) {
  return `${tag}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

async function registerAdminCookie() {
  const email = uniqueEmail("admin-products");
  const response = await request(app).post("/api/auth/register").send({
    name: "Admin Products Tester",
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
  const email = uniqueEmail("customer-products");
  const response = await request(app).post("/api/auth/register").send({
    name: "Customer Tester",
    email,
    password: "password123",
  });
  expect(response.status).toBe(201);
  return response.headers["set-cookie"][0].split(";")[0];
}

describe("admin product contracts", () => {
  it("rejects unauthenticated admin list requests", async () => {
    const response = await request(app).get("/api/admin/products?page=1&pageSize=5");
    expect(response.status).toBe(401);
  });

  it("rejects non-admin admin list requests", async () => {
    const cookie = await registerCustomerCookie();
    const response = await request(app)
      .get("/api/admin/products?page=1&pageSize=5")
      .set("Cookie", cookie);
    expect(response.status).toBe(403);
  });

  it("returns a paginated shape for admin product list", async () => {
    const cookie = await registerAdminCookie();
    const response = await request(app)
      .get("/api/admin/products?page=1&pageSize=5")
      .set("Cookie", cookie);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      items: expect.any(Array),
      page: 1,
      pageSize: 5,
      totalCount: expect.any(Number),
      totalPages: expect.any(Number),
    });
  });

  it("exposes an admin detail endpoint by numeric id", async () => {
    const cookie = await registerAdminCookie();
    const firstProduct = await prisma.product.findFirst({ orderBy: { id: "asc" } });
    if (!firstProduct) {
      return;
    }

    const response = await request(app)
      .get(`/api/admin/products/${firstProduct.id}`)
      .set("Cookie", cookie);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(firstProduct.id);
    expect(response.body.slug).toBe(firstProduct.slug);
  });

  it("returns 404 for an unknown admin product id", async () => {
    const cookie = await registerAdminCookie();
    const response = await request(app)
      .get("/api/admin/products/999999999")
      .set("Cookie", cookie);
    expect(response.status).toBe(404);
  });
});
