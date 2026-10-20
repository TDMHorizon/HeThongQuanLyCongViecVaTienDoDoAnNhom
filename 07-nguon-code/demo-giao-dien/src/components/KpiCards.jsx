import React from 'react';
import { useProject } from '../context/ProjectContext.jsx';

export default function KpiCards() {
  const { filteredTasks } = useProject();

  const inProgress = filteredTasks.filter(t => t.trang_thai === 'dang_lam').length;
  const completed = filteredTasks.filter(t => t.trang_thai === 'hoan_thanh').length;
  const overdue = filteredTasks.filter(t => t.trang_thai === 'tre_han').length;

  return (
    <div className="kpi-grid">
      <div className="kpi-card">
        <span className="kpi-label">Tổng số công việc</span>
        <span className="kpi-value num-tabular" id="kpi-total-tasks">{filteredTasks.length}</span>
        <span className="kpi-subtext">Trong 4 mốc tiến độ</span>
      </div>
      <div className="kpi-card">
        <span className="kpi-label">Đang thực hiện (dang_lam)</span>
        <span className="kpi-value num-tabular" style={{ color: '#1d4ed8' }} id="kpi-in-progress">
          {inProgress}
        </span>
        <span className="kpi-subtext">Đang trong hạn</span>
      </div>
      <div className="kpi-card">
        <span className="kpi-label">Đã hoàn thành (hoan_thanh)</span>
        <span className="kpi-value num-tabular" style={{ color: '#15803d' }} id="kpi-completed">
          {completed}
        </span>
        <span className="kpi-subtext">Đã chốt tiến độ</span>
      </div>
      <div className="kpi-card">
        <span className="kpi-label">Cảnh báo trễ hạn (tre_han)</span>
        <span className="kpi-value num-tabular" style={{ color: '#b91c1c' }} id="kpi-overdue">
          {overdue}
        </span>
        <span className="kpi-subtext">Cần xử lý gấp</span>
      </div>
    </div>
  );
}
