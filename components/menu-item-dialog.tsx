"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ImageUpload } from "@/components/image-upload"
import type { MenuItem } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface MenuItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: MenuItem | null
  onSuccess: () => void
}

export function MenuItemDialog({ open, onOpenChange, item, onSuccess }: MenuItemDialogProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    categoria: "",
    imagen_url: "",
    activo: true,
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (item) {
      setFormData({
        nombre: item.nombre,
        descripcion: item.descripcion || "",
        precio: item.precio.toString(),
        categoria: item.categoria,
        imagen_url: item.imagen_url || "",
        activo: item.activo,
      })
    } else {
      setFormData({
        nombre: "",
        descripcion: "",
        precio: "",
        categoria: "",
        imagen_url: "",
        activo: true,
      })
    }
  }, [item, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre || !formData.precio || !formData.categoria) {
      toast({
        title: "Error",
        description: "Completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    if (Number.parseFloat(formData.precio) <= 0) {
      toast({
        title: "Error",
        description: "El precio debe ser mayor a 0",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const url = item ? `/api/menu/${item.id}` : "/api/menu"
      const method = item ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          precio: Number.parseFloat(formData.precio),
          descripcion: formData.descripcion || undefined,
        }),
      })

      if (response.ok) {
        toast({
          title: item ? "Item actualizado" : "Item creado",
          description: `"${formData.nombre}" ${item ? "actualizado" : "agregado"} correctamente`,
        })
        onOpenChange(false)
        onSuccess()
      } else {
        throw new Error("Error al guardar item")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el item",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Editar Item" : "Nuevo Item del Menú"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
              placeholder="Nombre del plato"
              required
            />
          </div>

          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Descripción del plato (ingredientes, preparación, etc.)"
              rows={3}
              className="resize-none"
            />
          </div>

          <div>
            <Label htmlFor="precio">Precio (USD) *</Label>
            <Input
              id="precio"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.precio}
              onChange={(e) => setFormData((prev) => ({ ...prev, precio: e.target.value }))}
              placeholder="0.00"
              required
            />
          </div>

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
                <SelectItem value="COMIDA">COMIDA</SelectItem>
                <SelectItem value="BEBIDA">BEBIDA</SelectItem>
                <SelectItem value="POSTRE">POSTRE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ImageUpload
            value={formData.imagen_url}
            onChange={(value) => setFormData((prev) => ({ ...prev, imagen_url: value }))}
            placeholder="Agregar imagen del producto"
          />

          <div className="flex items-center space-x-2">
            <Switch
              id="activo"
              checked={formData.activo}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, activo: checked }))}
            />
            <Label htmlFor="activo">Item activo</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : item ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
