"use client"

import { CustomTabs, CustomTabsContent, CustomTabsList, CustomTabsTrigger } from "@/components/ui/custom-tabs"
import { MesasTab } from "@/components/mesas-tab"
import { MenuViewTab } from "@/components/menu-view-tab"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function MeseroDashboard() {
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del mesero */}
      <header className="bg-black shadow-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center">
              <img
                src="/images/vibrass-logo.png"
                alt="VIBRASS FOOD"
                className="h-16 w-auto object-contain filter brightness-0 invert"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = "none"
                  const fallback = target.nextElementSibling as HTMLElement
                  if (fallback) {
                    fallback.style.display = "block"
                  }
                }}
              />
              <h1 className="text-3xl font-bold text-white ml-4 hidden">VIBRASS FOOD</h1>
            </div>

            {/* Solo botón de cerrar sesión */}
            <Button
              onClick={logout}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Panel del mesero con tabs */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CustomTabs defaultValue="mesas" className="w-full">
          <CustomTabsList className="grid w-full grid-cols-2">
            <CustomTabsTrigger value="mesas">Mesas</CustomTabsTrigger>
            <CustomTabsTrigger value="menu">Menú</CustomTabsTrigger>
          </CustomTabsList>

          <CustomTabsContent value="mesas">
            <MesasTab />
          </CustomTabsContent>

          <CustomTabsContent value="menu">
            <MenuViewTab />
          </CustomTabsContent>
        </CustomTabs>
      </main>
    </div>
  )
}
