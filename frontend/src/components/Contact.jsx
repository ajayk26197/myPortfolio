import React, { useState } from 'react'
import SectionTitle from './SectionTitle'
import Button from './Button'

// ── EDIT YOUR CONTACT INFO HERE ──
const contactInfo = [
  { icon: '✉️', label: 'Email',    value: 'ajayk26197@gmail.com', href: 'mailto:ajayk26197@gmail.com' },
  { icon: '💼', label: 'LinkedIn', value: 'linkedin.com/in/you',  href: 'https://linkedin.com/in/' },
  { icon: '🐙', label: 'GitHub',   value: 'github.com/aimajay',  href: 'https://github.com/aimajay' },
  { icon: '📍', label: 'Location', value: 'India',               href: null },
]

function AnimatedDroppingTitle() {
  const words = [
    { text: "Let's", isHighlight: false },
    { text: "Work", isHighlight: true },
    { text: "Together", isHighlight: false },
  ]

  let charCount = 0

  return (
    <h2 className="dropping-text-title">
      {words.map((wordObj, wIdx) => {
        const letters = wordObj.text.split('')
        return (
          <span
            key={wIdx}
            className={`dropping-word ${wordObj.isHighlight ? 'gradient-text' : ''}`}
          >
            {letters.map((char, lIdx) => {
              const delay = charCount * 0.08
              charCount++
              return (
                <span
                  key={lIdx}
                  className="dropping-letter"
                  style={{ animationDelay: `${delay}s` }}
                >
                  {char}
                </span>
              )
            })}
          </span>
        )
      })}
    </h2>
  )
}

const API_BASE = '/api'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState('')

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setStatus('success')
        setForm({ name: '', email: '', subject: '', message: '' })
        setTimeout(() => setStatus(''), 5000)
      } else {
        setStatus('error')
      }
    } catch (err) {
      console.error('Contact form submission error:', err)
      setStatus('error')
    }
  }

  return (
    <section id="contact">
      <div className="container">
        <div className="section-title" style={{ textAlign: 'left' }}>
          <span className="label">Get In Touch</span>
          <AnimatedDroppingTitle />
          <div className="section-divider" style={{ margin: '14px 0 24px', marginLeft: 0 }} />
        </div>

        <div className="contact-grid">
          {/* Info */}
          <div className="contact-info">
            <h3>Let's <span className="gradient-text">Connect</span></h3>
            <p>
              I'm currently open to new opportunities and exciting collaborations.
              Whether it's a project, freelance work, or just a chat — feel free to reach out!
            </p>
            <div className="contact-items">
              {contactInfo.map((item, i) => (
                <div key={i} className="contact-item">
                  <div className="contact-item-icon">{item.icon}</div>
                  <div className="contact-item-text">
                    <span>{item.label}</span>
                    {item.href
                      ? <a href={item.href} target="_blank" rel="noopener noreferrer">{item.value}</a>
                      : <p>{item.value}</p>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Column with Subtitle Directly Above */}
          <div className="contact-form-col">
            <p className="contact-form-lead">
              Have a project in mind? I'd love to hear from you.
            </p>
            <form className="contact-form glass-card" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="contact-name">Name</label>
                <input
                  id="contact-name"
                  className="form-input"
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="contact-email">Email</label>
                <input
                  id="contact-email"
                  className="form-input"
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="contact-subject">Subject</label>
              <input
                id="contact-subject"
                className="form-input"
                type="text"
                name="subject"
                placeholder="Project Discussion"
                value={form.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                className="form-textarea"
                name="message"
                placeholder="Tell me about your project..."
                value={form.message}
                onChange={handleChange}
                required
              />
            </div>

            <Button id="contact-submit" variant="primary" className="form-submit btn btn-primary form-submit">
              {status === 'sending' ? 'Sending...' : status === 'success' ? '✓ Message Sent!' : 'Send Message →'}
            </Button>

            {status === 'error' && (
              <p style={{ color: '#f87171', marginTop: '12px', fontSize: '14px' }}>
                Something went wrong. Please try again.
              </p>
            )}
          </form>
          </div>
        </div>
      </div>
    </section>
  )
}
