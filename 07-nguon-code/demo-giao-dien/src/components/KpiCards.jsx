import React from 'react';
import { useProject } from '../context/ProjectContext.jsx';
import { CHIBI_ASSETS } from '../constants/chibiAssets.js';
import { isTaskOverdue } from '../utils/formatters.js';

export default function KpiCards() {
  const { filteredTasks, chibiMode } = useProject();

  const completed = filteredTasks.filter(t => t.trang_thai === 'hoan_thanh' || Number(t.phan_tram_tien_do) >= 100).length;
  // Đếm chuẩn xác tất cả công việc chưa xong mà đã quá ngày hạn chót
  const overdue = filteredTasks.filter(t => isTaskOverdue(t)).length;
  const inProgress = filteredTasks.filter(t => (t.trang_thai === 'dang_lam' || (Number(t.phan_tram_tien_do) > 0 && Number(t.phan_tram_tien_do) < 100)) && !isTaskOverdue(t)).length;

  return (
    <div className="kpi-grid">
      {/* 1. Tổng số công việc */}
      <div className="kpi-card kpi-card-total">
        <div className="kpi-card-inner">
          <div className="kpi-card-text">
            <span className="kpi-label">Tổng số công việc</span>
            <span className="kpi-value num-tabular" id="kpi-total-tasks">{filteredTasks.length}</span>
            <span className="kpi-subtext">Trong 4 mốc tiến độ</span>
          </div>
          {chibiMode && (
            <div className="kpi-watermark-mascot">
              <img
                src={CHIBI_ASSETS.characters.chiaTask}
                alt="Tổng việc"
              />
            </div>
          )}
        </div>
      </div>

      {/* 2. Đang thực hiện */}
      <div className="kpi-card kpi-card-progress">
        <div className="kpi-card-inner">
          <div className="kpi-card-text">
            <span className="kpi-label">Đang thực hiện</span>
            <span className="kpi-value num-tabular" style={{ color: '#1d4ed8' }} id="kpi-in-progress">
              {inProgress}
            </span>
            <span className="kpi-subtext">Đang trong hạn quy định</span>
          </div>
          {chibiMode && (
            <div className="kpi-watermark-mascot">
              <img
                src={CHIBI_ASSETS.characters.coding}
                alt="Đang thực hiện"
              />
            </div>
          )}
        </div>
      </div>

      {/* 3. Đã hoàn thành */}
      <div className="kpi-card kpi-card-completed">
        <div className="kpi-card-inner">
          <div className="kpi-card-text">
            <span className="kpi-label">Đã hoàn thành</span>
            <span className="kpi-value num-tabular" style={{ color: '#15803d' }} id="kpi-completed">
              {completed}
            </span>
            <span className="kpi-subtext">Đã chốt tiến độ</span>
          </div>
          {chibiMode && (
            <div className="kpi-watermark-mascot">
              <img
                src={CHIBI_ASSETS.characters.success}
                alt="Hoàn thành"
              />
            </div>
          )}
        </div>
      </div>

      {/* 4. Cảnh báo trễ hạn */}
      <div className="kpi-card kpi-card-overdue">
        <div className="kpi-card-inner">
          <div className="kpi-card-text">
            <span className="kpi-label">Cảnh báo trễ hạn</span>
            <span className="kpi-value num-tabular" style={{ color: '#b91c1c' }} id="kpi-overdue">
              {overdue}
            </span>
            <span className="kpi-subtext">{overdue > 0 ? 'Cần xử lý gấp' : 'Tuyệt vời, 0 việc trễ'}</span>
          </div>
          {chibiMode && (
            <div className="kpi-watermark-mascot">
              <img
                src={overdue > 0 ? CHIBI_ASSETS.characters.tieuChay : CHIBI_ASSETS.characters.success}
                alt="Trễ hạn"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
