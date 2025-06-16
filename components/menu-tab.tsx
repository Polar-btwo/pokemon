"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, Edit, Trash2, ImageIcon } from "lucide-react"
import type { MenuItem } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { MenuItemDialog } from "@/components/menu-item-dialog"
import { useToast } from "@/hooks/use-toast"

export function MenuTab() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [showDialog, setShowDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const { toast } = useToast()

  const categories = ["Todos", "COMIDA", "BEBIDA", "POSTRE"]

  useEffect(() => {
    fetchMenuItems()
  }, [])

  useEffect(() => {
    let filtered = menuItems

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

  const handleDelete = async (item: MenuItem) => {
    if (confirm(`¿Estás seguro de eliminar "${item.nombre}"?`)) {
      try {
        await fetch(`/api/menu/${item.id}`, { method: "DELETE" })
        fetchMenuItems()
        toast({
          title: "Item eliminado",
          description: `"${item.nombre}" eliminado del menú`,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el item",
          variant: "destructive",
        })
      }
    }
  }

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item)
    setShowDialog(true)
  }

  const handleToggleActive = async (item: MenuItem) => {
    try {
      await fetch(`/api/menu/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, activo: !item.activo }),
      })
      fetchMenuItems()
      toast({
        title: "Estado actualizado",
        description: `"${item.nombre}" ${!item.activo ? "activado" : "desactivado"}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Gestión de Menú</h2>
        <Button
          onClick={() => {
            setEditingItem(null)
            setShowDialog(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Item
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar items del menú..."
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

      {/* Grid de items */}
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
                    // Si la imagen no carga, mostrar placeholder
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
                <div className="flex gap-1">
                  <Badge
                    variant={item.activo ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => handleToggleActive(item)}
                  >
                    {item.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
              <Badge variant="outline">{item.categoria}</Badge>
              {item.descripcion && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.descripcion}</p>}
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-green-600">{formatCurrency(item.precio)}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(item)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No se encontraron items</p>
        </div>
      )}

      <MenuItemDialog open={showDialog} onOpenChange={setShowDialog} item={editingItem} onSuccess={fetchMenuItems} />
    </div>
  )
}
