import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No se encontró archivo" }, { status: 400 })
    }

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "El archivo debe ser una imagen" }, { status: 400 })
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "La imagen debe ser menor a 5MB" }, { status: 400 })
    }

    // En el entorno de desarrollo, simplemente retornamos un placeholder
    // En producción, aquí se guardaría el archivo en el servidor
    const timestamp = Date.now()
    const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`

    // Simular guardado exitoso
    const relativePath = `/placeholder.svg?height=200&width=300&text=${encodeURIComponent(file.name)}`

    return NextResponse.json({
      success: true,
      path: relativePath,
      message: "Imagen procesada correctamente",
    })
  } catch (error) {
    console.error("Error processing file:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
