"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { ProductoInventario } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface InventarioDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  producto: ProductoInventario | null
  onSuccess: () => void
}

export function InventarioDialog({ open, onOpenChange, producto, onSuccess }: InventarioDialogProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    cantidad: "",
    unidad: "",
    fecha_vencimiento: "",
    categoria: "",
    precio_compra: "",
  })
  const [tieneFechaVencimiento, setTieneFechaVencimiento] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (producto) {
      setFormData({
        nombre: producto.nombre,
        cantidad: producto.cantidad.toString(),
        unidad: producto.unidad,
        fecha_vencimiento: producto.fecha_vencimiento || "",
        categoria: producto.categoria,
        precio_compra: producto.precio_compra.toString(),
      })
      // Si el producto tiene fecha de vencimiento, marcar el checkbox
      setTieneFechaVencimiento(!!producto.fecha_vencimiento)
    } else {
      setFormData({
        nombre: "",
        cantidad: "",
        unidad: "",
        fecha_vencimiento: "",
        categoria: "",
        precio_compra: "",
      })
      setTieneFechaVencimiento(false)
    }
  }, [producto, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre || !formData.cantidad || !formData.unidad || !formData.categoria || !formData.precio_compra) {
      toast({
        title: "Error",
        description: "Completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    // Validar fecha de vencimiento solo si está marcado el checkbox
    if (tieneFechaVencimiento && !formData.fecha_vencimiento) {
      toast({
        title: "Error",
        description: "Selecciona una fecha de vencimiento",
        variant: "destructive",
      })
      return
    }

    if (Number.parseInt(formData.cantidad) <= 0 || Number.parseFloat(formData.precio_compra) <= 0) {
      toast({
        title: "Error",
        description: "La cantidad y precio deben ser mayores a 0",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const url = producto ? `/api/inventario/${producto.id}` : "/api/inventario"
      const method = producto ? "PUT" : "POST"

      // Preparar datos para enviar
      const dataToSend = {
        ...formData,
        cantidad: Number.parseInt(formData.cantidad),
        precio_compra: Number.parseFloat(formData.precio_compra),
        // Solo incluir fecha_vencimiento si está marcado el checkbox
        fecha_vencimiento: tieneFechaVencimiento ? formData.fecha_vencimiento : null,
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      })

      if (response.ok) {
        toast({
          title: producto ? "Producto actualizado" : "Producto creado",
          description: `"${formData.nombre}" ${producto ? "actualizado" : "agregado"} correctamente`,
        })
        onOpenChange(false)
        onSuccess()
      } else {
        throw new Error("Error al guardar producto")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el producto",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{producto ? "Editar Producto" : "Nuevo Producto de Inventario"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
              placeholder="Nombre del producto"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cantidad">Cantidad *</Label>
              <Input
                id="cantidad"
                type="number"
                min="1"
                value={formData.cantidad}
                onChange={(e) => setFormData((prev) => ({ ...prev, cantidad: e.target.value }))}
                placeholder="0"
                required
              />
            </div>
            <div>
              <Label htmlFor="unidad">Unidad *</Label>
              <Input
                id="unidad"
                value={formData.unidad}
                onChange={(e) => setFormData((prev) => ({ ...prev, unidad: e.target.value }))}
                placeholder="kg, litros, unidades..."
                required
              />
            </div>
          </div>

          {/* Checkbox para fecha de vencimiento */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="tiene-fecha-vencimiento"
              checked={tieneFechaVencimiento}
              onCheckedChange={(checked) => {
                setTieneFechaVencimiento(checked as boolean)
                // Si se desmarca, limpiar la fecha
                if (!checked) {
                  setFormData((prev) => ({ ...prev, fecha_vencimiento: "" }))
                }
              }}
            />
            <Label htmlFor="tiene-fecha-vencimiento" className="text-sm font-medium">
              ¿Tiene fecha de vencimiento?
            </Label>
          </div>

          {/* Campo de fecha de vencimiento - solo visible si está marcado el checkbox */}
          {tieneFechaVencimiento && (
            <div>
              <Label htmlFor="fecha_vencimiento">Fecha de Vencimiento *</Label>
              <Input
                id="fecha_vencimiento"
                type="date"
                value={formData.fecha_vencimiento}
                onChange={(e) => setFormData((prev) => ({ ...prev, fecha_vencimiento: e.target.value }))}
                required={tieneFechaVencimiento}
              />
            </div>
          )}

          <div>
            <Label htmlFor="categoria">Categoría *</Label>
            <Select
              value={formData.categoria}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, categoria: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Carnes">Carnes</SelectItem>
                <SelectItem value="Vegetales">Vegetales</SelectItem>
                <SelectItem value="Lácteos">Lácteos</SelectItem>
                <SelectItem value="Bebidas">Bebidas</SelectItem>
                <SelectItem value="Condimentos">Condimentos</SelectItem>
                <SelectItem value="Otros">Otros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="precio_compra">Precio de Compra (USD) *</Label>
            <Input
              id="precio_compra"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.precio_compra}
              onChange={(e) => setFormData((prev) => ({ ...prev, precio_compra: e.target.value }))}
              placeholder="0.00"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : producto ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
