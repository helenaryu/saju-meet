"use client"

import React from 'react'
import IntegratedAnalysisResult from './IntegratedAnalysisResult'
import { ProfileData } from '@/types'

interface AnalysisResult {
  keyword: string
  description: string
}

interface AnalysisResultStepProps {
  uploadedImage: string | null
  profileData: ProfileData
  faceReadingResults: AnalysisResult[]
  sajuResults: AnalysisResult[]
  ohaengData?: {
    labels: string[];
    data: number[];
    descriptions: string[];
    personalTraits: string[];
    colors: string[];
    overallInterpretation?: string;
  }
  onLogout: () => void
  localUser: any
  onProfileSetup: () => void
}

export default function AnalysisResultStep({
  uploadedImage,
  profileData,
  faceReadingResults,
  sajuResults,
  ohaengData,
  onLogout,
  localUser,
  onProfileSetup
}: AnalysisResultStepProps) {
  return (
    <IntegratedAnalysisResult
      uploadedImage={uploadedImage}
      profileData={profileData}
      faceReadingResults={faceReadingResults}
      sajuResults={sajuResults}
      ohaengData={ohaengData}
      onLogout={onLogout}
      localUser={localUser}
      onProfileSetup={onProfileSetup}
    />
  )
}
