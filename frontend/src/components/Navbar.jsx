import React, { useState, useEffect, useRef } from 'react'
import { auth, signInWithGoogle, onAuthStateChanged } from '../firebase'
import { followUser, checkFollowStatus } from '../services/api'

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

  // Follower state
  const [currentUser, setCurrentUser] = useState(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  // Count once per session: refreshes do not increment the counter.
  // The hasHit ref prevents React StrictMode's dev double-mount.
  const hasHit = useRef(false)
  useEffect(() => {
    if (hasHit.current) return
    hasHit.current = true

    const SESSION_KEY = 'portfolio_view_counted'
    const alreadyCountedInSession = sessionStorage.getItem(SESSION_KEY)

    if (alreadyCountedInSession) {
      // Refresh / already visited in this session: fetch count quietly without incrementing
      fetch(`${API_BASE}/views`)
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setViewCount(data.count)
          } else {
            setDisplayCount('—')
          }
        })
        .catch(() => setDisplayCount('—'))
        .finally(() => setViewLoading(false))
      return
    }

    // New session: increment counter once
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

  // Firebase auth state & follow status sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        try {
          const res = await checkFollowStatus(user.uid)
          if (res.success) {
            setIsFollowing(res.isFollowing)
          }
        } catch (err) {
          console.error('Failed to check follow status:', err)
        }
      } else {
        setIsFollowing(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const handleFollow = async () => {
    // No unfollow option: if already following or loading, do nothing
    if (followLoading || isFollowing) return
    setFollowLoading(true)

    try {
      let user = auth.currentUser

      // If user is not yet logged in, prompt Google popup
      if (!user) {
        const result = await signInWithGoogle()
        user = result.user
        setCurrentUser(user)
      }

      if (!user) {
        setFollowLoading(false)
        return
      }

      // Add follower in MongoDB
      const res = await followUser({
        uid: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Follower',
        email: user.email,
        photoURL: user.photoURL || '',
      })
      if (res.success) {
        setIsFollowing(true)
      }
    } catch (err) {
      if (
        err?.code !== 'auth/popup-closed-by-user' &&
        err?.code !== 'auth/cancelled-popup-request'
      ) {
        console.error('Follow action failed:', err)
      }
    } finally {
      setFollowLoading(false)
    }
  }

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

  const renderFollowBtnContent = () => {
    if (followLoading) {
      return (
        <>
          <span className="follow-btn-spinner" />
          <span>Following...</span>
        </>
      )
    }

    if (isFollowing) {
      return (
        <>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Following</span>
        </>
      )
    }

    return <span>+ Follow</span>
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
          <button
            id="navbar-portfolio-view-btn"
            className="btn btn-ghost navbar-btn-ghost"
            type="button"
            title="Total portfolio visits"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.85 }}>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>Portfolio Views</span>
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
            <button
              id="navbar-follow-btn"
              className={`btn btn-follow navbar-btn-follow ${isFollowing ? 'following' : ''}`}
              type="button"
              onClick={handleFollow}
              disabled={followLoading}
              title={
                isFollowing
                  ? 'Following Ajay'
                  : currentUser
                  ? `Follow as ${currentUser.displayName || currentUser.email}`
                  : 'Sign in with Google to follow'
              }
            >
              {renderFollowBtnContent()}
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
            <button
              id="mobile-portfolio-view-btn"
              className="btn btn-ghost"
              type="button"
              title="Total portfolio visits"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.85 }}>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>Portfolio Views</span>
              {countBadge}
            </button>
            <button
              id="mobile-follow-btn"
              className={`btn btn-follow ${isFollowing ? 'following' : ''}`}
              type="button"
              onClick={handleFollow}
              disabled={followLoading}
              title={
                isFollowing
                  ? 'Following Ajay'
                  : currentUser
                  ? `Follow as ${currentUser.displayName || currentUser.email}`
                  : 'Sign in with Google to follow'
              }
            >
              {renderFollowBtnContent()}
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
