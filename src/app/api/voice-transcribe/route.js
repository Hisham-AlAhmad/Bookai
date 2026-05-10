import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req) {
  try {
    console.log('[voice-transcribe] Request received')
    
    const apiKey = process.env.OPENROUTER_API_KEY?.trim().replace(/^['"]|['"]$/g, '')
    console.log('[voice-transcribe] API key check:', !!apiKey)

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Voice transcription is not configured. Set OPENROUTER_API_KEY in your environment.' },
        { status: 503 }
      )
    }

    console.log('[voice-transcribe] Parsing form data...')
    let formData
    try {
      formData = await req.formData()
      console.log('[voice-transcribe] Form data parsed successfully')
    } catch (err) {
      console.error('[voice-transcribe] FormData parse error:', err)
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
    }

    const audioFile = formData.get('file')
    console.log('[voice-transcribe] Audio file check:', !!audioFile, 'Type:', audioFile?.type)

    if (!(audioFile instanceof File)) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 })
    }

    if (!audioFile.size) {
      return NextResponse.json({ error: 'file is empty' }, { status: 400 })
    }

    console.log('Audio type:', audioFile.type)
    console.log('Audio size:', audioFile.size)

    // Convert File to Buffer for proper FormData handling
    const arrayBuffer = await audioFile.arrayBuffer()
    console.log('[voice-transcribe] Converted to buffer:', arrayBuffer.byteLength)

    const buffer = Buffer.from(arrayBuffer)
    const fileName = audioFile.name || `voice-${Date.now()}.webm`

    // Create a proper File object from the Buffer for multipart compatibility
    const fileForUpload = new File([buffer], fileName, { type: audioFile.type || 'audio/webm' })

    const transcriptionForm = new FormData()
    transcriptionForm.append('file', fileForUpload)
    transcriptionForm.append('model', 'whisper-1')

    console.log('[voice-transcribe] Sending to OpenRouter...')
    const aiRes = await fetch('https://openrouter.ai/api/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXTAUTH_URL || 'https://bookai.app',
        'X-Title': 'Bookai Voice Transcription',
      },
      body: transcriptionForm,
    })

    console.log('[voice-transcribe] OpenRouter response status:', aiRes.status)

    const responseText = await aiRes.text()

    if (!aiRes.ok) {
      console.error('[voice-transcribe] OpenRouter error:', aiRes.status, responseText)
      return NextResponse.json(
        { error: 'Could not transcribe the recording right now. Please try again.' },
        { status: 502 }
      )
    }

    let parsed
    try {
      parsed = JSON.parse(responseText)
    } catch {
      parsed = { text: responseText }
    }

    const transcript = (parsed.text || '').trim()

    if (!transcript) {
      return NextResponse.json({ error: 'No speech was detected in the recording.' }, { status: 422 })
    }

    console.log('[voice-transcribe] Success! Transcript length:', transcript.length)
    return NextResponse.json({ transcript })
  } catch (err) {
    console.error('[voice-transcribe] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error. Check server logs.' },
      { status: 500 }
    )
  }
}