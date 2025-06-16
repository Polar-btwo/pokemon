"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Users, Clock } from "lucide-react"
import type { Mesa, Pedido } from "@/lib/types"
import { formatCurrency, formatTime } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

interface MesaDetalleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mesa: Mesa | null
  pedidos: Pedido[]
  timer: number | undefined
  onPedido: () => void
  onPago: () => void
  onCambiarEstado: () => void
  onEditarPedido: () => void
  onReservar: () => void
}

export function MesaDetalleDialog({
  open,
  onOpenChange,
  mesa,
  pedidos,
  timer,
  onPedido,
  onPago,
  onCambiarEstado,
  onEditarPedido,
  onReservar,
}: MesaDetalleDialogProps) {
  if (!mesa) return null

  const totalMesa = pedidos.reduce((sum, p) => sum + p.total, 0)
  const getTimerColor = (seconds: number) => {
    return seconds > 720 ? "text-red-600" : "text-gray-600" // 12 minutos = 720 segundos
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <span>Mesa {mesa.id}</span>
            <Badge
              className={`${
                mesa.estado === "Disponible"
                  ? "bg-green-500"
                  : mesa.estado === "Ocupado"
                    ? "bg-yellow-500"
                    : mesa.estado === "Consumiendo"
                      ? "bg-blue-500"
                      : "bg-purple-500"
              } text-white`}
            >
              {mesa.estado}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Área de contenido con scroll */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{mesa.capacidad} personas</span>
            </div>

            {mesa.estado === "Ocupado" && timer && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span className={getTimerColor(timer)}>Tiempo: {formatTime(timer)}</span>
              </div>
            )}

            {mesa?.estado === "Reservado" && mesa.reserva && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4 space-y-2">
                  <h3 className="font-medium text-blue-800">Información de Reserva:</h3>
                  <div className="text-sm space-y-1">
                    <div>
                      <strong>Referencia:</strong> {mesa.reserva.referencia_pago}
                    </div>
                    <div>
                      <strong>Fecha:</strong> {new Date(mesa.reserva.fecha_reserva).toLocaleString("es-ES")}
                    </div>
                    {mesa.reserva.nombre_cliente && (
                      <div>
                        <strong>Cliente:</strong> {mesa.reserva.nombre_cliente}
                      </div>
                    )}
                    {mesa.reserva.telefono && (
                      <div>
                        <strong>Teléfono:</strong> {mesa.reserva.telefono}
                      </div>
                    )}
                    <div>
                      <strong>Monto:</strong> {formatCurrency(mesa.reserva.monto_reserva)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {pedidos.length > 0 && (
              <Card>
                <CardContent className="pt-4 space-y-4">
                  <h3 className="font-medium">Pedidos de la mesa:</h3>

                  {/* ScrollArea para cuando hay más de 2 pedidos */}
                  {pedidos.length > 2 ? (
                    <ScrollArea className="h-64 pr-4">
                      <div className="space-y-3">
                        {pedidos.map((pedido) => (
                          <div key={pedido.id} className="space-y-2 p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Pedido #{pedido.id}</span>
                              <Badge variant={pedido.estado === "Completado" ? "outline" : "secondary"}>
                                {pedido.estado}
                              </Badge>
                            </div>
                            {pedido.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span>
                                  {item.cantidad}x {item.nombre}
                                </span>
                                <span>{formatCurrency(item.subtotal)}</span>
                              </div>
                            ))}
                            <Separator className="my-2" />
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    // Mostrar sin scroll cuando hay 2 o menos pedidos
                    <div className="space-y-3">
                      {pedidos.map((pedido) => (
                        <div key={pedido.id} className="space-y-2 p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Pedido #{pedido.id}</span>
                            <Badge variant={pedido.estado === "Completado" ? "outline" : "secondary"}>
                              {pedido.estado}
                            </Badge>
                          </div>
                          {pedido.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span>
                                {item.cantidad}x {item.nombre}
                              </span>
                              <span>{formatCurrency(item.subtotal)}</span>
                            </div>
                          ))}
                          <Separator className="my-2" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">{formatCurrency(totalMesa)}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        {/* Botones de acción - siempre visibles */}
        <div className="flex-shrink-0 pt-4 border-t">
          <div className="flex flex-col gap-2">
            {mesa.estado === "Disponible" && (
              <>
                <Button onClick={onPedido}>Crear Nuevo Pedido</Button>
                <Button variant="outline" onClick={onReservar}>
                  Reservar Mesa
                </Button>
              </>
            )}

            {mesa.estado === "Reservado" && <Button onClick={onPedido}>Confirmar Llegada</Button>}

            {mesa.estado === "Ocupado" && (
              <>
                <Button onClick={onCambiarEstado}>Cambiar a Consumiendo</Button>
                {pedidos.length > 0 && (
                  <Button variant="outline" onClick={onEditarPedido}>
                    Editar Pedidos
                  </Button>
                )}
              </>
            )}

            {mesa.estado === "Consumiendo" && (
              <>
                <Button onClick={onPago}>Procesar Pago</Button>
                {pedidos.length > 0 && (
                  <Button variant="outline" onClick={onEditarPedido}>
                    Editar Pedidos
                  </Button>
                )}
              </>
            )}

            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
