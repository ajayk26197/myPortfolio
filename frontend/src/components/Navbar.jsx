import React, { useState, useEffect } from 'react'

const navLinks = ['Home', 'About', 'Projects', 'Experience']

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('Home')

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

  const scrollTo = (id) => {
    setActive(id)
    const el = document.getElementById(id.toLowerCase())
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">

        {/* LEFT — AJ logo */}
        <div
          className="navbar-logo"
          onClick={() => scrollTo('Home')}
          style={{ cursor: 'pointer' }}
        >
          AJ
        </div>

        {/* MIDDLE — nav links pill */}
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

        {/* RIGHT — Contact CTA button */}
        <div className="navbar-right-group">
          <button
            id="navbar-contact-btn"
            className="navbar-cta"
            onClick={() => scrollTo('Contact')}
          >
            Contact Me
          </button>
        </div>

      </div>
    </nav>
  )
}
