import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";

type UserRole = "customer" | "admin";

type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type AuthResult = {
  user: SessionUser;
  sessionToken: string;
};

function signSessionToken(userId: number, role: UserRole) {
  return jwt.sign({ userId, role }, env.jwtSecret, { expiresIn: "7d" });
}

export function verifySessionToken(token: string) {
  return jwt.verify(token, env.jwtSecret) as { userId: number; role: UserRole };
}

export async function getSessionUser(userId: number): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  return user;
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<AuthResult> {
  const existinguser = await prisma.user.findUnique({
    where: { email },
  });

  if (existinguser) {
    throw new Error("EMAIL_ALREADY_IN_USE");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
  });

  const sessionToken = signSessionToken(user.id, user.role as UserRole);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    sessionToken,
  };
}

export async function loginUser(
  email: string,
  password: string,
): Promise<AuthResult> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const sessionToken = signSessionToken(user.id, user.role as UserRole);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    sessionToken,
  };
}
