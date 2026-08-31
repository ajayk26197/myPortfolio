import React from 'react'

export default function SectionTitle({ label, title, highlight, subtitle }) {
  const parts = title.split(highlight || '')

  return (
    <div className="section-title">
      {label && <span className="label">{label}</span>}
      <h2>
        {highlight ? (
          <>
            {parts[0]}
            <span className="gradient-text">{highlight}</span>
            {parts[1]}
          </>
        ) : title}
      </h2>
      <div className="section-divider" />
      {subtitle && <p>{subtitle}</p>}
    </div>
  )
}
