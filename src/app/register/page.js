'use client'

import { useState } from 'react'
import RegisterLayout from '@/components/register/RegisterLayout'
import StepPlan from '@/components/register/StepPlan'
import StepBusiness from '@/components/register/StepBusiness'
import StepAssets from '@/components/register/StepAssets'
import StepOwner from '@/components/register/StepOwner'
import RegisterStepper from '@/components/register/RegisterStepper'
import styles from '@/styles/register.module.css'

const STEPS = ['Business', 'Assets', 'Plan', 'Account']

export default function RegisterPage() {
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [plan, setPlan] = useState('free')

  const [businessForm, setBusinessForm] = useState({
    name: '',
    category: 'barbershop',
    city: '',
    address: '',
    bio: '',
    phone: '',
  })

  const [assets, setAssets] = useState({
    logoFile: null,
    coverFile: null,
    logoPreview: null,
    coverPreview: null,
  })

  const [ownerForm, setOwnerForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  function next() {
    setError('')
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  function back() {
    setError('')
    setStep((s) => Math.max(s - 1, 0))
  }

  async function handleSubmit() {
    setError('')

    if (ownerForm.password !== ownerForm.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (ownerForm.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          business: businessForm,
          logoUrl: assets.logoUrl || null,
          coverUrl: assets.coverUrl || null,
          owner: {
            name: ownerForm.name,
            email: ownerForm.email,
            password: ownerForm.password,
          },
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.')
        return
      }

      // Auto sign-in after registration
      const { signIn } = await import('next-auth/react')
      const result = await signIn('credentials', {
        email: ownerForm.email,
        password: ownerForm.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Account created but sign-in failed. Please go to the login page.')
        return
      }

      window.location.href = '/dashboard'
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <RegisterLayout>
      <div className={styles.pageInner}>
        <RegisterStepper steps={STEPS} currentStep={step} />

        <div className={styles.stepWrap}>
          {step === 0 && (
            <StepBusiness
              form={businessForm}
              onChange={setBusinessForm}
              onNext={next}
              // onBack={back}
            />
          )}

          {step === 1 && (
            <StepAssets
              assets={assets}
              onChange={setAssets}
              businessName={businessForm.name}
              onNext={next}
              onBack={back}
            />
          )}

          {step === 2 && (
            <StepPlan
              selected={plan}
              onSelect={setPlan}
              onNext={next}
              onBack={back}
            />
          )}

          {step === 3 && (
            <StepOwner
              form={ownerForm}
              onChange={setOwnerForm}
              onSubmit={handleSubmit}
              onBack={back}
              submitting={submitting}
              error={error}
            />
          )}
        </div>
      </div>
    </RegisterLayout>
  )
}