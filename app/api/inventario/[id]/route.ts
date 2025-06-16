import { type NextRequest, NextResponse } from "next/server"
import { inventario, updateProductoInventario, deleteProductoInventario } from "@/lib/data"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const id = Number.parseInt(params.id)
    const producto = inventario.find((p) => p.id === id)

    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    if (data.cantidad && data.cantidad <= 0) {
      return NextResponse.json({ error: "La cantidad debe ser mayor a 0" }, { status: 400 })
    }

    if (data.precio_compra && data.precio_compra <= 0) {
      return NextResponse.json({ error: "El precio debe ser mayor a 0" }, { status: 400 })
    }

    // Permitir que fecha_vencimiento sea null
    const updateData = {
      ...data,
      fecha_vencimiento: data.fecha_vencimiento || null,
    }

    updateProductoInventario(id, updateData)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const producto = inventario.find((p) => p.id === id)

    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    deleteProductoInventario(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
