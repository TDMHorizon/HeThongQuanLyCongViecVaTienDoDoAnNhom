/**
 * Root Application Controller (Clean Code Modular Architecture)
 * Quản trị vòng đời ứng dụng và kết nối các Components với Store
 */

import { store } from './state/store.js';
import { initBannerRoleBar } from './components/BannerRoleBar.js';
import { initSidebar } from './components/Sidebar.js';
import { initHeader } from './components/Header.js';
import { initKpiCards } from './components/KpiCards.js';
import { initKanbanBoard } from './components/KanbanBoard.js';
import { initTableView } from './components/TableView.js';
import { initMilestonesView } from './components/MilestonesView.js';
import { initTeamView } from './components/TeamView.js';
import { initNotificationCenter } from './components/NotificationCenter.js';
import { initTaskDrawer } from './components/TaskDrawer.js';
import { initTaskModal } from './components/TaskModal.js';

// View Containers
const views = {
  kanban: document.getElementById('view-kanban-container'),
  table: document.getElementById('view-table-container'),
  milestones: document.getElementById('view-milestones-container'),
  team: document.getElementById('view-team-container'),
  notifications: document.getElementById('view-notifications-container')
};

// Điều phối hiển thị tab
function handleTabChange(state) {
  const activeTab = state.activeTab;

  Object.keys(views).forEach(tabKey => {
    if (views[tabKey]) {
      views[tabKey].style.display = (tabKey === activeTab) ? 'block' : 'none';
    }
  });

  // Đồng bộ nút view tabs ở header (Kanban vs Table)
  document.querySelectorAll('.view-tabs .tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === activeTab);
  });
}

// Bắt sự kiện chuyển đổi giữa Kanban và Table trên Header
document.querySelectorAll('.view-tabs .tab-btn').forEach(btn => {
  btn.onclick = () => {
    store.setActiveTab(btn.dataset.view);
  };
});

// Khởi động toàn bộ các Component độc lập
function bootstrap() {
  console.log('[App] Khởi động hệ thống Clean Code Modular UI...');

  initBannerRoleBar();
  initSidebar();
  initHeader();
  initKpiCards();
  initKanbanBoard();
  initTableView();
  initMilestonesView();
  initTeamView();
  initNotificationCenter();
  initTaskDrawer();
  initTaskModal();

  store.subscribe(handleTabChange);

  // Tải dữ liệu ban đầu từ CSDL SQLite
  store.loadAll();
}

bootstrap();
