"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ImageUploadProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
}

export function ImageUpload({ value, onChange, placeholder = "Seleccionar imagen" }: ImageUploadProps) {
  const [preview, setPreview] = useState<string>(value || "")
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de imagen válido",
        variant: "destructive",
      })
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen debe ser menor a 5MB",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      // Crear un preview local usando FileReader
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setPreview(result)
        onChange(result)
      }
      reader.readAsDataURL(file)

      toast({
        title: "Imagen cargada",
        description: "La imagen se ha cargado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar la imagen",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview("")
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <Label>Imagen del producto</Label>

      {preview ? (
        <div className="relative">
          <img
            src={preview || "/placeholder.svg?height=200&width=300"}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
          onClick={handleClick}
        >
          <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">{placeholder}</p>
          <p className="text-sm text-gray-500">PNG, JPG, JPEG hasta 5MB</p>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

      <Button type="button" variant="outline" onClick={handleClick} disabled={uploading} className="w-full">
        <Upload className="w-4 h-4 mr-2" />
        {uploading ? "Cargando..." : "Seleccionar Imagen"}
      </Button>
    </div>
  )
}
