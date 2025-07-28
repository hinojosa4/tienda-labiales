// app/admin/layout.tsx
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Obtener usuario actual
  /*useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user.email) setUserEmail(data.session.user.email)
    })
  }, [])*/
    useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session) {
        router.push('/login?next=/admin')
        return
      }

      const userId = session.user.id

      const { data: userInfo, error: userError } = await supabase
        .from('users')
        .select('role, email')
        .eq('id', userId)
        .single()

      if (userError || !userInfo || userInfo.role !== 'vendedor') {
        router.push('/productos')
        return
      }

      setUserEmail(userInfo.email)
    }

    checkAccess()
  }, [router])


  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navLinks = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/reportes-diarios', label: 'Ventas Diarias' },
    { href: '/admin/ventas-semanales', label: 'Ventas Semanales' },
    { href: '/admin/reportes-productos', label: 'Productos' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-pink-700 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Panel de Vendedor</h1>
        <div className="flex items-center gap-4">
          {userEmail && <span>{userEmail}</span>}
          <button
            onClick={handleLogout}
            className="bg-pink-900 hover:bg-pink-800 px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Sidebar y contenido */}
      <div className="flex flex-1">
        <nav className="w-64 bg-pink-100 p-6 space-y-4">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2 rounded ${
                pathname === link.href ? 'bg-pink-300 font-semibold' : 'hover:bg-pink-200'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <main className="flex-1 p-6 bg-pink-50 overflow-auto">{children}</main>
      </div>

      {/* Footer */}
      <footer className="bg-pink-700 text-white p-4 text-center">
        &copy; {new Date().getFullYear()} Mi Tienda
      </footer>
    </div>
  )
}
