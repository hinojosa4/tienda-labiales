import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'



const inter = Inter({ subsets: ['latin'] })



export const metadata: Metadata = {
  title: 'Qiroya',
  description: 'Tienda de labiales Qiroya',
  icons: {
    icon: 'https://scontent.fcbb1-2.fna.fbcdn.net/v/t39.30808-6/514262943_2903332156520089_2844070122572378124_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=KIBEyVykrR8Q7kNvwE8O_IY&_nc_oc=AdmW5BwAFRyPE_MjUbj9RR7M3CdeOJjvKTrA4KjN-Rh6hZXg_GjDAgV5SM_M_ieq5oO7yY3HsYQ9yt2eHOxLZHqv&_nc_zt=23&_nc_ht=scontent.fcbb1-2.fna&_nc_gid=M0YiErjrnoUDTbDeLzP7Cw&oh=00_AfQTKVpzKATLGRvkTac53fm_P7MMKeP_G1c7yXSFvyMUQw&oe=688D6712',
  },
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
