import React from 'react';
import { useProject } from '../context/ProjectContext.jsx';
import { formatDate, getInitials } from '../utils/formatters.js';

export default function TeamView() {
  const { teamMembers, project } = useProject();

  const instructor = teamMembers?.instructor || project?.instructor;
  const members = teamMembers?.members || [];
  const team = project?.team;

  return (
    <div id="view-team-container" className="view-container">
      <div id="team-list-render" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="kpi-card" style={{ padding: '18px 20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Giảng viên hướng dẫn (K - do_an.ma_giang_vien)
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="user-avatar" style={{ width: '38px', height: '38px', fontSize: '13px' }}>
                GV
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{instructor?.ho_ten || 'ThS. Bùi Phú Khuyên'}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{instructor?.email || 'bpkhuyen@hutech.edu.vn'}</div>
              </div>
            </div>
            <span className="meta-pill" style={{ background: '#f1f5f9', fontWeight: 600 }}>Phụ trách đồ án</span>
          </div>
        </div>

        <div className="kpi-card" style={{ padding: '18px 20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Thành viên nhóm sinh viên ({team?.ten_nhom || 'Nhóm'})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {members.map(tv => {
              const isLeader = tv.vai_tro_trong_nhom === 'nhom_truong';
              return (
                <div
                  key={tv.ma_thanh_vien || tv.ma_nguoi_dung}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="user-avatar" style={{ width: '34px', height: '34px', fontSize: '12px' }}>
                      {getInitials(tv.ho_ten)}
                    </div>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 600 }}>{tv.ho_ten}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                        {tv.email} &bull; Tham gia: {formatDate(tv.thoi_gian_tham_gia)}
                      </div>
                    </div>
                  </div>
                  <span
                    className="meta-pill"
                    style={isLeader ? { background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe', fontWeight: 600 } : {}}
                  >
                    {isLeader ? '★ Nhóm trưởng' : 'Thành viên'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
