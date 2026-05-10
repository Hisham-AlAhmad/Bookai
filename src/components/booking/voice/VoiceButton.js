'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import styles from '@/styles/booking/voice-button.module.css'

/**
 * VoiceButton
 *
 * Floating mic button that captures voice via the Web Speech API.
 * On transcript ready, calls onTranscript(text).
 *
 * Props:
 *   onTranscript(text: string) — called with the final transcript
 *   disabled?: boolean
 *   lang?: string (e.g. 'en-US', 'ar-SA')
 */
function resolveSpeechLang(lang) {
  if (lang) return lang

  if (typeof navigator !== 'undefined') {
    const preferredLanguages = [
      ...(navigator.languages || []),
      navigator.language,
    ].filter(Boolean)

    const arabicOrEnglish = preferredLanguages.find((value) =>
      /^ar(-|$)/i.test(value) || /^en(-|$)/i.test(value)
    )

    if (arabicOrEnglish) return arabicOrEnglish
  }

  return 'en-US'
}

export default function VoiceButton({ onTranscript, disabled = false, lang }) {
  const [state, setState] = useState('idle') // 'idle' | 'listening' | 'processing' | 'error'
  const [errorMsg, setErrorMsg] = useState('')
  const [supported, setSupported] = useState(true)
  const recognitionRef = useRef(null)
  const finalTranscriptRef = useRef('')

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition)

    if (!SpeechRecognition) {
      setSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = resolveSpeechLang(lang)
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setState('listening')
      finalTranscriptRef.current = ''
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
      if (final) finalTranscriptRef.current = final
    }

    recognition.onend = () => {
      const transcript = finalTranscriptRef.current.trim()
      if (transcript) {
        setState('processing')
        onTranscript(transcript)
      } else {
        setState('idle')
      }
    }

    recognition.onerror = (event) => {
      const msg =
        event.error === 'no-speech'
          ? 'No speech detected. Please try again.'
          : event.error === 'not-allowed'
            ? 'Microphone access denied. Please allow microphone permission.'
            : event.error === 'network'
              ? 'Network error during recognition.'
              : `Error: ${event.error}`
      setErrorMsg(msg)
      setState('error')
    }

    recognitionRef.current = recognition

    return () => {
      recognition.abort()
    }
  }, [lang, onTranscript])

  const handleClick = useCallback(() => {
    if (disabled) return

    if (state === 'listening') {
      recognitionRef.current?.stop()
      return
    }

    if (state === 'idle' || state === 'error') {
      setState('idle')
      setErrorMsg('')
      try {
        recognitionRef.current?.start()
      } catch {
        setErrorMsg('Could not start microphone. Please try again.')
        setState('error')
      }
    }
  }, [state, disabled])

  // Allow parent to reset state (e.g. after processing completes)
  useEffect(() => {
    if (disabled === false && state === 'processing') {
      // keep processing state until parent changes something
    }
  }, [disabled, state])

  // Expose reset method via ref or effect
  const resetToIdle = useCallback(() => setState('idle'), [])

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