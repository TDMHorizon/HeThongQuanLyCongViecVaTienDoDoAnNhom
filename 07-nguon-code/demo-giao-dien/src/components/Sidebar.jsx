import React from 'react';
import { useProject } from '../context/ProjectContext.jsx';
import { getInitials } from '../utils/formatters.js';
import { CHIBI_ASSETS } from '../constants/chibiAssets.js';

export default function Sidebar() {
  const {
    activeProjectId,
    project,
    topics,
    currentUser,
    isLecturer,
    isLeader,
    activeTab,
    setActiveTab,
    filteredTasks,
    milestones,
    notifications,
    teamMembers,
    chibiMode,
    switchProject,
    enterWorkspace,
    returnToClassroom
  } = useProject();

  const isClassroomView = activeTab === 'classroom';
  const brandName = project?.team?.ten_nhom || 'Nhóm Đồ án Môn học 05';
  const isSoloProject = project?.project?.quy_mo === 'ca_nhan' || brandName.startsWith('Cá nhân');

  // Các đề tài đã có nhóm / sinh viên đăng ký (có Workspace hoạt động)
  const registeredTopics = topics.filter(t => t.da_dang_ky);
  const openTopicsCount = topics.filter(t => !t.da_dang_ky).length;

  let roleText = 'Thành viên';
  let frameSrc = CHIBI_ASSETS.avatarFrames.member;
  let roleBadgeSrc = CHIBI_ASSETS.badges.fresher;

  if (isLecturer) {
    roleText = 'Giảng viên phụ trách (GVPTMH)';
    frameSrc = CHIBI_ASSETS.avatarFrames.gv;
    roleBadgeSrc = CHIBI_ASSETS.badges.review10;
  } else if (isLeader) {
    roleText = isSoloProject ? 'Cá nhân thực hiện (1 SV)' : 'Nhóm trưởng';
    frameSrc = CHIBI_ASSETS.avatarFrames.leader;
    roleBadgeSrc = CHIBI_ASSETS.badges.leader;
  }

  const unreadCount = notifications.filter(n => !n.trang_thai_doc).length;

  return (
    <aside className="sidebar">
      {/* 1. NÚT QUAY LẠI CỔNG MÔN HỌC (HIỂN THỊ KHI ĐANG Ở BÊN TRONG WORKSPACE KANBAN) */}
      {!isClassroomView && (
        <div style={{ padding: '12px 14px 6px 14px', borderBottom: '1px solid var(--border)' }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={returnToClassroom}
            style={{
              width: '100%',
              justifyContent: 'center',
              gap: '6px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
              borderColor: '#93c5fd',
              color: '#1d4ed8',
              fontSize: '12px',
              padding: '7px 10px',
              borderRadius: '8px'
            }}
          >
            <span>🏫 ← Quay lại Cổng Môn học</span>
          </button>
        </div>
      )}

      {/* 2. HEADER SIDEBAR: CỔNG LỚP HỌC HOẶC BRAND CỦA NHÓM */}
      <div className="sidebar-header" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {isClassroomView ? (
          <div className="sidebar-brand-banner" title="Cổng Môn học • Lớp 21DTHC5">
            <img
              src={CHIBI_ASSETS.logos.team}
              alt="Logo Cổng"
              className="brand-banner-bg"
            />
            <div className="brand-banner-overlay">
              <span className="brand-banner-tag">GVPTMH &bull; LỚP 21DTHC5</span>
              <h1 id="brand-project-name" className="brand-banner-title">Cổng Đồ án Môn học</h1>
            </div>
          </div>
        ) : (
          <>
            {chibiMode ? (
              <div className="sidebar-brand-banner" title={brandName}>
                <img
                  src={CHIBI_ASSETS.logos.team}
                  alt="Logo Nhóm"
                  className="brand-banner-bg"
                />
                <div className="brand-banner-overlay">
                  <span className="brand-banner-tag">
                    {isSoloProject ? 'ĐỀ TÀI CÁ NHÂN • 1 SV' : 'CNPM • LỚP 21DTHC5'}
                  </span>
                  <h1 id="brand-project-name" className="brand-banner-title">{brandName}</h1>
                </div>
              </div>
            ) : (
              <div className="project-brand">
                <div className="brand-icon">{isSoloProject ? '1P' : 'D5'}</div>
                <div className="brand-info">
                  <h1 id="brand-project-name">{brandName}</h1>
                  <p>{isSoloProject ? 'Đề tài Cá nhân • 1 SV' : 'CNPM • Lớp 21DTHC5'}</p>
                </div>
              </div>
            )}

            {/* Bộ chuyển đổi Nhóm / Đề tài trong Lớp học phần */}
            <div
              style={{
                background: 'var(--surface-subtle)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '6px 8px'
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '3px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Chuyển Nhóm / Đề tài:</span>
                <span style={{ color: '#2563eb' }}>{registeredTopics.length} nhóm</span>
              </div>
              <select
                id="workspace-project-switcher"
                value={activeProjectId}
                onChange={(e) => switchProject(e.target.value)}
                style={{
                  width: '100%',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text)',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '5px 6px',
                  cursor: 'pointer'
                }}
              >
                {registeredTopics.map(t => (
                  <option key={t.ma_do_an} value={t.ma_do_an}>
                    {t.quy_mo === 'ca_nhan' ? '👤 ' : '👥 '}
                    {t.team?.ten_nhom || t.ten_do_an} ({Number(t.tien_do_tong || 0).toFixed(0)}%)
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      {/* 3. MENU ĐIỀU HƯỚNG TÙY THEO TẦNG HIỂN THỊ */}
      <nav className="sidebar-nav">
        {isClassroomView ? (
          /* MENU KHI Ở CỔNG MÔN HỌC (GỌN GÀNG, KHÔNG RỐI MẮT) */
          <>
            <div className="nav-section-title">Cổng Lớp Môn học</div>
            <div
              className={`nav-item ${activeTab === 'classroom' ? 'active' : ''}`}
              onClick={() => setActiveTab('classroom')}
            >
              {chibiMode ? (
                <img src={CHIBI_ASSETS.characters.gvReview} alt="Class" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                </svg>
              )}
              <span style={{ fontWeight: 600 }}>Tổng quan Lớp & Đề tài</span>
              <span className="nav-count" style={{ background: '#dcfce7', color: '#15803d', fontWeight: 700 }}>
                {topics.length} ĐT
              </span>
            </div>

            <div className="nav-section-title">Hộp thư</div>
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
          </>
        ) : (
          /* MENU KHI Ở KHÔNG GIAN LÀM VIỆC CHI TIẾT (WORKSPACE KANBAN) */
          <>
            <div className="nav-section-title">Không gian làm việc</div>
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

            <div className="nav-section-title">Quản lý &amp; Trao đổi</div>
            <div
              className={`nav-item ${activeTab === 'github' ? 'active' : ''}`}
              data-tour-id="tour-nav-github"
              onClick={() => setActiveTab('github')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span>GitHub Tiến độ</span>
            </div>
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
              <span>{isSoloProject ? 'Thông tin Cá nhân & GV' : 'Thành viên nhóm'}</span>
              <span className="nav-count">{teamMembers?.members?.length || 1}</span>
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
          </>
        )}
      </nav>

      {/* 4. FOOTER THÔNG TIN NGƯỜI DÙNG */}
      <div className="sidebar-footer">
        <div className="current-user-card" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="avatar-frame-wrap" style={{ position: 'relative', width: '48px', height: '48px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div
              className="user-avatar"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#1e293b',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              {currentUser ? getInitials(currentUser.ho_ten) : '??'}
            </div>
            {chibiMode && (
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
              {currentUser?.ho_ten || 'Chưa đăng nhập'}
            </div>
            <div className="user-role-badge" style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
              {chibiMode && currentUser && (
                <img src={roleBadgeSrc} alt="Badge" style={{ width: '15px', height: '15px', objectFit: 'contain' }} />
              )}
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{currentUser ? roleText : 'Chế độ khách'}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
