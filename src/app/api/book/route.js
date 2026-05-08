import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAvailableSlots } from '@/lib/availability'

export async function POST(req) {
  try {
    const body = await req.json()
    const {
      businessId,
      serviceId,
      staffId,
      starts_at,
      ends_at,
      customerName,
      customerPhone,
      customerNote,
      booked_via,
    } = body

    // ── Validate required fields ──────────────────────
    if (!businessId || !serviceId || !starts_at || !ends_at || !customerName || !customerPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // ── Validate business exists and is active ────────
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, active: true, name: true, phone: true },
    })

    if (!business || !business.active) {
      return NextResponse.json({ error: 'Business not found or inactive' }, { status: 404 })
    }

    // ── Resolve staff — if null, pick first available ─
    let resolvedStaffId = staffId

    if (!resolvedStaffId) {
      const anyStaff = await prisma.staffService.findFirst({
        where: { service_id: serviceId },
        include: { staff: { select: { id: true, active: true } } },
      })
      if (!anyStaff || !anyStaff.staff.active) {
        return NextResponse.json({ error: 'No staff available for this service' }, { status: 409 })
      }
      resolvedStaffId = anyStaff.staff_id
    }

    // ── Race condition: re-check slot availability ────
    const startsAt = new Date(starts_at)
    const endsAt = new Date(ends_at)
    const dateStr = startsAt.toISOString().split('T')[0]

    const conflict = await prisma.booking.findFirst({
      where: {
        staff_id: resolvedStaffId,
        status: { not: 'cancelled' },
        starts_at: { lt: endsAt },
        ends_at: { gt: startsAt },
      },
    })

    if (conflict) {
      // Slot was taken — return 3 nearest alternatives
      const slots = await getAvailableSlots(businessId, serviceId, resolvedStaffId, dateStr)
      const alternatives = slots.slice(0, 3)
      return NextResponse.json(
        { error: 'Slot no longer available', alternatives },
        { status: 409 }
      )
    }

    // ── Upsert customer by phone ──────────────────────
    const customer = await prisma.customer.upsert({
      where: { phone: customerPhone },
      update: { last_seen: new Date(), name: customerName },
      create: {
        name: customerName,
        phone: customerPhone,
        preferred_language: 'ar',
        last_seen: new Date(),
      },
    })

    // ── Create the booking ────────────────────────────
    const booking = await prisma.booking.create({
      data: {
        business_id: businessId,
        customer_id: customer.id,
        staff_id: resolvedStaffId,
        service_id: serviceId,
        starts_at: startsAt,
        ends_at: endsAt,
        status: 'pending',
        booked_via: booked_via || 'form',
        customer_note: customerNote || null,
        reminder_sent: 'no',
      },
      include: {
        service: { select: { name: true } },
        staff: { select: { name: true } },
        customer: { select: { name: true, phone: true } },
      },
    })

    return NextResponse.json({ booking }, { status: 201 })

  } catch (err) {
    console.error('[POST /api/book]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}