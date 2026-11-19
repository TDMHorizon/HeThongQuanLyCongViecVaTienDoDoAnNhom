import React, { useState } from 'react';
import { CHIBI_ASSETS } from '../constants/chibiAssets.js';

// Danh sách tài khoản demo để chọn nhanh khi báo cáo đồ án
const DEMO_ACCOUNTS = [
  {
    email: 'khuyenbp@hutech.edu.vn',
    ho_ten: 'ThS. Bùi Phú Khuyên',
    vai_tro: 'Giảng viên hướng dẫn',
    color: '#7c3aed'
  },
  {
    email: '2180606023@hutech.edu.vn',
    ho_ten: 'Đỗ Minh Trực',
    vai_tro: 'Nhóm trưởng',
    color: '#1d4ed8'
  },
  {
    email: '2280600494@hutech.edu.vn',
    ho_ten: 'Trần Minh Duy',
    vai_tro: 'Thành viên',
    color: '#0f766e'
  }
];

export default function LoginScreen({ onLoginSuccess, onClose, canClose = true }) {
  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    if (!email.trim()) {
      setError('Vui lòng nhập email đăng nhập.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), mat_khau: matKhau })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Đăng nhập thất bại.');
        return;
      }
      onLoginSuccess(data.user);
    } catch (err) {
      setError('Không thể kết nối đến máy chủ. Hãy kiểm tra server đang chạy.');
    } finally {
      setLoading(false);
    }
  }

  function handleQuickLogin(acc) {
    setEmail(acc.email);
    setMatKhau('demo');
    setError('');
  }

  return (
    <div
      className="login-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && canClose && onClose) {
          onClose();
        }
      }}
    >
      <div className="login-card" style={{ position: 'relative' }}>
        {/* Nút đóng modal */}
        {canClose && onClose && (
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            title="Đóng cửa sổ đăng nhập"
            style={{
              position: 'absolute',
              top: '14px',
              right: '16px',
              background: 'transparent',
              border: 'none',
              color: '#a1a1aa',
              fontSize: '22px',
              cursor: 'pointer',
              lineHeight: 1
            }}
          >
            &times;
          </button>
        )}

        {/* Logo + Tiêu đề */}
        <div className="login-header">
          <img
            src={CHIBI_ASSETS.logos.gearTick}
            alt="DACS Logo"
            className="login-logo"
          />
          <h1 className="login-title">Đăng nhập hệ thống</h1>
          <p className="login-subtitle">QUẢN LÝ CÔNG VIỆC</p>
        </div>

        {/* Chọn nhanh tài khoản demo */}
        <div className="login-quick-section">
          <span className="login-quick-label">Chọn nhanh tài khoản demo:</span>
          <div className="login-quick-buttons">
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.email}
                type="button"
                className="login-quick-btn"
                style={{ borderColor: acc.color, color: acc.color }}
                onClick={() => handleQuickLogin(acc)}
              >
                <span className="login-quick-role">{acc.vai_tro}</span>
                <span className="login-quick-name">{acc.ho_ten}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="login-divider"><span>hoặc nhập tay</span></div>

        {/* Form đăng nhập */}
        <form className="login-form" onSubmit={handleLogin}>
          <div className="login-field">
            <label className="login-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              className="login-input"
              placeholder="example@hutech.edu.vn"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="login-pass">Mật khẩu</label>
            <div className="login-pass-wrap">
              <input
                id="login-pass"
                type={showPass ? 'text' : 'password'}
                className="login-input"
                placeholder="Nhập mật khẩu (demo: bất kỳ)"
                value={matKhau}
                onChange={e => setMatKhau(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="login-show-pass"
                onClick={() => setShowPass(v => !v)}
                tabIndex={-1}
                title={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
            <span className="login-hint">Hệ thống demo: nhập bất kỳ mật khẩu đều được chấp nhận.</span>
          </div>

          {error && (
            <div className="login-error">
              <span>⚠️ {error}</span>
            </div>
          )}

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập →'}
          </button>
        </form>

        <p className="login-footer">
          DACS 2026 · HUTECH · React + Node.js + SQLite
        </p>
      </div>
    </div>
  );
}

