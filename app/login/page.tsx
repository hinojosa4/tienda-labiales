'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useMemo } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  //const nextUrl = searchParams.get('next') || '/productos'
  const nextUrl = useMemo(() => {
  const value = searchParams.get('next')
  return value || '/productos'
  }, [searchParams])

  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    address: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (isLogin) {
      // Login existente
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })

      if (error) {
        setError(error.message)
      } else {
        router.push(nextUrl)
      }
    } else {
      // Registro nuevo
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      const userId = signUpData?.user?.id

      if (userId) {
        // Evitar duplicados en tabla "users"
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', userId)
          .single()

        if (!existingUser) {
          const { error: insertError } = await supabase.from('users').insert({
            id: userId,
            full_name: form.full_name,
            phone: form.phone,
            email: form.email,
            address: form.address,
            role: 'cliente',
          })

          if (insertError) {
            setError('Error al guardar datos del usuario: ' + insertError.message)
            setLoading(false)
            return
          }
        }
      }

      router.push(nextUrl)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-200 to-pink-300 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-pink-600 text-center mb-4">
          {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Nombre completo marisol</label>
                <input name="full_name" value={form.full_name} onChange={handleChange} className="w-full p-3 border border-pink-300 rounded-lg" required />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Teléfono</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="w-full p-3 border border-pink-300 rounded-lg" required />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Dirección</label>
                <input name="address" value={form.address} onChange={handleChange} className="w-full p-3 border border-pink-300 rounded-lg" required />
              </div>
            </>
          )}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Correo electrónico</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full p-3 border border-pink-300 rounded-lg" required />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Contraseña</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} className="w-full p-3 border border-pink-300 rounded-lg" required />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button disabled={loading} className="w-full py-3 px-4 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition disabled:opacity-50">
            {loading ? 'Cargando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
          </button>
        </form>
        <p className="text-center mt-4 text-sm text-gray-600">
          {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-pink-600 font-medium hover:underline">
            {isLogin ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </div>
    </div>
  )
}
