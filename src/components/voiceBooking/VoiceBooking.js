'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import VoiceMicButton from './VoiceMicButton'
import VoiceTranscriptBubble from './VoiceTranscriptBubble'
import VoiceResultCard from './VoiceResultCard'
import VoiceClarificationForm from './VoiceClarificationForm'
import styles from '@/styles/booking/voice-booking.module.css'

const SILENCE_TIMEOUT_MS = 2500
const SILENCE_VOLUME_THRESHOLD = 8

export default function VoiceBooking({ businessId }) {
  const [supported, setSupported] = useState(false)
  const [voiceState, setVoiceState] = useState('idle')
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [textFallback, setTextFallback] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)

  const mediaRecorderRef = useRef(null)
  const mediaStreamRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const mediaSourceRef = useRef(null)
  const rafRef = useRef(null)
  const audioChunksRef = useRef([])
  const hasSpeechRef = useRef(false)
  const silenceStartedAtRef = useRef(null)
  const shouldSubmitOnStopRef = useRef(false)
  const stoppingRef = useRef(false)
  const errorLockedRef = useRef(false)

  async function readJsonResponse(res) {
    const contentType = res.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      return res.json()
    }

    const text = await res.text()

    try {
      return JSON.parse(text)
    } catch {
      return { error: text || 'Unexpected response from the server.' }
    }
  }

  useEffect(() => {
    const canRecord =
      typeof window !== 'undefined' &&
      !!navigator.mediaDevices?.getUserMedia &&
      typeof window.MediaRecorder !== 'undefined'
    setSupported(canRecord)
  }, [])

  useEffect(() => {
    return () => {
      stopRecording({ submit: false, abort: true })
    }
  }, [])

  useEffect(() => {
    if (voiceState === 'error') {
      setPanelOpen(true)
    }
  }, [voiceState])

  function cleanupRecordingResources() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    if (analyserRef.current) {
      analyserRef.current.disconnect()
      analyserRef.current = null
    }

    if (mediaSourceRef.current) {
      mediaSourceRef.current.disconnect()
      mediaSourceRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }

    mediaRecorderRef.current = null
  }

  function resetRecordingState() {
    audioChunksRef.current = []
    hasSpeechRef.current = false
    silenceStartedAtRef.current = null
    shouldSubmitOnStopRef.current = false
    stoppingRef.current = false
  }

  function enterVoiceError(message) {
    errorLockedRef.current = true
    setError(message)
    setVoiceState('error')
    setPanelOpen(true)
    stopRecording({ submit: false, abort: true })
  }

  const sendTranscript = useCallback(async (text) => {
    if (errorLockedRef.current) return

    if (!text.trim()) {
      setVoiceState('idle')
      setPanelOpen(false)
      return
    }

    setVoiceState('processing')
    setInterimTranscript('')

    try {
      const res = await fetch('/api/voice-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text, businessId }),
      })

      const data = await readJsonResponse(res)

      if (!res.ok) throw new Error(data.error || 'Could not understand the request.')

      setResult({ ...data, rawTranscript: text })

      if (data.confidence === 'high') {
        setVoiceState('result')
      } else {
        setVoiceState('clarify')
      }
    } catch (err) {
      enterVoiceError(err.message || 'Something went wrong. Please try again.')
    }
  }, [businessId])

  async function transcribeRecording(audioBlob) {
    if (!audioBlob || audioBlob.size === 0) {
      setVoiceState('idle')
      setPanelOpen(false)
      return
    }

    setVoiceState('processing')
    setInterimTranscript('')

    try {
      const formData = new FormData()
      formData.append('file', audioBlob, `voice-${Date.now()}.webm`)

      const res = await fetch('/api/voice-transcribe', {
        method: 'POST',
        body: formData,
      })

      const data = await readJsonResponse(res)

      if (!res.ok) throw new Error(data.error || 'Could not transcribe the recording.')

      const text = (data.transcript || '').trim()
      if (!text) throw new Error('No speech was detected in the recording.')

      setTranscript(text)
      await sendTranscript(text)
    } catch (err) {
      enterVoiceError(err.message || 'Could not transcribe the recording.')
    } finally {
      cleanupRecordingResources()
    }
  }

  function getSupportedMimeType() {
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
    ]

    for (const candidate of candidates) {
      if (window.MediaRecorder?.isTypeSupported?.(candidate)) {
        return candidate
      }
    }

    return ''
  }

  async function startRecording() {
    if (!supported) return

    errorLockedRef.current = false
    setError('')
    setResult(null)
    setTranscript('')
    setInterimTranscript('')
    setTextFallback('')
    setPanelOpen(true)
    setVoiceState('listening')

    resetRecordingState()

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream

      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      const audioContext = new AudioContextClass()
      audioContextRef.current = audioContext

      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 2048
      analyserRef.current = analyser

      const source = audioContext.createMediaStreamSource(stream)
      mediaSourceRef.current = source
      source.connect(analyser)

      const mimeType = getSupportedMimeType()
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)

      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      recorder.onerror = () => {
        if (!errorLockedRef.current) {
          enterVoiceError('Could not record audio. Please check your microphone permissions.')
        }
      }

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeType || audioChunksRef.current[0]?.type || 'audio/webm',
        })

        const shouldSubmit = shouldSubmitOnStopRef.current
        cleanupRecordingResources()

        if (!shouldSubmit) {
          if (!errorLockedRef.current) {
            setVoiceState('idle')
            setPanelOpen(false)
          }
          return
        }

        await transcribeRecording(audioBlob)
      }

      recorder.start()

      const samples = new Uint8Array(analyser.frequencyBinCount)

      const monitorSilence = () => {
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') {
          return
        }

        analyser.getByteTimeDomainData(samples)

        let sumSquares = 0
        for (let index = 0; index < samples.length; index += 1) {
          const normalized = (samples[index] - 128) / 128
          sumSquares += normalized * normalized
        }

        const rms = Math.sqrt(sumSquares / samples.length)
        const volume = rms * 100

        if (volume > SILENCE_VOLUME_THRESHOLD) {
          hasSpeechRef.current = true
          silenceStartedAtRef.current = null
        } else if (hasSpeechRef.current) {
          if (!silenceStartedAtRef.current) {
            silenceStartedAtRef.current = performance.now()
          } else if (performance.now() - silenceStartedAtRef.current >= SILENCE_TIMEOUT_MS) {
            stopRecording({ submit: true })
            return
          }
        }

        rafRef.current = requestAnimationFrame(monitorSilence)
      }

      rafRef.current = requestAnimationFrame(monitorSilence)
    } catch (err) {
      cleanupRecordingResources()
      enterVoiceError('Could not access the microphone. Please check browser permissions.')
    }
  }

  function stopRecording({ submit = true, abort = false } = {}) {
    if (stoppingRef.current) return
    stoppingRef.current = true

    shouldSubmitOnStopRef.current = submit

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        if (abort && mediaRecorderRef.current.abort) {
          mediaRecorderRef.current.abort()
        } else {
          mediaRecorderRef.current.stop()
        }
      } catch (_) {
        cleanupRecordingResources()
      }
      return
    }

    cleanupRecordingResources()
    stoppingRef.current = false
  }

  function handleMicClick() {
    if (voiceState === 'listening') {
      stopRecording({ submit: true })
      return
    }

    if (voiceState === 'idle' || voiceState === 'error' || voiceState === 'result' || voiceState === 'clarify') {
      startRecording()
    }
  }

  function handleRetry() {
    errorLockedRef.current = false
    setVoiceState('idle')
    setTranscript('')
    setInterimTranscript('')
    setResult(null)
    setError('')
    setTextFallback('')
    setTimeout(() => startRecording(), 100)
  }

  async function handleTextFallbackSubmit() {
    if (!textFallback.trim()) return
    await sendTranscript(textFallback.trim())
    setTextFallback('')
  }

  async function handleConfirm(parsedResult) {
    setBookingLoading(true)
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          serviceId: parsedResult.serviceId,
          staffId: parsedResult.staffId || null,
          starts_at: parsedResult.starts_at,
          ends_at: parsedResult.ends_at,
          customerName: parsedResult.name || 'Voice Booking',
          customerPhone: parsedResult.phone || '',
          customerNote: parsedResult.rawTranscript || '',
          booked_via: 'voice',
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Booking failed.')
      }

      setVoiceState('success')
    } catch (err) {
      setError(err.message)
      setVoiceState('clarify')
    } finally {
      setBookingLoading(false)
    }
  }

  function handleClose() {
    errorLockedRef.current = false
    stopRecording({ submit: false, abort: true })
    setPanelOpen(false)
    setVoiceState('idle')
    setTranscript('')
    setInterimTranscript('')
    setResult(null)
    setError('')
    setTextFallback('')
  }

  if (!supported) return null

  const showPanel = panelOpen && voiceState !== 'idle'

  return (
    <div className={styles.voiceRoot}>
      {showPanel && <div className={styles.voiceBackdrop} onClick={handleClose} aria-hidden="true" />}

      {showPanel && (
        <div className={styles.voicePanel} role="region" aria-label="Voice booking">
          <button className={styles.voicePanelClose} onClick={handleClose} aria-label="Close voice booking">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>

          {(voiceState === 'listening' || voiceState === 'processing') && (
            <VoiceTranscriptBubble
              transcript={transcript}
              interimTranscript={interimTranscript}
              state={voiceState}
            />
          )}

          {voiceState === 'result' && result && (
            <VoiceResultCard
              result={result}
              onConfirm={handleConfirm}
              onRetry={handleRetry}
              loading={bookingLoading}
            />
          )}

          {voiceState === 'clarify' && (
            <VoiceClarificationForm
              result={result}
              onSubmit={handleConfirm}
              onRetry={handleRetry}
              loading={bookingLoading}
            />
          )}

          {voiceState === 'error' && (
            <div className={styles.errorCard}>
              <div className={styles.errorIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                </svg>
              </div>
              <p className={styles.errorMessage}>{error}</p>

              <div className={styles.textFallback}>
                <input
                  type="text"
                  placeholder="Or type your request here..."
                  value={textFallback}
                  onChange={(e) => setTextFallback(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTextFallbackSubmit()}
                  className={styles.textInput}
                />
                <button
                  className={styles.textSubmitBtn}
                  onClick={handleTextFallbackSubmit}
                  disabled={!textFallback.trim()}
                >
                  Submit
                </button>
              </div>

              <button className={styles.errorRetryBtn} onClick={handleRetry}>
                Try again
              </button>
            </div>
          )}

          {voiceState === 'success' && (
            <div className={styles.successCard}>
              <div className={styles.successIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" />
                  <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className={styles.successTitle}>Booking confirmed!</h3>
              <p className={styles.successSub}>
                You'll receive an SMS reminder 1 hour before your appointment.
              </p>
              <button className={styles.errorRetryBtn} onClick={handleClose}>
                Done
              </button>
            </div>
          )}
        </div>
      )}

      <div className={styles.voiceFab}>
        {voiceState === 'listening' && !panelOpen && (
          <VoiceTranscriptBubble
            transcript={transcript}
            interimTranscript={interimTranscript}
            state={voiceState}
          />
        )}

        <VoiceMicButton
          state={voiceState}
          onClick={handleMicClick}
          disabled={voiceState === 'processing'}
        />
      </div>
    </div>
  )
}
