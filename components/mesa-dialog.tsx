"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface MesaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function MesaDialog({ open, onOpenChange, onSuccess }: MesaDialogProps) {
  const [capacidad, setCapacidad] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!capacidad || Number.parseInt(capacidad) < 1) {
      toast({
        title: "Error",
        description: "La capacidad debe ser mayor a 0",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/mesas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ capacidad: Number.parseInt(capacidad) }),
      })

      if (response.ok) {
        toast({
          title: "Mesa creada",
          description: "Nueva mesa agregada correctamente",
        })
        setCapacidad("")
        onOpenChange(false)
        onSuccess()
      } else {
        throw new Error("Error al crear mesa")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la mesa",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva Mesa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="capacidad">Capacidad (número de sillas)</Label>
            <Input
              id="capacidad"
              type="number"
              min="1"
              value={capacidad}
              onChange={(e) => setCapacidad(e.target.value)}
              placeholder="Ej: 4"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear Mesa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
