import type { Request, Response } from "express";

import {
  getSessionUser,
  loginUser,
  registerUser,
  verifySessionToken,
} from "../services/authService.js";
import { getSessionCookieName, getSessionCookieOptions } from "../config/session.js";
import { sendError } from "../utils/http.js";

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    const result = await registerUser(name, email, password);

    return res
      .cookie(
        getSessionCookieName(),
        result.sessionToken,
        getSessionCookieOptions(),
      )
      .status(201)
      .json({ user: result.user });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_ALREADY_IN_USE") {
      return sendError(res, 409, "EMAIL_ALREADY_IN_USE", "Email already in use");
    }

    console.error("Register failed: ", error);
    return sendError(res, 500, "INTERNAL_ERROR", "Register failed");
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const result = await loginUser(email, password);

    return res
      .cookie(
        getSessionCookieName(),
        result.sessionToken,
        getSessionCookieOptions(),
      )
      .status(200)
      .json({ user: result.user });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
      return sendError(res, 401, "INVALID_CREDENTIALS", "Invalid credentials");
    }

    console.error("Login failed: ", error);
    return sendError(res, 500, "INTERNAL_ERROR", "Login failed");
  }
}

export async function getSession(req: Request, res: Response) {
  const token = req.cookies[getSessionCookieName()];

  if (!token) {
    return sendError(res, 401, "UNAUTHORIZED", "Authentication is required");
  }

  try {
    const decoded = verifySessionToken(token);
    const user = await getSessionUser(decoded.userId);

    if (!user) {
      res.clearCookie(getSessionCookieName(), getSessionCookieOptions());
      return sendError(res, 401, "UNAUTHORIZED", "Authentication is required");
    }

    return res.status(200).json({ user });
  } catch {
    res.clearCookie(getSessionCookieName(), getSessionCookieOptions());
    return sendError(res, 401, "INVALID_SESSION", "Invalid or expired session");
  }
}

export function logout(_req: Request, res: Response) {
  res.clearCookie(getSessionCookieName(), getSessionCookieOptions());
  return res.status(204).send();
}
