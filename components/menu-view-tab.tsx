"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ImageIcon, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { MenuItem } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export function MenuViewTab() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const { toast } = useToast()

  const categories = ["Todos", "COMIDA", "BEBIDA", "POSTRE"]

  useEffect(() => {
    fetchMenuItems()
  }, [])

  useEffect(() => {
    let filtered = menuItems.filter((item) => item.activo) // Solo mostrar items activos

    if (selectedCategory !== "Todos") {
      filtered = filtered.filter((item) => item.categoria === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.descripcion && item.descripcion.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    setFilteredItems(filtered)
  }, [menuItems, searchTerm, selectedCategory])

  const fetchMenuItems = async () => {
    try {
      const response = await fetch("/api/menu")
      const data = await response.json()
      setMenuItems(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar el menú",
        variant: "destructive",
      })
    }
  }

  const handleViewDetail = (item: MenuItem) => {
    setSelectedItem(item)
    setShowDetailDialog(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Menú del Restaurante</h2>
        <Badge variant="secondary" className="text-sm">
          {filteredItems.length} platillos disponibles
        </Badge>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar platillos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid de items - Solo lectura */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow overflow-hidden">
            <div className="relative h-48 bg-gray-100">
              {item.imagen_url ? (
                <img
                  src={item.imagen_url || "/placeholder.svg"}
                  alt={item.nombre}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                    const placeholder = target.parentElement?.querySelector(".placeholder-icon")
                    if (placeholder) {
                      placeholder.classList.remove("hidden")
                    }
                  }}
                />
              ) : null}
              <div
                className={`placeholder-icon ${item.imagen_url ? "hidden" : ""} absolute inset-0 flex items-center justify-center bg-gray-100`}
              >
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Sin imagen</p>
                </div>
              </div>
            </div>

            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{item.nombre}</CardTitle>
                <Badge variant="default">Disponible</Badge>
              </div>
              <Badge variant="outline">{item.categoria}</Badge>
              {item.descripcion && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.descripcion}</p>}
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-green-600">{formatCurrency(item.precio)}</span>
                <Button size="sm" variant="outline" onClick={() => handleViewDetail(item)}>
                  <Eye className="w-4 h-4 mr-1" />
                  Ver
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No se encontraron platillos disponibles</p>
        </div>
      )}

      {/* Diálogo de detalle del item */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles del Platillo</DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              {selectedItem.imagen_url && (
                <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={selectedItem.imagen_url || "/placeholder.svg"}
                    alt={selectedItem.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <h3 className="text-xl font-bold">{selectedItem.nombre}</h3>
                  <Badge variant="outline" className="mt-1">
                    {selectedItem.categoria}
                  </Badge>
                </div>

                {selectedItem.descripcion && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-1">Descripción:</h4>
                    <p className="text-sm text-gray-600">{selectedItem.descripcion}</p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm text-gray-500">Precio:</span>
                  <span className="text-2xl font-bold text-green-600">{formatCurrency(selectedItem.precio)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
