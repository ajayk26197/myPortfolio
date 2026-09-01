import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Achievements from './components/Achievements';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminLogin from './components/AdminLogin';

const API_BASE = '/api';

function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [triggerAddModal, setTriggerAddModal] = useState(0);
  const [triggerEditModal, setTriggerEditModal] = useState(null);
  const [triggerDeleteModal, setTriggerDeleteModal] = useState(null);
  const [triggerUnlockAdmin, setTriggerUnlockAdmin] = useState(0);
  const [pendingAction, setPendingAction] = useState(null);
  const [pendingPayload, setPendingPayload] = useState(null);

  // Check existing token on load
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      // Verify token with backend
      fetch(`${API_BASE}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setIsAdminLoggedIn(true);
          } else {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            setIsAdminLoggedIn(false);
          }
        })
        .catch(() => {
          setIsAdminLoggedIn(true);
        });
    }
  }, []);

  const handleOpenLogin = (action = null, payload = null) => {
    setPendingAction(action);
    setPendingPayload(payload);
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    if (pendingAction === 'openAddProject') {
      setTriggerAddModal(Date.now());
    } else if (pendingAction === 'openEditProject') {
      setTriggerEditModal({ project: pendingPayload, ts: Date.now() });
    } else if (pendingAction === 'openDeleteProject') {
      setTriggerDeleteModal({ project: pendingPayload, ts: Date.now() });
    } else if (pendingAction === 'unlockAdminControls') {
      setTriggerUnlockAdmin(Date.now());
    }
    setPendingAction(null);
    setPendingPayload(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setIsAdminLoggedIn(false);
  };

  return (
    <div className="app">
      <Navbar />

      <main>
        <Hero />
        <About />
        <Projects
          isAdminLoggedIn={isAdminLoggedIn}
          onOpenAdminLogin={handleOpenLogin}
          triggerAddModal={triggerAddModal}
          triggerEditModal={triggerEditModal}
          triggerDeleteModal={triggerDeleteModal}
          triggerUnlockAdmin={triggerUnlockAdmin}
          onLogout={handleLogout}
        />
        <Experience />
        <Achievements />
        <Contact />
      </main>

      <Footer />

      {/* Admin Login Modal */}
      <AdminLogin
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          setPendingAction(null);
        }}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default App;
