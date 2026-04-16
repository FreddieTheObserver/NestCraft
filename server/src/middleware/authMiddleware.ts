import type { NextFunction, Request, Response } from "express";

import { getSessionCookieName } from "../config/session.js";
import { verifySessionToken } from "../services/authService.js";
import { sendError } from "../utils/http.js";

type UserRole = "customer" | "admin";

type AuthTokenPayload = {
      userId: number;
      role: UserRole;
};

export type AuthenticatedRequest = Request & {
      user?: AuthTokenPayload;
};

export function requireAuth(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction,
) {
      const token = req.cookies?.[getSessionCookieName()];

      if (!token) {
            return sendError(res, 401, "UNAUTHORIZED", "Authentication is required");
      }

      try {
            const decoded = verifySessionToken(token) as AuthTokenPayload;
            req.user = decoded;
            return next();
      } catch {
            return sendError(res, 401, "INVALID_SESSION", "Invalid or expired session");
      }
}

export function requireAdmin (
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
