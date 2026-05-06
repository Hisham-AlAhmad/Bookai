import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import StatCard from '@/components/dashboard/StatCard'
import RecentBookings from '@/components/dashboard/RecentBookings'
import styles from '@/styles/dashboard/overview.module.css'

async function getStats(businessId) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(todayStart.getTime() + 86400000)

  const [
    totalThisMonth,
    todayCount,
    noShowCount,
    voiceCount,
    staffCount,
    serviceCount,
    recentBookings,
  ] = await Promise.all([
    prisma.booking.count({
      where: { business_id: businessId, created_at: { gte: startOfMonth } },
    }),
    prisma.booking.count({
      where: {
        business_id: businessId,
        starts_at: { gte: todayStart, lt: todayEnd },
        status: { not: 'cancelled' },
      },
    }),
    prisma.booking.count({
      where: { business_id: businessId, status: 'no_show', created_at: { gte: startOfMonth } },
    }),
    prisma.booking.count({
      where: { business_id: businessId, booked_via: 'voice', created_at: { gte: startOfMonth } },
    }),
    prisma.staff.count({
      where: { business_id: businessId, active: true },
    }),
    prisma.service.count({
      where: { business_id: businessId, active: true },
    }),
    prisma.booking.findMany({
      where: { business_id: businessId },
      orderBy: { created_at: 'desc' },
      take: 6,
      include: {
        customer: { select: { name: true, phone: true } },
        service: { select: { name: true, price_usd: true } },
        staff: { select: { name: true } },
      },
    }),
  ])

  const noShowRate = totalThisMonth > 0
    ? Math.round((noShowCount / totalThisMonth) * 100)
    : 0

  const voicePct = totalThisMonth > 0
    ? Math.round((voiceCount / totalThisMonth) * 100)
    : 0

  return {
    totalThisMonth,
    todayCount,
    noShowRate,
    voicePct,
    staffCount,
    serviceCount,
    recentBookings,
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const stats = await getStats(session.user.businessId)

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <p className={styles.greeting}>{greeting()},</p>
          <h1 className={styles.name}>{session.user.name}</h1>
        </div>
        <div className={styles.headerMeta}>
          <span className={styles.dateBadge}>
            {new Date().toLocaleDateString('en-GB', {
              weekday: 'long', day: 'numeric', month: 'long'
            })}
          </span>
        </div>
      </div>

      {/* KPI stat cards */}
      <div className={styles.statsGrid}>
        <StatCard
          label="Bookings this month"
          value={stats.totalThisMonth}
          icon="calendar"
          accent="#c8a96e"
        />
        <StatCard
          label="Today's appointments"
          value={stats.todayCount}
          icon="clock"
          accent="#6e9ecf"
        />
        <StatCard
          label="No-show rate"
          value={`${stats.noShowRate}%`}
          icon="alert"
          accent="#cf6e6e"
        />
        <StatCard
          label="Voice bookings"
          value={`${stats.voicePct}%`}
          icon="mic"
          accent="#6ecf9e"
        />
        <StatCard
          label="Active staff"
          value={stats.staffCount}
          icon="staff"
          accent="#a96ec8"
        />
        <StatCard
          label="Active services"
          value={stats.serviceCount}
          icon="layers"
          accent="#c8a96e"
        />
      </div>

      {/* Recent bookings */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Bookings</h2>
          <a href="/dashboard/bookings" className={styles.sectionLink}>
            View all →
          </a>
        </div>
        <RecentBookings bookings={stats.recentBookings} />
      </div>

    </div>
  )
}