import React from 'react';
import { useProject } from '../context/ProjectContext.jsx';
import { getInitials } from '../utils/formatters.js';

export default function Sidebar() {
  const {
    project,
    currentUser,
    isLecturer,
    isLeader,
    activeTab,
    setActiveTab,
    filteredTasks,
    milestones,
    notifications,
    teamMembers
  } = useProject();

  const brandName = project?.team?.ten_nhom || 'Đồ án Nhóm 05';

  let roleText = 'Thành viên';
  if (isLecturer) {
    roleText = 'Giảng viên hướng dẫn';
  } else if (isLeader) {
    roleText = 'Nhóm trưởng';
  }

  const unreadCount = notifications.filter(n => !n.trang_thai_doc).length;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="project-brand">
          <div className="brand-icon">D5</div>
          <div className="brand-info">
            <h1 id="brand-project-name">{brandName}</h1>
            <p>CNPM &bull; DACS 2026</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Không gian làm việc</div>
        <div
          className={`nav-item ${activeTab === 'kanban' ? 'active' : ''}`}
          onClick={() => setActiveTab('kanban')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="9"></rect>
            <rect x="14" y="3" width="7" height="5"></rect>
            <rect x="14" y="12" width="7" height="9"></rect>
            <rect x="3" y="16" width="7" height="5"></rect>
          </svg>
          <span>Bảng việc (Kanban)</span>
          <span className="nav-count">{filteredTasks.length}</span>
        </div>
        <div
          className={`nav-item ${activeTab === 'table' ? 'active' : ''}`}
          onClick={() => setActiveTab('table')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
          <span>Danh sách chi tiết</span>
        </div>
        <div
          className={`nav-item ${activeTab === 'milestones' ? 'active' : ''}`}
          onClick={() => setActiveTab('milestones')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
            <line x1="4" y1="22" x2="4" y2="15"></line>
          </svg>
          <span>Mốc tiến độ (Milestones)</span>
          <span className="nav-count">{milestones.length}</span>
        </div>

        <div className="nav-section-title">Quản lý & Trao đổi</div>
        <div
          className={`nav-item ${activeTab === 'team' ? 'active' : ''}`}
          onClick={() => setActiveTab('team')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span>Thành viên nhóm</span>
          <span className="nav-count">{teamMembers.length || 2}</span>
        </div>
        <div
          className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span>Thông báo hệ thống</span>
          {unreadCount > 0 && <span className="nav-count">{unreadCount}</span>}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="current-user-card">
          <div className="user-avatar">
            {currentUser ? getInitials(currentUser.ho_ten) : '??'}
          </div>
          <div className="user-meta">
            <div className="user-name">{currentUser?.ho_ten || 'Đang tải...'}</div>
            <div className="user-role-badge">{roleText}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
