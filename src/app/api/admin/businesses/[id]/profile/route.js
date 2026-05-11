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

function deriveSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

const VALID_CATEGORIES = ['barbershop', 'salon', 'clinic', 'tutor', 'mechanic', 'other']
const VALID_PLANS = ['free', 'starter', 'pro']

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions)
  const guard = requireSuperAdmin(session)
  if (guard) return guard

  const business = await prisma.business.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      city: true,
      address: true,
      phone: true,
      bio: true,
      plan: true,
      active: true,
      created_at: true,
      updated_at: true,
    },
  })

  if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })

  return NextResponse.json({ business })
}

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  const guard = requireSuperAdmin(session)
  if (guard) return guard

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const {
    name,
    category,
    city,
    phone,
    address,
    bio,
    plan,
    active,
  } = body

  if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2)) {
    return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 })
  }

  if (category !== undefined && !VALID_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
  }

  if (plan !== undefined && !VALID_PLANS.includes(plan)) {
    return NextResponse.json({ error: 'Invalid plan selection' }, { status: 400 })
  }

  if (active !== undefined && typeof active !== 'boolean') {
    return NextResponse.json({ error: 'Status must be a boolean' }, { status: 400 })
  }

  if (bio !== undefined && typeof bio === 'string' && bio.length > 300) {
    return NextResponse.json({ error: 'Bio must be 300 characters or fewer' }, { status: 400 })
  }

  const existing = await prisma.business.findUnique({
    where: { id: params.id },
    select: { id: true },
  })

  if (!existing) return NextResponse.json({ error: 'Business not found' }, { status: 404 })

  const data = {}
  if (name !== undefined) data.name = name.trim()
  if (category !== undefined) data.category = category
  if (city !== undefined) data.city = city?.trim() || null
  if (phone !== undefined) data.phone = phone?.trim() || null
  if (address !== undefined) data.address = address?.trim() || null
  if (bio !== undefined) data.bio = bio?.trim() || null
  if (plan !== undefined) data.plan = plan
  if (active !== undefined) data.active = active

  if (name !== undefined) {
    const nextSlug = deriveSlug(name.trim())
    if (!nextSlug) {
      return NextResponse.json({ error: 'Name produces an invalid slug' }, { status: 400 })
    }

    const conflict = await prisma.business.findFirst({
      where: { slug: nextSlug, NOT: { id: params.id } },
      select: { id: true },
    })

    if (conflict) {
      return NextResponse.json(
        { error: 'This business name is already taken. Try adding a unique word.' },
        { status: 409 }
      )
    }

    data.slug = nextSlug
  }

  try {
    const updated = await prisma.business.update({
      where: { id: params.id },
      data,
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        city: true,
        address: true,
        phone: true,
        bio: true,
        plan: true,
        active: true,
        created_at: true,
      },
    })

    return NextResponse.json({ business: updated })
  } catch (err) {
    console.error('[PATCH /api/admin/businesses/[id]/profile]', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
