"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import type { Mesa, Pedido } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface PagoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mesa: Mesa | null
  pedidos: Pedido[]
  onSuccess: () => void
}

export function PagoDialog({ open, onOpenChange, mesa, pedidos, onSuccess }: PagoDialogProps) {
  const [metodoPago, setMetodoPago] = useState("")
  const [referencia, setReferencia] = useState("")
  const [montoPagado, setMontoPagado] = useState("")
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [pagoCompletado, setPagoCompletado] = useState(false)
  const { toast } = useToast()

  const total = pedidos.reduce((sum, pedido) => sum + pedido.total, 0)
  const metodosDigitales = ["Pagomovil", "Biopago", "Tarjeta de débito"]
  const metodosEfectivo = ["Efectivo BS", "Efectivo USD", "Efectivo EUR"]

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0 && pagoCompletado) {
      // Liberar mesa automáticamente cuando llegue a 0 y el pago esté completado
      liberarMesa()
    }
  }, [countdown, pagoCompletado])

  const liberarMesa = async () => {
    try {
      const response = await fetch(`/api/mesas/${mesa?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado: "Disponible",
          tiempo_inicio: null,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al liberar mesa")
      }

      toast({
        title: "Mesa liberada",
        description: `Mesa ${mesa?.id} está ahora disponible`,
      })

      // Resetear estados
      setPagoCompletado(false)
      setCountdown(0)

      // Actualizar vista y cerrar diálogo
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error liberando mesa:", error)
      toast({
        title: "Error",
        description: "No se pudo liberar la mesa",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!metodoPago) {
      toast({
        title: "Error",
        description: "Selecciona un método de pago",
        variant: "destructive",
      })
      return
    }

    if (metodosDigitales.includes(metodoPago) && !referencia) {
      toast({
        title: "Error",
        description: "La referencia es requerida para pagos digitales",
        variant: "destructive",
      })
      return
    }

    if (metodosEfectivo.includes(metodoPago) && (!montoPagado || Number.parseFloat(montoPagado) < total)) {
      toast({
        title: "Error",
        description: "El monto pagado debe ser mayor o igual al total",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Crear venta
      const ventaResponse = await fetch("/api/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mesa_id: mesa?.id,
          metodo_pago: metodoPago,
          referencia: metodosDigitales.includes(metodoPago) ? referencia : undefined,
          monto_pagado: metodosEfectivo.includes(metodoPago) ? Number.parseFloat(montoPagado) : undefined,
          total,
          pedidos,
        }),
      })

      if (!ventaResponse.ok) throw new Error("Error al procesar pago")

      // Actualizar estado de mesa a "Pagado"
      const mesaResponse = await fetch(`/api/mesas/${mesa?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "Pagado" }),
      })

      if (!mesaResponse.ok) throw new Error("Error al actualizar estado de mesa")

      // Marcar pedidos como completados
      for (const pedido of pedidos) {
        await fetch(`/api/pedidos/${pedido.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: "Completado" }),
        })
      }

      toast({
        title: "Pago procesado",
        description: `Pago de ${formatCurrency(total)} procesado correctamente`,
      })

      // Marcar pago como completado e iniciar countdown
      setPagoCompletado(true)
      setCountdown(10)
    } catch (error) {
      console.error("Error procesando pago:", error)
      toast({
        title: "Error",
        description: "No se pudo procesar el pago",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Resetear estados cuando se cierra el diálogo
  useEffect(() => {
    if (!open) {
      setMetodoPago("")
      setReferencia("")
      setMontoPagado("")
      setCountdown(0)
      setPagoCompletado(false)
      setLoading(false)
    }
  }, [open])

  if (countdown > 0 && pagoCompletado) {
    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pago Procesado</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <div className="text-6xl font-bold text-green-600 mb-4">{countdown}</div>
            <p className="text-lg">
              Mesa {mesa?.id} se liberará automáticamente en {countdown} segundos
            </p>
            <Button onClick={liberarMesa} className="mt-4">
              Liberar Mesa Ahora
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Procesar Pago - Mesa {mesa?.id}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Resumen del pedido */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pedidos.map((pedido) => (
                <div key={pedido.id} className="space-y-2">
                  <div className="font-medium text-sm">Pedido #{pedido.id}</div>
                  {pedido.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>
                        {item.cantidad}x {item.nombre}
                      </span>
                      <span>{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                  <Separator />
                </div>
              ))}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total:</span>
                <span className="text-green-600">{formatCurrency(total)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Formulario de pago */}
          <Card>
            <CardHeader>
              <CardTitle>Información de Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="metodo-pago">Método de Pago</Label>
                  <Select value={metodoPago} onValueChange={setMetodoPago}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pagomovil">Pago Móvil</SelectItem>
                      <SelectItem value="Biopago">Biopago</SelectItem>
                      <SelectItem value="Tarjeta de débito">Tarjeta de Débito</SelectItem>
                      <SelectItem value="Efectivo BS">Efectivo (Bs)</SelectItem>
                      <SelectItem value="Efectivo USD">Efectivo (USD)</SelectItem>
                      <SelectItem value="Efectivo EUR">Efectivo (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {metodosDigitales.includes(metodoPago) && (
                  <div>
                    <Label htmlFor="referencia">Referencia</Label>
                    <Input
                      id="referencia"
                      value={referencia}
                      onChange={(e) => setReferencia(e.target.value)}
                      placeholder="Número de referencia"
                      required
                    />
                  </div>
                )}

                {metodosEfectivo.includes(metodoPago) && (
                  <div>
                    <Label htmlFor="monto-pagado">Monto Pagado</Label>
                    <Input
                      id="monto-pagado"
                      type="number"
                      step="0.01"
                      min={total}
                      value={montoPagado}
                      onChange={(e) => setMontoPagado(e.target.value)}
                      placeholder={`Mínimo: ${total.toFixed(2)}`}
                      required
                    />
                    {Number.parseFloat(montoPagado) > total && (
                      <p className="text-sm text-green-600 mt-1">
                        Cambio: {formatCurrency(Number.parseFloat(montoPagado) - total)}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Procesando..." : "Procesar Pago"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
