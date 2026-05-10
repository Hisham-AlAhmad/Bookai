'use client'

import styles from '@/styles/booking/voice-booking.module.css'

/**
 * VoiceTranscriptBubble
 * Shows the live transcript as the user speaks, or an interim placeholder.
 * Appears above the mic button as a speech bubble.
 */
export default function VoiceTranscriptBubble({ transcript, interimTranscript, state }) {
  const isEmpty = !transcript && !interimTranscript
  const isListening = state === 'listening'
  const isProcessing = state === 'processing'

  if (!isListening && !isProcessing && isEmpty) return null

  return (
    <div className={`${styles.bubble} ${isProcessing ? styles.bubbleProcessing : ''}`} role="status" aria-live="polite">
      {/* Tail */}
      <span className={styles.bubbleTail} aria-hidden="true" />

      <div className={styles.bubbleContent}>
        {isEmpty && isListening ? (
          /* Waiting for speech */
          <span className={styles.bubblePlaceholder}>
            <span className={styles.listeningDots}>
              <span /><span /><span />
            </span>
            <span className={styles.bubblePlaceholderText}>Listening for Arabic or English…</span>
          </span>
        ) : (
          <>
            {/* Confirmed transcript */}
            {transcript && (
              <span className={styles.bubbleText}>{transcript}</span>
            )}
            {/* Interim (live) transcript */}
            {interimTranscript && (
              <span className={styles.bubbleInterim}>{interimTranscript}</span>
            )}
          </>
        )}

        {isProcessing && (
          <span className={styles.bubbleProcessingText}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
              <circle cx="12" cy="12" r="10" strokeOpacity="0.15" />
            </svg>
            Processing your request…
          </span>
        )}
      </div>
    </div>
  )
}