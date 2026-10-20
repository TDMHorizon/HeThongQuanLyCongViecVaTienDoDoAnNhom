import { store } from '../state/store.js';
import { getInitials } from '../utils/formatters.js';

export function initSidebar() {
  const brandName = document.getElementById('brand-project-name');
  const userAvatar = document.getElementById('current-user-avatar');
  const userName = document.getElementById('current-user-name');
  const userRole = document.getElementById('current-user-role');
  const countKanban = document.getElementById('count-kanban');
  const countMilestones = document.getElementById('count-milestones');
  const countUnread = document.getElementById('count-unread');

  function render() {
    if (!store.state.projectData) return;

    brandName.textContent = store.state.projectData.team ? store.state.projectData.team.ten_nhom : 'Đồ án Nhóm 05';

    // Current user card
    const currentUser = store.getCurrentUser();
    if (currentUser) {
      userAvatar.textContent = getInitials(currentUser.ho_ten);
      userName.textContent = currentUser.ho_ten;

      let roleText = 'Thành viên';
      if (store.isLecturer()) {
        roleText = 'Giảng viên hướng dẫn';
      } else if (store.isTeamLeader()) {
        roleText = 'Nhóm trưởng';
      }
      userRole.textContent = roleText;
    }

    // Badge counts
    const filteredTasks = store.getFilteredTasks();
    if (countKanban) countKanban.textContent = filteredTasks.length;
    if (countMilestones) countMilestones.textContent = store.state.milestones.length;
    if (countUnread) {
      const unreadCount = store.state.notifications.filter(n => !n.trang_thai_doc).length;
      countUnread.textContent = unreadCount;
    }

    // Active tab styling
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.tab === store.state.activeTab);
    });
  }

  // Bind tab click events
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
    item.addEventListener('click', () => {
      store.setActiveTab(item.dataset.tab);
    });
  });

  store.subscribe(render);
  render();
}
