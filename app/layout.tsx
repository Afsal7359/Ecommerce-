import type { Metadata } from 'next'
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google'
import { AuthProvider } from '@/lib/auth'
import { CartProvider } from '@/lib/cart'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const playfair = Playfair_Display({ subsets:['latin'], variable:'--font-playfair', display:'swap', weight:['700','900'] })
const jakarta  = Plus_Jakarta_Sans({ subsets:['latin'], variable:'--font-jakarta',  display:'swap', weight:['300','400','500','600','700'] })

export const metadata: Metadata = {
  title: { default:'IronForge Hardware — Dubai', template:'%s | IronForge Hardware' },
  description: "Dubai's #1 online hardware store. Power tools, paints, plumbing & construction materials.",
  keywords: ['hardware','tools','Dubai','UAE','Bosch','Dewalt','paint','plumbing'],
  openGraph: { title:'IronForge Hardware', description:"Dubai's #1 hardware store", locale:'en_AE', type:'website' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable}`}>
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster position="top-right" toastOptions={{
              duration: 3000,
              style: { fontFamily:'var(--font-jakarta)', fontSize:'13px' },
              success: { style:{ background:'#16A34A', color:'#fff' } },
              error:   { style:{ background:'#DC2626', color:'#fff' } },
            }}/>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
