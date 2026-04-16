/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useEffect, useState } from "react";

import {
      getSession,
      loginUser,
      logoutUser,
      registerUser,
      type AuthUser,
      type LoginInput,
      type RegisterInput,
} from '../services/auth';

type AuthContextValue = {
      user: AuthUser | null
      isAuthenticated: boolean
      isInitializing: boolean
      login: (data: LoginInput) => Promise<void>
      register: (data: RegisterInput) => Promise<void>
      logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function AuthProvider({ children }: { children: React.ReactNode }) {
      const [user, setUser] = useState<AuthUser | null>(null);
      const [isInitializing, setIsInitializing] = useState(true);

      useEffect(() => {
            let cancelled = false;

            async function bootstrap() {
                  try {
                        const result = await getSession();
                        if (!cancelled) {
                              setUser(result?.user ?? null);
                        }
                  } catch {
                        if (!cancelled) {
                              setUser(null);
                        }
                  } finally {
                        if (!cancelled) {
                              setIsInitializing(false);
                        }
                  }
            }

            bootstrap();

            return () => {
                  cancelled = true;
            };
      }, []);

      async function login(data: LoginInput) {
            const result = await loginUser(data);
            setUser(result.user);
      }

      async function register(data: RegisterInput) {
            const result = await registerUser(data);
            setUser(result.user);
      }

      async function logout() {
            try {
                  await logoutUser();
            } finally {
                  setUser(null);
            }
      }

      return (
            <AuthContext.Provider
                  value={{
                        user,
                        isAuthenticated: Boolean(user),
                        isInitializing,
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
