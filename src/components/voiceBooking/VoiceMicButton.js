'use client'

import styles from '@/styles/booking/voice-booking.module.css'

/**
 * VoiceMicButton
 * Floating action button that triggers voice recording.
 * Handles idle, listening, and processing visual states.
 */
export default function VoiceMicButton({ state, onClick, disabled }) {
  const isListening = state === 'listening'
  const isProcessing = state === 'processing'

  return (
    <button
      className={`
        ${styles.micBtn}
        ${isListening ? styles.micBtnListening : ''}
        ${isProcessing ? styles.micBtnProcessing : ''}
      `}
      onClick={onClick}
      disabled={disabled || isProcessing}
      aria-label={
        isListening
          ? 'Stop listening'
          : isProcessing
          ? 'Processing your request…'
          : 'Book by voice'
      }
      title={
        isListening
          ? 'Tap to stop'
          : isProcessing
          ? 'Processing…'
          : 'Book by voice'
      }
    >
      {/* Pulse rings — only visible while listening */}
      {isListening && (
        <>
          <span className={`${styles.pulseRing} ${styles.pulseRing1}`} aria-hidden="true" />
          <span className={`${styles.pulseRing} ${styles.pulseRing2}`} aria-hidden="true" />
          <span className={`${styles.pulseRing} ${styles.pulseRing3}`} aria-hidden="true" />
        </>
      )}

      {/* Icon */}
      <span className={styles.micBtnInner}>
        {isProcessing ? (
          <svg
            className={styles.processingSpinner}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
          </svg>
        ) : isListening ? (
          /* Stop square icon while listening */
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          /* Mic icon while idle */
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 10a7 7 0 0 0 14 0M12 19v3M9 22h6" />
          </svg>
        )}
      </span>

      {/* Label */}
      <span className={styles.micBtnLabel}>
        {isListening ? 'Listening…' : isProcessing ? 'Processing…' : 'Book by voice'}
      </span>
    </button>
  )
}