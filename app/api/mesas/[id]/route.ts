import { type NextRequest, NextResponse } from "next/server"
import { mesas, updateMesa, deleteMesa, pedidos } from "@/lib/data"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()
    const mesa = mesas.find((m) => m.id === params.id)

    if (!mesa) {
      return NextResponse.json({ error: "Mesa no encontrada" }, { status: 404 })
    }

    updateMesa(params.id, updates)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const mesa = mesas.find((m) => m.id === params.id)

    if (!mesa) {
      return NextResponse.json({ error: "Mesa no encontrada" }, { status: 404 })
    }

    // Verificar que no tenga pedidos activos
    const pedidosActivos = pedidos.filter((p) => p.mesa_id === params.id && p.estado === "Pendiente")
    if (pedidosActivos.length > 0) {
      return NextResponse.json({ error: "No se puede eliminar mesa con pedidos activos" }, { status: 400 })
    }

    deleteMesa(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
