import type { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';

type AuthTokenPayload = {
      userId: number;
      role: string;
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
            return res.status(401).json({
                  message: "Unauthorized",
            });
      }

      const token = authorization.split(" ")[1];

      try {
            const decoded = jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
            req.user = decoded;
            return next();
      } catch {
            return res.status(401).json({
                  message: "Invalid token",
            })
      }
}