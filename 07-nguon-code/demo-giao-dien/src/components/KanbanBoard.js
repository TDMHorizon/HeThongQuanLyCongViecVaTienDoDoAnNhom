import { store } from '../state/store.js';
import { getInitials } from '../utils/formatters.js';

export function initKanbanBoard() {
  const cols = {
    can_lam: document.getElementById('list-can-lam'),
    dang_lam: document.getElementById('list-dang-lam'),
    hoan_thanh: document.getElementById('list-hoan-thanh'),
    tre_han: document.getElementById('list-tre-han')
  };

  const badgeCounts = {
    can_lam: document.getElementById('badge-count-can-lam'),
    dang_lam: document.getElementById('badge-count-dang-lam'),
    hoan_thanh: document.getElementById('badge-count-hoan-thanh'),
    tre_han: document.getElementById('badge-count-tre-han')
  };

  function render() {
    if (!cols.can_lam) return;

    // Reset lists
    Object.values(cols).forEach(col => { if (col) col.innerHTML = ''; });

    const tasks = store.getFilteredTasks();
    const counts = { can_lam: 0, dang_lam: 0, hoan_thanh: 0, tre_han: 0 };

    tasks.forEach(task => {
      counts[task.trang_thai] = (counts[task.trang_thai] || 0) + 1;

      const card = document.createElement('div');
      card.className = 'task-card';
      card.dataset.taskId = task.ma_cong_viec;

      const initials = getInitials(task.ten_nguoi_thuc_hien);
      const isLocked = Boolean(task.trang_thai_khoa);

      card.innerHTML = `
        <div class="task-card-header">
          <span class="task-title">${task.tieu_de}</span>
          ${isLocked ? `<span class="lock-indicator">&#128274; Đã khóa</span>` : ''}
        </div>
        <div>
          <span class="task-milestone-tag">${task.ten_moc || 'Chưa gán mốc'}</span>
        </div>
        <div class="task-card-footer">
          <div class="task-assignee">
            <div class="avatar-tiny">${initials}</div>
            <span>${task.ten_nguoi_thuc_hien ? task.ten_nguoi_thuc_hien.split(' ').slice(-1)[0] : 'Chưa gán'}</span>
          </div>
          <div class="task-progress-mini">
            <div class="progress-mini-bar">
              <div class="progress-mini-fill" style="width: ${task.phan_tram_tien_do}%;"></div>
            </div>
            <span class="num-tabular">${task.phan_tram_tien_do}%</span>
          </div>
        </div>
      `;

      card.onclick = () => store.setSelectedTaskId(task.ma_cong_viec);

      if (cols[task.trang_thai]) {
        cols[task.trang_thai].appendChild(card);
      }
    });

    // Cập nhật số lượng trên tiêu đề cột
    Object.keys(badgeCounts).forEach(status => {
      if (badgeCounts[status]) {
        badgeCounts[status].textContent = counts[status] || 0;
      }
    });
  }

  store.subscribe(render);
  render();
}
