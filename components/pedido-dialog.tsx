"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Plus, Minus, ShoppingCart } from "lucide-react"
import type { Mesa, MenuItem, PedidoItem } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface PedidoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mesa: Mesa | null
  onSuccess: () => void
}

export function PedidoDialog({ open, onOpenChange, mesa, onSuccess }: PedidoDialogProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [carrito, setCarrito] = useState<PedidoItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos")
  const { toast } = useToast()

  const categories = ["Todos", "COMIDA", "BEBIDA", "POSTRE"]

  useEffect(() => {
    if (open) {
      fetchMenuItems()
      setCarrito([])
    }
  }, [open])

  const fetchMenuItems = async () => {
    try {
      const response = await fetch("/api/menu")
      const data = await response.json()
      setMenuItems(data.filter((item: MenuItem) => item.activo))
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar el menú",
        variant: "destructive",
      })
    }
  }

  const filteredItems =
    selectedCategory === "Todos" ? menuItems : menuItems.filter((item) => item.categoria === selectedCategory)

  const addToCarrito = (item: MenuItem) => {
    setCarrito((prev) => {
      const existing = prev.find((p) => p.menu_item_id === item.id)
      if (existing) {
        return prev.map((p) =>
          p.menu_item_id === item.id ? { ...p, cantidad: p.cantidad + 1, subtotal: (p.cantidad + 1) * p.precio } : p,
        )
      } else {
        return [
          ...prev,
          {
            menu_item_id: item.id,
            nombre: item.nombre,
            precio: item.precio,
            cantidad: 1,
            subtotal: item.precio,
          },
        ]
      }
    })
  }

  const updateCantidad = (menuItemId: number, cantidad: number) => {
    if (cantidad <= 0) {
      setCarrito((prev) => prev.filter((p) => p.menu_item_id !== menuItemId))
    } else {
      setCarrito((prev) =>
        prev.map((p) => (p.menu_item_id === menuItemId ? { ...p, cantidad, subtotal: cantidad * p.precio } : p)),
      )
    }
  }

  const total = carrito.reduce((sum, item) => sum + item.subtotal, 0)

  const handleSubmit = async () => {
    if (carrito.length === 0) {
      toast({
        title: "Error",
        description: "Agrega al menos un item al pedido",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mesa_id: mesa?.id,
          items: carrito,
          total,
        }),
      })

      if (response.ok) {
        // Actualizar estado de la mesa a "Ocupado"
        await fetch(`/api/mesas/${mesa?.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            estado: "Ocupado",
            tiempo_inicio: new Date().toISOString(),
          }),
        })

        toast({
          title: "Pedido creado",
          description: `Pedido agregado a Mesa ${mesa?.id}`,
        })
        onOpenChange(false)
        onSuccess()
      } else {
        throw new Error("Error al crear pedido")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el pedido",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Pedido - Mesa {mesa?.id}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menú */}
          <div className="lg:col-span-2 space-y-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{item.nombre}</CardTitle>
                      <Badge variant="secondary">{item.categoria}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-green-600">{formatCurrency(item.precio)}</span>
                      <Button size="sm" onClick={() => addToCarrito(item)}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Carrito */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Carrito
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {carrito.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Carrito vacío</p>
                ) : (
                  <>
                    {carrito.map((item) => (
                      <div key={item.menu_item_id} className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.nombre}</p>
                            <p className="text-xs text-gray-500">{formatCurrency(item.precio)} c/u</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">{formatCurrency(item.subtotal)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCantidad(item.menu_item_id, item.cantidad - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <Input
                            type="number"
                            min="0"
                            value={item.cantidad}
                            onChange={(e) => updateCantidad(item.menu_item_id, Number.parseInt(e.target.value) || 0)}
                            className="w-16 text-center"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCantidad(item.menu_item_id, item.cantidad + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <Separator />
                      </div>
                    ))}

                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total:</span>
                        <span className="text-green-600">{formatCurrency(total)}</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={loading || carrito.length === 0} className="flex-1">
                {loading ? "Procesando..." : "Crear Pedido"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
