import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Key, Mail, Eye, EyeOff, ShieldAlert } from 'lucide-react';

const Login = ({ onViewChange }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      onViewChange('dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (roleEmail) => {
    setError('');
    setLoading(true);
    try {
      await login(roleEmail, 'password123');
      onViewChange('dashboard');
    } catch (err) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 120px)' }}>
      <div className="glass" style={{ width: '100%', maxWidth: '450px', padding: '36px', borderRadius: 'var(--radius-lg)' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>Sign in to manage your real estate journey</p>
        </div>

        {error && (
          <div style={{ 
            backgroundColor: 'hsla(0, 84%, 60%, 0.1)', 
            color: 'var(--danger-color)', 
            padding: '12px 16px', 
            borderRadius: 'var(--radius-md)', 
            fontSize: '0.85rem',
            fontWeight: 500,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShieldAlert size={16} />
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Email Address</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-primary)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <Mail size={18} style={{ color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" 
                style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '1rem' }} 
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Password</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-primary)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <Key size={18} style={{ color: 'var(--text-muted)' }} />
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" 
                style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '1rem' }} 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ width: '100%', padding: '14px', marginTop: '10px', fontSize: '1rem' }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Quick login handles for testing */}
        <div style={{ marginTop: '28px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', textAlign: 'center', marginBottom: '12px', textTransform: 'uppercase' }}>
            Demo Quick Login
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button 
              onClick={() => handleQuickLogin('renter@househunt.com')} 
              className="btn-secondary" 
              style={{ padding: '8px 12px', fontSize: '0.8rem', borderRadius: '8px' }}
            >
              🔑 Renter (Hema)
            </button>
            <button 
              onClick={() => handleQuickLogin('landlord@househunt.com')} 
              className="btn-secondary" 
              style={{ padding: '8px 12px', fontSize: '0.8rem', borderRadius: '8px' }}
            >
              🔑 Landlord (Charan)
            </button>
            <button 
              onClick={() => handleQuickLogin('agent@househunt.com')} 
              className="btn-secondary" 
              style={{ padding: '8px 12px', fontSize: '0.8rem', borderRadius: '8px' }}
            >
              🔑 Agent (Uma)
            </button>
            <button 
              onClick={() => handleQuickLogin('admin@househunt.com')} 
              className="btn-secondary" 
              style={{ padding: '8px 12px', fontSize: '0.8rem', borderRadius: '8px' }}
            >
              🔑 Admin (Chaitanya)
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <button 
            onClick={() => onViewChange('register')} 
            style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            Create account
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;
