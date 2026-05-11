import settingsStyles from '@/styles/dashboard/settings.module.css'
import { CheckIcon, ErrorIcon } from '@/components/dashboard/settings/SettingsIcons'

export default function BusinessEditToast({ toast }) {
  if (!toast) return null

  const isSuccess = toast.type === 'success'

  return (
    <div className={`${settingsStyles.toast} ${isSuccess ? settingsStyles.toastSuccess : settingsStyles.toastError}`}>
      {isSuccess ? <CheckIcon /> : <ErrorIcon />}
      {toast.message}
    </div>
  )
}
