import React, { useState, useEffect, useRef } from 'react';
import SectionTitle from './SectionTitle';

const API_BASE = 'http://localhost:5001/api';

const EMOJI_OPTIONS = ['🚀', '💻', '🛒', '🤖', '📊', '🧠', '💬', '📝', '⚡', '🎮', '🌐', '📱', '🔒', '📦'];

const getValidUrl = (url) => {
  if (!url || url === '#' || url.trim() === '') return null;
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `https://${trimmed}`;
};

const fallbackProjects = [
  {
    title: 'E-Commerce Platform',
    description: 'A full-stack e-commerce application with authentication, product management, cart, and payment integration.',
    stack: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    github: 'https://github.com/aimajay',
    live: 'https://ecommerce-store-demo.vercel.app',
  },
  {
    title: 'AI Chat Assistant',
    description: 'A conversational AI chatbot powered by an LLM API with context memory and a beautiful streaming UI.',
    stack: ['Python', 'FastAPI', 'React', 'OpenAI'],
    github: 'https://github.com/aimajay',
    live: 'https://ai-chat-assistant.vercel.app',
  },
  {
    title: 'Portfolio Dashboard',
    description: 'Real-time analytics dashboard with charts, filters, and live data fetching for portfolio metrics.',
    stack: ['React', 'D3.js', 'Express', 'WebSocket'],
    github: 'https://github.com/aimajay',
    live: 'https://analytics-dashboard-demo.vercel.app',
  },
  {
    title: 'ML Image Classifier',
    description: 'A deep learning model that classifies images with 95%+ accuracy, deployed as a REST API.',
    stack: ['Python', 'TensorFlow', 'Flask', 'Docker'],
    github: 'https://github.com/aimajay',
    live: 'https://image-classifier-ai.vercel.app',
  },
  {
    title: 'Real-Time Chat App',
    description: 'Group chat application with real-time messaging, online presence, and media sharing.',
    stack: ['React', 'Socket.io', 'Node.js', 'MongoDB'],
    github: 'https://github.com/aimajay',
    live: 'https://realtime-chat-demo.vercel.app',
  },
  {
    title: 'Task Manager',
    description: 'Kanban-style task manager with drag-and-drop, team collaboration, and deadline reminders.',
    stack: ['React', 'Express', 'PostgreSQL', 'JWT'],
    github: 'https://github.com/aimajay',
    live: 'https://task-manager-app-demo.vercel.app',
  },
];

export default function Projects({
  isAdminLoggedIn,
  onOpenAdminLogin,
  triggerAddModal,
  triggerEditModal,
  triggerDeleteModal,
  triggerUnlockAdmin,
  onLogout,
}) {
  const [projects, setProjects] = useState(fallbackProjects);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [showAdminControls, setShowAdminControls] = useState(false);

  const addTimerRef = useRef(null);
  const adminTimerRef = useRef(null);
  const addLastTapRef = useRef(0);
  const adminLastTapRef = useRef(0);

  // Add / Edit Project Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [saving, setSaving] = useState(false);
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

  // Delete Confirmation Modal State
  const [deletingProject, setDeletingProject] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Messages Inbox Modal State
  const [isMessagesModalOpen, setIsMessagesModalOpen] = useState(false);
  const [messagesList, setMessagesList] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const fetchMessages = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    setLoadingMessages(true);
    try {
      const res = await fetch(`${API_BASE}/contact/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setMessagesList(data.data);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/contact/messages/${msgId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMessagesList((prev) => prev.filter((m) => m._id !== msgId));
        showToast('Message deleted successfully', 'success');
      }
    } catch (err) {
      showToast('Failed to delete message', 'error');
    }
  };

  const openMessagesModal = () => {
    setIsMessagesModalOpen(true);
    fetchMessages();
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: '' });
    }, 4000);
  };

  const loadProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/projects`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setProjects(data.data);
      }
    } catch (err) {
      console.warn('Backend API not reachable, rendering cached portfolio projects:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Auto-open Add Project modal after successful login
  useEffect(() => {
    if (triggerAddModal) {
      setShowAdminControls(true);
      openAddModal();
    }
  }, [triggerAddModal]);

  // Auto-open Edit Project modal after successful login
  useEffect(() => {
    if (triggerEditModal && triggerEditModal.project) {
      setShowAdminControls(true);
      openEditModal(triggerEditModal.project);
    }
  }, [triggerEditModal]);

  // Auto-open Delete Project modal after successful login
  useEffect(() => {
    if (triggerDeleteModal && triggerDeleteModal.project) {
      setShowAdminControls(true);
      setDeletingProject(triggerDeleteModal.project);
    }
  }, [triggerDeleteModal]);

  // Auto-unlock Admin controls (Edit & Delete) after successful login via Admin button
  useEffect(() => {
    if (triggerUnlockAdmin) {
      setShowAdminControls(true);
      showToast('✅ Admin Mode Unlocked: Edit & Delete controls now visible', 'success');
    }
  }, [triggerUnlockAdmin]);

  const openAddModal = () => {
    setEditingProject(null);
    setFormData({
      icon: '🚀',
      title: '',
      description: '',
      stack: '',
      github: '',
      live: '',
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
      github: project.github && project.github !== '#' ? project.github : '',
      live: project.live && project.live !== '#' ? project.live : '',
      order: project.order !== undefined ? project.order : 0,
      featured: project.featured !== undefined ? project.featured : true,
    });
    setIsModalOpen(true);
  };

  // Add Project Button: 1 Tap = Warning Popup | Double Tap = Open Login Card
  const handleAddProjectClick = (e) => {
    e?.preventDefault();
    if (showAdminControls || isAdminLoggedIn) {
      openAddModal();
      return;
    }

    const now = Date.now();
    const timeSinceLastTap = now - addLastTapRef.current;

    if (timeSinceLastTap < 450 && timeSinceLastTap > 0) {
      addLastTapRef.current = 0;
      if (addTimerRef.current) {
        clearTimeout(addTimerRef.current);
        addTimerRef.current = null;
      }
      onOpenAdminLogin('openAddProject');
    } else {
      addLastTapRef.current = now;
      if (addTimerRef.current) clearTimeout(addTimerRef.current);
      addTimerRef.current = setTimeout(() => {
        showToast('⚠️ Access Restricted', 'error');
        addLastTapRef.current = 0;
      }, 350);
    }
  };

  const handleAddProjectDoubleClick = (e) => {
    e?.preventDefault();
    if (showAdminControls || isAdminLoggedIn) {
      openAddModal();
      return;
    }
    if (addTimerRef.current) {
      clearTimeout(addTimerRef.current);
      addTimerRef.current = null;
    }
    addLastTapRef.current = 0;
    onOpenAdminLogin('openAddProject');
  };

  // Admin Button (For Edit & Delete): 1 Tap = Warning Popup | Double Tap = Open Login & Unlock Controls
  const handleAdminButtonClick = (e) => {
    e?.preventDefault();
    if (showAdminControls) {
      setShowAdminControls(false);
      showToast('🔒 Edit & Delete controls hidden', 'success');
      return;
    }

    const now = Date.now();
    const timeSinceLastTap = now - adminLastTapRef.current;

    if (timeSinceLastTap < 450 && timeSinceLastTap > 0) {
      // DOUBLE TAP DETECTED: Open Login to Unlock Edit/Delete
      adminLastTapRef.current = 0;
      if (adminTimerRef.current) {
        clearTimeout(adminTimerRef.current);
        adminTimerRef.current = null;
      }
      onOpenAdminLogin('unlockAdminControls');
    } else {
      // FIRST TAP: Show warning popup
      adminLastTapRef.current = now;
      if (adminTimerRef.current) clearTimeout(adminTimerRef.current);
      adminTimerRef.current = setTimeout(() => {
        showToast('⚠️ Access Restricted', 'error');
        adminLastTapRef.current = 0;
      }, 350);
    }
  };

  const handleAdminButtonDoubleClick = (e) => {
    e?.preventDefault();
    if (showAdminControls) return;
    if (adminTimerRef.current) {
      clearTimeout(adminTimerRef.current);
      adminTimerRef.current = null;
    }
    adminLastTapRef.current = 0;
    onOpenAdminLogin('unlockAdminControls');
  };

  // Edit Project Click
  const handleEditProjectClick = (project) => {
    openEditModal(project);
  };

  // Delete Project Click
  const handleDeleteProjectClick = (project) => {
    setDeletingProject(project);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    if (!token) {
      showToast('⚠️ Login required to save changes', 'error');
      setIsModalOpen(false);
      onOpenAdminLogin(editingProject ? 'openEditProject' : 'openAddProject', editingProject);
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      showToast('Title and description are required', 'error');
      return;
    }

    setSaving(true);
    try {
      const isExisting = editingProject && editingProject._id;
      const url = isExisting
        ? `${API_BASE}/projects/${editingProject._id}`
        : `${API_BASE}/projects`;

      const method = isExisting ? 'PUT' : 'POST';

      const payload = {
        icon: formData.icon,
        title: formData.title.trim(),
        description: formData.description.trim(),
        stack: formData.stack.split(',').map((s) => s.trim()).filter(Boolean),
        github: formData.github.trim() || '#',
        live: formData.live.trim() || '#',
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
        isExisting
          ? `Project "${payload.title}" updated successfully!`
          : `🎉 New Project "${payload.title}" added successfully!`,
        'success'
      );

      setIsModalOpen(false);
      loadProjects();
    } catch (err) {
      console.error('Error saving project:', err);
      showToast(err.message || 'Failed to save project', 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingProject) return;
    const token = localStorage.getItem('adminToken');

    if (!token) {
      showToast('⚠️ Login required to delete project', 'error');
      const target = deletingProject;
      setDeletingProject(null);
      onOpenAdminLogin('openDeleteProject', target);
      return;
    }

    if (!deletingProject._id) {
      setProjects((prev) => prev.filter((p) => p !== deletingProject));
      showToast(`Project "${deletingProject.title}" deleted successfully!`, 'success');
      setDeletingProject(null);
      return;
    }

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
      loadProjects();
    } catch (err) {
      console.error('Error deleting project:', err);
      showToast(err.message || 'Failed to delete project', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section id="projects" className="projects">
      {/* Toast Notification */}
      {toast.message && (
        <div className={`admin-toast admin-toast-${toast.type}`}>
          {toast.type === 'success' ? '✅' : '⚠️'} {toast.message}
        </div>
      )}

      <div className="container">
        {/* PROJECTS SECTION HEADER: My Work on top left, Featured Projects directly below it, and buttons on the right */}
        <div className="projects-header-wrapper">
          <div className="projects-header-left">
            <span className="label">My Work</span>
            <h2>
              Featured <span className="gradient-text">Projects</span>
            </h2>
            <div className="section-divider-left" />
            <p>A selection of projects I've built with passion and precision.</p>
          </div>

          <div className="projects-admin-actions">
            {/* INBOX MESSAGES: Visible when Admin controls are unlocked */}
            {showAdminControls && (
              <button
                id="projects-messages-btn"
                className="projects-admin-btn admin-btn-active"
                onClick={openMessagesModal}
                title="View received contact messages"
              >
                📬 Messages {messagesList.length > 0 ? `(${messagesList.length})` : ''}
              </button>
            )}

            {/* ADD PROJECT: Strictly visible ONLY after Admin Login */}
            {showAdminControls && (
              <button
                id="projects-add-btn"
                className="projects-admin-btn admin-btn-active"
                onClick={openAddModal}
                title="Add a new project"
              >
                ➕ Add Project
              </button>
            )}

            {/* ADMIN BUTTON: Double tap to login & reveal Add Project, Edit, and Delete */}
            <button
              id="projects-admin-toggle-btn"
              className={`projects-admin-btn ${showAdminControls ? 'admin-btn-active' : ''}`}
              onClick={handleAdminButtonClick}
              onDoubleClick={handleAdminButtonDoubleClick}
              title={showAdminControls ? 'Click to hide Admin controls' : 'Admin: Double-tap to login'}
            >
              {showAdminControls ? '🔓 Admin (Hide)' : '⚙️ Admin'}
            </button>
          </div>
        </div>

        <div className="projects-grid">
          {projects.map((project, i) => {
            const liveUrl = getValidUrl(project.live);
            const githubUrl = getValidUrl(project.github);
            const cardKey = project._id || `proj-${i}`;

            return (
              <div key={cardKey} className="project-card glass-card">
                <div className="project-header">
                  {/* RED LIVE BUTTON / BADGE */}
                  {liveUrl ? (
                    <a
                      id={`project-live-${i}`}
                      href={liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-live-btn"
                      title="Open Live Project in Browser"
                    >
                      <span className="live-dot-pulse"></span>
                      <span className="live-text-bold">LIVE</span>
                      <span className="live-arrow-icon">↗</span>
                    </a>
                  ) : (
                    <span className="project-offline-tag">Code Only</span>
                  )}

                  <div className="project-links">
                    {githubUrl && (
                      <a
                        id={`project-github-${i}`}
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-link-btn"
                        title="View GitHub Source Code"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                        </svg>
                      </a>
                    )}

                    {/* Edit / Delete Controls: HIDDEN by default, shown ONLY after Admin unlocks */}
                    {showAdminControls && (
                      <>
                        <button
                          className="project-admin-action-btn edit"
                          onClick={() => handleEditProjectClick(project)}
                          title="Edit Project"
                        >
                          ✏️
                        </button>
                        <button
                          className="project-admin-action-btn delete"
                          onClick={() => handleDeleteProjectClick(project)}
                          title="Delete Project"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="project-title">{project.title}</div>
                <p className="project-description">{project.description}</p>
                <div className="project-stack">
                  {Array.isArray(project.stack) &&
                    project.stack.map((tech, j) => (
                      <span key={j} className="stack-tag">
                        {tech}
                      </span>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================
          ADD / EDIT PROJECT MODAL CARD
      ========================================== */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="admin-modal-content admin-modal-lg glass-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div className="admin-modal-title">
                <span>{editingProject ? '✏️' : '➕'}</span>
                <h3>{editingProject ? 'Edit Project Details' : 'Add New Project'}</h3>
              </div>
              <button
                className="admin-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <p className="admin-modal-desc">
              Fill in your project details below. When you add a live URL, the red <strong>LIVE ↗</strong> button will appear and take clients directly to your live website!
            </p>

            <form onSubmit={handleSaveProject} className="admin-form">
              {/* Emoji Picker */}
              <div className="admin-form-group">
                <label>Project Icon / Emoji</label>
                <div className="admin-emoji-picker">
                  {EMOJI_OPTIONS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      className={`admin-emoji-btn ${formData.icon === em ? 'active' : ''}`}
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
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  />
                </div>
              </div>

              {/* Title */}
              <div className="admin-form-group">
                <label htmlFor="modal-project-title">Project Title *</label>
                <input
                  id="modal-project-title"
                  type="text"
                  className="admin-input"
                  placeholder="e.g. AI-Powered SaaS Application"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              {/* Description */}
              <div className="admin-form-group">
                <label htmlFor="modal-project-desc">Project Description *</label>
                <textarea
                  id="modal-project-desc"
                  rows={3}
                  className="admin-textarea"
                  placeholder="Describe key features, technology highlights, architecture, and what makes this project special..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              {/* Live URL & GitHub URL Row */}
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label htmlFor="modal-project-live">
                    🌐 Live Website / Project URL (Clients go here)
                  </label>
                  <input
                    id="modal-project-live"
                    type="text"
                    className="admin-input"
                    placeholder="https://my-app.vercel.app"
                    value={formData.live}
                    onChange={(e) => setFormData({ ...formData, live: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="modal-project-github">📦 GitHub Repository URL</label>
                  <input
                    id="modal-project-github"
                    type="text"
                    className="admin-input"
                    placeholder="https://github.com/username/project"
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  />
                </div>
              </div>

              {/* Tech Stack */}
              <div className="admin-form-group">
                <label htmlFor="modal-project-stack">
                  Tech Stack (Comma-separated)
                </label>
                <input
                  id="modal-project-stack"
                  type="text"
                  className="admin-input"
                  placeholder="e.g. React, Node.js, Express, MongoDB, TailwindCSS"
                  value={formData.stack}
                  onChange={(e) => setFormData({ ...formData, stack: e.target.value })}
                />
              </div>

              {/* Order & Featured */}
              <div className="admin-form-row admin-align-center">
                <div className="admin-form-group admin-flex-1">
                  <label htmlFor="modal-project-order">Display Order Index</label>
                  <input
                    id="modal-project-order"
                    type="number"
                    min={0}
                    className="admin-input"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  />
                </div>

                <div className="admin-form-checkbox-group">
                  <label className="admin-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    />
                    <span>Highlight as Featured Project</span>
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
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
                    ? 'Saving Project...'
                    : editingProject
                      ? '💾 Update Project'
                      : '➕ Create & Publish Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================
          DELETE CONFIRMATION MODAL
      ========================================== */}
      {deletingProject && (
        <div className="admin-modal-overlay" onClick={() => setDeletingProject(null)}>
          <div
            className="admin-modal-content glass-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div className="admin-modal-title">
                <span>⚠️</span>
                <h3>Delete Project</h3>
              </div>
              <button
                className="admin-modal-close"
                onClick={() => setDeletingProject(null)}
              >
                ✕
              </button>
            </div>

            <p className="admin-modal-desc">
              Are you sure you want to delete <strong>"{deletingProject.title}"</strong>? This will permanently remove it from your portfolio.
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
                {deleting ? 'Deleting...' : '🗑️ Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Inbox Modal */}
      {isMessagesModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsMessagesModalOpen(false)}>
          <div
            className="admin-modal-card"
            style={{ maxWidth: '650px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header" style={{ marginBottom: '16px' }}>
              <div>
                <h3 className="admin-modal-title">📬 Received Messages</h3>
                <p className="admin-modal-subtitle">
                  Messages submitted via the Contact Me form
                </p>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setIsMessagesModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {loadingMessages ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                  Loading messages...
                </div>
              ) : messagesList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No messages yet</p>
                  <p style={{ fontSize: '13px', marginTop: '4px' }}>When someone sends a message via Contact Me, it will show up here.</p>
                </div>
              ) : (
                messagesList.map((msg) => (
                  <div
                    key={msg._id}
                    className="glass-card"
                    style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid var(--border)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', marginRight: '8px' }}>
                          {msg.name}
                        </span>
                        <a
                          href={`mailto:${msg.email}`}
                          style={{ fontSize: '13px', color: 'var(--accent-orange)', textDecoration: 'underline' }}
                        >
                          {msg.email}
                        </a>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {new Date(msg.createdAt).toLocaleDateString()} {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(msg._id)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#f87171',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                          }}
                          title="Delete Message"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {msg.subject && (
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>
                        📌 Subject: {msg.subject}
                      </div>
                    )}

                    <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: '8px', margin: '4px 0 0', whiteSpace: 'pre-wrap' }}>
                      {msg.message}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setIsMessagesModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
