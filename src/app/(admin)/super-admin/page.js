import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import AdminStatsStrip from '@/components/admin/stats/AdminStatsStrip'
import adminStyles from '@/styles/admin/admin.module.css'
import styles from '@/styles/admin/super-admin.module.css'

export const metadata = {
  title: 'Super Admin Dashboard — Bookai',
}

async function getStats() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [totalBusinesses, totalActive, totalBookingsThisMonth] = await Promise.all([
    prisma.business.count(),
    prisma.business.count({ where: { active: true } }),
    prisma.booking.count({ where: { created_at: { gte: startOfMonth } } }),
  ])

  return { totalBusinesses, totalActive, totalBookingsThisMonth }
}

export default async function SuperAdminDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'superadmin') redirect('/login')

  const stats = await getStats()

  return (
    <div className={adminStyles.page}>
      <div className={adminStyles.pageHeader}>
        <div>
          <p className={adminStyles.eyebrow}>Platform</p>
          <h1 className={adminStyles.pageTitle}>Super Admin Dashboard</h1>
          <p className={adminStyles.pageSubtitle}>Monitor platform health and manage tenants.</p>
        </div>
      </div>

      <AdminStatsStrip stats={stats} />

      <div className={styles.dashboardGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2 className={styles.panelTitle}>Quick actions</h2>
              <p className={styles.panelSubtitle}>Jump into the most common workflows.</p>
            </div>
          </div>
          <div className={styles.actionList}>
            <div className={styles.actionItem}>
              Review new businesses
              <a className={styles.actionLink} href="/super-admin/businesses">Open</a>
            </div>
            <div className={styles.actionItem}>
              View plan distribution
              <a className={styles.actionLink} href="/super-admin/plans">Open</a>
            </div>
            <div className={styles.actionItem}>
              Platform analytics overview
              <a className={styles.actionLink} href="/super-admin/analytics">Open</a>
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2 className={styles.panelTitle}>Admin notes</h2>
              <p className={styles.panelSubtitle}>Stay on top of escalations and tasks.</p>
            </div>
          </div>
          <p className={styles.panelSubtitle}>
            Capture high-priority issues, tenant escalations, or manual interventions needed this week.
          </p>
        </section>
      </div>
    </div>
  )
}
