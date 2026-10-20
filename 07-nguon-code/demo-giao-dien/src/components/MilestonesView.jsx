import React from 'react';
import { useProject } from '../context/ProjectContext.jsx';
import { formatDate } from '../utils/formatters.js';

export default function MilestonesView() {
  const { milestones } = useProject();

  return (
    <div id="view-milestones-container" className="view-container">
      <div id="milestones-list-render" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {milestones.map(m => {
          const total = m.tong_so_viec || 0;
          const completed = m.so_viec_hoan_thanh || 0;
          const progress = total ? Math.round((completed / total) * 100) : 0;

          return (
            <div key={m.ma_moc} className="kpi-card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>{m.ten_moc}</h3>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {m.noi_dung_mo_ta || ''}
                  </p>
                </div>
                <span className="meta-pill" style={{ fontWeight: 600 }}>
                  Hạn chót: {formatDate(m.han_hoan_thanh)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '10px' }}>
                <div className="progress-track" style={{ height: '6px', flex: 1 }}>
                  <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <span className="num-tabular" style={{ fontSize: '12.5px', fontWeight: 600, minWidth: '85px' }}>
                  {completed}/{total} việc ({progress}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
