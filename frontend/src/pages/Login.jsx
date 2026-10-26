import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    const res = await login(username, password);
    if (!res.success) {
      setError(res.message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at top left, #1e1b4b 0%, #0f172a 60%, #020617 100%)',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Ambient background glow */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
        top: '-10%',
        left: '10%',
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, rgba(0, 0, 0, 0) 70%)',
        bottom: '-5%',
        right: '15%',
        pointerEvents: 'none'
      }} />

      {/* Login Card */}
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(30, 41, 59, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
            marginBottom: '1rem'
          }}>
            <Sparkles size={28} />
          </div>
          <h1 style={{
            fontSize: '1.65rem',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            marginBottom: '0.35rem'
          }}>
            AcademiaERP
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Academic Admin & Attendance Portal
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ color: '#cbd5e1' }}>Admin Username</label>
            <div className="search-input-wrapper" style={{ minWidth: 'auto' }}>
              <User size={18} className="search-icon" style={{ color: '#64748b' }} />
              <input
                type="text"
                className="form-control"
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  borderColor: 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                }}
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label" style={{ color: '#cbd5e1' }}>Admin Password</label>
            <div className="search-input-wrapper" style={{ minWidth: 'auto' }}>
              <Lock size={18} className="search-icon" style={{ color: '#64748b' }} />
              <input
                type="password"
                className="form-control"
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  borderColor: 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                }}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.85rem',
              fontSize: '0.98rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem'
            }}
            disabled={loading}
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
