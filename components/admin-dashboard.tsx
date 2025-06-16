"use client"

import { useState } from "react"
import { CustomTabs, CustomTabsList, CustomTabsTrigger, CustomTabsContent } from "@/components/ui/custom-tabs"
import { MesasTab } from "@/components/mesas-tab"
import { MenuTab } from "@/components/menu-tab"
import { InventarioTab } from "@/components/inventario-tab"
import { InformesTab } from "@/components/informes-tab"
import { Button } from "@/components/ui/button"
import { LogOut, BarChart3, Package, UtensilsCrossed } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("mesas")
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del administrador */}
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

      {/* Panel de control del administrador */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navegación principal */}
        <CustomTabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <CustomTabsList className="grid grid-cols-4 w-full max-w-3xl bg-black">
              <CustomTabsTrigger value="mesas" className="text-white font-semibold">
                <UtensilsCrossed className="w-4 h-4 mr-2" />
                Mesas
              </CustomTabsTrigger>
              <CustomTabsTrigger value="menu" className="text-white font-semibold">
                <Package className="w-4 h-4 mr-2" />
                Menú
              </CustomTabsTrigger>
              <CustomTabsTrigger value="inventario" className="text-white font-semibold">
                <Package className="w-4 h-4 mr-2" />
                Inventario
              </CustomTabsTrigger>
              <CustomTabsTrigger value="informes" className="text-white font-semibold">
                <BarChart3 className="w-4 h-4 mr-2" />
                Informes
              </CustomTabsTrigger>
            </CustomTabsList>
          </div>

          <CustomTabsContent value="mesas">
            <MesasTab />
          </CustomTabsContent>

          <CustomTabsContent value="menu">
            <MenuTab />
          </CustomTabsContent>

          <CustomTabsContent value="inventario">
            <InventarioTab />
          </CustomTabsContent>

          <CustomTabsContent value="informes">
            <InformesTab />
          </CustomTabsContent>
        </CustomTabs>
      </main>
    </div>
  )
}
