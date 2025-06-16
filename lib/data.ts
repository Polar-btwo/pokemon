import type { Mesa, MenuItem, Pedido, Venta, ProductoInventario, Reserva } from "./types"

// Base de datos en memoria (mock)
export let mesas: Mesa[] = [
  { id: "1", capacidad: 4, estado: "Disponible" },
  { id: "2", capacidad: 2, estado: "Disponible" },
  { id: "3", capacidad: 6, estado: "Disponible" },
  { id: "4", capacidad: 4, estado: "Disponible" },
  { id: "5", capacidad: 8, estado: "Disponible" },
  { id: "6", capacidad: 2, estado: "Disponible" },
]

export let menuItems: MenuItem[] = [
  {
    id: 1,
    nombre: "Hamburguesa Clásica",
    precio: 12.5,
    categoria: "COMIDA",
    activo: true,
  },
  {
    id: 2,
    nombre: "Pizza Margherita",
    precio: 18.0,
    categoria: "COMIDA",
    activo: true,
  },
  {
    id: 3,
    nombre: "Ensalada César",
    precio: 8.5,
    categoria: "COMIDA",
    activo: true,
  },
  {
    id: 4,
    nombre: "Coca Cola",
    precio: 3.0,
    categoria: "BEBIDA",
    activo: true,
  },
  {
    id: 5,
    nombre: "Tiramisu",
    precio: 6.5,
    categoria: "POSTRE",
    activo: true,
  },
  {
    id: 6,
    nombre: "Pasta Carbonara",
    precio: 15.0,
    categoria: "COMIDA",
    activo: true,
  },
]

export const pedidos: Pedido[] = []

export const ventas: Venta[] = []

export let inventario: ProductoInventario[] = [
  {
    id: 1,
    nombre: "Carne de Res",
    cantidad: 15,
    unidad: "kg",
    fecha_vencimiento: "2025-01-10",
    categoria: "Carnes",
    precio_compra: 8.5,
  },
  {
    id: 2,
    nombre: "Tomates",
    cantidad: 3,
    unidad: "kg",
    fecha_vencimiento: "2025-01-08",
    categoria: "Vegetales",
    precio_compra: 2.5,
  },
  {
    id: 3,
    nombre: "Queso Mozzarella",
    cantidad: 8,
    unidad: "kg",
    fecha_vencimiento: "2025-01-15",
    categoria: "Lácteos",
    precio_compra: 12.0,
  },
  {
    id: 4,
    nombre: "Leche",
    cantidad: 2,
    unidad: "litros",
    fecha_vencimiento: "2025-01-06",
    categoria: "Lácteos",
    precio_compra: 1.8,
  },
  {
    id: 5,
    nombre: "Sal",
    cantidad: 10,
    unidad: "kg",
    fecha_vencimiento: null, // Producto sin fecha de vencimiento
    categoria: "Condimentos",
    precio_compra: 1.2,
  },
]

export const reservas: Reserva[] = []

// Funciones helper para manipular datos
export const updateMesa = (id: string, updates: Partial<Mesa>) => {
  const index = mesas.findIndex((m) => m.id === id)
  if (index !== -1) {
    mesas[index] = { ...mesas[index], ...updates }
  }
}

export const addMesa = (mesa: Mesa) => {
  mesas.push(mesa)
}

export const deleteMesa = (id: string) => {
  mesas = mesas.filter((m) => m.id !== id)
}

export const addMenuItem = (item: MenuItem) => {
  menuItems.push(item)
}

export const updateMenuItem = (id: number, updates: Partial<MenuItem>) => {
  const index = menuItems.findIndex((m) => m.id === id)
  if (index !== -1) {
    menuItems[index] = { ...menuItems[index], ...updates }
  }
}

export const deleteMenuItem = (id: number) => {
  menuItems = menuItems.filter((m) => m.id !== id)
}

export const addPedido = (pedido: Pedido) => {
  pedidos.push(pedido)
}

export const updatePedido = (id: number, updates: Partial<Pedido>) => {
  const index = pedidos.findIndex((p) => p.id === id)
  if (index !== -1) {
    pedidos[index] = { ...pedidos[index], ...updates }
  }
}

export const deletePedido = (id: number) => {
  const index = pedidos.findIndex((p) => p.id === id)
  if (index !== -1) {
    pedidos.splice(index, 1)
  }
}

export const addVenta = (venta: Venta) => {
  ventas.push(venta)
}

export const addProductoInventario = (producto: ProductoInventario) => {
  inventario.push(producto)
}

export const updateProductoInventario = (id: number, updates: Partial<ProductoInventario>) => {
  const index = inventario.findIndex((p) => p.id === id)
  if (index !== -1) {
    inventario[index] = { ...inventario[index], ...updates }
  }
}

export const deleteProductoInventario = (id: number) => {
  inventario = inventario.filter((p) => p.id !== id)
}

export const addReserva = (reserva: Reserva) => {
  reservas.push(reserva)
}

export const updateReserva = (id: number, updates: Partial<Reserva>) => {
  const index = reservas.findIndex((r) => r.id === id)
  if (index !== -1) {
    reservas[index] = { ...reservas[index], ...updates }
  }
}

export const deleteReserva = (id: number) => {
  const index = reservas.findIndex((r) => r.id === id)
  if (index !== -1) {
    reservas.splice(index, 1)
  }
}
