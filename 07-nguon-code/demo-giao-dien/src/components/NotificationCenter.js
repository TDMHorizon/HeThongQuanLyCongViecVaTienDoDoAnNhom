import { store } from '../state/store.js';
import { formatDate } from '../utils/formatters.js';

export function initNotificationCenter() {
  const container = document.getElementById('notifications-list-render');

  function render() {
    if (!container) return;
    container.innerHTML = '';

    const list = store.state.notifications;
    if (!list || !list.length) {
      container.innerHTML = `
        <div class="kpi-card" style="padding: 24px; text-align: center; color: var(--text-muted);">
          Hiện tại không có thông báo nào gửi đến bạn.
        </div>
      `;
      return;
    }

    list.forEach(tb => {
      const isOverdue = tb.loai_thong_bao === 'canh_bao_tre_han';
      const div = document.createElement('div');
      div.className = 'comment-card';
      div.style.background = tb.trang_thai_doc ? 'var(--ground)' : 'var(--surface)';
      div.style.borderLeft = isOverdue ? '3px solid #b91c1c' : '3px solid #18181b';
      div.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="font-weight: 600; font-size: 13px; color: ${isOverdue ? '#b91c1c' : 'var(--text)'};">
            ${tb.tieu_de}
          </span>
          <span style="font-size: 11px; color: var(--text-subtle);">${formatDate(tb.thoi_gian_tao)}</span>
        </div>
        <p style="font-size: 12.5px; color: var(--text-muted); line-height: 1.4;">${tb.noi_dung || ''}</p>
      `;
      container.appendChild(div);
    });
  }

  store.subscribe(render);
  render();
}
