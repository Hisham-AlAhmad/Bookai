import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getAvailableSlots } from '@/lib/availability'
import prisma from '@/lib/prisma'

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
})

const voiceBookModel = process.env.OPENROUTER_VOICE_BOOK_MODEL || 'openai/gpt-4o-mini'

// ─────────────────────────────────────────────────────────────────────────────
// Date helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the current date as "YYYY-MM-DD" in the LOCAL timezone of the
 * server (or in UTC if TZ env is not set). Using toLocaleDateString with
 * a fixed locale avoids the UTC-shift that toISOString().split('T')[0]
 * introduces when the server clock is in a non-UTC timezone.
 *
 * We use 'en-CA' because it reliably formats as YYYY-MM-DD.
 */
function getLocalDateString(date = new Date()) {
  return date.toLocaleDateString('en-CA') // → "2026-05-10"
}

/**
 * Given a "YYYY-MM-DD" string from the AI, validate it is today or future
 * relative to local time (not UTC). The old code compared against
 * new Date().toISOString().split('T')[0] which is UTC and can be
 * one day behind in UTC+2/+3 timezones.
 */
function isDateInPast(dateStr) {
  const todayStr = getLocalDateString()
  return dateStr < todayStr
}

/**
 * Build a rich "today" context for the AI so it can resolve
 * relative day names ("Friday", "الجمعة", "tomorrow", "next week") correctly.
 *
 * We pass:
 *  - todayISO: the local calendar date (YYYY-MM-DD)
 *  - todayDayName: full English weekday name of today
 *  - tomorrowISO / tomorrowDayName: same for tomorrow
 *  - nextSevenDays: array of { date, dayName } for the coming 7 days
 *
 * This anchors the AI in local calendar reality rather than UTC.
 */
function buildDateContext() {
  const now = new Date()
  const todayISO = getLocalDateString(now)

  // Build a week-ahead map so the AI can pin "Friday" to a real date
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const weekAhead = []
  for (let i = 0; i < 8; i++) {
    const d = new Date(now)
    d.setDate(now.getDate() + i)
    weekAhead.push({
      date: getLocalDateString(d),
      dayName: dayNames[d.getDay()],
    })
  }

  return {
    todayISO,
    todayDayName: dayNames[now.getDay()],
    weekAhead,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Closed-day validation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Checks whether a given date string (YYYY-MM-DD) falls on a day that is
 * marked as closed in the business working_hours table.
 *
 * Returns: { closed: boolean, dayName: string }
 */
async function checkIfDayClosed(businessId, dateStr) {
  // Derive day-of-week: 0=Sunday … 6=Saturday
  // Parse using Date constructor with local date string to avoid UTC shift
  const [year, month, day] = dateStr.split('-').map(Number)
  // new Date(year, month-1, day) → local midnight → correct getDay()
  const localDate = new Date(year, month - 1, day)
  const dayOfWeek = localDate.getDay()

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayName = dayNames[dayOfWeek]

  const workingHours = await prisma.workingHours.findUnique({
    where: {
      business_id_day_of_week: {
        business_id: businessId,
        day_of_week: dayOfWeek,
      },
    },
    select: { is_closed: true },
  })

  // If no row exists → treat as closed (no hours configured)
  const closed = !workingHours || workingHours.is_closed

  return { closed, dayName }
}

// ─────────────────────────────────────────────────────────────────────────────
// Route handler
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/voice-book
 *
 * Public endpoint. Receives a voice transcript + businessId,
 * calls OpenRouter to extract booking intent,
 * validates the date (not past, not closed),
 * and either returns available slots (high confidence) or
 * the parsed intent with a flag for the clarification form (low confidence).
 *
 * Body: { transcript: string, businessId: string }
 * Returns:
 *   - { confidence: 'high', intent, slots, date, service }   — ready to show slots
 *   - { confidence: 'low',  intent, hint? }                  — show clarification form
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

    // ── Fetch available services for this business ──────────────────────────
    const services = await prisma.service.findMany({
      where: { business_id: businessId, active: true },
      select: { id: true, name: true, duration_mins: true, price_usd: true },
    })

    if (!services.length) {
      return NextResponse.json({ error: 'No services available for this business' }, { status: 404 })
    }

    // ── Build date context (local, not UTC) ────────────────────────────────
    const { todayISO, todayDayName, weekAhead } = buildDateContext()

    // ── Build prompt and call OpenRouter ───────────────────────────────────
    //
    // Key improvements over the original:
    //  1. We pass LOCAL today (not UTC toISOString) so relative day names
    //     ("Friday", "الجمعة") resolve to the correct calendar date.
    //  2. We explicitly provide a weekAhead map so the model can pin named
    //     days to exact dates without guessing.
    //  3. We instruct the model to handle Arabic, English, and code-switching.
    //
    const prompt = `You are a booking assistant for a business. Extract structured booking intent from the request below.
Return ONLY valid JSON — no markdown, no explanation, no code fences.

REQUEST: "${transcript.trim()}"

TODAY (local date): ${todayISO} (${todayDayName})

NEXT 8 DAYS — use this table to map day names to exact dates:
${weekAhead.map((d) => `  ${d.dayName}: ${d.date}`).join('\n')}

AVAILABLE SERVICES:
${JSON.stringify(services, null, 2)}

INSTRUCTIONS:
- The request may be in Arabic, English, or mixed (code-switching). Understand both.
- For day names in Arabic (الأحد=Sunday, الاثنين=Monday, الثلاثاء=Tuesday, الأربعاء=Wednesday, الخميس=Thursday, الجمعة=Friday, السبت=Saturday) map them to the exact date from the table above.
- "tomorrow" / "غداً" → use tomorrow's date from the table.
- "today" / "اليوم" → use today's date: ${todayISO}
- If a day name is mentioned (e.g. "Friday", "الجمعة"), ALWAYS pick the next upcoming occurrence from the table above.
- preferredDate MUST be in YYYY-MM-DD format. Never use a past date.
- If the date is ambiguous or unclear, set preferredDate to null and confidence to "low".
- confidence is "high" only when BOTH service AND preferredDate are clearly identified.

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

    // ── Parse the JSON response safely ─────────────────────────────────────
    let intent
    try {
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

    if (!intent || typeof intent !== 'object') {
      return NextResponse.json({ error: 'Invalid intent structure' }, { status: 502 })
    }

    const confidence = intent.confidence === 'high' ? 'high' : 'low'

    // ── Low confidence — return intent for clarification form ───────────────
    if (confidence === 'low') {
      return NextResponse.json({ confidence: 'low', intent })
    }

    // ── High confidence — resolve service ───────────────────────────────────
    const matchedService = intent.service
      ? services.find((s) =>
          s.name.toLowerCase().includes(intent.service.toLowerCase()) ||
          intent.service.toLowerCase().includes(s.name.toLowerCase())
        )
      : null

    if (!matchedService) {
      return NextResponse.json({
        confidence: 'low',
        intent,
        hint: 'Could not match the requested service. Please select one below.',
      })
    }

    // ── Validate date ───────────────────────────────────────────────────────
    const targetDate = intent.preferredDate

    if (!targetDate || !/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
      return NextResponse.json({
        confidence: 'low',
        intent: { ...intent, resolvedServiceId: matchedService.id, resolvedServiceName: matchedService.name },
        hint: 'Please select a date for your appointment.',
      })
    }

    // Check past date using LOCAL comparison (not UTC)
    if (isDateInPast(targetDate)) {
      return NextResponse.json({
        confidence: 'low',
        intent: { ...intent, resolvedServiceId: matchedService.id, resolvedServiceName: matchedService.name },
        hint: 'The requested date is in the past. Please choose a future date.',
      })
    }

    // ── Check if day is closed ──────────────────────────────────────────────
    const { closed, dayName } = await checkIfDayClosed(businessId, targetDate)

    if (closed) {
      // Return low confidence so the clarification form is shown, with a
      // clear, friendly message telling the user that day is unavailable.
      return NextResponse.json({
        confidence: 'low',
        intent: {
          ...intent,
          resolvedServiceId: matchedService.id,
          resolvedServiceName: matchedService.name,
          // Keep preferredDate so the clarification form can pre-fill the service
          // but clear the date so the user must pick a new one.
          preferredDate: null,
        },
        hint: `${dayName} is not available — this business is closed on ${dayName}s. Please choose a different day.`,
      })
    }

    // ── Fetch available slots ───────────────────────────────────────────────
    let slots
    try {
      slots = await getAvailableSlots(businessId, matchedService.id, null, targetDate)
    } catch (err) {
      console.error('[voice-book] getAvailableSlots error:', err)
      return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
    }

    // ── Filter by preferred time range if provided ──────────────────────────
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

      // If time filter eliminates everything, fall back to all slots
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