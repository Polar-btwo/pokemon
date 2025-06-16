import { type NextRequest, NextResponse } from "next/server"
import { reservas, addReserva } from "@/lib/data"

export async function GET() {
  return NextResponse.json(reservas)
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.mesa_id || !data.referencia_pago || !data.fecha_reserva || !data.monto_reserva) {
      return NextResponse.json({ error: "Campos requeridos faltantes" }, { status: 400 })
    }

    if (data.monto_reserva <= 0) {
      return NextResponse.json({ error: "El monto de reserva debe ser mayor a 0" }, { status: 400 })
    }

    const newReserva = {
      id: Math.max(...reservas.map((r) => r.id), 0) + 1,
      mesa_id: data.mesa_id,
      referencia_pago: data.referencia_pago,
      fecha_reserva: data.fecha_reserva,
      nombre_cliente: data.nombre_cliente || "",
      telefono: data.telefono || "",
      monto_reserva: data.monto_reserva,
      fecha_creacion: new Date().toISOString(),
      estado: "Activa" as const,
    }

    addReserva(newReserva)
    return NextResponse.json(newReserva, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
