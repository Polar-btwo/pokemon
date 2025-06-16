"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, Clock, Trash2 } from "lucide-react"
import type { Mesa, Pedido } from "@/lib/types"
import { formatTime, formatCurrency } from "@/lib/utils"
import { MesaDialog } from "@/components/mesa-dialog"
import { PedidoDialog } from "@/components/pedido-dialog"
import { PagoDialog } from "@/components/pago-dialog"
import { useToast } from "@/hooks/use-toast"
import { MesaDetalleDialog } from "@/components/mesa-detalle-dialog"
import { EditarPedidoDialog } from "@/components/editar-pedido-dialog"
import { ReservaDialog } from "@/components/reserva-dialog"

export function MesasTab() {
  const [mesas, setMesas] = useState<Mesa[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null)
  const [showMesaDialog, setShowMesaDialog] = useState(false)
  const [showPedidoDialog, setShowPedidoDialog] = useState(false)
  const [showPagoDialog, setShowPagoDialog] = useState(false)
  const [showDetalleDialog, setShowDetalleDialog] = useState(false)
  const [showEditarPedidoDialog, setShowEditarPedidoDialog] = useState(false)
  const [showReservaDialog, setShowReservaDialog] = useState(false)
  const [timers, setTimers] = useState<Record<string, number>>({})
  const { toast } = useToast()

  useEffect(() => {
    fetchMesas()
    fetchPedidos()
  }, [])

  // Modificar la lógica del timer para que solo se muestre en estado "Ocupado"
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const newTimers = { ...prev }
        mesas.forEach((mesa) => {
          if (mesa.estado === "Ocupado" && mesa.tiempo_inicio) {
            const startTime = new Date(mesa.tiempo_inicio).getTime()
            const now = new Date().getTime()
            const elapsed = Math.floor((now - startTime) / 1000)
            newTimers[mesa.id] = elapsed
          } else {
            delete newTimers[mesa.id]
          }
        })
        return newTimers
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [mesas])

  const fetchMesas = async () => {
    try {
      const response = await fetch("/api/mesas")
      const data = await response.json()
      setMesas(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las mesas",
        variant: "destructive",
      })
    }
  }

  const fetchPedidos = async () => {
    try {
      const response = await fetch("/api/pedidos")
      const data = await response.json()
      setPedidos(data)
    } catch (error) {
      console.error("Error fetching pedidos:", error)
    }
  }

  const handleDeleteMesa = async (mesa: Mesa) => {
    const pedidosActivos = pedidos.filter((p) => p.mesa_id === mesa.id && p.estado === "Pendiente")

    if (pedidosActivos.length > 0) {
      toast({
        title: "No se puede eliminar",
        description: "La mesa tiene pedidos activos",
        variant: "destructive",
      })
      return
    }

    if (confirm(`¿Estás seguro de eliminar la Mesa ${mesa.id}?`)) {
      try {
        await fetch(`/api/mesas/${mesa.id}`, { method: "DELETE" })
        fetchMesas()
        toast({
          title: "Mesa eliminada",
          description: `Mesa ${mesa.id} eliminada correctamente`,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar la mesa",
          variant: "destructive",
        })
      }
    }
  }

  // Modificar la función handleMesaClick para mostrar el diálogo de detalles
  const handleMesaClick = (mesa: Mesa) => {
    setSelectedMesa(mesa)
    setShowDetalleDialog(true)
  }

  // Agregar una nueva función para cambiar el estado de la mesa a "Consumiendo"
  const cambiarAConsumiendo = async () => {
    if (!selectedMesa) return

    try {
      await fetch(`/api/mesas/${selectedMesa.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado: "Consumiendo",
        }),
      })
      fetchMesas()
      setShowDetalleDialog(false)
      toast({
        title: "Estado actualizado",
        description: `Mesa ${selectedMesa.id} ahora está en estado Consumiendo`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la mesa",
        variant: "destructive",
      })
    }
  }

  const abrirEditarPedido = () => {
    setShowDetalleDialog(false)
    setShowEditarPedidoDialog(true)
  }

  const getEstadoColor = (estado: Mesa["estado"]) => {
    switch (estado) {
      case "Disponible":
        return "bg-green-500"
      case "Ocupado":
        return "bg-yellow-500"
      case "Consumiendo":
        return "bg-blue-500"
      case "Pagado":
        return "bg-purple-500"
      case "Reservado":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  const getTimerColor = (seconds: number) => {
    return seconds > 720 ? "text-red-600" : "text-gray-600" // 12 minutos = 720 segundos
  }

  const getPedidosMesa = (mesaId: string) => {
    return pedidos.filter((p) => p.mesa_id === mesaId)
  }

  const abrirReserva = () => {
    setShowDetalleDialog(false)
    setShowReservaDialog(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Gestión de Mesas</h2>
        <Button onClick={() => setShowMesaDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Mesa
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mesas.map((mesa) => {
          const pedidosMesa = getPedidosMesa(mesa.id)
          const totalMesa = pedidosMesa.reduce((sum, p) => sum + p.total, 0)

          return (
            <Card
              key={mesa.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                mesa.estado !== "Disponible" ? "ring-2 ring-offset-2" : ""
              }`}
              onClick={() => handleMesaClick(mesa)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Mesa {mesa.id}</CardTitle>
                  <div className="flex gap-2">
                    <Badge className={`${getEstadoColor(mesa.estado)} text-white`}>{mesa.estado}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteMesa(mesa)
                      }}
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{mesa.capacidad} personas</span>
                </div>

                {mesa.estado === "Ocupado" && timers[mesa.id] && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4" />
                    <span className={getTimerColor(timers[mesa.id])}>{formatTime(timers[mesa.id])}</span>
                  </div>
                )}

                {mesa.estado === "Consumiendo" && pedidosMesa.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Consumiendo Actualmente:</div>
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {pedidosMesa.map((pedido) => (
                        <div key={pedido.id} className="text-xs text-gray-600">
                          {pedido.items.map((item, idx) => (
                            <div key={idx}>
                              {item.cantidad}x {item.nombre}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                    <div className="text-sm font-bold text-green-600">Total: ${totalMesa.toFixed(2)}</div>
                  </div>
                )}
                {mesa.estado === "Reservado" && mesa.reserva && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-orange-700">Reservado para:</div>
                    <div className="text-xs text-gray-600">
                      {new Date(mesa.reserva.fecha_reserva).toLocaleString("es-ES")}
                    </div>
                    {mesa.reserva.nombre_cliente && (
                      <div className="text-xs text-gray-600">{mesa.reserva.nombre_cliente}</div>
                    )}
                    <div className="text-sm font-bold text-orange-600">
                      {formatCurrency(mesa.reserva.monto_reserva)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
      <MesaDialog open={showMesaDialog} onOpenChange={setShowMesaDialog} onSuccess={fetchMesas} />
      <PedidoDialog
        open={showPedidoDialog}
        onOpenChange={setShowPedidoDialog}
        mesa={selectedMesa}
        onSuccess={() => {
          fetchMesas()
          fetchPedidos()
        }}
      />
      <PagoDialog
        open={showPagoDialog}
        onOpenChange={setShowPagoDialog}
        mesa={selectedMesa}
        pedidos={selectedMesa ? getPedidosMesa(selectedMesa.id) : []}
        onSuccess={() => {
          fetchMesas()
          fetchPedidos()
        }}
      />
      <MesaDetalleDialog
        open={showDetalleDialog}
        onOpenChange={setShowDetalleDialog}
        mesa={selectedMesa}
        pedidos={selectedMesa ? getPedidosMesa(selectedMesa.id) : []}
        timer={selectedMesa ? timers[selectedMesa.id] : undefined}
        onPedido={() => {
          setShowDetalleDialog(false)
          setShowPedidoDialog(true)
        }}
        onPago={() => {
          setShowDetalleDialog(false)
          setShowPagoDialog(true)
        }}
        onCambiarEstado={cambiarAConsumiendo}
        onEditarPedido={abrirEditarPedido}
        onReservar={abrirReserva}
      />
      <EditarPedidoDialog
        open={showEditarPedidoDialog}
        onOpenChange={setShowEditarPedidoDialog}
        mesa={selectedMesa}
        pedidos={selectedMesa ? getPedidosMesa(selectedMesa.id) : []}
        onSuccess={() => {
          fetchMesas()
          fetchPedidos()
        }}
      />
      <ReservaDialog
        open={showReservaDialog}
        onOpenChange={setShowReservaDialog}
        mesa={selectedMesa}
        onSuccess={() => {
          fetchMesas()
          fetchPedidos()
        }}
      />
    </div>
  )
}
