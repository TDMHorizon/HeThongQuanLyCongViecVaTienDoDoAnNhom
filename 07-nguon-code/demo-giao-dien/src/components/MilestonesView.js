import { store } from '../state/store.js';
import { formatDate } from '../utils/formatters.js';

export function initMilestonesView() {
  const container = document.getElementById('milestones-list-render');

  function render() {
    if (!container) return;
    container.innerHTML = '';

    store.state.milestones.forEach(m => {
      const total = m.tong_so_viec || 0;
      const completed = m.so_viec_hoan_thanh || 0;
      const progress = total ? Math.round((completed / total) * 100) : 0;

      const div = document.createElement('div');
      div.className = 'kpi-card';
      div.style.padding = '18px 20px';
      div.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <div>
            <h3 style="font-size: 15px; font-weight: 600; color: var(--text);">${m.ten_moc}</h3>
            <p style="font-size: 12.5px; color: var(--text-muted); margin-top: 4px;">${m.noi_dung_mo_ta || ''}</p>
          </div>
          <span class="meta-pill" style="font-weight: 600;">Hạn chót: ${formatDate(m.han_hoan_thanh)}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 14px; margin-top: 10px;">
          <div class="progress-track" style="height: 6px;">
            <div class="progress-fill" style="width: ${progress}%;"></div>
          </div>
          <span class="num-tabular" style="font-size: 12.5px; font-weight: 600; min-width: 85px;">
            ${completed}/${total} việc (${progress}%)
          </span>
        </div>
      `;

      container.appendChild(div);
    });
  }

  store.subscribe(render);
  render();
}
