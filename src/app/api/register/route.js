import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

/**
 * Derives a URL-safe slug from a business name.
 * "Tony's Barber Shop!" → "tonys-barber-shop"
 * Must be kept in sync with the same function in /api/settings.
 */
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

/**
 * POST /api/register
 *
 * Creates a new Business + owner Staff record in a single Prisma transaction.
 *
 * Body:
 *   plan         - 'free' | 'starter' | 'pro'
 *   business     - { name, category, city, address, bio, phone }
 *   logoUrl      - string | null
 *   coverUrl     - string | null
 *   owner        - { name, email, password }
 */
export async function POST(req) {
  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { plan, business, logoUrl, coverUrl, owner } = body

  // ── Validate plan ────────────────────────────────────────────────────────
  if (!VALID_PLANS.includes(plan)) {
    return NextResponse.json({ error: 'Invalid plan selected.' }, { status: 400 })
  }

  // ── Validate business fields ─────────────────────────────────────────────
  if (!business?.name || typeof business.name !== 'string' || business.name.trim().length < 2) {
    return NextResponse.json({ error: 'Business name must be at least 2 characters.' }, { status: 400 })
  }

  if (!VALID_CATEGORIES.includes(business.category)) {
    return NextResponse.json({ error: 'Invalid business category.' }, { status: 400 })
  }

  if (business.bio && business.bio.length > 300) {
    return NextResponse.json({ error: 'Bio must be 300 characters or fewer.' }, { status: 400 })
  }

  // ── Validate owner fields ────────────────────────────────────────────────
  if (!owner?.name || typeof owner.name !== 'string' || owner.name.trim().length < 2) {
    return NextResponse.json({ error: 'Owner name must be at least 2 characters.' }, { status: 400 })
  }

  if (!owner?.email || typeof owner.email !== 'string') {
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(owner.email)) {
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
  }

  if (!owner?.password || owner.password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
  }

  // ── Check email uniqueness ───────────────────────────────────────────────
  const existingStaff = await prisma.staff.findUnique({
    where: { email: owner.email.toLowerCase() },
    select: { id: true },
  })

  if (existingStaff) {
    return NextResponse.json(
      { error: 'This email is already registered. Try signing in instead.' },
      { status: 409 }
    )
  }

  // ── Derive and validate slug ─────────────────────────────────────────────
  const slug = deriveSlug(business.name.trim())

  if (!slug) {
    return NextResponse.json(
      { error: 'Business name produces an invalid URL slug. Please use letters or numbers.' },
      { status: 400 }
    )
  }

  const slugConflict = await prisma.business.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (slugConflict) {
    return NextResponse.json(
      {
        error: `The URL "bookai.app/${slug}" is already taken. Try adding your city or a unique word to your business name.`,
      },
      { status: 409 }
    )
  }

  // ── Hash password ────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash(owner.password, 10)

  // ── Create Business + owner Staff in a transaction ───────────────────────
  try {
    const result = await prisma.$transaction(async (tx) => {
      const newBusiness = await tx.business.create({
        data: {
          slug,
          name: business.name.trim(),
          category: business.category,
          city: business.city?.trim() || null,
          address: business.address?.trim() || null,
          bio: business.bio?.trim() || null,
          phone: business.phone?.trim() || null,
          logo_url: logoUrl || null,
          cover_url: coverUrl || null,
          plan,
          active: true,
        },
      })

      const newOwner = await tx.staff.create({
        data: {
          business_id: newBusiness.id,
          name: owner.name.trim(),
          email: owner.email.toLowerCase().trim(),
          password_hash: passwordHash,
          role: 'owner',
          can_login: true,
          active: true,
        },
      })

      return { business: newBusiness, owner: newOwner }
    })

    return NextResponse.json(
      {
        success: true,
        businessSlug: result.business.slug,
        ownerId: result.owner.id,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('[POST /api/register]', err)

    // Handle rare race condition on slug uniqueness
    if (err.code === 'P2002') {
      return NextResponse.json(
        {
          error: `The URL "bookai.app/${slug}" was just taken. Try adding your city or a unique word.`,
        },
        { status: 409 }
      )
    }

    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 })
  }
}