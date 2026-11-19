import React, { useState, useRef, useEffect } from 'react';
import { useProject } from '../context/ProjectContext.jsx';
import { formatDate } from '../utils/formatters.js';
import { CHIBI_ASSETS } from '../constants/chibiAssets.js';

export default function Header({ activeTab, setActiveTab }) {
  const {
    project,
    milestones,
    filterMilestoneId,
    setFilterMilestoneId,
    scopeFilter,
    setScopeFilter,
    isLecturer,
    canCreateTask,
    setIsTaskModalOpen,
    kpis,
    chibiMode
  } = useProject();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const overallProgress = (kpis.overallProgress || 0).toFixed(1);
  const activeMilestone = milestones.find(m => m.ma_moc === filterMilestoneId);
  const filterLabel = activeMilestone ? activeMilestone.ten_moc.split(':')[0] : 'Lọc theo Mốc';

  const instructorName = project?.instructor?.ho_ten || 'ThS. Bùi Phú Khuyên';
  const courseName = project?.project?.ten_mon_hoc || 'Môn: Công nghệ phần mềm';
  const loaiMap = {
    mon_hoc: 'Đồ án Môn học',
    co_so: 'Đồ án Cơ sở',
    chuyen_nganh: 'Đồ án Chuyên ngành'
  };
  const projectType = loaiMap[project?.project?.loai_do_an] || 'Đồ án Môn học';
  const projectTitle = project?.project?.ten_do_an || 'Hệ thống quản lý công việc và tiến độ đồ án môn học';
  const projectStatus = 'Đang thực hiện';

  // Chibi Runner state calculation
  const progressNum = parseFloat(overallProgress) || 0;
  let runnerIcon = CHIBI_ASSETS.characters.coLen;
  let runnerSpeech = 'Khởi động nào!';
  if (progressNum >= 100) {
    runnerIcon = CHIBI_ASSETS.characters.success;
    runnerSpeech = 'Về đích 100%! 🎉';
  } else if (progressNum >= 75) {
    runnerIcon = CHIBI_ASSETS.characters.deadline;
    runnerSpeech = 'Nước rút về đích! 🚀';
  } else if (progressNum >= 40) {
    runnerIcon = CHIBI_ASSETS.characters.coding;
    runnerSpeech = 'Đang cày code! 💻';
  } else if (progressNum > 0) {
    runnerIcon = CHIBI_ASSETS.characters.coLen;
    runnerSpeech = 'Cố lên nhóm ơi! ✨';
  }

  return (
    <header className="canvas-header">
      <div className="header-top-row">
        <div className="project-title-area">
          <h2 id="project-title-heading">{projectTitle}</h2>
          <div className="project-meta-pills">
            <span className="meta-pill" id="pill-course-name">{courseName}</span>
            <span className="meta-pill" id="pill-project-type">Loại: {projectType}</span>
            <span className="meta-pill" id="pill-status-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              {chibiMode && (
                <img src={CHIBI_ASSETS.logos.stampOnTrack} alt="On track" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
              )}
              {projectStatus}
            </span>
            <span className="meta-pill" id="pill-instructor">GVHD: {instructorName}</span>
          </div>
        </div>

        <div className="header-actions">
          {/* Scope Toggle: Hidden for Lecturer */}
          {!isLecturer && (
            <div id="scope-filter-toggle" style={{ display: 'inline-flex', gap: '4px' }}>
              <div className="view-tabs" style={{ marginRight: '4px' }}>
                <button
                  className={`tab-btn ${scopeFilter === 'my' || activeTab === 'my-tasks' ? 'active' : ''}`}
                  onClick={() => {
                    setScopeFilter('my');
                    setActiveTab('my-tasks');
                  }}
                  style={{ padding: '4px 10px', fontSize: '11.5px' }}
                >
                  Việc của tôi
                </button>
                <button
                  className={`tab-btn ${scopeFilter === 'all' && activeTab !== 'my-tasks' ? 'active' : ''}`}
                  onClick={() => {
                    setScopeFilter('all');
                    if (activeTab === 'my-tasks') setActiveTab('kanban');
                  }}
                  style={{ padding: '4px 10px', fontSize: '11.5px' }}
                >
                  Toàn nhóm
                </button>
              </div>
            </div>
          )}

          {/* Milestone Filter Dropdown */}
          <div className="milestone-dropdown-wrapper" ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              className="btn btn-outline btn-sm"
              id="btn-filter-milestone"
              onClick={() => setIsDropdownOpen(prev => !prev)}
              style={activeMilestone ? {
                backgroundColor: 'var(--surface-subtle)',
                borderColor: 'var(--text)',
                fontWeight: 600
              } : {}}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              <span id="label-filter-milestone">{filterLabel}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '3px' }}>
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="dropdown-popup" id="dropdown-milestones-menu" style={{ display: 'flex' }}>
                <div className="dropdown-header-title">Lọc công việc theo mốc tiến độ</div>
                <div
                  className={`dropdown-item ${filterMilestoneId === 'all' ? 'active' : ''}`}
                  onClick={() => {
                    setFilterMilestoneId('all');
                    setIsDropdownOpen(false);
                  }}
                >
                  <span>Tất cả các mốc (Toàn bộ)</span>
                  {filterMilestoneId === 'all' && (
                    <span style={{ color: '#15803d', fontWeight: 700 }}>✓</span>
                  )}
                </div>
                <div className="dropdown-divider"></div>
                {milestones.map(m => {
                  const isSelected = filterMilestoneId === m.ma_moc;
                  return (
                    <div
                      key={m.ma_moc}
                      className={`dropdown-item ${isSelected ? 'active' : ''}`}
                      onClick={() => {
                        setFilterMilestoneId(m.ma_moc);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 500 }}>{m.ten_moc}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                          Hạn chót: {formatDate(m.han_hoan_thanh)}
                        </span>
                      </div>
                      {isSelected && (
                        <span style={{ color: '#15803d', fontWeight: 700, marginLeft: '8px' }}>✓</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Create Task Button: Only for Leader */}
          {canCreateTask && (
            <button
              className="btn btn-primary btn-sm"
              id="btn-create-task"
              onClick={() => setIsTaskModalOpen(true)}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Giao việc mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Overall Progress Track with Chibi Marathon Runner */}
      <div className="progress-summary-bar">
        <span className="progress-label">Tiến độ tổng thể đồ án:</span>
        <div className="progress-track-wrapper">
          <div className="progress-track">
            <div
              className="progress-fill"
              id="overall-progress-fill"
              style={{ width: `${progressNum}%` }}
            ></div>
          </div>
          {chibiMode && (
            <div
              className="chibi-progress-runner"
              style={{ left: `calc(${Math.min(Math.max(progressNum, 2), 97)}% - 14px)` }}
              title={`Tiến độ hiện tại: ${progressNum}% - ${runnerSpeech}`}
            >
              <div className="runner-speech-bubble">{runnerSpeech}</div>
              <img
                src={runnerIcon}
                alt="Runner"
                className="runner-mascot-img"
              />
            </div>
          )}
          {chibiMode && (
            <div className="track-finish-cup" title="Cột mốc hoàn thành 100%">
              <img src={CHIBI_ASSETS.icons.trophy} alt="Cup" />
            </div>
          )}
        </div>
        <span className="progress-value num-tabular" id="overall-progress-text">
          {overallProgress}%
        </span>
      </div>

      {/* Navigation Tabs Bar */}
      {(activeTab === 'kanban' || activeTab === 'table') && (
        <div className="view-tabs-bar">
          <div className="view-tabs">
            <button
              className={`tab-btn ${activeTab === 'kanban' ? 'active' : ''}`}
              onClick={() => setActiveTab('kanban')}
            >
              Bảng Kanban
            </button>
            <button
              className={`tab-btn ${activeTab === 'table' ? 'active' : ''}`}
              onClick={() => setActiveTab('table')}
            >
              Bảng chi tiết (Table)
            </button>
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
            Nhấn vào bất kỳ công việc nào để xem chi tiết, cập nhật % và khóa tiến độ.
          </div>
        </div>
      )}
    </header>
  );
}
