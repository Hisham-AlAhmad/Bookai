import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')

  if (slug !== null) {
    if (!slug) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 })
    }

    const business = await prisma.business.findUnique({ where: { slug } })
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const services = await prisma.service.findMany({
      where: { business_id: business.id, active: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        duration_mins: true,
        price_usd: true,
      },
    })

    return NextResponse.json({ services })
  }

  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const allowedRoles = ['owner', 'manager']
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const services = await prisma.service.findMany({
    where: { business_id: session.user.businessId },
    orderBy: { created_at: 'asc' },
  })

  return NextResponse.json({ services })
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const allowedRoles = ['owner', 'manager']
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { name, description, duration_mins, price_usd } = body

  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  if (!duration_mins || isNaN(Number(duration_mins))) {
    return NextResponse.json({ error: 'Valid duration is required' }, { status: 400 })
  }

  const service = await prisma.service.create({
    data: {
      business_id: session.user.businessId,
      name,
      description: description || null,
      duration_mins: Number(duration_mins),
      price_usd: price_usd ? Number(price_usd) : null,
    },
  })

  return NextResponse.json(service, { status: 201 })
}