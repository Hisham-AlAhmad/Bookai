import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const allowedRoles = ['owner', 'manager']
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const staff = await prisma.staff.findMany({
    where: { business_id: session.user.businessId },
    include: {
      services: {
        include: { service: { select: { id: true, name: true } } },
      },
    },
    orderBy: { created_at: 'asc' },
  })

  return NextResponse.json(staff)
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const allowedRoles = ['owner', 'manager']
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { name, phone, bio, can_login, email, password, role, service_ids } = body

  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  let password_hash = null
  if (can_login && password) {
    password_hash = await bcrypt.hash(password, 10)
  }

  const member = await prisma.staff.create({
    data: {
      business_id: session.user.businessId,
      name,
      phone: phone || null,
      bio: bio || null,
      can_login: Boolean(can_login),
      email: can_login && email ? email : null,
      password_hash,
      role: role || 'staff',
      services: service_ids?.length
        ? { create: service_ids.map((id) => ({ service_id: id })) }
        : undefined,
    },
  })

  return NextResponse.json(member, { status: 201 })
}