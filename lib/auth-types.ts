export interface User {
  id: string
  username: string
  role: "admin" | "mesero"
  name: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}
