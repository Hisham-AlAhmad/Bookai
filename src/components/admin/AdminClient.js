'use client'

import { useRef, useState } from 'react'
import AdminStatsStrip from './stats/AdminStatsStrip'
import AdminTable from './table/AdminTable'
import AdminDetailPanel from './detail/AdminDetailPanel'
import ConfirmationModal from '@/components/shared/ConfirmationModal'
import styles from '@/styles/admin/admin.module.css'

export default function AdminClient({ initialData }) {
  const [businesses, setBusinesses] = useState(initialData.businesses)
  const [stats, setStats] = useState(initialData.stats)
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [detailClosing, setDetailClosing] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [confirmError, setConfirmError] = useState('')
  const [confirmSuccess, setConfirmSuccess] = useState('')
  const successTimer = useRef(null)

  // ── Suspend / Reactivate ──────────────────────────────────────────────────
  function handleToggleActive(business) {
    openConfirm(business.active ? 'suspend' : 'reactivate', business)
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  function handleDelete(business) {
    openConfirm('delete', business)
  }

  function openConfirm(type, business) {
    if (successTimer.current) {
      clearTimeout(successTimer.current)
      successTimer.current = null
    }
    setConfirmError('')
    setConfirmSuccess('')
    setConfirmAction({ type, business })
  }

  function closeConfirm() {
    if (confirmLoading) return
    if (successTimer.current) {
      clearTimeout(successTimer.current)
      successTimer.current = null
    }
    setConfirmAction(null)
    setConfirmError('')
    setConfirmSuccess('')
  }

  async function runConfirmedAction() {
    if (!confirmAction || confirmLoading) return
    setConfirmLoading(true)
    setConfirmError('')
    setConfirmSuccess('')

    const { type, business } = confirmAction
    const copy = getConfirmCopy(type, business)

    try {
      if (type === 'delete') {
        const res = await fetch(`/api/admin/businesses/${business.id}`, {
          method: 'DELETE',
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Failed to delete business.')

        setBusinesses((prev) => prev.filter((b) => b.id !== business.id))
        setStats((prev) => ({
          ...prev,
          totalBusinesses: prev.totalBusinesses - 1,
          totalActive: business.active ? prev.totalActive - 1 : prev.totalActive,
        }))

        if (selectedBusiness?.id === business.id) {
          closeDetail()
        }
      } else {
        const nextActive = type === 'reactivate'
        const res = await fetch(`/api/admin/businesses/${business.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ active: nextActive }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Failed to update status.')

        setBusinesses((prev) =>
          prev.map((b) => (b.id === business.id ? { ...b, active: nextActive } : b))
        )

        setStats((prev) => ({
          ...prev,
          totalActive: nextActive ? prev.totalActive + 1 : prev.totalActive - 1,
        }))

        if (selectedBusiness?.id === business.id) {
          setSelectedBusiness((prev) => ({ ...prev, active: nextActive }))
        }
      }

      setConfirmSuccess(copy.successMessage)
      successTimer.current = setTimeout(() => {
        setConfirmAction(null)
        setConfirmSuccess('')
      }, 900)
    } catch (err) {
      setConfirmError(err.message || 'Something went wrong.')
    } finally {
      setConfirmLoading(false)
    }
  }

  // ── Detail panel ──────────────────────────────────────────────────────────
  function openDetail(business) {
    if (detailClosing) return
    setSelectedBusiness(business)
  }

  function closeDetail() {
    setDetailClosing(true)
    setTimeout(() => {
      setSelectedBusiness(null)
      setDetailClosing(false)
    }, 260)
  }

  const confirmCopy = confirmAction
    ? getConfirmCopy(confirmAction.type, confirmAction.business)
    : null

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Platform</p>
          <h1 className={styles.pageTitle}>Tenant Management</h1>
          <p className={styles.pageSubtitle}>
            View and manage all registered businesses on the Bookai platform.
          </p>
        </div>
      </div>

      <AdminStatsStrip stats={stats} />

      <AdminTable
        businesses={businesses}
        onToggleActive={handleToggleActive}
        onDelete={handleDelete}
        onRowClick={openDetail}
        selectedId={selectedBusiness?.id}
      />

      {selectedBusiness && (
        <AdminDetailPanel
          business={selectedBusiness}
          isClosing={detailClosing}
          onClose={closeDetail}
          onToggleActive={handleToggleActive}
          onDelete={handleDelete}
        />
      )}

      <ConfirmationModal
        open={!!confirmAction}
        title={confirmCopy?.title || ''}
        message={confirmCopy?.message || ''}
        confirmLabel={
          confirmLoading ? confirmCopy?.loadingLabel || '' : confirmCopy?.confirmLabel || ''
        }
        cancelLabel="Cancel"
        variant={confirmCopy?.variant || 'warning'}
        requireConfirmation={confirmCopy?.requireConfirmation || false}
        confirmationLabel={confirmCopy?.confirmationLabel || ''}
        loading={confirmLoading}
        error={confirmError}
        success={confirmSuccess}
        onConfirm={runConfirmedAction}
        onCancel={closeConfirm}
      />
    </div>
  )
}

function getConfirmCopy(type, business) {
  const name = business?.name || 'this business'

  if (type === 'delete') {
    return {
      title: `Delete ${name}?`,
      message:
        'This permanently removes the business, staff, services, and bookings. This action cannot be undone.',
      confirmLabel: 'Delete business',
      loadingLabel: 'Deleting...',
      variant: 'danger',
      requireConfirmation: true,
      confirmationLabel: 'I understand this deletion cannot be undone.',
      successMessage: 'Business deleted successfully.',
    }
  }

  if (type === 'reactivate') {
    return {
      title: `Reactivate ${name}?`,
      message:
        'This will restore the business and allow new bookings again immediately.',
      confirmLabel: 'Reactivate business',
      loadingLabel: 'Reactivating...',
      variant: 'success',
      requireConfirmation: false,
      confirmationLabel: '',
      successMessage: 'Business reactivated successfully.',
    }
  }

  return {
    title: `Suspend ${name}?`,
    message:
      'Suspending disables new bookings and hides the business from public discovery. You can reactivate at any time.',
    confirmLabel: 'Suspend business',
    loadingLabel: 'Suspending...',
    variant: 'warning',
    requireConfirmation: true,
    confirmationLabel: 'I understand this business will be suspended.',
    successMessage: 'Business suspended successfully.',
  }
}