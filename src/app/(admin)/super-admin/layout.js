import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SuperAdminSidebar from '@/components/admin/SuperAdminSidebar'
import styles from '@/styles/dashboard/layout.module.css'

export default async function SuperAdminLayout({ children }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'superadmin') redirect('/login')

  return (
    <div className={styles.shell}>
      <SuperAdminSidebar session={session} />
      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  )
}
