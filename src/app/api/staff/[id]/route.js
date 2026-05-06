import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const allowedRoles = ['owner', 'manager']
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = params
  const body = await req.json()

  // Ensure the staff member belongs to this business
  const existing = await prisma.staff.findFirst({
    where: { id, business_id: session.user.businessId },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { name, phone, bio, can_login, email, password, role, active, service_ids } = body

  if (
    session.user.role === 'owner' &&
    existing.id === session.user.id &&
    (active === false || can_login === false)
  ) {
    return NextResponse.json(
      { error: 'Owner account must remain active with dashboard access.' },
      { status: 403 }
    )
  }

  const updateData = {}
  if (name !== undefined) updateData.name = name
  if (phone !== undefined) updateData.phone = phone || null
  if (bio !== undefined) updateData.bio = bio || null
  if (active !== undefined) updateData.active = Boolean(active)
  if (can_login !== undefined) updateData.can_login = Boolean(can_login)
  if (email !== undefined) updateData.email = email || null
  if (role !== undefined) updateData.role = role
  if (password) {
    updateData.password_hash = await bcrypt.hash(password, 10)
  }

  // Handle service assignments if provided
  if (service_ids !== undefined) {
    await prisma.staffService.deleteMany({ where: { staff_id: id } })
    if (service_ids.length) {
      await prisma.staffService.createMany({
        data: service_ids.map((sid) => ({ staff_id: id, service_id: sid })),
      })
    }
  }

  const updated = await prisma.staff.update({
    where: { id },
    data: updateData,
  })

  return NextResponse.json(updated)
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (session.user.role !== 'owner') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = params

  const existing = await prisma.staff.findFirst({
    where: { id, business_id: session.user.businessId },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Soft-delete: deactivate instead of hard delete (preserves booking history)
  await prisma.staff.update({ where: { id }, data: { active: false } })

  return NextResponse.json({ success: true })
}