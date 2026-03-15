import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';

type AuthResult = {
      user: {
            id: number;
            name: string;
            email: string;
            role: string;
      };
      token: string;
};

function signToken(userId: number, role: string) {
      return jwt.sign({ userId, role }, env.jwtSecret, { expiresIn: "7d" });
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

      const token = signToken(user.id, user.role);

      return {
            user: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  role: user.role,
            },
            token,
      };
}

export async function loginUser (
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

      const token = signToken(user.id, user.role);

      return {
            user: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  role: user.role,
            },
            token,
      };
}