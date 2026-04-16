import type { CookieOptions } from "express";

const SESSION_COOKIE_NAME = "nestcraft_session";
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}

export function getSessionMaxAgeMs() {
  return SESSION_MAX_AGE_MS;
}

export function getSessionCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_MS,
  };
}
