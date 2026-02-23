import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import './globals.css'

const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-roboto'
})

export const metadata: Metadata = {
  title: 'AniList - Comic Universe Plugin',
  description: 'Metadata plugin for AniList in Comic Universe',
  icons: {
    icon: '/icon.png'
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className={`${roboto.variable} antialiased`}>
        <div
          className='fixed inset-0 w-full h-full -z-10'
          style={{
            background:
              'linear-gradient(135deg, #2b3a67 0%, #101028 70%, #12182b 90%, #19202c 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        {children}
      </body>
    </html>
  )
}
