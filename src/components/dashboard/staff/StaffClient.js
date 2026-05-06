'use client'

import { useEffect, useRef, useState } from 'react'
import StaffTable from './StaffTable'
import StaffSlideOver from './StaffSlideOver'
import styles from '@/styles/dashboard/staff.module.css'

export default function StaffClient({ initialStaff, services, role, currentUserId }) {
  const [staff, setStaff] = useState(initialStaff)
  const [slideOverOpen, setSlideOverOpen] = useState(false)
  const [slideOverClosing, setSlideOverClosing] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const closeTimerRef = useRef(null)
  const CLOSE_DURATION_MS = 250

  const canManage = ['owner', 'manager'].includes(role)
  const isOwner = role === 'owner'

  function openAdd() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    setEditingMember(null)
    setSlideOverClosing(false)
    setSlideOverOpen(true)
  }

  function openEdit(member) {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    setEditingMember(member)
    setSlideOverClosing(false)
    setSlideOverOpen(true)
  }

  function closeSlideOver() {
    if (slideOverClosing) return
    setSlideOverClosing(true)
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    closeTimerRef.current = setTimeout(() => {
      setSlideOverOpen(false)
      setSlideOverClosing(false)
      closeTimerRef.current = null
    }, CLOSE_DURATION_MS)
  }

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  async function handleToggleActive(member) {
    const res = await fetch(`/api/staff/${member.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !member.active }),
    })
    if (res.ok) {
      setStaff((prev) =>
        prev.map((s) => (s.id === member.id ? { ...s, active: !s.active } : s))
      )
    }
  }

  function handleSaved(saved, isEdit) {
    if (isEdit) {
      setStaff((prev) => prev.map((s) => (s.id === saved.id ? { ...s, ...saved } : s)))
    } else {
      setStaff((prev) => [...prev, { ...saved, services: [] }])
    }
    closeSlideOver()
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Staff</h1>
          <p className={styles.subtitle}>
            {staff.filter((s) => s.active).length} active ·{' '}
            {staff.filter((s) => !s.active).length} inactive
          </p>
        </div>
        {canManage && (
          <button className={styles.addBtn} onClick={openAdd}>
            + Add Staff
          </button>
        )}
      </div>

      <StaffTable
        staff={staff}
        canManage={canManage}
        onEdit={openEdit}
        onToggleActive={handleToggleActive}
        currentUserId={currentUserId}
        isOwner={isOwner}
      />

      {slideOverOpen && (
        <StaffSlideOver
          member={editingMember}
          services={services}
          onClose={closeSlideOver}
          onSaved={handleSaved}
          isClosing={slideOverClosing}
          currentUserId={currentUserId}
          isOwner={isOwner}
        />
      )}
    </div>
  )
}