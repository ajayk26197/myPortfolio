import React from 'react'
import SectionTitle from './SectionTitle'

// ── EDIT YOUR ACHIEVEMENTS HERE ──
const achievements = []

export default function Achievements() {
  if (achievements.length === 0) return null
  return (
    <section id="achievements" className="achievements">
      <div className="container">
        <SectionTitle
          label="Milestones"
          title="Achievements & Awards"
          highlight="Achievements"
          subtitle="Recognition and milestones from my journey so far."
        />

        <div className="achievements-grid">
          {achievements.map((item, i) => (
            <div key={i} className="achievement-card glass-card">
              <div className="achievement-medal">{item.medal}</div>
              <div className="achievement-title">{item.title}</div>
              <p className="achievement-desc">{item.description}</p>
              <span className="achievement-badge">{item.badge}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
