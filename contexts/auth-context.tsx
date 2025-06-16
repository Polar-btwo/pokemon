"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User, AuthState } from "@/lib/auth-types"

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Usuarios predefinidos
const USERS: Record<string, { password: string; user: User }> = {
  admin: {
    password: "admin123",
    user: {
      id: "1",
      username: "admin",
      role: "admin",
      name: "Administrador",
    },
  },
  mesero: {
    password: "mesero123",
    user: {
      id: "2",
      username: "mesero",
      role: "mesero",
      name: "Mesero",
    },
  },
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  })

  useEffect(() => {
    // Verificar si hay una sesión guardada
    const savedUser = localStorage.getItem("vibrass_user")
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        setAuthState({
          user,
          isAuthenticated: true,
        })
      } catch (error) {
        localStorage.removeItem("vibrass_user")
      }
    }
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    const userCredentials = USERS[username.toLowerCase()]

    if (userCredentials && userCredentials.password === password) {
      const user = userCredentials.user
      setAuthState({
        user,
        isAuthenticated: true,
      })
      localStorage.setItem("vibrass_user", JSON.stringify(user))
      return true
    }

    return false
  }

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
    })
    localStorage.removeItem("vibrass_user")
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
