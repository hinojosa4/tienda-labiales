'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useCart } from '@/lib/store/useCart'
import { FaFacebookF, FaTiktok, FaUserCircle, FaShoppingCart } from 'react-icons/fa'

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const { items } = useCart()
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)

    useEffect(() => {
        const getUser = async () => {
        const { data } = await supabase.auth.getUser()
        setUser(data?.user || null)
    }

    getUser()

    // Escuchar cambios de sesión
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null)
    })

    return () => {
        listener?.subscription.unsubscribe()
    }
    }, [])


  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  return (
    <header className="bg-white shadow-md py-3 px-6 flex items-center justify-between sticky top-0 z-50">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
    <img
      src="https://scontent.fcbb1-2.fna.fbcdn.net/v/t39.30808-6/514262943_2903332156520089_2844070122572378124_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=KIBEyVykrR8Q7kNvwE8O_IY&_nc_oc=AdmW5BwAFRyPE_MjUbj9RR7M3CdeOJjvKTrA4KjN-Rh6hZXg_GjDAgV5SM_M_ieq5oO7yY3HsYQ9yt2eHOxLZHqv&_nc_zt=23&_nc_ht=scontent.fcbb1-2.fna&_nc_gid=M0YiErjrnoUDTbDeLzP7Cw&oh=00_AfQTKVpzKATLGRvkTac53fm_P7MMKeP_G1c7yXSFvyMUQw&oe=688D6712"
      alt="Qoriya Logo"
      className="h-10 w-auto rounded-full object-cover"
    />
    <span className="text-xl font-bold text-pink-600 hidden sm:inline">Qoriya</span>
  </Link>


      {/* Redes */}
      <div className="flex gap-4 text-xl">
        <a href="https://www.facebook.com/profile.php?id=61578632754336" target="_blank" className="text-blue-600">
          <FaFacebookF />
        </a>
        <a href="https://www.tiktok.com/@1qoriya1?_t=ZM-8yM7fI4nAuL&_r=1" target="_blank" className="text-black">
          <FaTiktok />
        </a>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-4">
        {/* Carrito */}
        <Link href="/carrito" className="relative text-pink-600 text-2xl hover:text-pink-800">
          <FaShoppingCart />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full px-2">
              {totalItems}
            </span>
          )}
        </Link>

        {/* Usuario */}
        {user ? (
          <div className="flex items-center gap-2">
            <FaUserCircle className="text-pink-700 text-xl" />
            <button onClick={handleLogout} className="text-sm bg-pink-600 text-white px-3 py-1 rounded hover:bg-pink-700">
              Cerrar sesión
            </button>
          </div>
        ) : (
          <Link href="/login" className="text-sm bg-pink-600 text-white px-3 py-1 rounded hover:bg-pink-700">
            Iniciar sesión
          </Link>
        )}
      </div>
    </header>
  )
}
