"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Minus, ShoppingCart, Trash2, Save } from "lucide-react"
import type { Mesa, MenuItem, PedidoItem, Pedido } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface EditarPedidoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mesa: Mesa | null
  pedidos: Pedido[]
  onSuccess: () => void
}

export function EditarPedidoDialog({ open, onOpenChange, mesa, pedidos, onSuccess }: EditarPedidoDialogProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [carrito, setCarrito] = useState<PedidoItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos")
  const [loading, setLoading] = useState(false)
  const [pedidosEditados, setPedidosEditados] = useState<Pedido[]>([])
  const { toast } = useToast()

  const categories = ["Todos", "COMIDA", "BEBIDA", "POSTRE"]

  useEffect(() => {
    if (open) {
      fetchMenuItems()
      setCarrito([]) // Limpiar carrito al abrir
      setPedidosEditados(pedidos.map((p) => ({ ...p, items: [...p.items] }))) // Copia profunda
    }
  }, [open, pedidos])

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

  // Calcular totales actualizados
  const totalCarrito = carrito.reduce((sum, item) => sum + item.subtotal, 0)
  const totalPedidosExistentes = pedidosEditados.reduce((sum, pedido) => {
    return sum + pedido.items.reduce((itemSum, item) => itemSum + item.subtotal, 0)
  }, 0)
  const totalGeneral = totalPedidosExistentes + totalCarrito

  const handleGuardarEdicion = async () => {
    // Verificar que no se quede sin pedidos
    const pedidosConItems = pedidosEditados.filter((pedido) => pedido.items.length > 0)

    if (pedidosConItems.length === 0 && carrito.length === 0) {
      toast({
        title: "Error",
        description: "No puedes dejar la mesa sin órdenes. Debe tener al menos un item.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      console.log("Iniciando guardado de edición...")
      console.log("Pedidos editados:", pedidosEditados)
      console.log("Carrito:", carrito)

      // Actualizar pedidos existentes
      for (const pedido of pedidosEditados) {
        console.log(`Procesando pedido ${pedido.id}:`, pedido)

        if (pedido.items.length === 0) {
          // Eliminar pedido si no tiene items
          console.log(`Eliminando pedido ${pedido.id}`)
          const deleteResponse = await fetch(`/api/pedidos/${pedido.id}`, { method: "DELETE" })
          if (!deleteResponse.ok) {
            throw new Error(`Error al eliminar pedido ${pedido.id}`)
          }
        } else {
          // Actualizar pedido con nuevos items y total
          const newTotal = pedido.items.reduce((sum, item) => sum + item.subtotal, 0)
          console.log(`Actualizando pedido ${pedido.id} con total ${newTotal}`)

          const updateResponse = await fetch(`/api/pedidos/${pedido.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: pedido.items,
              total: newTotal,
            }),
          })

          if (!updateResponse.ok) {
            const errorData = await updateResponse.json()
            console.error(`Error al actualizar pedido ${pedido.id}:`, errorData)
            throw new Error(`Error al actualizar pedido ${pedido.id}: ${errorData.error || "Error desconocido"}`)
          }

          const updateResult = await updateResponse.json()
          console.log(`Pedido ${pedido.id} actualizado exitosamente:`, updateResult)
        }
      }

      // Crear nuevo pedido si hay items en el carrito
      if (carrito.length > 0) {
        console.log("Creando nuevo pedido con carrito:", carrito)
        const response = await fetch("/api/pedidos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mesa_id: mesa?.id,
            items: carrito,
            total: totalCarrito,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error("Error al crear nuevo pedido:", errorData)
          throw new Error(`Error al crear nuevo pedido: ${errorData.error || "Error desconocido"}`)
        }

        const newPedido = await response.json()
        console.log("Nuevo pedido creado:", newPedido)
      }

      toast({
        title: "Edición guardada",
        description: `Se guardaron los cambios en la Mesa ${mesa?.id}`,
      })
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error("Error en handleGuardarEdicion:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudieron guardar los cambios",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const eliminarItemExistente = (pedidoId: number, menuItemId: number) => {
    console.log(`Eliminando item ${menuItemId} del pedido ${pedidoId}`)
    setPedidosEditados((prev) =>
      prev.map((pedido) => {
        if (pedido.id === pedidoId) {
          const newItems = pedido.items.filter((item) => item.menu_item_id !== menuItemId)
          console.log(`Nuevos items para pedido ${pedidoId}:`, newItems)
          return { ...pedido, items: newItems }
        }
        return pedido
      }),
    )
  }

  const modificarCantidadExistente = (pedidoId: number, menuItemId: number, nuevaCantidad: number) => {
    console.log(`Modificando cantidad del item ${menuItemId} en pedido ${pedidoId} a ${nuevaCantidad}`)
    setPedidosEditados((prev) =>
      prev.map((pedido) => {
        if (pedido.id === pedidoId) {
          let newItems
          if (nuevaCantidad <= 0) {
            newItems = pedido.items.filter((item) => item.menu_item_id !== menuItemId)
          } else {
            newItems = pedido.items.map((item) =>
              item.menu_item_id === menuItemId
                ? { ...item, cantidad: nuevaCantidad, subtotal: nuevaCantidad * item.precio }
                : item,
            )
          }
          console.log(`Nuevos items para pedido ${pedidoId}:`, newItems)
          return { ...pedido, items: newItems }
        }
        return pedido
      }),
    )
  }

  const handleCantidadChange = (pedidoId: number, menuItemId: number, value: string) => {
    const nuevaCantidad = Number.parseInt(value) || 0
    modificarCantidadExistente(pedidoId, menuItemId, nuevaCantidad)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Editar Pedidos - Mesa {mesa?.id}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          {/* Menú */}
          <div className="lg:col-span-2 flex flex-col min-h-0">
            <div className="flex gap-2 flex-wrap mb-4 flex-shrink-0">
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

            <ScrollArea className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
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
            </ScrollArea>
          </div>

          {/* Panel derecho */}
          <div className="flex flex-col gap-4 min-h-0">
            {/* Pedidos existentes */}
            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="text-lg">Pedidos Actuales</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 p-0">
                <ScrollArea className="h-full px-6 pb-6">
                  <div className="space-y-3 pt-2">
                    {pedidosEditados.map((pedido) => (
                      <div key={pedido.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Pedido #{pedido.id}</span>
                          <Badge variant="outline">{pedido.estado}</Badge>
                        </div>
                        {pedido.items.length === 0 ? (
                          <div className="text-sm text-gray-500 italic">Sin items (se eliminará al guardar)</div>
                        ) : (
                          pedido.items.map((item) => (
                            <div key={item.menu_item_id} className="flex justify-between items-center text-sm">
                              <div className="flex-1">
                                <span>{item.nombre}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      modificarCantidadExistente(pedido.id, item.menu_item_id, item.cantidad - 1)
                                    }
                                    className="h-6 w-6 p-0"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={item.cantidad}
                                    onChange={(e) => handleCantidadChange(pedido.id, item.menu_item_id, e.target.value)}
                                    className="w-12 h-6 text-center text-xs p-1"
                                  />
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      modificarCantidadExistente(pedido.id, item.menu_item_id, item.cantidad + 1)
                                    }
                                    className="h-6 w-6 p-0"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                                <span className="font-medium w-16 text-right">{formatCurrency(item.subtotal)}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => eliminarItemExistente(pedido.id, item.menu_item_id)}
                                  className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                        <Separator />
                      </div>
                    ))}
                    <div className="flex justify-between font-bold">
                      <span>Subtotal Actual:</span>
                      <span className="text-blue-600">{formatCurrency(totalPedidosExistentes)}</span>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Items a agregar */}
            <Card className="flex-shrink-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Items a Agregar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {carrito.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Selecciona items del menú para agregar</p>
                ) : (
                  <>
                    <div className="max-h-32 overflow-y-auto space-y-2">
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
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center font-bold">
                        <span>Subtotal Nuevo:</span>
                        <span className="text-green-600">{formatCurrency(totalCarrito)}</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Total general */}
            <Card className="bg-gray-50 flex-shrink-0">
              <CardContent className="pt-4">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total General:</span>
                  <span className="text-green-600">{formatCurrency(totalGeneral)}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2 flex-shrink-0">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleGuardarEdicion} disabled={loading} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Guardando..." : "Guardar Edición"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
