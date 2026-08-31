import React from 'react'
import SocialLinks from './SocialLinks'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <p className="footer-copy">
            © {year} <span className="gradient-text" style={{ fontWeight: 700 }}>AJAY K</span>. Crafted with ❤️ using React &amp; Node.js
          </p>

          <div className="footer-right">
            <SocialLinks />
          </div>
        </div>
      </div>
    </footer>
  )
}
