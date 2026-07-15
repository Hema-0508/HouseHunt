import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  Search, 
  MessageSquare, 
  LayoutDashboard, 
  LogOut, 
  Sun, 
  Moon, 
  User, 
  Layers
} from 'lucide-react';

const Navbar = ({ currentView, onViewChange }) => {
  const { user, theme, toggleTheme, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onViewChange('home');
  };

  return (
    <header className="glass" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: '1px solid var(--border-color)',
      padding: '12px 0'
    }}>
      <div className="page-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px'
      }}>
        {/* Logo */}
        <div 
          onClick={() => onViewChange('home')} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            cursor: 'pointer',
            fontWeight: 800,
            fontSize: '1.5rem',
            letterSpacing: '-0.5px'
          }}
        >
          <div className="gradient-bg" style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <Home size={20} />
          </div>
          <span className="gradient-text">HouseHunt</span>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            onClick={() => onViewChange('home')}
            className={`tab-btn ${currentView === 'home' ? 'active' : ''}`}
            style={{ border: 'none', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Home size={16} /> Home
          </button>
          
          <button 
            onClick={() => onViewChange('search')}
            className={`tab-btn ${currentView === 'search' ? 'active' : ''}`}
            style={{ border: 'none', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Search size={16} /> Explore
          </button>

          {user && (
            <>
              <button 
                onClick={() => onViewChange('chat')}
                className={`tab-btn ${currentView === 'chat' ? 'active' : ''}`}
                style={{ border: 'none', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <MessageSquare size={16} /> Messages
              </button>

              <button 
                onClick={() => onViewChange('dashboard')}
                className={`tab-btn ${currentView === 'dashboard' ? 'active' : ''}`}
                style={{ border: 'none', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <LayoutDashboard size={16} /> Dashboard
              </button>
            </>
          )}
        </nav>

        {/* Right Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="btn-secondary"
            style={{ padding: '8px', borderRadius: '50%', width: '40px', height: '40px' }}
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 600 }}>{user.name}</span>
                <span style={{ 
                  textTransform: 'capitalize', 
                  fontSize: '0.75rem', 
                  color: 'var(--accent-color)', 
                  fontWeight: 500,
                  backgroundColor: 'var(--accent-light)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  marginTop: '2px'
                }}>
                  {user.role}
                </span>
              </div>
              <button 
                onClick={handleLogout}
                className="btn-secondary"
                style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                onClick={() => onViewChange('login')}
                className="btn-secondary"
                style={{ padding: '8px 16px' }}
              >
                Login
              </button>
              <button 
                onClick={() => onViewChange('register')}
                className="btn-primary"
                style={{ padding: '8px 16px' }}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
