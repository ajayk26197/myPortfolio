import React, { useState } from 'react'
import Button from './Button'
import SocialLinks from './SocialLinks'
import SpotifyPlaylist from './SpotifyPlaylist'
import resumePdf from '../assets/resume.pdf'

export default function Hero() {
  const [downloading, setDownloading] = useState(false)

  const handleDownloadResume = async (e) => {
    e.preventDefault()
    if (downloading) return
    setDownloading(true)
    try {
      const fileUrl = resumePdf || '/resume.pdf'
      const response = await fetch(fileUrl)
      if (!response.ok) throw new Error('Failed to fetch resume file')
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = 'Ajay_Kumar_Resume.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (err) {
      console.error('Blob download failed, using fallback:', err)
      const link = document.createElement('a')
      link.href = '/resume.pdf'
      link.download = 'Ajay_Kumar_Resume.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <section id="home" className="hero">
      {/* Background orbs */}
      <div className="hero-bg">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
      </div>

      <div className="container">
        <div className="hero-grid">
          {/* Left — Text Content */}
          <div className="hero-content">
            <div className="hero-badge">
              <span className="hero-badge-text">DEVELOPER &amp; AI ML ENTHUSIAST</span>
            </div>

            <div className="hero-code-lines">
              <div className="hero-code-line">
                <span className="prompt">&gt;&gt;</span>
                <span className="keyword"> const </span>
                <span>developer = </span>
                <span className="keyword">new </span>
                <span className="method">FullStackDeveloper</span>
                <span className="bracket">(</span>
                <span className="string">'AJAY K'</span>
                <span className="bracket">);</span>
              </div>
              <div className="hero-code-line">
                <span className="prompt">&gt;&gt;</span>
                <span> developer.specialization = </span>
                <span className="bracket">[ </span>
                <span className="string">'Full-Stack'</span>
                <span className="bracket"> ];</span>
              </div>
            </div>

            <h1 className="hero-title">
              Hi, I'm <span className="gradient-text">AJAY K</span>
            </h1>

            <p className="hero-description">
              Passionate about turning ideas into modern digital experiences, I build responsive and scalable web applications with clean interfaces, powerful functionality, and a strong focus on performance and user experience.
            </p>

            <div className="hero-actions">
              <Button
                id="hero-explore-btn"
                variant="primary"
                onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore My Work →
              </Button>
              <Button
                id="hero-resume-btn"
                variant="outline"
                as="a"
                href={resumePdf}
                download="Ajay_Kumar_Resume.pdf"
                onClick={handleDownloadResume}
              >
                {downloading ? 'Downloading...' : 'Resume ↓'}
              </Button>
            </div>
          </div>

          {/* Right — Avatar on top, Music Card below */}
          <div className="hero-visual">
            <div className="hero-avatar-wrapper">
              <div className="hero-orbit-ring">
                <div className="hero-orbit-dot" />
              </div>
              <div className="hero-orbit-ring hero-orbit-ring-2" />

              <div className="hero-avatar-placeholder">
                <div className="avatar-icon">🧑‍💻</div>
              </div>

              <div className="hero-social-bar">
                <SocialLinks variant="bar" />
              </div>
            </div>

            <SpotifyPlaylist />
          </div>

        </div>
      </div>
    </section>
  )
}
