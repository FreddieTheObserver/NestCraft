import { randomBytes } from "node:crypto";

import { prisma } from "../lib/prisma.js";
import { getSessionMaxAgeMs } from "../config/session.js";

type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

function generateSessionId() {
  return randomBytes(32).toString("base64url");
}

export async function createSession(userId: number): Promise<string> {
  const id = generateSessionId();
  const expiresAt = new Date(Date.now() + getSessionMaxAgeMs());
  await prisma.session.create({
    data: { id, userId, expiresAt },
  });
  return id;
}

export async function destroySession(id: string): Promise<void> {
  await prisma.session.deleteMany({ where: { id } });
}

export async function lookupSession(id: string): Promise<SessionUser | null> {
  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.delete({ where: { id } }).catch(() => {});
    return null;
  }

  return session.user;
}
