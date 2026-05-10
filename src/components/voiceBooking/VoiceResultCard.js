'use client'

import styles from '@/styles/booking/voice-booking.module.css'

/**
 * VoiceResultCard
 * Shown when the AI parsed a high-confidence booking intent.
 * Displays the parsed booking details and a confirm button.
 */
export default function VoiceResultCard({ result, onConfirm, onRetry, loading }) {
  const { service, staff, date, time, rawTranscript } = result

  return (
    <div className={styles.resultCard} role="dialog" aria-label="Voice booking confirmation">
      {/* Header */}
      <div className={styles.resultHeader}>
        <div className={styles.resultIconWrap}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 10a7 7 0 0 0 14 0M12 19v3M9 22h6" />
          </svg>
        </div>
        <div>
          <h3 className={styles.resultTitle}>We heard you!</h3>
          <p className={styles.resultSub}>Here's what we understood</p>
        </div>
      </div>

      {/* Transcript echo */}
      {rawTranscript && (
        <div className={styles.resultTranscript}>
          <span className={styles.resultTranscriptIcon} aria-hidden="true">"</span>
          <p className={styles.resultTranscriptText}>{rawTranscript}</p>
        </div>
      )}

      {/* Parsed booking details */}
      <div className={styles.resultDetails}>
        {service && (
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Service</span>
            <span className={styles.resultValue}>{service}</span>
          </div>
        )}
        {staff && (
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Staff</span>
            <span className={styles.resultValue}>{staff}</span>
          </div>
        )}
        {date && (
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Date</span>
            <span className={styles.resultValue}>{date}</span>
          </div>
        )}
        {time && (
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Time</span>
            <span className={styles.resultValue}>{time}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className={styles.resultActions}>
        <button
          className={styles.resultRetryBtn}
          onClick={onRetry}
          disabled={loading}
          type="button"
        >
          Try again
        </button>
        <button
          className={styles.resultConfirmBtn}
          onClick={() => onConfirm(result)}
          disabled={loading}
          type="button"
        >
          {loading ? (
            <>
              <svg className={styles.processingSpinner} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
              </svg>
              Booking…
            </>
          ) : (
            <>
              Confirm booking
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  )
}