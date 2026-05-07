import { NextResponse } from 'next/server'
import { getAvailableSlots } from '@/lib/availability'

/**
 * POST /api/availability
 *
 * Public endpoint — no session required. Called by the booking page
 * when a customer selects a service/staff/date to see available time slots.
 *
 * Body: { businessId, serviceId, staffId, date }
 *   - staffId is optional (pass null for "no preference")
 *   - date is "YYYY-MM-DD"
 *
 * Returns: { slots: [{ starts_at, ends_at }, …] }
 */
export async function POST(req) {
  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { businessId, serviceId, staffId = null, date } = body

  // Basic input validation
  if (!businessId || !serviceId || !date) {
    return NextResponse.json(
      { error: 'businessId, serviceId, and date are required' },
      { status: 400 }
    )
  }

  // Validate date format — must be YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: 'date must be in YYYY-MM-DD format' },
      { status: 400 }
    )
  }

  // Reject dates in the past (compare against today UTC)
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  if (date < todayStr) {
    return NextResponse.json(
      { error: 'date cannot be in the past' },
      { status: 400 }
    )
  }

  try {
    const slots = await getAvailableSlots(businessId, serviceId, staffId, date)
    return NextResponse.json({ slots })
  } catch (err) {
    console.error('[POST /api/availability]', err)
    return NextResponse.json({ error: 'Failed to compute availability' }, { status: 500 })
  }
}