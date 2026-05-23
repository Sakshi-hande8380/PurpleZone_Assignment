import React, { useState } from 'react';

function AuthPage({ onSubmit, error }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!username.trim() || !password.trim()) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (username.length < 3) {
      setLocalError('Username must be at least 3 characters long');
      return;
    }

    if (isRegister) {
      if (password.length < 8) {
        setLocalError('Password must be at least 8 characters long');
        return;
      }
      if (!/[A-Z]/.test(password)) {
        setLocalError('Password must contain at least one uppercase letter');
        return;
      }
      if (!/[a-z]/.test(password)) {
        setLocalError('Password must contain at least one lowercase letter');
        return;
      }
      if (!/\d/.test(password)) {
        setLocalError('Password must contain at least one number');
        return;
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        setLocalError('Password must contain at least one special character (e.g. !@#$%^&*)');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match');
        return;
      }
    } else {
      if (password.length < 6) {
        setLocalError('Password must be at least 6 characters long');
        return;
      }
    }

    setLoading(true);
    try {
      await onSubmit(username.trim(), password, isRegister);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="figma-auth-split">
      <div className="figma-auth-left" />
      <div className="figma-auth-right" />

      <div className="figma-auth-card">
        {/* REGISTER / LOGIN TABS */}
        <div className="figma-tab-group">
          <button
            type="button"
            className={`figma-tab ${isRegister ? 'active' : ''}`}
            onClick={() => {
              setIsRegister(true);
              setLocalError('');
            }}
          >
            REGISTER
          </button>
          <button
            type="button"
            className={`figma-tab ${!isRegister ? 'active' : ''}`}
            onClick={() => {
              setIsRegister(false);
              setLocalError('');
            }}
          >
            LOGIN
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="figma-input-group">
            <label className="figma-input-label">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="figma-underline-input"
              disabled={loading}
              required
            />
          </div>

          <div className="figma-input-group">
            <label className="figma-input-label">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="figma-underline-input"
              disabled={loading}
              required
            />
          </div>

          {isRegister && (
            <div className="figma-input-group">
              <label className="figma-input-label">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="figma-underline-input"
                disabled={loading}
                required
              />
            </div>
          )}

          {(error || localError) && (
            <div style={{ color: '#EF4444', fontSize: '0.8rem', fontWeight: 500, margin: '0 0 -8px 0' }}>
              {localError || error}
            </div>
          )}

          <button type="submit" className="figma-pill-button" disabled={loading}>
            {loading ? 'Processing...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthPage;
