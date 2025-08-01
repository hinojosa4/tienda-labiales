'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Pedido {
  id: string
  created_at: string
  total_price: number
}

export default function VentasDiariasPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [totalVentas, setTotalVentas] = useState(0)
  const [loading, setLoading] = useState(true)
  const [fechaSeleccionada, setFechaSeleccionada] = useState(() => {
    const hoy = new Date()
    return hoy.toISOString().split('T')[0] // yyyy-mm-dd
  })

  const fetchVentasPorFecha = async (fechaStr: string) => {
    setLoading(true)

    const [año, mes, día] = fechaStr.split('-').map(Number)

    // Crear fechas en UTC
    const inicioDia = new Date(Date.UTC(año, mes - 1, día, 0, 0, 0))
    const finDia = new Date(Date.UTC(año, mes - 1, día, 23, 59, 59))

    const inicioISO = inicioDia.toISOString()
    const finISO = finDia.toISOString()

    const { data, error } = await supabase
      .from('orders')
      .select('id, created_at, total_price')
      .gte('created_at', inicioISO)
      .lte('created_at', finISO)
      .eq('status', 'completado')

    if (!error && data) {
      setPedidos(data)
      const total = data.reduce((sum, pedido) => sum + Number(pedido.total_price), 0)
      setTotalVentas(total)
    } else {
      console.error('Error al obtener ventas:', error)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchVentasPorFecha(fechaSeleccionada)
  }, [fechaSeleccionada])

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text(`Reporte de Ventas (${fechaSeleccionada})`, 14, 20)

    autoTable(doc, {
      startY: 30,
      head: [['#', 'Fecha', 'Total (Bs)']],
      body: pedidos.map((p, i) => [
        i + 1,
        format(new Date(p.created_at), 'dd/MM/yyyy HH:mm'),
        `Bs ${p.total_price.toFixed(2)}`
      ])
    })

    doc.save(`ventas-${fechaSeleccionada}.pdf`)
  }

  return (
    <main className="p-6 bg-pink-50 min-h-screen">
      <h1 className="text-3xl font-bold text-pink-700 mb-4">📊 Ventas por Fecha</h1>

      {/* Selector de fecha */}
      <div className="mb-6">
        <label className="block mb-2 text-pink-700 font-medium">Seleccionar fecha:</label>
        <input
          type="date"
          value={fechaSeleccionada}
          max={new Date().toISOString().split('T')[0]}
          onChange={e => setFechaSeleccionada(e.target.value)}
          className="px-4 py-2 border border-pink-300 rounded-md"
        />
      </div>

      {loading ? (
        <p>Cargando reporte...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <h3 className="text-pink-700 font-semibold text-lg">Total Vendido</h3>
              <p className="text-2xl font-bold text-pink-800 mt-2">Bs {totalVentas.toFixed(2)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <h3 className="text-pink-700 font-semibold text-lg">Pedidos Completados</h3>
              <p className="text-2xl font-bold text-pink-800 mt-2">{pedidos.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <h3 className="text-pink-700 font-semibold text-lg">Fecha</h3>
              <p className="text-xl font-medium text-pink-800 mt-2">
                {format(new Date(fechaSeleccionada), "EEEE dd MMMM yyyy", { locale: es })}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <button
              onClick={exportToPDF}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              📄 Exportar a PDF
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-pink-100 text-pink-800">
                <tr>
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Fecha</th>
                  <th className="p-3 text-left">Total (Bs)</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido, i) => (
                  <tr key={pedido.id} className="border-t">
                    <td className="p-3">{i + 1}</td>
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
