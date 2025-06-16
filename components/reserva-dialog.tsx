"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, User, Phone, CreditCard, DollarSign } from "lucide-react"
import type { Mesa } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface ReservaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mesa: Mesa | null
  onSuccess: () => void
}

export function ReservaDialog({ open, onOpenChange, mesa, onSuccess }: ReservaDialogProps) {
  const [formData, setFormData] = useState({
    referencia_pago: "",
    fecha_reserva: "",
    nombre_cliente: "",
    telefono: "",
    monto_reserva: "10.00", // Monto base de reserva
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.referencia_pago || !formData.fecha_reserva || !formData.monto_reserva) {
      toast({
        title: "Error",
        description: "Completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    if (Number.parseFloat(formData.monto_reserva) <= 0) {
      toast({
        title: "Error",
        description: "El monto de reserva debe ser mayor a 0",
        variant: "destructive",
      })
      return
    }

    // Validar que la fecha de reserva sea futura
    const fechaReserva = new Date(formData.fecha_reserva)
    const ahora = new Date()
    if (fechaReserva <= ahora) {
      toast({
        title: "Error",
        description: "La fecha de reserva debe ser futura",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Crear reserva
      const reservaResponse = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mesa_id: mesa?.id,
          ...formData,
          monto_reserva: Number.parseFloat(formData.monto_reserva),
        }),
      })

      if (!reservaResponse.ok) throw new Error("Error al crear reserva")

      // Actualizar estado de mesa a "Reservado"
      await fetch(`/api/mesas/${mesa?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado: "Reservado",
          reserva: {
            referencia_pago: formData.referencia_pago,
            fecha_reserva: formData.fecha_reserva,
            nombre_cliente: formData.nombre_cliente,
            telefono: formData.telefono,
            monto_reserva: Number.parseFloat(formData.monto_reserva),
          },
        }),
      })

      toast({
        title: "Reserva creada",
        description: `Mesa ${mesa?.id} reservada correctamente`,
      })

      // Limpiar formulario
      setFormData({
        referencia_pago: "",
        fecha_reserva: "",
        nombre_cliente: "",
        telefono: "",
        monto_reserva: "10.00",
      })

      onOpenChange(false)
      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la reserva",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reservar Mesa {mesa?.id}</DialogTitle>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Información de la Reserva
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="referencia_pago">Referencia de Pago *</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="referencia_pago"
                    value={formData.referencia_pago}
                    onChange={(e) => setFormData((prev) => ({ ...prev, referencia_pago: e.target.value }))}
                    placeholder="Número de referencia del pago"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="fecha_reserva">Fecha y Hora de Reserva *</Label>
                <Input
                  id="fecha_reserva"
                  type="datetime-local"
                  value={formData.fecha_reserva}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fecha_reserva: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="monto_reserva">Monto de Reserva (USD) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="monto_reserva"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.monto_reserva}
                    onChange={(e) => setFormData((prev) => ({ ...prev, monto_reserva: e.target.value }))}
                    placeholder="10.00"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="nombre_cliente">Nombre del Cliente</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="nombre_cliente"
                    value={formData.nombre_cliente}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nombre_cliente: e.target.value }))}
                    placeholder="Nombre completo (opcional)"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => setFormData((prev) => ({ ...prev, telefono: e.target.value }))}
                    placeholder="Número de contacto (opcional)"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Resumen */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Mesa:</span>
                  <span>
                    Mesa {mesa?.id} ({mesa?.capacidad} personas)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Monto de Reserva:</span>
                  <span className="text-green-600 font-bold">
                    {formatCurrency(Number.parseFloat(formData.monto_reserva || "0"))}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Creando..." : "Crear Reserva"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
