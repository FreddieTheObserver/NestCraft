/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useState } from "react";

import {
      loginUser,
      registerUser,
      type AuthUser,
      type LoginInput,
      type RegisterInput,
} from '../services/auth';

type AuthContextValue = {
      user: AuthUser | null
      token: string
      isAuthenticated: boolean
      login: (data: LoginInput) => Promise<void>
      register: (data: RegisterInput) => Promise<void>
      logout: () => void
}

type StoredAuthState = {
      user: AuthUser | null
      token: string
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredAuth(): StoredAuthState {
      if (typeof window === 'undefined') {
            return {
                  user: null,
                  token: '',
            };
      }

      const storedUser = window.localStorage.getItem('auth_user');
      const storedToken = window.localStorage.getItem('auth_token');

      if (!storedUser || !storedToken) {
            return {
                  user: null,
                  token: '',
            };
      }

      try {
            return {
                  user: JSON.parse(storedUser) as AuthUser,
                  token: storedToken,
            };
      } catch {
            window.localStorage.removeItem('auth_user');
            window.localStorage.removeItem('auth_token');

            return {
                  user: null,
                  token: '',
            };
      }
}

function AuthProvider({ children }: { children: React.ReactNode }) {
      const [{ user, token }, setAuthState] = useState<StoredAuthState>(readStoredAuth);

      async function login(data: LoginInput) {
            const result = await loginUser(data);

            setAuthState({
                  user: result.user,
                  token: result.token,
            });

            localStorage.setItem('auth_user', JSON.stringify(result.user));
            localStorage.setItem('auth_token', result.token);
      }

      async function register(data: RegisterInput) {
            const result = await registerUser(data);

            setAuthState({
                  user: result.user,
                  token: result.token,
            });

            localStorage.setItem('auth_user', JSON.stringify(result.user));  
            localStorage.setItem('auth_token', result.token);  
      }

      function logout() {
            setAuthState({
                  user: null,
                  token: '',
            });

            localStorage.removeItem('auth_user');
            localStorage.removeItem('auth_token');
      }

      return (
            <AuthContext.Provider
                  value={{
                        user,
                        token,
                        isAuthenticated: Boolean(user && token),
                        login,
                        register,
                        logout,
                  }}
            >
                  {children}
            </AuthContext.Provider>
      )
}

function useAuth() {
      const context = useContext(AuthContext);

      if (!context) {
            throw new Error('useAuth must be used inside AuthProvider');
      }

      return context;
}

export { AuthProvider, useAuth };
