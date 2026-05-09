import styles from '@/styles/dashboard/settings.module.css'
import { CheckIcon, ErrorIcon } from './SettingsIcons'

export default function SettingsToast({ toast }) {
  if (!toast) return null

  const isSuccess = toast.type === 'success'

  return (
    <div className={`${styles.toast} ${isSuccess ? styles.toastSuccess : styles.toastError}`}>
      {isSuccess ? <CheckIcon /> : <ErrorIcon />}
      {toast.message}
    </div>
  )
}
