"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, Edit, Trash2, AlertTriangle, Clock, Package, Calendar } from "lucide-react"
import type { ProductoInventario } from "@/lib/types"
import { formatCurrency, getDaysUntilExpiry, getInventoryAlertLevel } from "@/lib/utils"
import { InventarioDialog } from "@/components/inventario-dialog"
import { useToast } from "@/hooks/use-toast"

export function InventarioTab() {
  const [productos, setProductos] = useState<ProductoInventario[]>([])
  const [filteredProductos, setFilteredProductos] = useState<ProductoInventario[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [showDialog, setShowDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductoInventario | null>(null)
  const { toast } = useToast()

  const categories = ["Todos", "Carnes", "Vegetales", "Lácteos", "Bebidas", "Condimentos", "Otros"]

  useEffect(() => {
    fetchProductos()
  }, [])

  useEffect(() => {
    let filtered = productos

    // Filtrar por categoría solo si no es "Todos"
    if (selectedCategory !== "Todos") {
      filtered = filtered.filter((producto) => producto.categoria === selectedCategory)
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter((producto) => producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    setFilteredProductos(filtered)
  }, [productos, searchTerm, selectedCategory])

  const fetchProductos = async () => {
    try {
      const response = await fetch("/api/inventario")
      const data = await response.json()
      setProductos(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar el inventario",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (producto: ProductoInventario) => {
    if (confirm(`¿Estás seguro de eliminar "${producto.nombre}"?`)) {
      try {
        await fetch(`/api/inventario/${producto.id}`, { method: "DELETE" })
        fetchProductos()
        toast({
          title: "Producto eliminado",
          description: `"${producto.nombre}" eliminado del inventario`,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el producto",
          variant: "destructive",
        })
      }
    }
  }

  const handleEdit = (producto: ProductoInventario) => {
    setEditingProduct(producto)
    setShowDialog(true)
  }

  const getAlertIcon = (alertLevel: string) => {
    switch (alertLevel) {
      case "expired":
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case "expiring":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "low-stock":
        return <Package className="w-4 h-4 text-orange-600" />
      default:
        return null
    }
  }

  const getAlertBadge = (producto: ProductoInventario) => {
    const alertLevel = getInventoryAlertLevel(producto)
    const daysUntilExpiry = getDaysUntilExpiry(producto.fecha_vencimiento)

    switch (alertLevel) {
      case "expired":
        return <Badge variant="destructive">Vencido</Badge>
      case "expiring":
        return <Badge className="bg-yellow-500 text-white">Vence en {daysUntilExpiry} días</Badge>
      case "low-stock":
        return <Badge className="bg-orange-500 text-white">Stock Bajo</Badge>
      default:
        return null
    }
  }

  const alertProducts = productos.filter((p) => getInventoryAlertLevel(p) !== "normal")

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Gestión de Inventario</h2>
        <Button
          onClick={() => {
            setEditingProduct(null)
            setShowDialog(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* Alertas */}
      {alertProducts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="w-5 h-5" />
              Alertas de Inventario ({alertProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {alertProducts.map((producto) => (
                <div key={producto.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex items-center gap-2">
                    {getAlertIcon(getInventoryAlertLevel(producto))}
                    <span className="font-medium">{producto.nombre}</span>
                  </div>
                  {getAlertBadge(producto)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar productos..."
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

      {/* Grid de productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProductos.map((producto) => {
          const alertLevel = getInventoryAlertLevel(producto)
          const daysUntilExpiry = getDaysUntilExpiry(producto.fecha_vencimiento)

          return (
            <Card
              key={producto.id}
              className={`hover:shadow-lg transition-shadow ${alertLevel !== "normal" ? "ring-2 ring-offset-2" : ""} ${
                alertLevel === "expired"
                  ? "ring-red-500"
                  : alertLevel === "expiring"
                    ? "ring-yellow-500"
                    : alertLevel === "low-stock"
                      ? "ring-orange-500"
                      : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{producto.nombre}</CardTitle>
                  <div className="flex flex-col gap-1">{getAlertBadge(producto)}</div>
                </div>
                <Badge variant="outline">{producto.categoria}</Badge>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Cantidad:</span>
                    <div className="font-medium">
                      {producto.cantidad} {producto.unidad}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Precio:</span>
                    <div className="font-medium">{formatCurrency(producto.precio_compra)}</div>
                  </div>
                </div>

                <div className="text-sm">
                  <span className="text-gray-500">Vencimiento:</span>
                  {producto.fecha_vencimiento ? (
                    <div
                      className={`font-medium ${
                        daysUntilExpiry < 0
                          ? "text-red-600"
                          : daysUntilExpiry <= 3
                            ? "text-yellow-600"
                            : "text-gray-900"
                      }`}
                    >
                      {new Date(producto.fecha_vencimiento).toLocaleDateString("es-ES")}
                      {daysUntilExpiry >= 0 && <span className="text-xs ml-1">({daysUntilExpiry} días)</span>}
                    </div>
                  ) : (
                    <div className="font-medium text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Sin fecha de vencimiento
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-1">{getAlertIcon(alertLevel)}</div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(producto)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(producto)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredProductos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No se encontraron productos</p>
        </div>
      )}

      <InventarioDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        producto={editingProduct}
        onSuccess={fetchProductos}
      />
    </div>
  )
}
