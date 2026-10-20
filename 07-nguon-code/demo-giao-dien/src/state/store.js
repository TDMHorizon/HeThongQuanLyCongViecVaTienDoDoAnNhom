import { apiService } from '../services/apiService.js';

class AppStore {
  constructor() {
    this.state = {
      currentUserId: 'u-sv-01', // Mặc định: Đỗ Minh Trực (Nhóm trưởng)
      activeTab: 'kanban',
      filterScope: 'all_tasks', // 'all_tasks' hoặc 'my_tasks'
      filterMilestoneId: 'all',
      selectedTaskId: null,
      
      // Data models from SQLite
      projectData: null,
      users: [],
      milestones: [],
      tasks: [],
      teamData: null,
      notifications: [],
      loading: true,
      error: null
    };

    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  // Load all data from SQLite backend
  async loadAll() {
    this.state.loading = true;
    this.notify();

    try {
      const [projectRes, usersRes, milestonesRes, tasksRes, teamRes, notifRes] = await Promise.all([
        apiService.getProject(),
        apiService.getUsers(),
        apiService.getMilestones(),
        apiService.getTasks(),
        apiService.getTeam(),
        apiService.getNotifications(this.state.currentUserId)
      ]);

      this.state.projectData = projectRes;
      this.state.users = usersRes;
      this.state.milestones = milestonesRes;
      this.state.tasks = tasksRes;
      this.state.teamData = teamRes;
      this.state.notifications = notifRes;
      this.state.loading = false;
      this.state.error = null;
    } catch (err) {
      console.error('[Store] Lỗi tải dữ liệu từ CSDL:', err);
      this.state.error = err.message;
      this.state.loading = false;
    }

    this.notify();
  }

  // Reload tasks & project after update
  async reloadTasks() {
    try {
      const [projectRes, tasksRes, milestonesRes] = await Promise.all([
        apiService.getProject(),
        apiService.getTasks(),
        apiService.getMilestones()
      ]);
      this.state.projectData = projectRes;
      this.state.tasks = tasksRes;
      this.state.milestones = milestonesRes;
      this.notify();
    } catch (err) {
      console.error('[Store] Lỗi reload tasks:', err);
    }
  }

  // Current User Helpers
  getCurrentUser() {
    return this.state.users.find(u => u.ma_nguoi_dung === this.state.currentUserId) || null;
  }

  isLecturer() {
    const user = this.getCurrentUser();
    return user && user.vai_tro_he_thong === 'giangvien';
  }

  isTeamLeader() {
    const user = this.getCurrentUser();
    if (!user || !this.state.teamData) return false;
    const member = this.state.teamData.members.find(m => m.ma_nguoi_dung === user.ma_nguoi_dung);
    return member && member.vai_tro_trong_nhom === 'nhom_truong';
  }

  isMember() {
    const user = this.getCurrentUser();
    if (!user || !this.state.teamData) return false;
    const member = this.state.teamData.members.find(m => m.ma_nguoi_dung === user.ma_nguoi_dung);
    return member && member.vai_tro_trong_nhom === 'thanh_vien';
  }

  // RBAC Permission Gates
  canCreateTask() {
    return this.isLecturer() || this.isTeamLeader();
  }

  canLockTask() {
    return this.isLecturer() || this.isTeamLeader();
  }

  canEditTaskProgress(task) {
    if (!task) return false;
    if (task.trang_thai_khoa) return false; // Đã khóa thì không ai được tự ý kéo % trừ khi mở khóa
    if (this.isLecturer() || this.isTeamLeader()) return true;
    return task.ma_nguoi_thuc_hien === this.state.currentUserId;
  }

  // Role switching
  async setCurrentUser(userId) {
    this.state.currentUserId = userId;
    
    // Đặt mặc định scope theo vai trò:
    // Thành viên: Mặc định lọc "Việc của tôi"
    // Nhóm trưởng / Giảng viên: Mặc định "Toàn bộ việc của nhóm"
    if (userId === 'u-sv-02') {
      this.state.filterScope = 'my_tasks';
    } else {
      this.state.filterScope = 'all_tasks';
    }

    try {
      this.state.notifications = await apiService.getNotifications(userId);
    } catch (e) {
      console.warn('Lỗi tải thông báo cho user:', e);
    }

    this.notify();
  }

  setFilterScope(scope) {
    this.state.filterScope = scope;
    this.notify();
  }

  setFilterMilestone(milestoneId) {
    this.state.filterMilestoneId = milestoneId;
    this.notify();
  }

  setActiveTab(tab) {
    this.state.activeTab = tab;
    this.notify();
  }

  setSelectedTaskId(id) {
    this.state.selectedTaskId = id;
    this.notify();
  }

  // Get filtered tasks according to current role and scope
  getFilteredTasks() {
    return this.state.tasks.filter(t => {
      // 1. Filter theo Milestone nếu có chọn
      if (this.state.filterMilestoneId !== 'all' && t.ma_moc !== this.state.filterMilestoneId) {
        return false;
      }
      // 2. Filter theo Scope (Việc của tôi vs Việc toàn nhóm)
      if (this.state.filterScope === 'my_tasks') {
        return t.ma_nguoi_thuc_hien === this.state.currentUserId;
      }
      return true;
    });
  }
}

export const store = new AppStore();
