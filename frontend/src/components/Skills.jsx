import React from 'react'
import SectionTitle from './SectionTitle'

// ── EDIT YOUR SKILLS HERE ──
const skillCategories = [
  {
    icon: '🖥️',
    title: 'Frontend',
    skills: ['React.js', 'HTML5', 'CSS3', 'JavaScript', 'Tailwind CSS', 'Vite'],
  },
  {
    icon: '⚙️',
    title: 'Backend',
    skills: ['Node.js', 'Express.js', 'REST APIs', 'GraphQL', 'JWT', 'Socket.io'],
  },
  {
    icon: '🗄️',
    title: 'Database',
    skills: ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase'],
  },
  {
    icon: '🤖',
    title: 'AI / ML',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy'],
  },
  {
    icon: '🛠️',
    title: 'Tools & DevOps',
    skills: ['Git', 'GitHub', 'Docker', 'Linux', 'VS Code', 'Postman'],
  },
  {
    icon: '🏆',
    title: 'Competitive',
    skills: ['C++', 'Data Structures', 'Algorithms', 'LeetCode', 'CodeForces'],
  },
]

export default function Skills() {
  return (
    <section id="skills">
      <div className="container">
        <SectionTitle
          label="Tech Stack"
          title="Skills & Technologies"
          highlight="Skills"
          subtitle="Technologies I work with to bring ideas to life."
        />

        <div className="skills-grid">
          {skillCategories.map((cat, i) => (
            <div key={i} className="skill-category glass-card">
              <div className="skill-category-title">
                <div className="skill-category-icon">{cat.icon}</div>
                {cat.title}
              </div>
              <div className="skill-tags">
                {cat.skills.map((skill, j) => (
                  <span key={j} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
