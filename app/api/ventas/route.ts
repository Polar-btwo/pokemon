import { type NextRequest, NextResponse } from "next/server"
import { ventas, addVenta } from "@/lib/data"

export async function GET() {
  return NextResponse.json(ventas)
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.mesa_id || !data.metodo_pago || !data.total || !data.pedidos) {
      return NextResponse.json({ error: "Datos de venta inválidos" }, { status: 400 })
    }

    const newVenta = {
      id: Math.max(...ventas.map((v) => v.id), 0) + 1,
      mesa_id: data.mesa_id,
      metodo_pago: data.metodo_pago,
      referencia: data.referencia,
      monto_pagado: data.monto_pagado,
      total: data.total,
      fecha: new Date().toISOString(),
      pedidos: data.pedidos,
    }

    addVenta(newVenta)
    return NextResponse.json(newVenta, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
