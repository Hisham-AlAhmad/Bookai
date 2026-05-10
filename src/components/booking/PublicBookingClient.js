"use client"

import { useState, useCallback } from 'react'
import BookingFlow from './BookingFlow'
import VoiceBookingTrigger from './voice/VoiceBookingTrigger'

export default function PublicBookingClient({ businessSlug, businessId, workingHours, services = [] }) {
  const [externalSelection, setExternalSelection] = useState(null)

  const handleSlotSelected = useCallback((slot, intent) => {
    setExternalSelection({ slot, intent })
    // also dispatch a window event for components that listen globally
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('voice-slot-selected', { detail: { slot, intent } }))
    }
  }, [])

  return (
    <>
      <div style={{ position: 'relative' }}>
        <BookingFlow
          businessSlug={businessSlug}
          businessId={businessId}
          workingHours={workingHours}
          services={services}
          externalSlotSelection={externalSelection}
        />
      </div>

      <VoiceBookingTrigger
        businessId={businessId}
        services={services}
        onSlotSelected={handleSlotSelected}
      />
    </>
  )
}
