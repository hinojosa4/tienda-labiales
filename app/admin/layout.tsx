// app/admin/layout.tsx
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Menu } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

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
  { href: '/admin/pedidos', label: 'Pedidos' }, // ✅ nuevo enlace
  { href: '/admin/reportes-diarios', label: 'Ventas Diarias' },
  { href: '/admin/ventas-semanales', label: 'Ventas Semanales' },
  { href: '/admin/reportes-productos', label: 'Productos' },
]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#882F41] text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Panel de Vendedor</h1>
        <div className="md:flex hidden items-center gap-4">
          {userEmail && <span className="text-black bg-white px-2 py-1 rounded">{userEmail}</span>}
          <button
            onClick={handleLogout}
            className="bg-[#5e1f2f] hover:bg-[#762737] px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu />
        </button>
      </header>

      {/* Sidebar y contenido */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Sidebar para móviles y desktop */}
        <nav
          className={`${
            menuOpen ? 'block' : 'hidden'
          } md:block w-full md:w-64 bg-[#f7dfe3] p-6 space-y-4`}
        >
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2 rounded text-black ${
                pathname === link.href
                  ? 'bg-[#e4acb5] font-semibold'
                  : 'hover:bg-[#f2c9d0]'
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {/* Logout visible en móvil también */}
          <div className="mt-4 md:hidden">
            {userEmail && <span className="block mb-2 text-black">{userEmail}</span>}
            <button
              onClick={handleLogout}
              className="bg-[#5e1f2f] text-white hover:bg-[#762737] w-full px-3 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </nav>

        {/* Contenido principal */}
        <main className="flex-1 p-6 bg-[#fef4f5] overflow-auto text-black">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-[#882F41] text-white p-4 text-center">
        &copy; {new Date().getFullYear()} Mi Tienda
      </footer>
    </div>
  )
}
