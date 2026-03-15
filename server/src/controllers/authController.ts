import type { Request, Response } from 'express';
import { loginUser, registerUser } from '../services/authService.js';

export async function register(req: Request, res: Response) {
      try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                  return res.status(400).json({
                        message: "Name, email, and password are required",
                  });
            }

            const result = await registerUser(name, email, password);
            
            return res.status(201).json(result);
      } catch (error) {
            if (error instanceof Error && error.message === "EMAIL_ALREADY_IN_USE") {
                  return res.status(409).json({
                        message: "Email already in use",
                  });
            }

            console.error("Register failed: ", error);

            return res.status(500).json({
                  message: "Register failed",
            });
      }
}

export async function login(req: Request, res: Response) {
      try {
            const { email, password } = req.body;

            if (!email || !password) {
                  return res.status(400).json({
                        message: "Email and password are required",
                  });
            }

            const result = await loginUser(email, password);

            return res.status(200).json(result);
      } catch (error) {
            if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
                  return res.status(401).json({
                        message: "Invalid credentials",
                  });
            }

            console.error("Login failed: ", error);

            return res.status(500).json({
                  message: "Login failed",
            })
      }
}
