import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import SearchPage from './pages/Search';
import PropertyDetails from './pages/PropertyDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import { Home as HomeIcon, MapPin, Mail, Phone, ExternalLink } from 'lucide-react';

const AppContent = () => {
  const { loading } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [selectionSearch, setSelectionSearch] = useState({
    search: '',
    location: '',
    type: 'All',
    selectedPropertyId: null
  });

  const handleViewChange = (view) => {
    setCurrentView(view);
    // Smooth scroll to top of page on route change
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Landing onViewChange={handleViewChange} setSelectionSearch={setSelectionSearch} />;
      case 'search':
        return <SearchPage onViewChange={handleViewChange} selectionSearch={selectionSearch} setSelectionSearch={setSelectionSearch} />;
      case 'property-details':
        return <PropertyDetails onViewChange={handleViewChange} selectionSearch={selectionSearch} setSelectionSearch={setSelectionSearch} />;
      case 'login':
        return <Login onViewChange={handleViewChange} />;
      case 'register':
        return <Register onViewChange={handleViewChange} />;
      case 'chat':
        return <Chat />;
      case 'dashboard':
        return <Dashboard onViewChange={handleViewChange} setSelectionSearch={setSelectionSearch} />;
      default:
        return <Landing onViewChange={handleViewChange} setSelectionSearch={setSelectionSearch} />;
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid var(--border-color)',
          borderTop: '3px solid var(--accent-color)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }} />
        <span style={{ fontWeight: 600, fontSize: '1rem', letterSpacing: '0.5px' }}>Loading HouseHunt...</span>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar currentView={currentView} onViewChange={handleViewChange} />
      
      <main style={{ flex: 1 }}>
        {renderView()}
      </main>

      {/* Premium Footer */}
      <footer style={{
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)',
        padding: '48px 0 24px 0',
        marginTop: '60px',
        fontSize: '0.9rem',
        color: 'var(--text-secondary)'
      }}>
        <div className="page-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', paddingBottom: '32px', borderBottom: '1px solid var(--border-color)', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
              <div className="gradient-bg" style={{ width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <HomeIcon size={14} />
              </div>
              <span className="gradient-text">HouseHunt</span>
            </div>
            <p style={{ marginTop: '12px', lineHeight: 1.5 }}>
              Revolutionizing the real estate search, rental, and document flow for buyers, sellers, renters, and agents.
            </p>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '14px' }}>Platform</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><button onClick={() => handleViewChange('search')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>Explore Listings</button></li>
              <li><button onClick={() => handleViewChange('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>Market Insights</button></li>
              <li><a href="#" style={{ color: 'inherit' }}>Pricing Details</a></li>
              <li><a href="#" style={{ color: 'inherit' }}>Client Portal</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '14px' }}>Security & Legal</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><a href="#" style={{ color: 'inherit' }}>Digital Signatures</a></li>
              <li><a href="#" style={{ color: 'inherit' }}>Smart Paperwork</a></li>
              <li><a href="#" style={{ color: 'inherit' }}>Terms of Service</a></li>
              <li><a href="#" style={{ color: 'inherit' }}>Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '14px' }}>Contact & Help</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={14} /> support@househunt.com</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={14} /> +1 (800) 555-HUNT</li>
              <li><a href="#" style={{ color: 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}>Knowledge Base <ExternalLink size={12} /></a></li>
            </ul>
          </div>
        </div>

        <div className="page-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span>© 2026 HouseHunt Inc. All rights reserved. Secured Digital Marketplace.</span>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Created by Team Antigravity</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
