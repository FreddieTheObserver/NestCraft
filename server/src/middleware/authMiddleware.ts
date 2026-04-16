import type { NextFunction, Request, Response } from "express";

import { getSessionCookieName, getSessionCookieOptions } from "../config/session.js";
import { lookupSession } from "../services/sessionService.js";
import { sendError } from "../utils/http.js";

export type AuthenticatedUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const sessionId = req.cookies?.[getSessionCookieName()];
  if (!sessionId) {
    return sendError(res, 401, "UNAUTHORIZED", "Authentication is required");
  }

  const user = await lookupSession(sessionId);
  if (!user) {
    res.clearCookie(getSessionCookieName(), getSessionCookieOptions());
    return sendError(res, 401, "INVALID_SESSION", "Invalid or expired session");
  }

  req.user = user;
  return next();
}

export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    return sendError(res, 401, "UNAUTHORIZED", "Authentication is required");
  }
  if (req.user.role !== "admin") {
    return sendError(res, 403, "FORBIDDEN", "Admin access is required");
  }
  return next();
}
