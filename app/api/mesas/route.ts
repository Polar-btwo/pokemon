import { type NextRequest, NextResponse } from "next/server"
import { mesas, addMesa } from "@/lib/data"

export async function GET() {
  return NextResponse.json(mesas)
}

export async function POST(request: NextRequest) {
  try {
    const { capacidad } = await request.json()

    if (!capacidad || capacidad < 1) {
      return NextResponse.json({ error: "Capacidad inválida" }, { status: 400 })
    }

    const newMesa = {
      id: (Math.max(...mesas.map((m) => Number.parseInt(m.id)), 0) + 1).toString(),
      capacidad,
      estado: "Disponible" as const,
    }

    addMesa(newMesa)
    return NextResponse.json(newMesa, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
