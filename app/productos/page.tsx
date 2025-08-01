'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useCart } from '@/lib/store/useCart'
import Header from '@/components/Header'
import { useRouter } from 'next/navigation'

export default function ProductosPage() {
  const [productos, setProductos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { clearCart } = useCart()

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('products').select('*')
      if (!error) setProductos(data || [])
      setLoading(false)
    }

    fetchData()
  }, [])

  useEffect(() => {
    const items = localStorage.getItem('cart')
    if (!items || JSON.parse(items).length === 0) {
      clearCart()
    }
  }, [clearCart])

  if (loading) return <p className="text-center mt-10">Cargando productos...</p>

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-200 to-pink-300 py-10 px-4">
        <div className="max-w-6xl mx-auto bg-white/90 p-6 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-pink-600 mb-8 text-center">Nuestros Productos</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {productos.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>

          {/* Bloque visualmente atractivo: Sobre Stark */}
          <section className="mt-16 rounded-xl bg-gradient-to-br from-pink-200 via-pink-100 to-white shadow-inner px-8 py-10 sm:px-10 lg:px-20">
            <h2 className="text-3xl font-bold text-pink-700 text-center mb-6 relative inline-block after:block after:w-24 after:h-1 after:rounded-full after:bg-pink-400 after:mx-auto after:mt-2">
              Sobre Stark
            </h2>
            <p className="text-gray-800 text-lg sm:text-xl leading-relaxed text-justify font-serif tracking-wide drop-shadow-sm">
              En <span className="font-semibold text-pink-700">Stark</span>, fundada en <strong>2025</strong>, nos especializamos en la creación de 
              <strong> labiales artesanales</strong> de la más alta calidad. Cada uno de nuestros productos está cuidadosamente elaborado con 
              ingredientes <span className="italic text-pink-600">premium</span>, garantizando no solo belleza, sino también el cuidado que tus labios merecen.
              <br /><br />
              Nuestra pasión por la cosmética artesanal nos impulsa a crear <span className="font-medium">fórmulas únicas</span> que realzan tu 
              belleza natural con productos excepcionales y duraderos. Creemos en la importancia de ofrecer labiales que 
              <strong> nutren, protegen y embellecen</strong>, manteniendo siempre los más altos estándares de calidad.
            </p>
          </section>
        </div>
      </main>
    </>
  )
}

function ProductoCard({ producto }: { producto: any }) {
  const { addToCart } = useCart()
  const [cantidad, setCantidad] = useState(1)
  const router = useRouter()

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
    router.push('/carrito')
  }

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition overflow-hidden flex flex-col">
      {producto.image_url && (
        <div className="w-full aspect-[4/3] bg-white">
          <img
            src={producto.image_url}
            alt={producto.name}
            className="w-full h-full object-contain"
          />
        </div>
      )}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h2 className="text-xl font-semibold text-pink-600">{producto.name}</h2>
        <p className="text-gray-600">{producto.description}</p>
        <p className="text-pink-500 font-bold">Bs {producto.price}</p>
        <div className="flex items-center gap-2 justify-center mt-2">
          <button
            onClick={disminuir}
            className="px-3 py-1 bg-pink-100 rounded-full text-pink-600 font-bold text-lg"
          >
            −
          </button>
          <span className="text-lg font-semibold text-black">{cantidad}</span>
          <button
            onClick={aumentar}
            className="px-3 py-1 bg-pink-100 rounded-full text-pink-600 font-bold text-lg"
          >
            +
          </button>
        </div>
        <button
          onClick={handleAgregar}
          className="mt-3 bg-pink-500 text-white px-4 py-2 rounded-full hover:bg-pink-600 transition"
        >
          Agregar al carrito
        </button>
      </div>
    </div>
  )
}
