import { apiFetch, readApiError } from '../utils/api'

type AuthUser = {
      id: number
      name: string
      email: string
      role: string
}

type AuthResponse = {
      user: AuthUser
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
      const response = await apiFetch('/api/auth/register', {
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
      const response = await apiFetch('/api/auth/login', {
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

export async function getSession(): Promise<AuthResponse | null> {
      const response = await apiFetch('/api/auth/session')

      if (response.status === 401) {
            return null;
      }

      if (!response.ok) {
            throw new Error(await readApiError(response, "Failed to load session"));
      }

      return response.json() as Promise<AuthResponse>;
}

export async function logoutUser(): Promise<void> {
      const response = await apiFetch('/api/auth/logout', {
            method: 'POST',
      })

      if (!response.ok) {
            throw new Error(await readApiError(response, "Failed to log out"));
      }
}

export type { AuthUser, AuthResponse, RegisterInput, LoginInput };
