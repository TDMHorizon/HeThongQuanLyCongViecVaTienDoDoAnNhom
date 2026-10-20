import React from 'react';
import { useProject } from '../context/ProjectContext.jsx';

export default function BannerRoleBar() {
  const { currentUserId, setCurrentUserId, isLecturer, isLeader } = useProject();

  let permissionHint = '';
  if (isLecturer) {
    permissionHint = 'Quyền hạn: Xem toàn cảnh đồ án, đánh giá mốc Milestone & khóa tiến độ';
  } else if (isLeader) {
    permissionHint = 'Quyền hạn: Quản trị nhóm, phân chia việc cho thành viên & chốt tiến độ';
  } else {
    permissionHint = 'Quyền hạn: Xem việc được giao, kéo % tiến độ cá nhân, gửi phản hồi & nộp tệp';
  }

  return (
    <div className="demo-role-banner">
      <div className="banner-title">
        <span>ĐỒ ÁN CƠ SỞ (DACS)</span>
        <span style={{ fontSize: '11.5px', color: '#a1a1aa', marginLeft: '8px' }}>
          &bull; {permissionHint}
        </span>
      </div>
      <div className="role-switch-buttons">
        <span style={{ alignSelf: 'center', color: '#a1a1aa', fontSize: '11.5px', marginRight: '4px' }}>
          Đang xem với vai trò:
        </span>
        <button
          className={`btn-role-tab ${currentUserId === 'u-gv-01' ? 'active' : ''}`}
          onClick={() => setCurrentUserId('u-gv-01')}
        >
          ThS. Bùi Phú Khuyên (GVHD)
        </button>
        <button
          className={`btn-role-tab ${currentUserId === 'u-sv-01' ? 'active' : ''}`}
          onClick={() => setCurrentUserId('u-sv-01')}
        >
          Đỗ Minh Trực (Nhóm trưởng)
        </button>
        <button
          className={`btn-role-tab ${currentUserId === 'u-sv-02' ? 'active' : ''}`}
          onClick={() => setCurrentUserId('u-sv-02')}
        >
          Trần Minh Duy (Thành viên)
        </button>
      </div>
    </div>
  );
}
