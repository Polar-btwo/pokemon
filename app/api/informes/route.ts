import { type NextRequest, NextResponse } from "next/server"
import { ventas, reservas } from "@/lib/data"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const periodo = searchParams.get("periodo") || "semana_actual"

    const now = new Date()
    let startDate: Date
    let endDate: Date = new Date(now)

    switch (periodo) {
      case "semana_actual":
        startDate = new Date(now)
        startDate.setDate(now.getDate() - now.getDay())
        startDate.setHours(0, 0, 0, 0)
        break
      case "semana_anterior":
        endDate = new Date(now)
        endDate.setDate(now.getDate() - now.getDay() - 1)
        endDate.setHours(23, 59, 59, 999)
        startDate = new Date(endDate)
        startDate.setDate(endDate.getDate() - 6)
        startDate.setHours(0, 0, 0, 0)
        break
      case "mes_actual":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case "mes_anterior":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        endDate = new Date(now.getFullYear(), now.getMonth(), 0)
        endDate.setHours(23, 59, 59, 999)
        break
      default:
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 7)
    }

    const ventasFiltradas = ventas.filter((venta) => {
      const fechaVenta = new Date(venta.fecha)
      return fechaVenta >= startDate && fechaVenta <= endDate
    })

    const totalFacturado = ventasFiltradas.reduce((sum, venta) => sum + venta.total, 0)
    // Cambiar esta línea para contar las ventas, no la suma de pedidos
    const cantidadPedidos = ventasFiltradas.length

    // Método de pago más usado
    const metodosPago = ventasFiltradas.reduce(
      (acc, venta) => {
        acc[venta.metodo_pago] = (acc[venta.metodo_pago] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const metodoPagoMasUsado = Object.entries(metodosPago).sort(([, a], [, b]) => b - a)[0]?.[0] || ""

    const reservasFiltradas = reservas.filter((reserva) => {
      const fechaReserva = new Date(reserva.fecha_creacion)
      return fechaReserva >= startDate && fechaReserva <= endDate
    })

    const totalReservas = reservasFiltradas.reduce((sum, reserva) => sum + reserva.monto_reserva, 0)
    const cantidadReservas = reservasFiltradas.length

    const resumen = {
      total_facturado: totalFacturado,
      total_reservas: totalReservas,
      cantidad_pedidos: cantidadPedidos,
      cantidad_reservas: cantidadReservas,
      metodo_pago_mas_usado: metodoPagoMasUsado,
      ventas_detalladas: ventasFiltradas.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),
      reservas_detalladas: reservasFiltradas.sort(
        (a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime(),
      ),
    }

    return NextResponse.json(resumen)
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
