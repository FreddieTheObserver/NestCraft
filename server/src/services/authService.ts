import bcrypt from "bcryptjs";

import { prisma } from "../lib/prisma.js";
import { createSession } from "./sessionService.js";

type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type AuthResult = {
  user: SessionUser;
  sessionId: string;
};

function toSessionUser(user: {
  id: number;
  name: string;
  email: string;
  role: string;
}): SessionUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("EMAIL_ALREADY_IN_USE");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
    select: { id: true, name: true, email: true, role: true },
  });

  const sessionId = await createSession(user.id);
  return { user: toSessionUser(user), sessionId };
}

export async function loginUser(
  email: string,
  password: string,
): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const sessionId = await createSession(user.id);
  return { user: toSessionUser(user), sessionId };
}
