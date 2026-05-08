import Providers from '@/components/Providers'
import './globals.css'

// Bookai: Book + kai
export const metadata = {
  title: 'Bookai',
  description: 'Smart booking for Lebanese businesses',
  icons: {
    icon: '/logos/logo-icon.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}