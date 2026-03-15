import { createContext, useContext, useEffect, useState } from "react";

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

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function AuthProvider({ children }: { children: React.ReactNode }) {
      const [user, setUser] = useState<AuthUser | null>(null);
      const [token, setToken] = useState("");

      useEffect(() => {
            const storedUser = localStorage.getItem('auth_user');
            const storedToken = localStorage.getItem('auth_token');

            if (storedUser && storedToken) {
                  setUser(JSON.parse(storedUser));
                  setToken(storedToken);
            }
      }, []);

      async function login(data: LoginInput) {
            const result = await loginUser(data);

            setUser(result.user);
            setToken(result.token);

            localStorage.setItem('auth_user', JSON.stringify(result.user));
            localStorage.setItem('auth_token', result.token);
      }

      async function register(data: RegisterInput) {
            const result = await registerUser(data);

            setUser(result.user);
            setToken(result.token);

            localStorage.setItem('auth_user', JSON.stringify(result.user));  
            localStorage.setItem('auth_token', result.token);  
      }

      function logout() {
            setUser(null);
            setToken("");

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