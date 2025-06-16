import { type NextRequest, NextResponse } from "next/server"
import { menuItems, updateMenuItem, deleteMenuItem } from "@/lib/data"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const id = Number.parseInt(params.id)
    const item = menuItems.find((m) => m.id === id)

    if (!item) {
      return NextResponse.json({ error: "Item no encontrado" }, { status: 404 })
    }

    if (data.precio && data.precio <= 0) {
      return NextResponse.json({ error: "El precio debe ser mayor a 0" }, { status: 400 })
    }

    // Incluir descripción en la actualización
    const updateData = {
      ...data,
      descripcion: data.descripcion || undefined,
    }

    updateMenuItem(id, updateData)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const item = menuItems.find((m) => m.id === id)

    if (!item) {
      return NextResponse.json({ error: "Item no encontrado" }, { status: 404 })
    }

    deleteMenuItem(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
