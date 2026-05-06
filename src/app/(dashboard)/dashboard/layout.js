import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'
import styles from '@/styles/dashboard/layout.module.css'

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions)

  if (!session) redirect('/login')

  return (
    <div className={styles.shell}>
      <Sidebar session={session} />
      <main className={styles.main}>
        <Header user={session?.user} />
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  )
}