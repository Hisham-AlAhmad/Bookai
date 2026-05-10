import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getAvailableSlots } from '@/lib/availability'
import prisma from '@/lib/prisma'

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
})

const voiceBookModel = process.env.OPENROUTER_VOICE_BOOK_MODEL || 'openai/gpt-4o-mini'

/**
 * POST /api/voice-book
 *
 * Public endpoint. Receives a voice transcript + businessId,
 * calls OpenRouter to extract booking intent,
 * and either returns available slots (high confidence) or
 * the parsed intent with a flag for the clarification form (low confidence).
 *
 * Body: { transcript: string, businessId: string }
 * Returns:
 *   - { confidence: 'high', intent, slots } — ready to book
 *   - { confidence: 'low', intent }         — show clarification form
 */
export async function POST(req) {
  try {
    let body
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { transcript, businessId } = body

    if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
      return NextResponse.json({ error: 'transcript is required' }, { status: 400 })
    }

    if (!businessId) {
      return NextResponse.json({ error: 'businessId is required' }, { status: 400 })
    }

    // ── Fetch available services for this business ─────────────────────────
    const services = await prisma.service.findMany({
      where: { business_id: businessId, active: true },
      select: { id: true, name: true, duration_mins: true, price_usd: true },
    })

    if (!services.length) {
      return NextResponse.json({ error: 'No services available for this business' }, { status: 404 })
    }

    // ── Build prompt and call OpenRouter ──────────────────────────────────
    const today = new Date().toISOString()
    const prompt = `You are a booking assistant. Extract structured data from this booking request.
Return ONLY valid JSON, no explanation, no markdown.
Request: "${transcript.trim()}"
Today is: ${today}
Business services available: ${JSON.stringify(services)}
  The transcript may be in Arabic, English, or a mix of both. Preserve the user's intended meaning across code-switching.
Return this exact shape:
{
  "service": string or null,
  "preferredDate": "YYYY-MM-DD" or null,
  "preferredTimeRange": { "from": "HH:MM", "to": "HH:MM" } or null,
  "staffPreference": string or null,
  "confidence": "high" | "low"
}`

    let rawContent
    try {
      const completion = await client.chat.completions.create({
        model: voiceBookModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 300,
      })
      rawContent = completion.choices?.[0]?.message?.content || ''
    } catch (err) {
      console.error('[voice-book] OpenRouter error:', err?.message || err)
      return NextResponse.json(
        { error: 'Failed to process transcript with AI. Please try again.' },
        { status: 502 }
      )
    }

    // ── Parse the JSON response safely ────────────────────────────────────
    let intent
    try {
      // Strip markdown code fences if the model wrapped it anyway
      const cleaned = rawContent
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '')
        .trim()
      intent = JSON.parse(cleaned)
    } catch {
      console.error('[voice-book] Failed to parse model response:', rawContent)
      return NextResponse.json(
        { error: 'AI returned an unexpected format. Please try again.' },
        { status: 502 }
      )
    }

    // ── Validate intent shape ─────────────────────────────────────────────
    if (!intent || typeof intent !== 'object') {
      return NextResponse.json({ error: 'Invalid intent structure' }, { status: 502 })
    }

    // Normalise confidence
    const confidence = intent.confidence === 'high' ? 'high' : 'low'

    // ── Low confidence — return intent for clarification form ─────────────
    if (confidence === 'low') {
      return NextResponse.json({ confidence: 'low', intent })
    }

    // ── High confidence — resolve service and query availability ──────────
    // Match extracted service name to an actual service ID
    const matchedService = intent.service
      ? services.find((s) =>
          s.name.toLowerCase().includes(intent.service.toLowerCase()) ||
          intent.service.toLowerCase().includes(s.name.toLowerCase())
        )
      : null

    if (!matchedService) {
      // Service not matched — fall back to clarification
      return NextResponse.json({
        confidence: 'low',
        intent,
        hint: 'Could not match the requested service. Please select one below.',
      })
    }

    // If we have a preferred date, check slots
    const targetDate = intent.preferredDate
    if (!targetDate || !/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
      // No date — still fall back so user picks one
      return NextResponse.json({
        confidence: 'low',
        intent: { ...intent, resolvedServiceId: matchedService.id, resolvedServiceName: matchedService.name },
        hint: 'Please select a date for your appointment.',
      })
    }

    // Validate date is not in the past
    const todayStr = new Date().toISOString().split('T')[0]
    if (targetDate < todayStr) {
      return NextResponse.json({
        confidence: 'low',
        intent: { ...intent, resolvedServiceId: matchedService.id, resolvedServiceName: matchedService.name },
        hint: 'The requested date is in the past. Please choose a future date.',
      })
    }

    // Fetch available slots for the matched service on the preferred date
    let slots
    try {
      slots = await getAvailableSlots(businessId, matchedService.id, null, targetDate)
    } catch (err) {
      console.error('[voice-book] getAvailableSlots error:', err)
      return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
    }

    // Filter by preferred time range if provided
    let filteredSlots = slots
    if (intent.preferredTimeRange?.from && intent.preferredTimeRange?.to) {
      const [fromH, fromM] = intent.preferredTimeRange.from.split(':').map(Number)
      const [toH, toM] = intent.preferredTimeRange.to.split(':').map(Number)
      const fromMins = fromH * 60 + fromM
      const toMins = toH * 60 + toM

      filteredSlots = slots.filter((slot) => {
        const slotDate = new Date(slot.starts_at)
        const slotMins = slotDate.getUTCHours() * 60 + slotDate.getUTCMinutes()
        return slotMins >= fromMins && slotMins <= toMins
      })

      // If time filter leaves nothing, fall back to all slots
      if (!filteredSlots.length) filteredSlots = slots
    }

    return NextResponse.json({
      confidence: 'high',
      intent: {
        ...intent,
        resolvedServiceId: matchedService.id,
        resolvedServiceName: matchedService.name,
      },
      slots: filteredSlots,
      date: targetDate,
      service: matchedService,
    })
  } catch (err) {
    console.error('[voice-book] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}