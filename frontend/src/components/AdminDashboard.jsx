import React, { useState, useEffect } from 'react';

const API_BASE = '/api';

const EMOJI_OPTIONS = ['🛒', '🤖', '📊', '🧠', '💬', '📝', '🚀', '💻', '⚡', '🎮', '🌐', '📱', '🔒', '📦'];

export default function AdminDashboard({ onExitDashboard, onLogout }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    icon: '🚀',
    title: '',
    description: '',
    stack: '',
    github: '',
    live: '',
    order: 0,
    featured: true,
  });
  const [saving, setSaving] = useState(false);

  // Delete modal state
  const [deletingProject, setDeletingProject] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const token = localStorage.getItem('adminToken');

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 4000);
  };

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/projects`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setProjects(data.data);
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error('Error loading projects in admin:', err);
      setError('Failed to load projects. Ensure backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openAddModal = () => {
    setEditingProject(null);
    setFormData({
      icon: '🚀',
      title: '',
      description: '',
      stack: '',
      github: '#',
      live: '#',
      order: projects.length + 1,
      featured: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      icon: project.icon || '🚀',
      title: project.title || '',
      description: project.description || '',
      stack: Array.isArray(project.stack) ? project.stack.join(', ') : '',
      github: project.github || '#',
      live: project.live || '#',
      order: project.order !== undefined ? project.order : 0,
      featured: project.featured !== undefined ? project.featured : true,
    });
    setIsModalOpen(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      showToast('Title and description are required', 'error');
      return;
    }

    setSaving(true);
    try {
      const url = editingProject
        ? `${API_BASE}/projects/${editingProject._id}`
        : `${API_BASE}/projects`;

      const method = editingProject ? 'PUT' : 'POST';

      const payload = {
        icon: formData.icon,
        title: formData.title,
        description: formData.description,
        stack: formData.stack.split(',').map((s) => s.trim()).filter(Boolean),
        github: formData.github,
        live: formData.live,
        order: Number(formData.order) || 0,
        featured: formData.featured,
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to save project');
      }

      showToast(
        editingProject
          ? `Project "${payload.title}" updated successfully!`
          : `New Project "${payload.title}" created successfully!`,
        'success'
      );

      setIsModalOpen(false);
      fetchProjects();
    } catch (err) {
      console.error('Error saving project:', err);
      showToast(err.message || 'Failed to save project', 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingProject) return;

    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/projects/${deletingProject._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to delete project');
      }

      showToast(`Project "${deletingProject.title}" deleted successfully!`, 'success');
      setDeletingProject(null);
      fetchProjects();
    } catch (err) {
      console.error('Error deleting project:', err);
      showToast(err.message || 'Failed to delete project', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Toast Notification */}
      {notification.message && (
        <div className={`admin-toast admin-toast-${notification.type}`}>
          {notification.type === 'success' ? '✅' : '⚠️'} {notification.message}
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="admin-topbar">
        <div className="admin-topbar-inner">
          <div className="admin-topbar-left">
            <div className="admin-brand-badge">⚡ Admin Panel</div>
            <h1 className="admin-title">Project Management</h1>
          </div>

          <div className="admin-topbar-actions">
            <button
              id="admin-view-public-btn"
              className="admin-btn-outline"
              onClick={onExitDashboard}
            >
              👁️ View Public Portfolio
            </button>
            <button
              id="admin-logout-btn"
              className="admin-btn-danger"
              onClick={onLogout}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main container">
        {/* Statistics Cards */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card glass-card">
            <div className="admin-stat-icon">📁</div>
            <div className="admin-stat-info">
              <div className="admin-stat-val">{projects.length}</div>
              <div className="admin-stat-lbl">Total Projects</div>
            </div>
          </div>
          <div className="admin-stat-card glass-card">
            <div className="admin-stat-icon">⭐</div>
            <div className="admin-stat-info">
              <div className="admin-stat-val">
                {projects.filter((p) => p.featured !== false).length}
              </div>
              <div className="admin-stat-lbl">Featured Projects</div>
            </div>
          </div>
          <div className="admin-stat-card glass-card">
            <div className="admin-stat-icon">🔗</div>
            <div className="admin-stat-info">
              <div className="admin-stat-val">
                {projects.filter((p) => p.live && p.live !== '#').length}
              </div>
              <div className="admin-stat-lbl">Live Deployments</div>
            </div>
          </div>
        </div>

        {/* Section Header with Add Action */}
        <div className="admin-section-header">
          <div>
            <h2>Manage Portfolio Projects</h2>
            <p>Add, edit, reorder, or delete projects visible on your public portfolio.</p>
          </div>
          <button
            id="admin-add-project-btn"
            className="admin-btn-primary"
            onClick={openAddModal}
          >
            ➕ Add New Project
          </button>
        </div>

        {/* Error / Loading State */}
        {error && <div className="admin-alert-error">{error}</div>}

        {loading ? (
          <div className="admin-loading-state glass-card">
            <div className="admin-spinner" />
            <p>Loading projects from database...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="admin-empty-state glass-card">
            <div className="admin-empty-icon">📭</div>
            <h3>No projects found</h3>
            <p>Get started by creating your first portfolio project.</p>
            <button className="admin-btn-primary" onClick={openAddModal}>
              ➕ Add Project Now
            </button>
          </div>
        ) : (
          <div className="admin-projects-list">
            {projects.map((proj, idx) => (
              <div key={proj._id || idx} className="admin-project-item glass-card">
                <div className="admin-proj-left">
                  <div className="admin-proj-icon">{proj.icon || '🚀'}</div>
                  <div className="admin-proj-details">
                    <div className="admin-proj-title-row">
                      <span className="admin-proj-title">{proj.title}</span>
                      {proj.featured && (
                        <span className="admin-badge-featured">Featured</span>
                      )}
                      <span className="admin-order-badge">#{proj.order || idx + 1}</span>
                    </div>
                    <p className="admin-proj-desc">{proj.description}</p>
                    <div className="admin-proj-stack">
                      {Array.isArray(proj.stack) &&
                        proj.stack.map((tech, sIdx) => (
                          <span key={sIdx} className="admin-stack-tag">
                            {tech}
                          </span>
                        ))}
                    </div>
                    <div className="admin-proj-links">
                      {proj.github && proj.github !== '#' && (
                        <a
                          href={proj.github}
                          target="_blank"
                          rel="noreferrer"
                          className="admin-link-chip"
                        >
                          📦 GitHub
                        </a>
                      )}
                      {proj.live && proj.live !== '#' && (
                        <a
                          href={proj.live}
                          target="_blank"
                          rel="noreferrer"
                          className="admin-link-chip"
                        >
                          🌐 Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="admin-proj-actions">
                  <button
                    className="admin-action-btn admin-edit-btn"
                    onClick={() => openEditModal(proj)}
                    title="Edit Project"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="admin-action-btn admin-delete-btn"
                    onClick={() => setDeletingProject(proj)}
                    title="Delete Project"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="admin-modal-content admin-modal-lg glass-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div className="admin-modal-title">
                <span>{editingProject ? '✏️' : '➕'}</span>
                <h3>{editingProject ? 'Edit Project' : 'Add New Project'}</h3>
              </div>
              <button
                className="admin-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="admin-form">
              {/* Icon selector */}
              <div className="admin-form-group">
                <label>Project Icon / Emoji</label>
                <div className="admin-emoji-picker">
                  {EMOJI_OPTIONS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      className={`admin-emoji-btn ${
                        formData.icon === em ? 'active' : ''
                      }`}
                      onClick={() => setFormData({ ...formData, icon: em })}
                    >
                      {em}
                    </button>
                  ))}
                  <input
                    type="text"
                    className="admin-input-icon-custom"
                    placeholder="Custom"
                    maxLength={4}
                    value={formData.icon}
                    onChange={(e) =>
                      setFormData({ ...formData, icon: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Title */}
              <div className="admin-form-group">
                <label htmlFor="form-title">Project Title *</label>
                <input
                  id="form-title"
                  type="text"
                  className="admin-input"
                  placeholder="e.g. AI-Powered Recommendation Engine"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              {/* Description */}
              <div className="admin-form-group">
                <label htmlFor="form-desc">Project Description *</label>
                <textarea
                  id="form-desc"
                  rows={3}
                  className="admin-textarea"
                  placeholder="Describe key features, challenges solved, and architecture..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>

              {/* Tech Stack */}
              <div className="admin-form-group">
                <label htmlFor="form-stack">
                  Tech Stack (Comma-separated)
                </label>
                <input
                  id="form-stack"
                  type="text"
                  className="admin-input"
                  placeholder="e.g. React, Node.js, MongoDB, Docker, AWS"
                  value={formData.stack}
                  onChange={(e) =>
                    setFormData({ ...formData, stack: e.target.value })
                  }
                />
              </div>

              {/* Links Row */}
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label htmlFor="form-github">GitHub Repository URL</label>
                  <input
                    id="form-github"
                    type="text"
                    className="admin-input"
                    placeholder="https://github.com/username/project"
                    value={formData.github}
                    onChange={(e) =>
                      setFormData({ ...formData, github: e.target.value })
                    }
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="form-live">Live Demo / Website URL</label>
                  <input
                    id="form-live"
                    type="text"
                    className="admin-input"
                    placeholder="https://my-app.vercel.app"
                    value={formData.live}
                    onChange={(e) =>
                      setFormData({ ...formData, live: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Order & Featured Row */}
              <div className="admin-form-row admin-align-center">
                <div className="admin-form-group admin-flex-1">
                  <label htmlFor="form-order">Display Order Index</label>
                  <input
                    id="form-order"
                    type="number"
                    min={0}
                    className="admin-input"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({ ...formData, order: e.target.value })
                    }
                  />
                </div>

                <div className="admin-form-checkbox-group">
                  <label className="admin-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          featured: e.target.checked,
                        })
                      }
                    />
                    <span>Highlight as Featured Project</span>
                  </label>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="admin-form-actions">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn-primary"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving...'
                    : editingProject
                    ? '💾 Update Project'
                    : '➕ Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingProject && (
        <div
          className="admin-modal-overlay"
          onClick={() => setDeletingProject(null)}
        >
          <div
            className="admin-modal-content glass-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div className="admin-modal-title">
                <span>⚠️</span>
                <h3>Delete Project Confirmation</h3>
              </div>
              <button
                className="admin-modal-close"
                onClick={() => setDeletingProject(null)}
              >
                ✕
              </button>
            </div>

            <p className="admin-modal-desc">
              Are you sure you want to delete{' '}
              <strong>"{deletingProject.title}"</strong>? This will permanently
              remove the project from your portfolio.
            </p>

            <div className="admin-form-actions">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setDeletingProject(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn-danger"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : '🗑️ Yes, Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
