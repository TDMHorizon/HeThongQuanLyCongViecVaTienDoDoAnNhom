import React from 'react';
import { useProject } from '../context/ProjectContext.jsx';
import { getInitials } from '../utils/formatters.js';
import { CHIBI_ASSETS } from '../constants/chibiAssets.js';

export default function Sidebar() {
  const {
    project,
    currentUser,
    currentUserId,
    isLecturer,
    isLeader,
    activeTab,
    setActiveTab,
    tasks,
    filteredTasks,
    milestones,
    notifications,
    teamMembers,
    chibiMode,
    setIsLoginModalOpen
  } = useProject();

  const brandName = project?.team?.ten_nhom || 'Nhóm Đồ án Môn học 05';

  let roleText = currentUser ? 'Thành viên' : 'Chế độ khách';
  let frameSrc = CHIBI_ASSETS.avatarFrames.member;
  let roleBadgeSrc = CHIBI_ASSETS.badges.fresher;

  if (isLecturer) {
    roleText = 'Giảng viên hướng dẫn';
    frameSrc = CHIBI_ASSETS.avatarFrames.gv;
    roleBadgeSrc = CHIBI_ASSETS.badges.review10;
  } else if (isLeader) {
    roleText = 'Nhóm trưởng';
    frameSrc = CHIBI_ASSETS.avatarFrames.leader;
    roleBadgeSrc = CHIBI_ASSETS.badges.leader;
  }

  const unreadCount = notifications.filter(n => !n.trang_thai_doc).length;

  // Đếm công việc cá nhân của người đang đăng nhập
  const myTasksCount = (tasks || []).filter(t => t.ma_nguoi_thuc_hien === currentUserId).length;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        {chibiMode ? (
          <div className="sidebar-brand-banner" title={brandName}>
            <img
              src={CHIBI_ASSETS.logos.team}
              alt="Logo Nhóm 05"
              className="brand-banner-bg"
            />
            <div className="brand-banner-overlay">
              <span className="brand-banner-tag">CNPM &bull; 2026</span>
              <h1 id="brand-project-name" className="brand-banner-title">{brandName}</h1>
            </div>
          </div>
        ) : (
          <div className="project-brand">
            <div className="brand-icon">D5</div>
            <div className="brand-info">
              <h1 id="brand-project-name">{brandName}</h1>
              <p>CNPM &bull; 2026</p>
            </div>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Không gian làm việc</div>

        {/* 1. Bảng việc Kanban */}
        <div
          className={`nav-item ${activeTab === 'kanban' ? 'active' : ''}`}
          onClick={() => setActiveTab('kanban')}
        >
          {chibiMode ? (
            <img src={CHIBI_ASSETS.icons.kanban} alt="Kanban" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="9"></rect>
              <rect x="14" y="3" width="7" height="5"></rect>
              <rect x="14" y="12" width="7" height="9"></rect>
              <rect x="3" y="16" width="7" height="5"></rect>
            </svg>
          )}
          <span>Bảng việc (Kanban)</span>
          <span className="nav-count">{filteredTasks.length}</span>
        </div>


        <div
          className={`nav-item ${activeTab === 'table' ? 'active' : ''}`}
          onClick={() => setActiveTab('table')}
        >
          {chibiMode ? (
            <img src={CHIBI_ASSETS.icons.checklist} alt="List" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
          )}
          <span>Danh sách chi tiết</span>
        </div>
        <div
          className={`nav-item ${activeTab === 'milestones' ? 'active' : ''}`}
          onClick={() => setActiveTab('milestones')}
        >
          {chibiMode ? (
            <img src={CHIBI_ASSETS.icons.flag} alt="Milestones" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
              <line x1="4" y1="22" x2="4" y2="15"></line>
            </svg>
          )}
          <span>Mốc tiến độ (Milestones)</span>
          <span className="nav-count">{milestones.length}</span>
        </div>

        <div className="nav-section-title">Quản lý & Trao đổi</div>
        <div
          className={`nav-item ${activeTab === 'team' ? 'active' : ''}`}
          onClick={() => setActiveTab('team')}
        >
          {chibiMode ? (
            <img src={CHIBI_ASSETS.characters.chiaTask} alt="Team" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          )}
          <span>Thành viên nhóm</span>
          <span className="nav-count">{teamMembers?.members?.length || 2}</span>
        </div>
        <div
          className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          {chibiMode ? (
            <img src={CHIBI_ASSETS.icons.bell} alt="Notify" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          )}
          <span>Thông báo hệ thống</span>
          {unreadCount > 0 && <span className="nav-count">{unreadCount}</span>}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div
          className="current-user-card"
          onClick={() => {
            if (!currentUser && setIsLoginModalOpen) {
              setIsLoginModalOpen(true);
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: !currentUser ? 'pointer' : 'default',
            padding: '6px 8px',
            borderRadius: '8px',
            transition: 'background 0.2s ease'
          }}
          title={!currentUser ? 'Bấm để đăng nhập' : ''}
        >
          <div className="avatar-frame-wrap" style={{ position: 'relative', width: '48px', height: '48px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div
              className="user-avatar"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: currentUser ? '#1e293b' : '#2563eb',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: currentUser ? '13px' : '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              {currentUser ? getInitials(currentUser.ho_ten) : '👤'}
            </div>
            {chibiMode && currentUser && (
              <img
                src={frameSrc}
                alt="Frame"
                style={{
                  position: 'absolute',
                  top: '-3px',
                  left: '-3px',
                  width: '54px',
                  height: '54px',
                  pointerEvents: 'none',
                  zIndex: 2,
                  objectFit: 'contain'
                }}
              />
            )}
          </div>
          <div className="user-meta" style={{ minWidth: 0, flex: 1 }}>
            <div className="user-name" style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentUser?.ho_ten || 'Chế độ khách'}
            </div>
            <div className="user-role-badge" style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
              {chibiMode && currentUser && (
                <img src={roleBadgeSrc} alt="Badge" style={{ width: '15px', height: '15px', objectFit: 'contain' }} />
              )}
              <span style={{ fontSize: '11px', color: !currentUser ? '#2563eb' : 'var(--text-muted)', fontWeight: !currentUser ? 600 : 400 }}>
                {!currentUser ? '🔑 Bấm để đăng nhập' : roleText}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
