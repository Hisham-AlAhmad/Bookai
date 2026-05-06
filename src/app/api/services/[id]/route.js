import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
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

  const existing = await prisma.service.findFirst({
    where: { id, business_id: session.user.businessId },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { name, description, duration_mins, price_usd, active } = body

  const updateData = {}
  if (name !== undefined) updateData.name = name
  if (description !== undefined) updateData.description = description || null
  if (duration_mins !== undefined) updateData.duration_mins = Number(duration_mins)
  if (price_usd !== undefined) updateData.price_usd = price_usd ? Number(price_usd) : null
  if (active !== undefined) updateData.active = Boolean(active)

  const updated = await prisma.service.update({ where: { id }, data: updateData })
  return NextResponse.json(updated)
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (session.user.role !== 'owner') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = params

  const existing = await prisma.service.findFirst({
    where: { id, business_id: session.user.businessId },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Soft-delete
  await prisma.service.update({ where: { id }, data: { active: false } })
  return NextResponse.json({ success: true })
}