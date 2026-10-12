import React, { useState, useEffect, useMemo } from 'react'

const navLinks = ['Home', 'About', 'Projects', 'Experience']

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('Home')
  const [menuOpen, setMenuOpen] = useState(false)

  // Random portfolio view count, stable across re-renders
  const viewCount = useMemo(() => {
    const n = Math.floor(Math.random() * 9000) + 1000
    return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`
  }, [])

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
            Portfolio View
            <span className="portfolio-view-count">{viewCount}</span>
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
              <span className="portfolio-view-count">{viewCount}</span>
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
