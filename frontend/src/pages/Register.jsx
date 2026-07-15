import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Key, Briefcase, Eye, EyeOff, ShieldAlert } from 'lucide-react';

const Register = ({ onViewChange }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('renter'); // renter, landlord, agent
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, role);
      onViewChange('dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 120px)' }}>
      <div className="glass" style={{ width: '100%', maxWidth: '480px', padding: '36px', borderRadius: 'var(--radius-lg)' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>Join HouseHunt and start your journey today</p>
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

        {/* Register Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Full Name</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-primary)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <User size={18} style={{ color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                required 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe" 
                style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '1rem' }} 
              />
            </div>
          </div>

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
                placeholder="Min 6 characters" 
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

          {/* Role selector */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Select Your Role</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setRole('renter')}
                className={role === 'renter' ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '10px 0', fontSize: '0.85rem', borderRadius: 'var(--radius-md)' }}
              >
                Renter
              </button>
              <button
                type="button"
                onClick={() => setRole('landlord')}
                className={role === 'landlord' ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '10px 0', fontSize: '0.85rem', borderRadius: 'var(--radius-md)' }}
              >
                Landlord
              </button>
              <button
                type="button"
                onClick={() => setRole('agent')}
                className={role === 'agent' ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '10px 0', fontSize: '0.85rem', borderRadius: 'var(--radius-md)' }}
              >
                Agent
              </button>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'center' }}>
              {role === 'renter' && "I want to explore listings, request tours, and sign lease agreements."}
              {role === 'landlord' && "I want to list rental homes and manage client tour requests."}
              {role === 'agent' && "I am a professional broker wanting to market properties and follow leads."}
            </span>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ width: '100%', padding: '14px', marginTop: '10px', fontSize: '1rem' }}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <button 
            onClick={() => onViewChange('login')} 
            style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            Sign In
          </button>
        </div>

      </div>
    </div>
  );
};

export default Register;
