"use client"

import { AuthProvider, useAuth } from "@/contexts/auth-context"
import { LoginScreen } from "@/components/login-screen"
import { AdminDashboard } from "@/components/admin-dashboard"
import { MeseroDashboard } from "@/components/mesero-dashboard"
import { Toaster } from "@/components/ui/toaster"

function AppContent() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <LoginScreen />
  }

  if (user?.role === "admin") {
    return <AdminDashboard />
  }

  if (user?.role === "mesero") {
    return <MeseroDashboard />
  }

  return <LoginScreen />
}

export default function RestaurantManagement() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  )
}
