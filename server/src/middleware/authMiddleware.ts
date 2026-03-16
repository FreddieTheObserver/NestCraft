import type { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import { sendError } from '../utils/http.js';

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
      const authorization = req.headers.authorization;
      
      if (!authorization || !authorization.startsWith("Bearer ")) {
            return sendError(res, 401, "UNAUTHORIZED", "Authentication is required");
      }

      const token = authorization.split(" ")[1];

      try {
            const decoded = jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
            req.user = decoded;
            return next();
      } catch {
            return sendError(res, 401, "INVALID_TOKEN", "Invalid or expired token");
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
