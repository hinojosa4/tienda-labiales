'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Pedido {
  id: string
  created_at: string
  total_price: number
}

export default function VentasSemanalesPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [totalVentas, setTotalVentas] = useState(0)
  const [loading, setLoading] = useState(false)

  const [fechaInicio, setFechaInicio] = useState<string>(() => {
    const date = new Date()
    date.setDate(date.getDate() - 7)
    return format(date, 'yyyy-MM-dd')
  })

  const [fechaFin, setFechaFin] = useState<string>(() => {
    const date = new Date()
    return format(date, 'yyyy-MM-dd')
  })

  const fetchVentas = async () => {
    setLoading(true)
    const inicio = new Date(`${fechaInicio}T00:00:00Z`)
    const fin = new Date(`${fechaFin}T23:59:59Z`)

    const { data, error } = await supabase
      .from('orders')
      .select('id, created_at, total_price')
      .gte('created_at', inicio.toISOString())
      .lte('created_at', fin.toISOString())
      .eq('status', 'completado')

    if (!error && data) {
      setPedidos(data)
      const total = data.reduce((sum, p) => sum + Number(p.total_price), 0)
      setTotalVentas(total)
    } else {
      console.error('Error al obtener ventas:', error)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchVentas()
  }, [])

  const exportarPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('Reporte de Ventas', 14, 20)

    autoTable(doc, {
      startY: 30,
      head: [['#', 'Fecha', 'Total (Bs)']],
      body: pedidos.map((p, i) => [
        i + 1,
        format(new Date(p.created_at), 'dd/MM/yyyy HH:mm'),
        `Bs ${p.total_price.toFixed(2)}`
      ])
    })

    doc.save('reporte-ventas.pdf')
  }

  return (
    <main className="p-4 md:p-6 bg-pink-50 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold text-[rgb(136,47,65)] mb-4">📊 Ventas por Rango de Fechas</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-black mb-1">Fecha Inicio</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={e => setFechaInicio(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-black mb-1">Fecha Fin</label>
          <input
            type="date"
            value={fechaFin}
            onChange={e => setFechaFin(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded w-full"
          />
        </div>
        <div className="self-end">
          <button
            onClick={fetchVentas}
            className="bg-[rgb(136,47,65)] text-white px-4 py-2 rounded hover:bg-[rgb(100,30,45)]"
          >
            🔍 Buscar
          </button>
        </div>
      </div>

      {loading ? (
        <p>Cargando reporte...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <h3 className="text-[rgb(136,47,65)] font-semibold text-lg">Total Vendido</h3>
              <p className="text-2xl font-bold mt-2 text-black">Bs {totalVentas.toFixed(2)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <h3 className="text-[rgb(136,47,65)] font-semibold text-lg">Pedidos Completados</h3>
              <p className="text-2xl font-bold mt-2 text-black">{pedidos.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <h3 className="text-[rgb(136,47,65)] font-semibold text-lg">Rango</h3>
              <p className="text-base font-medium text-black mt-2">
                {format(parseISO(fechaInicio), 'dd MMM yyyy', { locale: es })} -{' '}
                {format(parseISO(fechaFin), 'dd MMM yyyy', { locale: es })}
              </p>
            </div>
          </div>

          <div className="flex justify-end mb-4">
            <button
              onClick={exportarPDF}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              📄 Exportar a PDF
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-pink-100 text-[rgb(136,47,65)]">
                <tr>
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Fecha</th>
                  <th className="p-3 text-left">Total (Bs)</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido, index) => (
                  <tr key={pedido.id} className="border-t">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{format(new Date(pedido.created_at), 'dd/MM/yyyy HH:mm')}</td>
                    <td className="p-3">Bs {pedido.total_price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  )
}
