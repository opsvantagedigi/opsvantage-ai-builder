import React from 'react'
import { OnboardingData } from '@/types/onboarding'

type Props = {
  onNext: (data: Partial<OnboardingData>) => Promise<void> | void
  onBack?: () => void
  onSaveAndExit?: () => void
  initialData?: OnboardingData
  isSaving?: boolean
}

export default function BrandIdentityStep(_: Props) {
  return <div />
}
