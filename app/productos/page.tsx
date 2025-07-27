'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useCart } from '@/lib/store/useCart'

// Si tienes un Header puedes descomentar
// import Header from '@/components/Header'

export default function ProductosPage() {
  const [productos, setProductos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { items } = useCart()
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('products').select('*')
      if (!error) setProductos(data || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) return <p className="text-center mt-10">Cargando productos...</p>

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-200 to-pink-300 py-10 px-4">
      {/* <Header /> */}
      <div className="flex justify-end mb-4">
        <a href="/carrito" className="relative inline-flex items-center text-pink-600 hover:text-pink-800">
          <span className="text-2xl">🛒</span>
          {totalItems > 0 && (
            <span className="ml-1 text-sm font-bold bg-pink-500 text-white rounded-full px-2">
              {totalItems}
            </span>
          )}
        </a>
      </div>

      <div className="max-w-6xl mx-auto bg-white/90 p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-pink-600 mb-8 text-center">Nuestros Productos</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {productos.map((producto) => (
            <ProductoCard key={producto.id} producto={producto} />
          ))}
        </div>
      </div>
    </main>
  )
}

function ProductoCard({ producto }: { producto: any }) {
  const { addToCart } = useCart()
  const [cantidad, setCantidad] = useState(1)

  const aumentar = () => setCantidad(c => c + 1)
  const disminuir = () => setCantidad(c => Math.max(1, c - 1))

  const handleAgregar = () => {
    addToCart(
      {
        id: producto.id,
        name: producto.name,
        price: producto.price,
        image_url: producto.image_url,
      },
      cantidad
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition overflow-hidden">
      {producto.image_url && (
        <img src={producto.image_url} alt={producto.name} className="h-48 w-full object-cover" />
      )}
      <div className="p-4 flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-pink-600">{producto.name}</h2>
        <p className="text-gray-600">{producto.description}</p>
        <p className="text-pink-500 font-bold">Bs {producto.price}</p>
        <div className="flex items-center gap-2 justify-center mt-2">
          <button onClick={disminuir} className="px-3 py-1 bg-pink-100 rounded-full text-pink-600 font-bold text-lg">−</button>
          <span className="text-lg font-semibold">{cantidad}</span>
          <button onClick={aumentar} className="px-3 py-1 bg-pink-100 rounded-full text-pink-600 font-bold text-lg">+</button>
        </div>
        <button onClick={handleAgregar} className="mt-3 bg-pink-500 text-white px-4 py-2 rounded-full hover:bg-pink-600 transition">
          Agregar al carrito
        </button>
      </div>
    </div>
  )
}
