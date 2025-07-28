'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { format } from 'date-fns'

interface Pedido {
  id: string
  created_at: string
  total_price: number
  status: 'pendiente' | 'completado' | 'anulado'
  users: {
    full_name: string
    phone: string
  } | null
}

interface PedidoDetalle {
  quantity: number
  unit_price: number
  products: {
    name: string
  }
}

export default function PedidosAdminPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [limit, setLimit] = useState(10)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [detallePedido, setDetallePedido] = useState<PedidoDetalle[]>([])
  const [pedidoActual, setPedidoActual] = useState<Pedido | null>(null)

  const [filtroNombre, setFiltroNombre] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')

  const fetchPedidos = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('orders')
      .select('id, created_at, total_price, status, users(full_name, phone)')
      .order('created_at', { ascending: false })
      .limit(100) // traemos más para aplicar filtros en frontend

    if (!error && data) {
      const pedidosFormateados: Pedido[] = data.map((pedido: any) => ({
        id: pedido.id,
        created_at: pedido.created_at,
        total_price: Number(pedido.total_price),
        status: pedido.status,
        users: pedido.users || null,
      }))
      setPedidos(pedidosFormateados)
    } else {
      console.error('Error al cargar pedidos:', error)
    }

    setLoading(false)
  }

  const abrirModal = async (pedido: Pedido) => {
    setPedidoActual(pedido)
    setModalAbierto(true)

    const { data, error } = await supabase
      .from('order_items')
      .select('quantity, unit_price, products(name)')
      .eq('order_id', pedido.id)

    if (!error && data) {
      setDetallePedido(data)
    } else {
      console.error('Error al obtener detalles:', error)
    }
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setDetallePedido([])
    setPedidoActual(null)
  }

  const cambiarEstado = async (id: string, nuevoEstado: 'completado' | 'anulado') => {
    await supabase.from('orders').update({ status: nuevoEstado }).eq('id', id)
    fetchPedidos()
  }

  useEffect(() => {
    fetchPedidos()
  }, [])

  const pedidosFiltrados = pedidos
    .filter(p =>
      filtroNombre.trim() === '' ||
      p.users?.full_name?.toLowerCase().includes(filtroNombre.toLowerCase())
    )
    .filter(p =>
      filtroEstado === 'todos' || p.status === filtroEstado
    )
    .slice(0, limit)

  return (
    <main className="p-6 bg-pink-50 min-h-screen">
      <h1 className="text-3xl font-bold text-pink-600 mb-4">📦 Pedidos Recientes</h1>

      {/* Filtros */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
        <input
          type="text"
          placeholder="Buscar por cliente..."
          value={filtroNombre}
          onChange={e => setFiltroNombre(e.target.value)}
          className="px-4 py-2 rounded-lg border border-pink-300 w-full md:w-64"
        />

        <select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
          className="px-4 py-2 rounded-lg border border-pink-300 w-full md:w-48"
        >
          <option value="todos">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="completado">Completado</option>
          <option value="anulado">Anulado</option>
        </select>
      </div>

      {loading ? (
        <p className="text-center">Cargando...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-xl">
            <thead>
              <tr className="bg-pink-100 text-pink-700 text-left">
                <th className="p-4">Cliente</th>
                <th className="p-4">Teléfono</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Total (Bs)</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map(pedido => (
                <tr key={pedido.id} className="border-t hover:bg-pink-50">
                  <td className="p-4 font-semibold">{pedido.users?.full_name || 'Sin nombre'}</td>
                  <td className="p-4">{pedido.users?.phone || '-'}</td>
                  <td className="p-4">{format(new Date(pedido.created_at), 'dd/MM/yyyy HH:mm')}</td>
                  <td className="p-4">Bs {pedido.total_price.toFixed(2)}</td>
                  <td className="p-4 capitalize text-sm font-medium text-pink-700">{pedido.status}</td>
                  <td className="p-4 space-x-2">
                    <button onClick={() => cambiarEstado(pedido.id, 'completado')} className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600">✅</button>
                    <button onClick={() => cambiarEstado(pedido.id, 'anulado')} className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600">❌</button>
                    <button onClick={() => abrirModal(pedido)} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pedidosFiltrados.length < pedidos.length && (
            <div className="text-center mt-4">
              <button onClick={() => setLimit(l => l + 10)} className="bg-pink-600 text-white px-5 py-2 rounded-full hover:bg-pink-700">
                Ver más pedidos
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modalAbierto && pedidoActual && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg relative">
            <button onClick={cerrarModal} className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl">×</button>
            <h2 className="text-xl font-bold text-pink-700 mb-4">
              Detalles de pedido de {pedidoActual.users?.full_name}
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2">Producto</th>
                  <th className="py-2">Cantidad</th>
                  <th className="py-2">Precio Unitario (Bs)</th>
                </tr>
              </thead>
              <tbody>
                {detallePedido.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{item.products.name}</td>
                    <td className="py-2">{item.quantity}</td>
                    <td className="py-2">Bs {item.unit_price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right mt-4">
              <button onClick={cerrarModal} className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
