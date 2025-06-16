"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, TrendingUp, ShoppingCart, CreditCard, Calendar } from "lucide-react"
import type { Venta, ResumenVentas, Reserva } from "@/lib/types"
import { formatCurrency, formatDate, exportToCSV } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export function InformesTab() {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [resumen, setResumen] = useState<ResumenVentas | null>(null)
  const [periodo, setPeriodo] = useState("semana_actual")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [reservas, setReservas] = useState<Reserva[]>([])

  useEffect(() => {
    fetchInformes()
  }, [periodo])

  const fetchInformes = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/informes?periodo=${periodo}`)
      const data = await response.json()
      setVentas(data.ventas_detalladas)
      setReservas(data.reservas_detalladas || [])
      setResumen(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los informes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    if (ventas.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay ventas para exportar",
        variant: "destructive",
      })
      return
    }

    const exportData = ventas.map((venta) => ({
      Fecha: formatDate(venta.fecha),
      Mesa: venta.mesa_id,
      "Método de Pago": venta.metodo_pago,
      Referencia: venta.referencia || "N/A",
      "Monto Pagado": venta.monto_pagado || venta.total,
      Total: venta.total,
    }))

    exportToCSV(exportData, `ventas_${periodo}_${new Date().toISOString().split("T")[0]}.csv`)

    toast({
      title: "Exportación exitosa",
      description: "Archivo CSV descargado correctamente",
    })
  }

  const getMetodoPagoColor = (metodo: string) => {
    switch (metodo) {
      case "Pagomovil":
        return "bg-blue-500"
      case "Biopago":
        return "bg-green-500"
      case "Tarjeta de débito":
        return "bg-purple-500"
      case "Efectivo BS":
        return "bg-yellow-500"
      case "Efectivo USD":
        return "bg-emerald-500"
      case "Efectivo EUR":
        return "bg-indigo-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando informes...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Informes y Reportes</h2>
        <div className="flex gap-2">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semana_actual">Semana Actual</SelectItem>
              <SelectItem value="semana_anterior">Semana Anterior</SelectItem>
              <SelectItem value="mes_actual">Mes Actual</SelectItem>
              <SelectItem value="mes_anterior">Mes Anterior</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      {resumen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Facturado</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(resumen.total_facturado)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Cantidad de Ventas</CardTitle>
              <ShoppingCart className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumen.cantidad_pedidos}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Items Vendidos</CardTitle>
              <ShoppingCart className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {ventas.reduce(
                  (total, venta) =>
                    total +
                    venta.pedidos.reduce(
                      (pedidoTotal, pedido) =>
                        pedidoTotal + pedido.items.reduce((itemTotal, item) => itemTotal + item.cantidad, 0),
                      0,
                    ),
                  0,
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Método Más Usado</CardTitle>
              <CreditCard className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{resumen.metodo_pago_mas_usado || "N/A"}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Promedio por Venta</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {resumen.cantidad_pedidos > 0
                  ? formatCurrency(resumen.total_facturado / resumen.cantidad_pedidos)
                  : formatCurrency(0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(resumen.total_reservas)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Cantidad Reservas</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumen.cantidad_reservas}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabla de ventas detalladas */}
      <Card>
        <CardHeader>
          <CardTitle>Ventas Detalladas</CardTitle>
        </CardHeader>
        <CardContent>
          {ventas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No hay ventas en el período seleccionado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Mesa</TableHead>
                    <TableHead>Método de Pago</TableHead>
                    <TableHead>Referencia</TableHead>
                    <TableHead>Monto Pagado</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ventas.map((venta) => (
                    <TableRow key={venta.id}>
                      <TableCell className="font-medium">{formatDate(venta.fecha)}</TableCell>
                      <TableCell>Mesa {venta.mesa_id}</TableCell>
                      <TableCell>
                        <Badge className={`${getMetodoPagoColor(venta.metodo_pago)} text-white`}>
                          {venta.metodo_pago}
                        </Badge>
                      </TableCell>
                      <TableCell>{venta.referencia || "N/A"}</TableCell>
                      <TableCell>
                        {venta.monto_pagado ? formatCurrency(venta.monto_pagado) : formatCurrency(venta.total)}
                      </TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(venta.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla de reservas */}
      <Card>
        <CardHeader>
          <CardTitle>Reservas Detalladas</CardTitle>
        </CardHeader>
        <CardContent>
          {reservas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No hay reservas en el período seleccionado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha Creación</TableHead>
                    <TableHead>Mesa</TableHead>
                    <TableHead>Referencia</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha Reserva</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservas.map((reserva) => (
                    <TableRow key={reserva.id}>
                      <TableCell className="font-medium">{formatDate(reserva.fecha_creacion)}</TableCell>
                      <TableCell>Mesa {reserva.mesa_id}</TableCell>
                      <TableCell>{reserva.referencia_pago}</TableCell>
                      <TableCell>{reserva.nombre_cliente || "N/A"}</TableCell>
                      <TableCell>{formatDate(reserva.fecha_reserva)}</TableCell>
                      <TableCell className="text-right font-bold text-orange-600">
                        {formatCurrency(reserva.monto_reserva)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráfico simple de métodos de pago */}
      {ventas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Métodos de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(
                ventas.reduce(
                  (acc, venta) => {
                    acc[venta.metodo_pago] = (acc[venta.metodo_pago] || 0) + 1
                    return acc
                  },
                  {} as Record<string, number>,
                ),
              ).map(([metodo, cantidad]) => {
                const porcentaje = (cantidad / ventas.length) * 100
                return (
                  <div key={metodo} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge className={`${getMetodoPagoColor(metodo)} text-white`}>{metodo}</Badge>
                        <span className="text-sm text-gray-600">
                          {cantidad} ventas ({porcentaje.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getMetodoPagoColor(metodo)}`}
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
