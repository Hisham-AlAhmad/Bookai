import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * POST /api/voice-book
 *
 * Public endpoint. Accepts a raw voice transcript, sends it to OpenRouter
 * for structured intent extraction, and returns a parsed booking object.
 *
 * Body:   { transcript: string, businessId: string }
 * Returns: {
 *   confidence: 'high' | 'low',
 *   service:    string | null,
 *   serviceId:  string | null,
 *   staff:      string | null,
 *   staffId:    string | null,
 *   date:       string | null,   // human-readable, e.g. "Friday 16 May"
 *   time:       string | null,   // human-readable, e.g. "3:00 PM"
 *   starts_at:  string | null,   // ISO datetime
 *   ends_at:    string | null,   // ISO datetime
 *   name:       string | null,
 *   phone:      string | null,
 * }
 */
export async function POST(req) {
  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { transcript, businessId } = body

  if (!transcript || typeof transcript !== 'string' || transcript.trim().length < 2) {
    return NextResponse.json({ error: 'transcript is required' }, { status: 400 })
  }

  if (!businessId) {
    return NextResponse.json({ error: 'businessId is required' }, { status: 400 })
  }

  // ── Fetch business context for the AI prompt ─────────────────
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: {
      name: true,
      category: true,
      services: {
        where: { active: true },
        select: { id: true, name: true, duration_mins: true },
      },
      staff: {
        where: { active: true },
        select: { id: true, name: true },
      },
    },
  })

  if (!business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  const serviceList = business.services
    .map((s) => `${s.name} (${s.duration_mins} min, id: ${s.id})`)
    .join(', ')

  const staffList = business.staff
    .map((st) => `${st.name} (id: ${st.id})`)
    .join(', ')

  const today = new Date()
  const todayStr = today.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // ── System prompt ─────────────────────────────────────────────
  const systemPrompt = `You are a booking assistant for "${business.name}" (${business.category}).
Today is ${todayStr}.

Available services: ${serviceList || 'none specified'}
Available staff: ${staffList || 'none specified'}

The user will say something in Arabic or English to book an appointment.
Extract the booking intent and return ONLY valid JSON matching this schema:
{
  "confidence": "high" | "low",
  "service": "service name" | null,
  "serviceId": "service-uuid" | null,
  "staff": "staff name" | null,
  "staffId": "staff-uuid" | null,
  "date": "human-readable date string" | null,
  "time": "human-readable time string" | null,
  "starts_at": "ISO 8601 datetime" | null,
  "ends_at": "ISO 8601 datetime" | null,
  "name": "customer name" | null,
  "phone": "phone number" | null
}

Rules:
- confidence = "high" when you can identify at least a service AND a date/time
- confidence = "low" when key details are missing or ambiguous
- Match services and staff to the exact IDs provided above when possible
- For starts_at and ends_at: calculate based on service duration, use current year if only month/day given
- Return ONLY JSON, no explanation or markdown fences`

  // ── Call OpenRouter ───────────────────────────────────────────
  const apiKey = process.env.OPENROUTER_API_KEY?.trim().replace(/^['"]|['"]$/g, '')
  const hasValidKey = apiKey && apiKey !== 'your-key' && apiKey.length > 20
  if (!hasValidKey) {
    console.error('[voice-book] Missing OPENROUTER_API_KEY')
    return NextResponse.json(
      { error: 'Voice booking is not configured. Set a real OPENROUTER_API_KEY in your environment.' },
      { status: 503 }
    )
  }

  // Log a masked version of the key so we can verify the server loaded it (no full key in logs)
  try {
    const masked = apiKey.slice(0, 6) + '…' + apiKey.slice(-4)
    console.info('[voice-book] OPENROUTER_API_KEY loaded, prefix:', masked)
  } catch (e) {
    console.info('[voice-book] OPENROUTER_API_KEY present')
  }

  let parsed
  try {
    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXTAUTH_URL || 'https://bookai.app',
        'X-Title': 'Bookai Voice Booking',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: transcript.trim() },
        ],
        temperature: 0.1,
        max_tokens: 400,
        response_format: { type: 'json_object' },
      }),
    })

    if (!aiRes.ok) {
      const errText = await aiRes.text()
      console.error('[voice-book] OpenRouter error:', aiRes.status, errText)
      if (aiRes.status === 401) {
        return NextResponse.json(
          { error: 'OpenRouter authentication failed (check OPENROUTER_API_KEY).' },
          { status: 502 }
        )
      }
      return NextResponse.json(
        { error: 'Could not process your request. Please try again.' },
        { status: 502 }
      )
    }

    const aiData = await aiRes.json()
    const content = aiData.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json({ error: 'Empty AI response.' }, { status: 502 })
    }

    // Strip any accidental markdown fences before parsing
    const cleaned = content.replace(/```json|```/g, '').trim()
    parsed = JSON.parse(cleaned)
  } catch (err) {
    console.error('[voice-book] Parse/fetch error:', err)
    return NextResponse.json(
      { error: 'Failed to understand your request. Please try again.' },
      { status: 500 }
    )
  }

  // ── Validate and return ───────────────────────────────────────
  return NextResponse.json({
    confidence: parsed.confidence === 'high' ? 'high' : 'low',
    service:    parsed.service    || null,
    serviceId:  parsed.serviceId  || null,
    staff:      parsed.staff      || null,
    staffId:    parsed.staffId    || null,
    date:       parsed.date       || null,
    time:       parsed.time       || null,
    starts_at:  parsed.starts_at  || null,
    ends_at:    parsed.ends_at    || null,
    name:       parsed.name       || null,
    phone:      parsed.phone      || null,
  })
}