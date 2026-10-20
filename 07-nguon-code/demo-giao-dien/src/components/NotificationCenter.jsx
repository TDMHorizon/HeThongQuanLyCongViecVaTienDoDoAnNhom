import React from 'react';
import { useProject } from '../context/ProjectContext.jsx';
import { formatDate } from '../utils/formatters.js';

export default function NotificationCenter() {
  const { notifications } = useProject();

  return (
    <div id="view-notifications-container" className="view-container">
      <div id="notifications-list-render" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {notifications.length === 0 ? (
          <div className="kpi-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Hiện tại không có thông báo nào gửi đến bạn.
          </div>
        ) : (
          notifications.map(tb => {
            const isOverdue = tb.loai_thong_bao === 'canh_bao_tre_han';
            return (
              <div
                key={tb.ma_thong_bao}
                className="comment-card"
                style={{
                  background: tb.trang_thai_doc ? 'var(--ground)' : 'var(--surface)',
                  borderLeft: isOverdue ? '3px solid #b91c1c' : '3px solid #18181b'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, fontSize: '13px', color: isOverdue ? '#b91c1c' : 'var(--text)' }}>
                    {tb.tieu_de}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                    {formatDate(tb.thoi_gian_tao)}
                  </span>
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {tb.noi_dung || ''}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
