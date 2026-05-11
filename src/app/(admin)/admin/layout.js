import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import styles from '@/styles/admin/layout.module.css'

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'superadmin') redirect('/login')

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div className={styles.topbarLeft}>
            <img src="/logos/logo-rectangle-dark.png" alt="Bookai" className={styles.logo} />
            <span className={styles.adminBadge}>Super Admin</span>
          </div>
          <div className={styles.topbarRight}>
            <span className={styles.adminUser}>{session.user.name}</span>
            <a href="/api/auth/signout" className={styles.signOutLink}>Sign out</a>
          </div>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  )
}