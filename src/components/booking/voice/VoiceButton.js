'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import styles from '@/styles/booking/voice-button.module.css'

/**
 * VoiceButton
 *
 * Floating mic button that captures voice via the Web Speech API.
 * On transcript ready, calls onTranscript(text).
 *
 * Supports Arabic (ar-LB, ar-SA, ar) and English (en-US, en-GB, en).
 * When lang is not explicitly provided, it auto-detects from browser
 * preferences and picks the best supported locale.
 *
 * Props:
 *   onTranscript(text: string) — called with the final transcript
 *   disabled?: boolean
 *   lang?: string (e.g. 'en-US', 'ar-SA') — overrides auto-detection
 */

// Map common Arabic locale codes to the best SpeechRecognition locale
const ARABIC_LOCALES = ['ar-SA', 'ar-LB', 'ar-EG', 'ar-AE', 'ar-JO', 'ar']

/**
 * Resolves the best speech recognition language.
 * Priority:
 *  1. Explicit lang prop
 *  2. First Arabic or English browser language preference
 *  3. Falls back to 'ar-SA' if browser is Arabic, else 'en-US'
 *
 * Using 'ar-SA' works broadly across Arabic dialects in the Web Speech API.
 */
function resolveSpeechLang(lang) {
  if (lang) return lang

  if (typeof navigator === 'undefined') return 'ar-SA'

  const preferredLanguages = [
    ...(navigator.languages || []),
    navigator.language,
  ].filter(Boolean)

  for (const pref of preferredLanguages) {
    const lower = pref.toLowerCase()
    // Arabic: use ar-SA which has the broadest dialect coverage in WebSpeech
    if (lower.startsWith('ar')) return 'ar-SA'
    // English variants — keep as-is
    if (lower.startsWith('en')) return pref
  }

  // Default: Arabic-first since the project targets Lebanese/MENA businesses
  return 'ar-SA'
}

export default function VoiceButton({ onTranscript, disabled = false, lang }) {
  const [state, setState] = useState('idle') // 'idle' | 'listening' | 'processing' | 'error'
  const [errorMsg, setErrorMsg] = useState('')
  const [supported, setSupported] = useState(true)
  const recognitionRef = useRef(null)
  const finalTranscriptRef = useRef('')
  // Keep track of interim so we can display it as the user speaks
  const interimRef = useRef('')

  const resolvedLang = resolveSpeechLang(lang)

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition)

    if (!SpeechRecognition) {
      setSupported(false)
      return
    }

    const recognition = new SpeechRecognition()

    // ── Language configuration ────────────────────────────────────────────
    recognition.lang = resolvedLang
    // continuous: false gives us a clean single utterance per tap
    recognition.continuous = false
    // interimResults: true lets us show live feedback while the user speaks
    recognition.interimResults = true
    // maxAlternatives: keep 1 for determinism
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setState('listening')
      finalTranscriptRef.current = ''
      interimRef.current = ''
      setErrorMsg('')
    }

    recognition.onresult = (event) => {
      let interim = ''
      let final = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          final += result[0].transcript
        } else {
          interim += result[0].transcript
        }
      }

      if (final) {
        // Append to any previously finalized text (in case of multiple final events)
        finalTranscriptRef.current = (finalTranscriptRef.current + ' ' + final).trim()
      }
      interimRef.current = interim
    }

    recognition.onend = () => {
      const transcript = finalTranscriptRef.current.trim()
      if (transcript) {
        setState('processing')
        onTranscript(transcript)
      } else {
        // Nothing was captured — go back to idle so user can retry
        setState('idle')
      }
    }

    recognition.onerror = (event) => {
      let msg
      switch (event.error) {
        case 'no-speech':
          msg = 'No speech detected. Please try again.'
          break
        case 'not-allowed':
        case 'permission-denied':
          msg = 'Microphone access denied. Please allow microphone permission.'
          break
        case 'network':
          msg = 'Network error during recognition. Please check your connection.'
          break
        case 'audio-capture':
          msg = 'No microphone found. Please connect a microphone.'
          break
        case 'aborted':
          // User or code aborted — silent, go back to idle
          setState('idle')
          return
        default:
          msg = `Recognition error: ${event.error}. Please try again.`
      }
      setErrorMsg(msg)
      setState('error')
    }

    recognitionRef.current = recognition

    return () => {
      try {
        recognition.abort()
      } catch {
        // ignore abort errors on cleanup
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedLang]) // re-init when language changes

  // Separately update the onTranscript callback ref to avoid stale closures
  // without reinitialising the recognition engine
  const onTranscriptRef = useRef(onTranscript)
  useEffect(() => {
    onTranscriptRef.current = onTranscript
  }, [onTranscript])

  const handleClick = useCallback(() => {
    if (disabled) return

    if (state === 'listening') {
      // Tap again to stop — triggers onend which processes the transcript
      try {
        recognitionRef.current?.stop()
      } catch {
        setState('idle')
      }
      return
    }

    if (state === 'idle' || state === 'error') {
      setState('idle')
      setErrorMsg('')
      finalTranscriptRef.current = ''
      interimRef.current = ''
      try {
        recognitionRef.current?.start()
      } catch (err) {
        setErrorMsg('Could not start microphone. Please try again.')
        setState('error')
      }
    }
  }, [state, disabled])

  if (!supported) return null

  return (
    <div className={styles.wrapper}>
      <button
        className={`${styles.btn} ${styles[`btn_${state}`]}`}
        onClick={handleClick}
        disabled={disabled || state === 'processing'}
        aria-label={
          state === 'listening'
            ? 'Stop recording'
            : state === 'processing'
              ? 'Processing...'
              : 'Book with voice'
        }
        title={
          state === 'listening'
            ? 'Tap to stop'
            : state === 'processing'
              ? 'Processing your request...'
              : 'Book with voice'
        }
      >
        {/* Pulse rings for listening state */}
        {state === 'listening' && (
          <>
            <span className={styles.ring1} />
            <span className={styles.ring2} />
          </>
        )}

        {/* Icon */}
        <span className={styles.icon}>
          {state === 'processing' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" strokeDasharray="56" strokeDashoffset="14" />
            </svg>
          ) : state === 'error' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="2" width="6" height="12" rx="3" />
              <path d="M5 10a7 7 0 0 0 14 0M12 19v3M9 22h6" strokeLinecap="round" />
            </svg>
          )}
        </span>

        {/* Label */}
        <span className={styles.label}>
          {state === 'listening'
            ? 'Listening…'
            : state === 'processing'
              ? 'Processing…'
              : state === 'error'
                ? 'Try again'
                : 'Book with voice'}
        </span>
      </button>

      {errorMsg && (
        <div className={styles.error} role="alert">
          {errorMsg}
        </div>
      )}
    </div>
  )
}