import { store } from '../state/store.js';

export function initBannerRoleBar() {
  const container = document.querySelector('.demo-role-banner');
  if (!container) return;

  function render() {
    const isLecturer = store.isLecturer();
    const isLeader = store.isTeamLeader();
    const currentId = store.state.currentUserId;

    let permissionHint = '';
    if (isLecturer) {
      permissionHint = 'Quyền hạn: Xem toàn cảnh đồ án, đánh giá mốc Milestone & khóa tiến độ';
    } else if (isLeader) {
      permissionHint = 'Quyền hạn: Quản trị nhóm, phân chia việc cho thành viên & chốt tiến độ';
    } else {
      permissionHint = 'Quyền hạn: Xem việc được giao, kéo % tiến độ cá nhân, gửi phản hồi & nộp tệp';
    }

    container.innerHTML = `
      <div class="banner-title">
        <span>ĐỒ ÁN CƠ SỞ (DACS)</span>
        <span style="font-size: 11.5px; color: #a1a1aa; margin-left: 8px;">&bull; ${permissionHint}</span>
      </div>
      <div class="role-switch-buttons">
        <span style="align-self: center; color: #a1a1aa; font-size: 11.5px; margin-right: 4px;">Đang xem với vai trò:</span>
        <button class="btn-role-tab ${currentId === 'u-gv-01' ? 'active' : ''}" data-user-id="u-gv-01">ThS. Bùi Phú Khuyên (GVHD)</button>
        <button class="btn-role-tab ${currentId === 'u-sv-01' ? 'active' : ''}" data-user-id="u-sv-01">Đỗ Minh Trực (Nhóm trưởng)</button>
        <button class="btn-role-tab ${currentId === 'u-sv-02' ? 'active' : ''}" data-user-id="u-sv-02">Trần Minh Duy (Thành viên)</button>
      </div>
    `;

    container.querySelectorAll('.btn-role-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        store.setCurrentUser(btn.dataset.userId);
      });
    });
  }

  store.subscribe(render);
  render();
}
