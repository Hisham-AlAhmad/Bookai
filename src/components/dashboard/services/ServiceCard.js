import { useState, useEffect } from 'react'
import styles from '@/styles/dashboard/services.module.css'

export default function ServiceCard({ service, canManage, onEdit, onToggleActive }) {
  const hours = Math.floor(service.duration_mins / 60)
  const mins = service.duration_mins % 60

  const durationLabel = hours > 0
    ? `${hours}h${mins > 0 ? ` ${mins}m` : ''}`
    : `${mins}m`

  const [staffList, setStaffList] = useState([])
  const [loadingStaff, setLoadingStaff] = useState(true)
  const [toggling, setToggling] = useState({})

  useEffect(() => {
    let mounted = true
    async function fetchStaff() {
      try {
        const res = await fetch('/api/staff')
        if (!res.ok) return
        const data = await res.json()
        if (mounted) setStaffList(data.staff || [])
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoadingStaff(false)
      }
    }
    fetchStaff()
    return () => { mounted = false }
  }, [])

  function isAssigned(member) {
    return member.services?.some((s) => s.service?.id === service.id)
  }

  async function toggleAssign(member) {
    const assigned = isAssigned(member)
    const currentIds = member.services?.map((s) => s.service.id) || []
    const newIds = assigned ? currentIds.filter((id) => id !== service.id) : [...currentIds, service.id]

    setToggling((p) => ({ ...p, [member.id]: true }))
    const res = await fetch(`/api/staff/${member.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service_ids: newIds }),
    })

    if (res.ok) {
      setStaffList((prev) =>
        prev.map((m) =>
          m.id === member.id ? { ...m, services: newIds.map((id) => ({ service: { id } })) } : m
        )
      )
    } else {
      const err = await res.json().catch(() => ({}))
      alert(err.error || 'Failed to update staff assignments')
    }

    setToggling((p) => ({ ...p, [member.id]: false }))
  }

  return (
    <div className={`${styles.card} ${!service.active ? styles.cardInactive : ''}`}>
      <div className={styles.cardTop}>
        <div className={styles.cardIcon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        {!service.active && (
          <span className={styles.inactiveBadge}>Inactive</span>
        )}
      </div>

      <h3 className={styles.cardName}>{service.name}</h3>

      {service.description && (
        <p className={styles.cardDesc}>{service.description}</p>
      )}

      <div className={styles.cardMeta}>
        <span className={styles.metaItem}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 3" strokeLinecap="round" />
          </svg>
          {durationLabel}
        </span>

        {service.price_usd && (
          <span className={styles.metaItem}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 6v2m0 8v2M8.5 10.5A3.5 3.5 0 0112 8.5c1.93 0 3.5 1.12 3.5 2.5S14 13 12 13s-3.5 1.12-3.5 2.5S10.07 18 12 18c1.93 0 3.5-1.12 3.5-2.5" strokeLinecap="round" />
            </svg>
            ${Number(service.price_usd).toFixed(0)}
          </span>
        )}
      </div>

      <div className={styles.cardStaff}>
        <div className={styles.staffHeader}>Staff</div>
        {loadingStaff ? (
          <div className={styles.staffLoading}>Loading...</div>
        ) : staffList.length ? (
          staffList.map((member) => (
            <div key={member.id} className={styles.staffRow}>
              <div className={styles.staffLeft}>
                <div className={styles.staffInfo}>
                  <div className={styles.staffName}>{member.name}</div>
                </div>
              </div>
              {canManage && (
                <button
                  className={isAssigned(member) ? styles.assignedBtn : styles.assignBtn}
                  onClick={() => toggleAssign(member)}
                  disabled={Boolean(toggling[member.id])}
                >
                  {toggling[member.id] ? '...' : isAssigned(member) ? 'Unassign' : 'Assign'}
                </button>
              )}
            </div>
          ))
        ) : (
          <div className={styles.noStaff}>No staff yet.</div>
        )}
      </div>

      {canManage && (
        <div className={styles.cardActions}>
          <button
            className={styles.editCardBtn}
            onClick={() => onEdit(service)}
          >
            Edit
          </button>
          <button
            className={`${styles.toggleCardBtn} ${service.active ? styles.toggleCardDeactivate : styles.toggleCardActivate}`}
            onClick={() => onToggleActive(service)}
          >
            {service.active ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      )}
    </div>
  )
}