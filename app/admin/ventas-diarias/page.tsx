'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import * as XLSX from 'xlsx'
//import { saveAs } from 'file-saver'
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

  const fetchVentasDelDia = async () => {
    setLoading(true)
    const inicioDia = new Date()
    inicioDia.setHours(0, 0, 0, 0)
    const ahora = new Date()

    const { data, error } = await supabase
      .from('orders')
      .select('id, created_at, total_price')
      .gte('created_at', inicioDia.toISOString())
      .lte('created_at', ahora.toISOString())
      .eq('status', 'completado')

    if (!error && data) {
      setPedidos(data)
      const total = data.reduce((sum, pedido) => sum + Number(pedido.total_price), 0)
      setTotalVentas(total)
    } else {
      console.error('Error al obtener ventas del día:', error)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchVentasDelDia()
  }, [])

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      pedidos.map(p => ({
        ID: p.id,
        Fecha: format(new Date(p.created_at), 'dd/MM/yyyy HH:mm'),
        Total: p.total_price.toFixed(2),
      }))
    )
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventas Día')
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(blob, 'ventas-dia.xlsx')
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('Reporte de Ventas del Día', 14, 20)

    autoTable(doc, {
      startY: 30,
      head: [['ID', 'Fecha', 'Total (Bs)']],
      body: pedidos.map(p => [
        p.id.slice(0, 8) + '...',
        format(new Date(p.created_at), 'dd/MM/yyyy HH:mm'),
        `Bs ${p.total_price.toFixed(2)}`
      ])
    })

    doc.save('ventas-dia.pdf')
  }

  return (
    <main className="p-6 bg-pink-50 min-h-screen">
      <h1 className="text-3xl font-bold text-pink-700 mb-4">📊 Ventas del Día</h1>

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
                {format(new Date(), "EEEE dd MMMM yyyy", { locale: es })}
              </p>
            </div>
          </div>

          <div className="mb-4 flex gap-4">
            <button
              onClick={exportToExcel}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              📥 Exportar a Excel
            </button>
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
                  <th className="p-3 text-left">#ID</th>
                  <th className="p-3 text-left">Fecha</th>
                  <th className="p-3 text-left">Total (Bs)</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map(pedido => (
                  <tr key={pedido.id} className="border-t">
                    <td className="p-3">{pedido.id.slice(0, 8)}...</td>
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
