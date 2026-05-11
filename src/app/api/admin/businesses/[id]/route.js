import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

function requireSuperAdmin(session) {
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  if (session.user.role !== 'superadmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return null
}

/**
 * PATCH /api/admin/businesses/[id]
 * Toggle active status (suspend / reactivate).
 * Body: { active: boolean }
 */
export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  const guard = requireSuperAdmin(session)
  if (guard) return guard

  const { id } = params

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { active } = body
  if (typeof active !== 'boolean') {
    return NextResponse.json({ error: '`active` must be a boolean' }, { status: 400 })
  }

  const existing = await prisma.business.findUnique({
    where: { id },
    select: { id: true },
  })
  if (!existing) return NextResponse.json({ error: 'Business not found' }, { status: 404 })

  const updated = await prisma.business.update({
    where: { id },
    data: { active },
    select: { id: true, name: true, active: true, slug: true },
  })

  return NextResponse.json({ business: updated })
}

/**
 * DELETE /api/admin/businesses/[id]
 * Hard-delete the business and all related data (cascade in JS since
 * MySQL FK constraints use RESTRICT by default in this schema).
 * Deletion order: bookings → staffServices → staff → services →
 *                 workingHours → business
 */
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  const guard = requireSuperAdmin(session)
  if (guard) return guard

  const { id } = params

  const existing = await prisma.business.findUnique({
    where: { id },
    select: { id: true },
  })
  if (!existing) return NextResponse.json({ error: 'Business not found' }, { status: 404 })

  await prisma.$transaction(async (tx) => {
    // 1. Delete all bookings for this business
    await tx.booking.deleteMany({ where: { business_id: id } })

    // 2. Delete staffService pivot rows (they reference staff which references business)
    const staffIds = await tx.staff
      .findMany({ where: { business_id: id }, select: { id: true } })
      .then((rows) => rows.map((r) => r.id))

    if (staffIds.length) {
      await tx.staffService.deleteMany({ where: { staff_id: { in: staffIds } } })
    }

    // 3. Delete services (staffService rows referencing services are gone)
    await tx.service.deleteMany({ where: { business_id: id } })

    // 4. Delete staff
    await tx.staff.deleteMany({ where: { business_id: id } })

    // 5. Delete working hours
    await tx.workingHours.deleteMany({ where: { business_id: id } })

    // 6. Finally delete the business itself
    await tx.business.delete({ where: { id } })
  })

  return NextResponse.json({ success: true })
}