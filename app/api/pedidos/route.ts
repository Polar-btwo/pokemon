import { type NextRequest, NextResponse } from "next/server"
import { pedidos, addPedido } from "@/lib/data"

export async function GET() {
  return NextResponse.json(pedidos)
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.mesa_id || !data.items || data.items.length === 0) {
      return NextResponse.json({ error: "Datos del pedido inválidos" }, { status: 400 })
    }

    const newPedido = {
      id: Math.max(...pedidos.map((p) => p.id), 0) + 1,
      mesa_id: data.mesa_id,
      items: data.items,
      total: data.total,
      estado: "Pendiente" as const,
      created_at: new Date().toISOString(),
    }

    addPedido(newPedido)
    return NextResponse.json(newPedido, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
