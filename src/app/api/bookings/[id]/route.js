import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

/**
 * PATCH /api/bookings/[id]
 * Updates booking status. Allowed statuses: confirmed, cancelled, no_show, pending
 * Body: { status, cancelled_by?, cancellation_reason? }
 */
export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = params

  const existing = await prisma.booking.findFirst({
    where: { id, business_id: session.user.businessId },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { status, cancelled_by, cancellation_reason } = body

  const VALID_STATUSES = ['pending', 'confirmed', 'cancelled', 'no_show']
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const data = { status }
  const customerNoShowDelta =
    existing.status !== 'no_show' && status === 'no_show'
      ? 1
      : existing.status === 'no_show' && status !== 'no_show'
        ? -1
        : 0

  if (status === 'cancelled') {
    if (cancelled_by && ['customer', 'business'].includes(cancelled_by)) {
      data.cancelled_by = cancelled_by
    } else {
      data.cancelled_by = 'business'
    }
    if (cancellation_reason) data.cancellation_reason = cancellation_reason
  } else {
    // Clear cancellation fields when un-cancelling
    data.cancelled_by = null
    data.cancellation_reason = null
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id },
      data,
    })

    if (customerNoShowDelta !== 0) {
      const customer = await tx.customer.findUnique({
        where: { id: existing.customer_id },
        select: { no_show_count: true },
      })

      if (customer) {
        await tx.customer.update({
          where: { id: existing.customer_id },
          data: {
            no_show_count: Math.max(0, customer.no_show_count + customerNoShowDelta),
          },
        })
      }
    }

    return tx.booking.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, phone: true, no_show_count: true } },
        service: { select: { id: true, name: true, duration_mins: true, price_usd: true } },
        staff: { select: { id: true, name: true } },
      },
    })
  })

  return NextResponse.json({ booking: updated })
}

/**
 * DELETE /api/bookings/[id]
 * Soft-delete: marks booking as cancelled with reason "deleted_by_staff".
 * Preserves audit trail while freeing the time slot.
 */
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const allowedRoles = ['owner', 'manager']
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = params

  const existing = await prisma.booking.findFirst({
    where: { id, business_id: session.user.businessId },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Soft-delete: mark cancelled rather than hard delete (preserves history)
  await prisma.booking.update({
    where: { id },
    data: {
      status: 'cancelled',
      cancelled_by: 'business',
      cancellation_reason: 'Deleted by staff',
    },
  })

  return NextResponse.json({ success: true })
}