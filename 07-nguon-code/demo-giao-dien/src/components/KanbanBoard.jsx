import React from 'react';
import { useProject } from '../context/ProjectContext.jsx';
import { getInitials } from '../utils/formatters.js';

export default function KanbanBoard() {
  const { filteredTasks, setSelectedTaskId } = useProject();

  const columns = [
    { key: 'can_lam', label: 'Cần làm', badgeClass: 'badge-can-lam' },
    { key: 'dang_lam', label: 'Đang làm', badgeClass: 'badge-dang-lam' },
    { key: 'hoan_thanh', label: 'Hoàn thành', badgeClass: 'badge-hoan-thanh' },
    { key: 'tre_han', label: 'Trễ hạn', badgeClass: 'badge-tre-han' }
  ];

  return (
    <div id="view-kanban-container" className="view-container">
      <div className="kanban-board">
        {columns.map(col => {
          const colTasks = filteredTasks.filter(t => t.trang_thai === col.key);
          return (
            <div key={col.key} className="kanban-col" data-status={col.key}>
              <div className="kanban-col-header">
                <span className="kanban-col-title">
                  <span className={`col-badge ${col.badgeClass}`}>{colTasks.length}</span>
                  <span>{col.label}</span>
                </span>
              </div>
              <div className="kanban-cards-list" id={`list-${col.key}`}>
                {colTasks.map(task => {
                  const initials = getInitials(task.ten_nguoi_thuc_hien);
                  const isLocked = Boolean(task.trang_thai_khoa);
                  const shortName = task.ten_nguoi_thuc_hien
                    ? task.ten_nguoi_thuc_hien.trim().split(/\s+/).slice(-1)[0]
                    : 'Chưa gán';

                  return (
                    <div
                      key={task.ma_cong_viec}
                      className="task-card"
                      data-task-id={task.ma_cong_viec}
                      onClick={() => setSelectedTaskId(task.ma_cong_viec)}
                    >
                      <div className="task-card-header">
                        <span className="task-title">{task.tieu_de}</span>
                        {isLocked && <span className="lock-indicator">&#128274; Đã khóa</span>}
                      </div>
                      <div>
                        <span className="task-milestone-tag">
                          {task.ten_moc || 'Chưa gán mốc'}
                        </span>
                      </div>
                      <div className="task-card-footer">
                        <div className="task-assignee">
                          <div className="avatar-tiny">{initials}</div>
                          <span>{shortName}</span>
                        </div>
                        <div className="task-progress-mini">
                          <div className="progress-mini-bar">
                            <div
                              className="progress-mini-fill"
                              style={{ width: `${task.phan_tram_tien_do}%` }}
                            ></div>
                          </div>
                          <span className="num-tabular">{task.phan_tram_tien_do}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
