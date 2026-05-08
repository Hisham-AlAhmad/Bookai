import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import BookingFlow from '@/components/booking/BookingFlow'
import styles from '@/styles/booking/public-page.module.css'

async function getBusiness(slug) {
  const business = await prisma.business.findUnique({
    where: { slug },
    include: {
      working_hours: true,
    },
  })
  return business
}

export async function generateMetadata({ params }) {
  const business = await getBusiness(params.slug)
  if (!business) return { title: 'Not Found' }
  return {
    title: `Book at ${business.name}`,
    description: business.bio || `Book an appointment at ${business.name}`,
  }
}

export default async function PublicBookingPage({ params }) {
  const business = await getBusiness(params.slug)

  if (!business) notFound()
  if (!business.active) {
    return (
      <div className={styles.unavailable}>
        <div className={styles.unavailableCard}>
          <div className={styles.unavailableIcon}>⊘</div>
          <h1>Business Unavailable</h1>
          <p>This business is not currently accepting bookings.</p>
        </div>
      </div>
    )
  }

  const categoryLabels = {
    barbershop: 'Barbershop',
    salon: 'Salon',
    clinic: 'Clinic',
    tutor: 'Tutor',
    mechanic: 'Mechanic',
    other: 'Business',
  }

  return (
    <div className={styles.page}>

      {/* ── Hero Header ── */}
      <div className={styles.hero}>
        <div
          className={styles.heroCover}
          style={{
            backgroundImage: business.cover_url
              ? `url(${business.cover_url})`
              : undefined,
          }}
        >
          <div className={styles.heroOverlay} />
        </div>

        <div className={styles.heroContent}>
          {/* Logo */}
          <div className={styles.logoWrap}>
            {business.logo_url ? (
              <img
                src={business.logo_url}
                alt={business.name}
                className={styles.logo}
              />
            ) : (
              <div className={styles.logoFallback}>
                {business.name[0].toUpperCase()}
              </div>
            )}
          </div>

          {/* Business info */}
          <div className={styles.heroInfo}>
            <span className={styles.categoryBadge}>
              {categoryLabels[business.category] || 'Business'}
            </span>
            <h1 className={styles.businessName}>{business.name}</h1>
            <div className={styles.heroPills}>
              {business.city && (
                <span className={styles.pill}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                  {business.city}
                </span>
              )}
              {business.phone && (
                <span className={styles.pill}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z" />
                  </svg>
                  {business.phone}
                </span>
              )}
            </div>
            {business.bio && (
              <p className={styles.bio}>{business.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Booking Flow ── */}
      <div className={styles.bookingSection}>
        <BookingFlow
          businessSlug={business.slug}
          businessId={business.id}
          workingHours={business.working_hours}
        />
      </div>

    </div>
  )
}