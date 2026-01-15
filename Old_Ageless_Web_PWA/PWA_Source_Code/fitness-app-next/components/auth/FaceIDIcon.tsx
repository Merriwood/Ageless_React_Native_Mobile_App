'use client'

import { useState } from 'react'
import Image from 'next/image'

export function FaceIDIcon({ onClick }: { onClick?: () => void }) {
  const [isScanning, setIsScanning] = useState(false)

  const handleClick = () => {
    setIsScanning(true)
    setTimeout(() => setIsScanning(false), 2000) // Animation duration
    onClick?.()
  }

  return (
    <div
      className={`face-id-icon ${isScanning ? 'scanning' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      title="Tap to sign in with Face ID"
    >
      <Image
        src="/icons/face_id_icon.png"
        alt="Face ID"
        width={64}
        height={64}
        priority
      />
    </div>
  )
}
