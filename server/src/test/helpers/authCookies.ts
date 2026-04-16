import request from "supertest";

import app from "../../app.js";

export async function registerAndGetCookie(input: {
  name: string;
  email: string;
  password: string;
}) {
  const response = await request(app).post("/api/auth/register").send(input);
  return response.headers["set-cookie"][0].split(";")[0];
}
