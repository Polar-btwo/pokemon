export interface Mesa {
  id: string
  capacidad: number
  estado: "Disponible" | "Ocupado" | "Consumiendo" | "Pagado" | "Reservado"
  tiempo_inicio?: string
  reserva?: {
    referencia_pago: string
    fecha_reserva: string
    nombre_cliente?: string
    telefono?: string
    monto_reserva: number
  }
}

export interface MenuItem {
  id: number
  nombre: string
  descripcion?: string // Nueva propiedad para descripción
  precio: number
  categoria: "COMIDA" | "BEBIDA" | "POSTRE"
  imagen_url?: string
  activo: boolean
}

export interface PedidoItem {
  menu_item_id: number
  nombre: string
  precio: number
  cantidad: number
  subtotal: number
}

export interface Pedido {
  id: number
  mesa_id: string
  items: PedidoItem[]
  total: number
  estado: "Pendiente" | "Completado"
  created_at: string
}

export interface Venta {
  id: number
  mesa_id: string
  metodo_pago: "Pagomovil" | "Biopago" | "Efectivo BS" | "Efectivo USD" | "Efectivo EUR" | "Tarjeta de débito"
  referencia?: string
  monto_pagado?: number
  total: number
  fecha: string
  pedidos: Pedido[]
}

export interface Reserva {
  id: number
  mesa_id: string
  referencia_pago: string
  fecha_reserva: string
  nombre_cliente?: string
  telefono?: string
  monto_reserva: number
  fecha_creacion: string
  estado: "Activa" | "Completada" | "Cancelada"
}

export interface ProductoInventario {
  id: number
  nombre: string
  cantidad: number
  unidad: string
  fecha_vencimiento?: string | null // Ahora es opcional
  categoria: "Carnes" | "Vegetales" | "Lácteos" | "Bebidas" | "Condimentos" | "Otros"
  precio_compra: number
}

export interface ResumenVentas {
  total_facturado: number
  total_reservas: number
  cantidad_pedidos: number
  cantidad_reservas: number
  metodo_pago_mas_usado: string
  ventas_detalladas: Venta[]
  reservas_detalladas: Reserva[]
}
