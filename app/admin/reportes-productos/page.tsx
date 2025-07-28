'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import * as XLSX from 'xlsx'
import { format } from 'date-fns'
//import { saveAs } from 'file-saver'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Producto {
  id: string
  name: string
  price: number
  stock: number
}

export default function ReporteProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProductos = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, stock')

    if (!error && data) {
      setProductos(data)
    } else {
      console.error('Error al obtener productos:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProductos()
  }, [])

  // Exportar Excel
  /*const exportarExcel = async () => {
    const { saveAs } = await import('file-saver')

    const worksheetData = productos.map(p => ({
      ID: p.id,
      Nombre: p.name,
      Precio: p.price.toFixed(2),
      Stock: p.stock,
    }))

    const worksheet = XLSX.utils.json_to_sheet(worksheetData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos')

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(blob, 'productos.xlsx')
  }*/
  const exportarExcel = async () => {
    const FileSaver = await import('file-saver') // ✅ carga dinámica compatible
    const saveAs = FileSaver.default // ✅ usa la exportación por defecto

    const worksheetData = productos.map(p => ({
      ID: p.id,
      Nombre: p.name,
      Precio: p.price.toFixed(2),
      Stock: p.stock,
  }))

  const worksheet = XLSX.utils.json_to_sheet(worksheetData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos')

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })

  saveAs(blob, 'productos.xlsx') // ✅ ahora sí funciona
}


  // Exportar PDF
  const exportarPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('Reporte de Productos', 14, 20)

    autoTable(doc, {
      startY: 30,
      head: [['ID', 'Nombre', 'Precio (Bs)', 'Stock']],
      body: productos.map(p => [
        p.id.slice(0, 8),
        p.name,
        `Bs ${p.price.toFixed(2)}`,
        p.stock.toString()
      ])
    })

    doc.save('productos.pdf')
  }

  return (
    <main className="p-6 bg-pink-50 min-h-screen">
      <h1 className="text-3xl font-bold text-pink-700 mb-4">📦 Reporte de Productos</h1>

      {loading ? (
        <p>Cargando productos...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <h3 className="text-pink-700 font-semibold text-lg">Total Productos</h3>
              <p className="text-2xl font-bold text-pink-800 mt-2">{productos.length}</p>
            </div>
          </div>

          <div className="flex justify-end mb-4 gap-2">
            <button
              onClick={exportarExcel}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              📥 Exportar a Excel
            </button>
            <button
              onClick={exportarPDF}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              📄 Exportar a PDF
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-pink-100 text-pink-800">
                <tr>
                  <th className="p-3 text-left">#ID</th>
                  <th className="p-3 text-left">Nombre</th>
                  <th className="p-3 text-left">Precio (Bs)</th>
                  <th className="p-3 text-left">Stock</th>
                </tr>
              </thead>
              <tbody>
                {productos.map(producto => (
                  <tr key={producto.id} className="border-t">
                    <td className="p-3">{producto.id.slice(0, 8)}...</td>
                    <td className="p-3">{producto.name}</td>
                    <td className="p-3">Bs {producto.price.toFixed(2)}</td>
                    <td className="p-3">{producto.stock}</td>
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
