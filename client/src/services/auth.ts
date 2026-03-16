import { readApiError } from '../utils/api'

type AuthUser = {
      id: number
      name: string 
      email: string 
      role: string 
}

type AuthResponse = {
      user: AuthUser
      token: string
}

type RegisterInput = {
      name: string
      email: string 
      password: string
}

type LoginInput = {
      email: string 
      password: string
}

export async function registerUser(data: RegisterInput): Promise<AuthResponse> {
      const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                  'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
      })

      if (!response.ok) {
            throw new Error(await readApiError(response, "Failed to register"));
      }

      return response.json() as Promise<AuthResponse>;
}

export async function loginUser(data: LoginInput): Promise<AuthResponse> {
      const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                  'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
      })

      if (!response.ok) {
            throw new Error(await readApiError(response, "Failed to login"));
      }

      return response.json() as Promise<AuthResponse>;
}

export type { AuthUser, AuthResponse, RegisterInput, LoginInput };
