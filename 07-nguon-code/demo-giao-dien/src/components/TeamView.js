import { store } from '../state/store.js';
import { formatDate, getInitials } from '../utils/formatters.js';

export function initTeamView() {
  const container = document.getElementById('team-list-render');

  function render() {
    if (!container || !store.state.teamData) return;
    const { members, instructor } = store.state.teamData;
    const team = store.state.projectData ? store.state.projectData.team : null;

    container.innerHTML = `
      <div class="kpi-card" style="padding: 18px 20px;">
        <h3 style="font-size: 13px; font-weight: 600; margin-bottom: 12px; color: var(--text-muted); text-transform: uppercase;">
          Giảng viên hướng dẫn (K - do_an.ma_giang_vien)
        </h3>
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="user-avatar" style="width: 38px; height: 38px; font-size: 13px;">GV</div>
            <div>
              <div style="font-size: 14px; font-weight: 600;">${instructor ? instructor.ho_ten : 'N/A'}</div>
              <div style="font-size: 12px; color: var(--text-muted);">${instructor ? instructor.email : ''}</div>
            </div>
          </div>
          <span class="meta-pill" style="background: #f1f5f9; font-weight: 600;">Phụ trách đồ án</span>
        </div>
      </div>

      <div class="kpi-card" style="padding: 18px 20px;">
        <h3 style="font-size: 13px; font-weight: 600; margin-bottom: 12px; color: var(--text-muted); text-transform: uppercase;">
          Thành viên nhóm sinh viên (${team ? team.ten_nhom : 'Nhóm'})
        </h3>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${members.map(tv => {
            const isLeader = tv.vai_tro_trong_nhom === 'nhom_truong';
            return `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md);">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div class="user-avatar" style="width: 34px; height: 34px; font-size: 12px;">
                    ${getInitials(tv.ho_ten)}
                  </div>
                  <div>
                    <div style="font-size: 13.5px; font-weight: 600;">${tv.ho_ten}</div>
                    <div style="font-size: 11.5px; color: var(--text-muted);">${tv.email} &bull; Tham gia: ${formatDate(tv.thoi_gian_tham_gia)}</div>
                  </div>
                </div>
                <span class="meta-pill" style="${isLeader ? 'background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; font-weight: 600;' : ''}">
                  ${isLeader ? '★ Nhóm trưởng' : 'Thành viên'}
                </span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  store.subscribe(render);
  render();
}
