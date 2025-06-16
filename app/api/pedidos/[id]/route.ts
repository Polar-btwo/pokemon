import { type NextRequest, NextResponse } from "next/server"
import { pedidos, updatePedido, deletePedido } from "@/lib/data"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()
    const id = Number.parseInt(params.id)
    const pedido = pedidos.find((p) => p.id === id)

    if (!pedido) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }

    updatePedido(id, updates)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const pedido = pedidos.find((p) => p.id === id)

    if (!pedido) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }

    // Usar la función helper para eliminar
    deletePedido(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
