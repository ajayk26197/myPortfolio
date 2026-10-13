import React, { useState, useEffect, useRef } from 'react'

const navLinks = ['Home', 'About', 'Projects', 'Experience']
const API_BASE = '/api'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('Home')
  const [menuOpen, setMenuOpen] = useState(false)

  // Real view counter state
  const [viewCount, setViewCount] = useState(null)       // raw number from API
  const [displayCount, setDisplayCount] = useState('…')  // formatted animated value
  const [viewLoading, setViewLoading] = useState(true)
  const animTimerRef = useRef(null)

  // Hit the counter once per tab session (sessionStorage clears on tab close).
  // The hasHit ref prevents React StrictMode's double-mount from firing twice.
  const hasHit = useRef(false)
  useEffect(() => {
    const SESSION_KEY = 'pv_counted'
    if (hasHit.current) return          // StrictMode guard
    hasHit.current = true

    if (sessionStorage.getItem(SESSION_KEY)) {
      // Already counted this tab session — just fetch the current count quietly
      fetch(`${API_BASE}/views`)
        .then(r => r.json())
        .then(data => {
          if (data.success) setViewCount(data.count)
          else setDisplayCount('—')
        })
        .catch(() => setDisplayCount('—'))
        .finally(() => setViewLoading(false))
      return
    }

    // First load of this tab — increment
    fetch(`${API_BASE}/views/hit`, { method: 'POST' })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          sessionStorage.setItem(SESSION_KEY, '1')
          setViewCount(data.count)
        } else {
          setDisplayCount('—')
        }
      })
      .catch(() => setDisplayCount('—'))
      .finally(() => setViewLoading(false))
  }, [])

  // Animate the count up when viewCount arrives
  useEffect(() => {
    if (viewCount === null) return
    const target = viewCount
    const duration = 1200
    const steps = 40
    const stepTime = duration / steps
    let step = 0
    const tick = () => {
      step++
      const current = Math.min(Math.round((target / steps) * step), target)
      const formatted = current >= 1000
        ? `${(current / 1000).toFixed(1)}k`
        : `${current}`
      setDisplayCount(formatted)
      if (step < steps) {
        animTimerRef.current = setTimeout(tick, stepTime)
      }
    }
    tick()
    return () => clearTimeout(animTimerRef.current)
  }, [viewCount])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)

    const sections = ['home', 'about', 'projects', 'experience', 'contact']
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id
            const matchedLink = navLinks.find(
              (l) => l.toLowerCase() === id
            )
            if (matchedLink) {
              setActive(matchedLink)
            }
          }
        })
      },
      { threshold: 0.35 }
    )

    sections.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      observer.disconnect()
    }
  }, [])

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const scrollTo = (id) => {
    setActive(id)
    setMenuOpen(false)
    const el = document.getElementById(id.toLowerCase())
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const countBadge = viewLoading ? (
    <span className="portfolio-view-count portfolio-view-loading" />
  ) : (
    <span className="portfolio-view-count">{displayCount}</span>
  )

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">

        {/* LEFT — AJ logo + Portfolio View */}
        <div className="navbar-left-group">
          <div
            className="navbar-logo"
            onClick={() => scrollTo('Home')}
            style={{ cursor: 'pointer' }}
          >
            AJ
          </div>
          <button id="navbar-portfolio-view-btn" className="btn btn-ghost navbar-btn-ghost" type="button">
            Portfolio Views
            {countBadge}
          </button>
        </div>

        {/* MIDDLE — nav links pill (desktop) */}
        <div className="navbar-links">
          {navLinks.map(link => (
            <button
              key={link}
              id={`nav-${link.toLowerCase()}`}
              className={`nav-link ${active === link ? 'active' : ''}`}
              onClick={() => scrollTo(link)}
            >
              {link}
            </button>
          ))}
        </div>

        {/* RIGHT — Follow + Contact CTA + Hamburger */}
        <div className="navbar-right-group">
          <div className="navbar-actions">
            <button id="navbar-follow-btn" className="btn btn-follow navbar-btn-follow" type="button">
              + Follow
            </button>
          </div>

          <button
            id="navbar-contact-btn"
            className="navbar-cta"
            onClick={() => scrollTo('Contact')}
          >
            Contact Me
          </button>

          {/* Hamburger (mobile only) */}
          <button
            id="navbar-hamburger"
            className={`navbar-hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

      </div>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMenuOpen(false)} />
      )}

      {/* Mobile Menu Drawer */}
      <div className={`mobile-menu ${menuOpen ? 'mobile-menu-open' : ''}`}>
        <div className="mobile-menu-links">
          {navLinks.map(link => (
            <button
              key={link}
              className={`mobile-nav-link ${active === link ? 'active' : ''}`}
              onClick={() => scrollTo(link)}
            >
              {link}
            </button>
          ))}
          <div className="mobile-menu-actions">
            <button id="mobile-portfolio-view-btn" className="btn btn-ghost" type="button">
              Portfolio View
              {countBadge}
            </button>
            <button id="mobile-follow-btn" className="btn btn-follow" type="button">
              + Follow
            </button>
          </div>
          <button
            className="mobile-nav-cta"
            onClick={() => scrollTo('Contact')}
          >
            Contact Me
          </button>
        </div>
      </div>
    </nav>
  )
}
