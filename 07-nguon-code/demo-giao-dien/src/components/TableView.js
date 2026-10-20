import { store } from '../state/store.js';
import { formatDate } from '../utils/formatters.js';

export function initTableView() {
  const tbody = document.getElementById('table-tasks-body');

  function render() {
    if (!tbody) return;
    tbody.innerHTML = '';

    const tasks = store.getFilteredTasks();

    if (!tasks.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">
            Không có công việc nào trong danh mục này.
          </td>
        </tr>
      `;
      return;
    }

    tasks.forEach(task => {
      const isLocked = Boolean(task.trang_thai_khoa);
      const tr = document.createElement('tr');
      tr.dataset.taskId = task.ma_cong_viec;
      tr.innerHTML = `
        <td style="font-weight: 500;">
          ${task.tieu_de}
          ${isLocked ? ' <span style="font-size: 11px; color: #b45309;">&#128274;</span>' : ''}
        </td>
        <td style="color: var(--text-muted);">${task.ten_moc || 'N/A'}</td>
        <td>${task.ten_nguoi_thuc_hien || '<span style="color: var(--text-subtle);">Chưa gán</span>'}</td>
        <td class="date-cell">${formatDate(task.han_chot)}</td>
        <td style="text-align: right; font-weight: 600;" class="num-tabular">${task.phan_tram_tien_do}%</td>
        <td style="text-align: center;">${isLocked ? '&#128274;' : '-'}</td>
      `;

      tr.onclick = () => store.setSelectedTaskId(task.ma_cong_viec);
      tbody.appendChild(tr);
    });
  }

  store.subscribe(render);
  render();
}
