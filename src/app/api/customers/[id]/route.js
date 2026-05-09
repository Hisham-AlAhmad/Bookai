import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

/**
 * PATCH /api/customers/[id]
 * Supports incrementing or decrementing no_show_count.
 * Body: { increment_no_show: true } or { decrement_no_show: true }
 */
export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = params

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { increment_no_show, decrement_no_show } = body

  if (!increment_no_show && !decrement_no_show) {
    return NextResponse.json({ error: 'No valid update field provided' }, { status: 400 })
  }

  const delta = increment_no_show ? 1 : -1

  // Verify this customer has at least one booking with this business (scoped access)
  const bookingForBusiness = await prisma.booking.findFirst({
    where: { customer_id: id, business_id: session.user.businessId },
    select: { id: true },
  })

  if (!bookingForBusiness) {
    return NextResponse.json({ error: 'Customer not found for this business' }, { status: 404 })
  }

  const customer = await prisma.customer.update({
    where: { id },
    data: {
      no_show_count: { increment: delta },
    },
    select: {
      id: true,
      name: true,
      phone: true,
      no_show_count: true,
      preferred_language: true,
      last_seen: true,
    },
  })

  return NextResponse.json({ customer })
}

/**
 * GET /api/customers/[id]
 * Returns customer details + booking history for this business.
 */
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = params

  const customer = await prisma.customer.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      phone: true,
      no_show_count: true,
      preferred_language: true,
      last_seen: true,
      created_at: true,
    },
  })

  if (!customer) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const bookingCount = await prisma.booking.count({
    where: { customer_id: id, business_id: session.user.businessId },
  })

  const noShowCount = await prisma.booking.count({
    where: { customer_id: id, business_id: session.user.businessId, status: 'no_show' },
  })

  return NextResponse.json({ customer, bookingCount, noShowCount })
}