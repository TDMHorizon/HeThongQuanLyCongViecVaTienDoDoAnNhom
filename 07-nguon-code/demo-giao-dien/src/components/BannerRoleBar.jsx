import React from 'react';
import { useProject } from '../context/ProjectContext.jsx';
import { CHIBI_ASSETS } from '../constants/chibiAssets.js';

export default function BannerRoleBar() {
  const { authUser, isLecturer, isLeader, chibiMode, toggleChibiMode, logout, setIsLoginModalOpen } = useProject();

  // Nhãn quyền hạn hiển thị trên banner
  let permissionHint = 'Chế độ xem chung (Khách) &bull; Đăng nhập để tự chấm tiến độ và nộp tài liệu';
  let roleLabel = 'Khách';
  let badgeSrc = null;

  if (authUser) {
    if (isLecturer) {
      permissionHint = 'Quyền hạn: Xem toàn cảnh đồ án, đánh giá mốc Milestone & khóa tiến độ';
      roleLabel = 'Giảng viên hướng dẫn';
      badgeSrc = CHIBI_ASSETS.badges?.review10;
    } else if (isLeader) {
      permissionHint = 'Quyền hạn: Quản trị nhóm, phân việc, tự chấm tiến độ & chốt khóa';
      roleLabel = 'Nhóm trưởng';
      badgeSrc = CHIBI_ASSETS.badges?.leader;
    } else {
      permissionHint = 'Quyền hạn: Tự chấm tiến độ cho bản thân (25%-100%), gửi phản hồi sticker & nộp tệp';
      roleLabel = 'Thành viên';
      badgeSrc = CHIBI_ASSETS.badges?.fresher;
    }
  }

  return (
    <div className="demo-role-banner">
      {/* Bên trái: Logo + Tiêu đề đồ án */}
      <div className="banner-title">
        {chibiMode && (
          <img
            src={CHIBI_ASSETS.logos.gearTick}
            alt="DACS Logo"
            style={{ width: '30px', height: '30px', marginRight: '8px', objectFit: 'contain' }}
          />
        )}
        <span style={{ fontWeight: 700, fontSize: '13px', letterSpacing: '0.4px' }}>HỆ THỐNG QUẢN LÝ ĐỒ ÁN MÔN HỌC</span>
        <span className="banner-hint-text" style={{ fontSize: '11.5px', color: '#a1a1aa', marginLeft: '8px' }}>
          &bull; {permissionHint}
        </span>
      </div>

      {/* Bên phải: Thông tin user đang đăng nhập + nút Chibi + nút Đăng xuất / Đăng nhập */}
      <div className="role-switch-buttons" style={{ display: 'flex', alignItems: 'center' }}>
        {authUser ? (
          <>
            <div className="banner-user-info">
              {chibiMode && badgeSrc && (
                <img
                  src={badgeSrc}
                  alt={roleLabel}
                  style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                />
              )}
              <div className="banner-user-texts">
                <span className="banner-user-name">{authUser.ho_ten}</span>
                <span className="banner-user-role">{roleLabel}</span>
              </div>
            </div>

            <button
              className="btn-logout"
              onClick={logout}
              title="Đăng xuất khỏi hệ thống"
            >
              Đăng xuất
            </button>
          </>
        ) : (
          <button
            className="btn-login-trigger"
            onClick={() => setIsLoginModalOpen(true)}
            title="Đăng nhập tài khoản"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 14px',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <span>🔑 Đăng nhập</span>
          </button>
        )}

        {/* Chibi Mascot Mode Toggle */}
        <button
          className={`btn-chibi-toggle ${chibiMode ? 'active' : ''}`}
          onClick={toggleChibiMode}
          title={chibiMode ? 'Chuyển sang giao diện Tối giản (Minimalist)' : 'Bật giao diện Chibi Mascot sinh động'}
          style={{
            marginLeft: '8px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 10px',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            border: chibiMode ? '1px solid #f59e0b' : '1px solid #3f3f46',
            background: chibiMode ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : '#27272a',
            color: chibiMode ? '#92400e' : '#a1a1aa',
            transition: 'all 0.2s ease'
          }}
        >
          <span>{chibiMode ? '✨ Chibi: BẬT' : '🌿 Tối giản'}</span>
        </button>
      </div>
    </div>
  );
}
