'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function PedidoDetalle() {
  const params = useParams()
  const id = params?.id
  const router = useRouter()
  const [detalles, setDetalles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const fetchDetalles = async () => {
      const { data, error } = await supabase
        .from('order_items')
        .select('quantity, unit_price, products(name)')
        .eq('order_id', id)

      if (error) {
        console.error('Error al obtener detalles del pedido:', error)
      } else {
        setDetalles(data)
      }
      setLoading(false)
    }

    fetchDetalles()
  }, [id])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-pink-700 mb-4">🧾 Detalle del Pedido</h1>

      {loading ? (
        <p>Cargando productos...</p>
      ) : (
        <table className="min-w-full bg-white shadow rounded-lg">
          <thead>
            <tr className="bg-pink-100 text-pink-800">
              <th className="py-2 px-4 text-left">Producto</th>
              <th className="py-2 px-4 text-left">Cantidad</th>
              <th className="py-2 px-4 text-left">Precio Unitario (Bs)</th>
            </tr>
          </thead>
          <tbody>
            {detalles.map((item, idx) => (
              <tr key={idx} className="border-t">
                <td className="py-2 px-4">{item.products.name}</td>
                <td className="py-2 px-4">{item.quantity}</td>
                <td className="py-2 px-4">Bs {item.unit_price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button
        className="mt-6 px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
        onClick={() => router.back()}
      >
        ← Volver a la lista
      </button>
    </div>
  )
}
