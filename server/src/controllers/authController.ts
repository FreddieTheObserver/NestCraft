import type { Request, Response } from 'express';

import { loginUser, registerUser } from '../services/authService.js';
import { sendError } from '../utils/http.js';

export async function register(req: Request, res: Response) {
      try {
            const { name, email, password } = req.body;

            const result = await registerUser(name, email, password);
            
            return res.status(201).json(result);
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

            return res.status(200).json(result);
      } catch (error) {
            if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
                  return sendError(res, 401, "INVALID_CREDENTIALS", "Invalid credentials");
            }

            console.error("Login failed: ", error);
            return sendError(res, 500, "INTERNAL_ERROR", "Login failed");
      }
}
