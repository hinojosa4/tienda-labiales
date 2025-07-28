'use client'

import { useCart } from '@/lib/store/useCart'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function CarritoPage() {
  const router = useRouter()
  const [procesando, setProcesando] = useState(false)
  const [isAuth, setIsAuth] = useState(false)

  const { items, increase, decrease, removeFromCart, getTotal, clearCart } = useCart()

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) setIsAuth(true)
    }
    checkSession()
  }, [])

  const handleComprar = async () => {
    setProcesando(true)

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (!session || sessionError) {
      setProcesando(false)
      router.push('/login?next=/carrito')
      return
    }

    const userAuth = session.user

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', userAuth.email)
      .single()

    if (!userData || userError) {
      alert('No se pudo obtener los datos del cliente')
      console.error(userError)
      setProcesando(false)
      return
    }

    const total = getTotal()

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userData.id,
        total_price: total,
        cancel_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      })
      .select()
      .single()

    if (orderError || !order) {
      alert('Error al crear el pedido')
      console.error(orderError)
      setProcesando(false)
      return
    }

    const itemsData = items.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.price,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(itemsData)

    if (itemsError) {
      alert('Error al guardar productos del pedido')
      console.error(itemsError)
      setProcesando(false)
      return
    }

    const mensaje = `
      🛍️ *Nuevo Pedido de ${userData.full_name}*

      📅 Fecha: ${new Date().toLocaleDateString()}
      📞 Teléfono: ${userData.phone}
      📍 Dirección: ${userData.address}

      🧾 *Detalle del pedido:*
      ${items.map(i => `- ${i.name} x${i.quantity} = Bs ${(i.price * i.quantity).toFixed(2)}`).join('\n')}

      💰 *Total a pagar:* Bs ${total.toFixed(2)}
    `.trim()

    const numeroVendedor = '59179730325'
    const url = `https://wa.me/${numeroVendedor}?text=${encodeURIComponent(mensaje)}`

    clearCart()
    window.open(url, '_blank')
    router.push('/productos')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-200 to-pink-300 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white/90 p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-pink-600 mb-6 text-center">Tu Carrito</h1>

        {items.length === 0 ? (
          <p className="text-center text-gray-600">Tu carrito está vacío.</p>
        ) : (
          <div className="space-y-6">
            {items.map(item => (
              <div
                key={item.id}
                className="flex flex-wrap sm:flex-nowrap gap-4 items-center bg-white p-4 rounded-xl shadow"
              >
                {item.image_url && (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-pink-600">{item.name}</h2>
                  <p className="text-gray-600">Bs {item.price}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <button
                      onClick={() => decrease(item.id)}
                      className="px-3 py-1 bg-pink-100 rounded-full text-pink-600 font-bold text-lg"
                    >
                      −
                    </button>
                    <span className="text-lg font-semibold text-black">{item.quantity}</span>
                    <button
                      onClick={() => increase(item.id)}
                      className="px-3 py-1 bg-pink-100 rounded-full text-pink-600 font-bold text-lg"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="ml-4 text-sm text-red-500 hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div className="text-right mt-6">
              <p className="text-xl font-semibold text-gray-700 mb-2">
                Total: <span className="text-pink-600">Bs {getTotal().toFixed(2)}</span>
              </p>
              <button
                onClick={handleComprar}
                className="bg-pink-500 text-white px-6 py-3 rounded-full hover:bg-pink-600 transition"
              >
                Finalizar pedido
              </button>
            </div>
          </div>
        )}
      </div>

      {procesando && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl text-center animate-fade-in">
            <p className="text-pink-600 text-xl font-bold mb-2">Procesando pedido...</p>
            <p className="text-gray-600">Redirigiendo a WhatsApp</p>
            <div className="mt-4 w-6 h-6 border-4 border-pink-300 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      )}
    </main>
  )
}
