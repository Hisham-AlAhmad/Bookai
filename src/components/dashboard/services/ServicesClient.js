'use client'

import { useState } from 'react'
import ServiceCard from './ServiceCard'
import ServiceModal from './ServiceModal'
import styles from '@/styles/dashboard/services.module.css'

export default function ServicesClient({ initialServices, role }) {
  const [services, setServices] = useState(initialServices)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingService, setEditingService] = useState(null)

  const canManage = ['owner', 'manager'].includes(role)
  const activeCount = services.filter((s) => s.active).length

  function openAdd() {
    setEditingService(null)
    setModalOpen(true)
  }

  function openEdit(service) {
    setEditingService(service)
    setModalOpen(true)
  }

  async function handleToggleActive(service) {
    const res = await fetch(`/api/services/${service.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !service.active }),
    })
    if (res.ok) {
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, active: !s.active } : s))
      )
    }
  }

  function handleSaved(saved, isEdit) {
    if (isEdit) {
      setServices((prev) => prev.map((s) => (s.id === saved.id ? saved : s)))
    } else {
      setServices((prev) => [...prev, saved])
    }
    setModalOpen(false)
  }

  const active = services.filter((s) => s.active)
  const inactive = services.filter((s) => !s.active)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Services</h1>
          <p className={styles.subtitle}>
            {activeCount} active · {services.length - activeCount} inactive
          </p>
        </div>
        {canManage && (
          <button className={styles.addBtn} onClick={openAdd}>
            + Add Service
          </button>
        )}
      </div>

      {services.length === 0 ? (
        <div className={styles.empty}>
          <p>No services yet. Add your first service to start accepting bookings.</p>
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            {active.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                canManage={canManage}
                onEdit={openEdit}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>

          {inactive.length > 0 && (
            <>
              <div className={styles.sectionLabel}>Inactive services</div>
              <div className={styles.grid}>
                {inactive.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    canManage={canManage}
                    onEdit={openEdit}
                    onToggleActive={handleToggleActive}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {modalOpen && (
        <ServiceModal
          service={editingService}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}