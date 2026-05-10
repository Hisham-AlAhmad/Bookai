'use client'

import styles from '@/styles/booking/voice-button.module.css'

/**
 * VoiceTranscriptBubble
 *
 * Shows the transcript text in a bubble with a subtle animation.
 * Used while the voice booking flow is active.
 */
export default function VoiceTranscriptBubble({ transcript, state }) {
  if (!transcript && state !== 'listening') return null

  return (
    <div className={`${styles.bubble} ${state === 'listening' ? styles.bubbleListening : ''}`}>
      <span className={styles.bubbleQuote}>"</span>
      <span className={styles.bubbleText}>
        {transcript || <span className={styles.bubblePlaceholder}>Say something like "Book a haircut Friday afternoon"…</span>}
      </span>
      <span className={styles.bubbleQuote}>"</span>
    </div>
  )
}