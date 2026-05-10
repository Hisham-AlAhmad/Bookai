import prisma from '@/lib/prisma'
import HomeNav from '@/components/home/HomeNav'
import BusinessGrid from '@/components/home/BusinessGrid'
import HomeHero from '@/components/home/HomeHero'
import styles from '@/styles/home/home.module.css'

export const metadata = {
  title: 'Bookai — Smart Booking for Businesses',
  description: 'Discover and book appointments with the best businesses near you. Barbershops, salons, clinics, tutors, and more.',
}

async function getBusinesses(page = 1, limit = 12) {
  const where = { active: true }

  const [businesses, total] = await Promise.all([
    prisma.business.findMany({
      where,
      select: {
        slug: true,
        name: true,
        category: true,
        city: true,
        logo_url: true,
        bio: true,
      },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.business.count({ where }),
  ])

  return { businesses, total }
}

async function getCities() {
  const rows = await prisma.business.findMany({
    where: { active: true },
    select: { city: true },
  })
  return [...new Set(rows.map((r) => r.city).filter(Boolean))].sort()
}

export default async function HomePage({ searchParams }) {
  const page = Math.max(1, parseInt(searchParams?.page || '1', 10))
  const limit = Math.max(6, Math.min(24, parseInt(searchParams?.limit || '12', 10)))

  const { businesses, total } = await getBusinesses(page, limit)
  const cities = await getCities()
  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className={styles.page}>
      <HomeNav />
      <HomeHero totalCount={total} />
      <main className={styles.main}>
        <BusinessGrid
          businesses={businesses}
          cities={cities}
          page={page}
          totalPages={totalPages}
          limit={limit}
        />
      </main>
      <footer className={styles.footer}>
        <p className={styles.footerText}>
          © {new Date().getFullYear()} Bookai · Smart booking for businesses
        </p>
      </footer>
    </div>
  )
}