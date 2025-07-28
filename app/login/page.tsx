'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

const badWords = ['mierda', 'puta', 'carajo', 'idiota', 'imbecil', 'estupido', 'estúpido', 'perra']

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextUrl = searchParams?.get('next') ?? '/productos'

  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    address: '',
  })

  const [errors, setErrors] = useState<any>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const validate = () => {
    const newErrors: any = {}
    const nameRegex = /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]{1,30}$/
    const phoneRegex = /^[67]\d{7}$/
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

    const containsBadWords = (text: string) =>
      badWords.some((word) => text.toLowerCase().includes(word))

    if (!nameRegex.test(form.full_name) || containsBadWords(form.full_name)) {
      newErrors.full_name = 'Nombre inválido (sin caracteres especiales, máximo 30 letras y sin groserías)'
    }

    if (!phoneRegex.test(form.phone)) {
      newErrors.phone = 'Número inválido (debe empezar en 6 o 7 y tener 8 dígitos)'
    }

    if (!emailRegex.test(form.email) || form.email.length > 20) {
      newErrors.email = 'Correo inválido (máximo 20 caracteres)'
    }

    if (form.address.length > 25 || containsBadWords(form.address)) {
      newErrors.address = 'Dirección inválida (máximo 25 caracteres y sin groserías)'
    }

    if (!passwordRegex.test(form.password)) {
      newErrors.password = 'Contraseña débil (mínimo 8 caracteres con mayúscula, minúscula y número)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!isLogin && !validate()) {
      setLoading(false)
      return
    }

    if (isLogin) {
      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })

      if (error) {
        setError(error.message)
      } else {
        const userId = signInData.user?.id
        if (userId) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', userId)
            .single()

          if (userError || !userData) {
            setError('No se pudo verificar el rol del usuario.')
          } else {
            router.push(userData.role === 'vendedor' ? '/admin' : nextUrl)
          }
        } else {
          setError('Usuario no encontrado.')
        }
      }
    } else {
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
                <label className="block mb-1 text-sm font-medium text-gray-700">Nombre completo</label>
                <input
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  className="w-full p-3 border border-pink-300 rounded-lg text-black"
                  required
                />
                {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Celular</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full p-3 border border-pink-300 rounded-lg text-black"
                  required
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Dirección</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full p-3 border border-pink-300 rounded-lg text-black"
                  required
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>
            </>
          )}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Correo electrónico</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 border border-pink-300 rounded-lg text-black"
              required
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Contraseña</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                className="w-full p-3 border border-pink-300 rounded-lg text-black pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-pink-600"
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            disabled={loading}
            className="w-full py-3 px-4 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition disabled:opacity-50"
          >
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
