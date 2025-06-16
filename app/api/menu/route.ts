import { type NextRequest, NextResponse } from "next/server"
import { menuItems, addMenuItem } from "@/lib/data"

export async function GET() {
  return NextResponse.json(menuItems)
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.nombre || !data.precio || !data.categoria) {
      return NextResponse.json({ error: "Campos requeridos faltantes" }, { status: 400 })
    }

    if (data.precio <= 0) {
      return NextResponse.json({ error: "El precio debe ser mayor a 0" }, { status: 400 })
    }

    const newItem = {
      id: Math.max(...menuItems.map((m) => m.id), 0) + 1,
      nombre: data.nombre,
      descripcion: data.descripcion || undefined,
      precio: data.precio,
      categoria: data.categoria,
      imagen_url: data.imagen_url || undefined,
      activo: data.activo !== undefined ? data.activo : true,
    }

    addMenuItem(newItem)
    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
