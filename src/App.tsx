import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Nav, Footer } from './components/Layout';
import { BackgroundPattern } from './components/Visuals';

// Public pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Work from './pages/Work';
import Contact from './pages/Contact';
import Journal from './pages/Journal';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import ProjectPage from './pages/work/slug';

// Admin pages — completely isolated, no Nav/Footer/grain overlay
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProjects from './pages/admin/AdminProjects';
import AdminFAQ from './pages/admin/AdminFAQ';
import AdminJournals from './pages/admin/AdminJournals';
import AdminLogin from './pages/admin/AdminLogin';

/** Wraps public pages with the shared chrome (grain, nav, footer). */
function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="grain-overlay" />
      <BackgroundPattern />
      <Nav />
      {children}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ── Admin (no public chrome) ─────────────────────────── */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/projects"  element={<AdminProjects />} />
        <Route path="/admin/faq"       element={<AdminFAQ />} />
        <Route path="/admin/journals"  element={<AdminJournals />} />

        {/* ── Public pages (with Nav / Footer / grain overlay) ─── */}
        <Route path="/"        element={<PublicShell><Home /></PublicShell>} />
        <Route path="/about"   element={<PublicShell><About /></PublicShell>} />
        <Route path="/services" element={<PublicShell><Services /></PublicShell>} />
        <Route path="/work"    element={<PublicShell><Work /></PublicShell>} />
        <Route path="/work/:slug" element={<PublicShell><ProjectPage /></PublicShell>} />
        <Route path="/contact" element={<PublicShell><Contact /></PublicShell>} />
        <Route path="/privacy" element={<PublicShell><Privacy /></PublicShell>} />
        <Route path="/terms"   element={<PublicShell><Terms /></PublicShell>} />
        <Route path="/journal" element={<PublicShell><Journal /></PublicShell>} />
      </Routes>
    </Router>
  );
}
