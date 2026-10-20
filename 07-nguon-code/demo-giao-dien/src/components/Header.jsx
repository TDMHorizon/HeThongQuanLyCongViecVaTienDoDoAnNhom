import React, { useState, useRef, useEffect } from 'react';
import { useProject } from '../context/ProjectContext.jsx';
import { formatDate } from '../utils/formatters.js';

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
    kpis
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
  const courseName = project?.project?.ten_mon_hoc || 'Đồ án cơ sở';
  const projectType = project?.project?.loai_do_an === 'co_so' ? 'Cơ sở (co_so)' : (project?.project?.loai_do_an || 'Cơ sở (co_so)');
  const projectTitle = project?.project?.ten_do_an || 'Hệ thống quản lý công việc và tiến độ đồ án nhóm';
  const projectStatus = 'Đang thực hiện';

  return (
    <header className="canvas-header">
      <div className="header-top-row">
        <div className="project-title-area">
          <h2 id="project-title-heading">{projectTitle}</h2>
          <div className="project-meta-pills">
            <span className="meta-pill" id="pill-course-name">{courseName}</span>
            <span className="meta-pill" id="pill-project-type">Loại: {projectType}</span>
            <span className="meta-pill" id="pill-status-badge">{projectStatus}</span>
            <span className="meta-pill" id="pill-instructor">GVHD: {instructorName}</span>
          </div>
        </div>

        <div className="header-actions">
          {/* Scope Toggle: Hidden for Lecturer */}
          {!isLecturer && (
            <div id="scope-filter-toggle" style={{ display: 'inline-flex', gap: '4px' }}>
              <div className="view-tabs" style={{ marginRight: '4px' }}>
                <button
                  className={`tab-btn ${scopeFilter === 'my' ? 'active' : ''}`}
                  onClick={() => setScopeFilter('my')}
                  style={{ padding: '4px 10px', fontSize: '11.5px' }}
                >
                  Việc của tôi
                </button>
                <button
                  className={`tab-btn ${scopeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setScopeFilter('all')}
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

      {/* Dynamic Overall Progress Track */}
      <div className="progress-summary-bar">
        <span className="progress-label">Tiến độ tổng thể đồ án (do_an.tien_do_tong):</span>
        <div className="progress-track">
          <div
            className="progress-fill"
            id="overall-progress-fill"
            style={{ width: `${overallProgress}%` }}
          ></div>
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
