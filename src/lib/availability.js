import prisma from './prisma'

/**
 * Parse a "HH:MM" string into total minutes from midnight.
 * e.g. "09:30" → 570
 */
function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/**
 * Given a base date (YYYY-MM-DD string or Date) and a minutes-from-midnight
 * offset, return a UTC Date object anchored to local midnight of that date.
 *
 * We store starts_at/ends_at as UTC in MySQL via Prisma. The booking page
 * will always send a local date string, so we construct the Date from the
 * local date parts to avoid timezone drift.
 */
function minutesToDate(dateStr, minutes) {
  // dateStr is expected as "YYYY-MM-DD"
  const [year, month, day] = dateStr.split('-').map(Number)
  // Use UTC constructor so the date isn't shifted by the server's local timezone
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0) + minutes * 60 * 1000)
}

/**
 * getAvailableSlots
 *
 * Returns an array of available time slots for a given business/service/staff/date.
 * Each slot is { starts_at: Date, ends_at: Date }.
 *
 * Steps:
 *  1. Fetch service duration
 *  2. Fetch working hours for the day — return [] if closed
 *  3. Generate all candidate slots (stepping by duration_mins)
 *  4. Fetch conflicting bookings using range-overlap query (uses the index)
 *  5. Filter out conflicts and return
 *
 * @param {string} businessId
 * @param {string} serviceId
 * @param {string|null} staffId  - null means "any available staff" (not yet implemented)
 * @param {string} date          - "YYYY-MM-DD" in local business timezone
 * @returns {Promise<Array<{ starts_at: Date, ends_at: Date }>>}
 */
export async function getAvailableSlots(businessId, serviceId, staffId, date) {
  // ── 1. Fetch service duration ────────────────────────────────────────────
  const service = await prisma.service.findFirst({
    where: { id: serviceId, business_id: businessId, active: true },
    select: { duration_mins: true },
  })

  if (!service) return []

  const { duration_mins } = service

  // ── 2. Fetch working hours for the day ───────────────────────────────────
  // day_of_week: 0 = Sunday, 6 = Saturday — matches JS Date.getUTCDay()
  const [year, month, day] = date.split('-').map(Number)
  const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay()

  const workingHours = await prisma.workingHours.findUnique({
    where: {
      business_id_day_of_week: {
        business_id: businessId,
        day_of_week: dayOfWeek,
      },
    },
  })

  // No row = assume closed; is_closed flag = also closed
  if (!workingHours || workingHours.is_closed) return []

  const openMinutes  = timeToMinutes(workingHours.open_at)
  const closeMinutes = timeToMinutes(workingHours.close_at)

  // ── 3. Generate all candidate slots ─────────────────────────────────────
  // A slot is valid if it starts at openMinutes and its END fits within closeMinutes.
  const candidates = []
  for (let start = openMinutes; start + duration_mins <= closeMinutes; start += duration_mins) {
    candidates.push({
      starts_at: minutesToDate(date, start),
      ends_at:   minutesToDate(date, start + duration_mins),
    })
  }

  if (candidates.length === 0) return []

  // ── 4. Fetch conflicting bookings (range-overlap) ────────────────────────
  // Overlap condition: existing.starts_at < candidateEnd AND existing.ends_at > candidateStart
  // We use the widest possible window (first candidate start → last candidate end)
  // so the single DB query covers everything and Prisma can use the index on
  // (staff_id, starts_at, ends_at).
  const windowStart = candidates[0].starts_at
  const windowEnd   = candidates[candidates.length - 1].ends_at

  const whereClause = {
    business_id: businessId,
    status: { not: 'cancelled' },
    starts_at: { lt: windowEnd },
    ends_at:   { gt: windowStart },
  }

  // If a specific staff member was requested, scope to them only.
  // If staffId is null the caller wants any staff — overlap checking is skipped
  // at the slot level (handled by the booking page showing per-staff availability).
  if (staffId) {
    whereClause.staff_id = staffId
  }

  const existingBookings = await prisma.booking.findMany({
    where: whereClause,
    select: { starts_at: true, ends_at: true },
  })

  // ── 5. Filter out taken slots ────────────────────────────────────────────
  // A candidate is taken if ANY existing booking overlaps with it.
  // Overlap: booking.starts_at < slot.ends_at AND booking.ends_at > slot.starts_at
  const available = candidates.filter((slot) =>
    !existingBookings.some(
      (booking) =>
        booking.starts_at < slot.ends_at &&
        booking.ends_at   > slot.starts_at
    )
  )

  return available
}