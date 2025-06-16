import { type NextRequest, NextResponse } from "next/server"
import { inventario, addProductoInventario } from "@/lib/data"

export async function GET() {
  return NextResponse.json(inventario)
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.nombre || !data.cantidad || !data.unidad || !data.categoria || !data.precio_compra) {
      return NextResponse.json({ error: "Campos requeridos faltantes" }, { status: 400 })
    }

    if (data.cantidad <= 0 || data.precio_compra <= 0) {
      return NextResponse.json({ error: "Cantidad y precio deben ser mayores a 0" }, { status: 400 })
    }

    const newProducto = {
      id: Math.max(...inventario.map((p) => p.id), 0) + 1,
      nombre: data.nombre,
      cantidad: data.cantidad,
      unidad: data.unidad,
      fecha_vencimiento: data.fecha_vencimiento || null, // Permitir null
      categoria: data.categoria,
      precio_compra: data.precio_compra,
    }

    addProductoInventario(newProducto)
    return NextResponse.json(newProducto, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
