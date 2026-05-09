import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * Derives a URL-safe slug from a business name.
 * "Tony's Barber Shop!" → "tonys-barber-shop"
 */
function deriveSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')                    // decompose accented chars
    .replace(/[\u0300-\u036f]/g, '')     // strip accent marks
    .replace(/[^a-z0-9\s-]/g, '')       // strip special chars
    .trim()
    .replace(/\s+/g, '-')               // spaces → hyphens
    .replace(/-+/g, '-')                // collapse multiple hyphens
    .slice(0, 80)                        // enforce DB varchar(80)
}

function isDataUrl(value) {
  return typeof value === 'string' && value.startsWith('data:')
}

// GET /api/settings
// Returns the full business row for the session's business.
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  if (session.user.role !== 'owner') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const business = await prisma.business.findUnique({
    where: { id: session.user.businessId },
    select: {
      id: true,
      name: true,
      slug: true,
      logo_url: true,
      cover_url: true,
      phone: true,
      address: true,
      city: true,
      category: true,
      bio: true,
      plan: true,
    },
  })

  if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })

  return NextResponse.json({ business })
}

// PATCH /api/settings
// Updates name, slug (auto-derived), category, city, phone, address, bio.
// Validates slug uniqueness before saving.
export async function PATCH(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  if (session.user.role !== 'owner') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name, category, city, phone, address, bio, logo_url, cover_url } = body

  const VALID_CATEGORIES = ['barbershop', 'salon', 'clinic', 'tutor', 'mechanic', 'other']

  if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2)) {
    return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 })
  }

  if (category !== undefined && !VALID_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
  }

  if (bio !== undefined && typeof bio === 'string' && bio.length > 300) {
    return NextResponse.json({ error: 'Bio must be 300 characters or fewer' }, { status: 400 })
  }

  if (logo_url !== undefined && isDataUrl(logo_url)) {
    return NextResponse.json({ error: 'Logo must be a file URL, not a base64 string' }, { status: 400 })
  }

  if (cover_url !== undefined && isDataUrl(cover_url)) {
    return NextResponse.json({ error: 'Cover must be a file URL, not a base64 string' }, { status: 400 })
  }

  const businessId = session.user.businessId

  // Build the update payload — only include fields that were sent
  const data = {}
  if (name      !== undefined) data.name    = name.trim()
  if (category  !== undefined) data.category = category
  if (city      !== undefined) data.city     = city?.trim() || null
  if (phone     !== undefined) data.phone    = phone?.trim() || null
  if (address   !== undefined) data.address  = address?.trim() || null
  if (bio       !== undefined) data.bio      = bio?.trim() || null
  if (logo_url  !== undefined) data.logo_url  = logo_url || null
  if (cover_url !== undefined) data.cover_url = cover_url || null

  // Auto-derive slug from name if name is being updated
  if (name !== undefined) {
    const newSlug = deriveSlug(name.trim())

    if (!newSlug) {
      return NextResponse.json({ error: 'Name produces an invalid slug' }, { status: 400 })
    }

    // Check uniqueness — exclude the current business from the check
    const conflict = await prisma.business.findFirst({
      where: { slug: newSlug, NOT: { id: businessId } },
      select: { id: true },
    })

    if (conflict) {
      return NextResponse.json(
        { error: 'This business name is already taken. Try adding your city or a unique word.' },
        { status: 409 }
      )
    }

    data.slug = newSlug
  }

  try {
    const updated = await prisma.business.update({
      where: { id: businessId },
      data,
      select: {
        id: true,
        name: true,
        slug: true,
        logo_url: true,
        cover_url: true,
        phone: true,
        address: true,
        city: true,
        category: true,
        bio: true,
        plan: true,
      },
    })

    return NextResponse.json({ business: updated })
  } catch (err) {
    console.error('[PATCH /api/settings]', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}