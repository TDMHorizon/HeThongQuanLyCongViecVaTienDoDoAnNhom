import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { apiService } from '../services/apiService.js';

const ProjectContext = createContext(null);

// Lấy thông tin đăng nhập đã lưu từ localStorage (nếu có)
function getSavedAuth() {
  try {
    const raw = localStorage.getItem('dacs_auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function ProjectProvider({ children }) {
  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Auth: lưu user đang đăng nhập vào localStorage
  const [authUser, setAuthUser] = useState(() => getSavedAuth());

  const [currentUserId, setCurrentUserId] = useState(() => {
    const saved = getSavedAuth();
    return saved?.ma_nguoi_dung || null;
  });
  const [activeTab, setActiveTab] = useState('kanban');
  const [filterMilestoneId, setFilterMilestoneId] = useState('all');
  const [scopeFilter, setScopeFilter] = useState('all');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  // Nếu chưa có session đăng nhập thì mở modal ngay từ đầu
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(() => !getSavedAuth());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hành động: Đăng nhập (lưu authUser vào state và localStorage)
  const login = useCallback((user) => {
    setAuthUser(user);
    setCurrentUserId(user.ma_nguoi_dung);
    setIsLoginModalOpen(false);
    try {
      localStorage.setItem('dacs_auth_user', JSON.stringify(user));
    } catch (e) {
      console.warn('Không thể lưu auth vào localStorage:', e);
    }
  }, []);

  // Hành động: Đăng xuất (vẫn ở trang chính, chuyển về bảng Kanban toàn nhóm)
  const logout = useCallback(() => {
    setAuthUser(null);
    setCurrentUserId(null);
    setScopeFilter('all');
    setActiveTab('kanban');
    try {
      localStorage.removeItem('dacs_auth_user');
    } catch (e) {}
    setIsLoginModalOpen(true);
  }, []);

  // Chibi Mascot Mode: Mặc định bật, lưu trong localStorage
  const [chibiMode, setChibiMode] = useState(() => {
    try {
      const saved = localStorage.getItem('dacs_chibi_mode');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleChibiMode = useCallback(() => {
    setChibiMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem('dacs_chibi_mode', String(next));
      } catch (e) {
        console.warn('Không thể lưu localStorage:', e);
      }
      return next;
    });
  }, []);

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [projData, usersData, msData, tasksData, teamData, notifsData] = await Promise.all([
        apiService.getProject(),
        apiService.getUsers(),
        apiService.getMilestones(),
        apiService.getTasks(),
        apiService.getTeam(),
        apiService.getNotifications(currentUserId)
      ]);

      setProject(projData);
      setUsers(usersData);
      setMilestones(msData);
      setTasks(tasksData);
      setTeamMembers(teamData);
      setNotifications(notifsData);
      setError(null);
    } catch (err) {
      console.error('[ProjectContext] Lỗi nạp dữ liệu:', err);
      setError(err.message || 'Không thể kết nối đến máy chủ SQLite');
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update notifications when switching user
  useEffect(() => {
    if (currentUserId) {
      apiService.getNotifications(currentUserId)
        .then(setNotifications)
        .catch(err => console.error('Lỗi nạp thông báo:', err));
    }
  }, [currentUserId]);

  // Current user & role resolution
  const currentUser = useMemo(() => {
    return users.find(u => u.ma_nguoi_dung === currentUserId) || null;
  }, [users, currentUserId]);

  const isLecturer = useMemo(() => {
    return currentUser?.vai_tro_he_thong === 'giangvien' || currentUser?.vai_tro_he_thong === 'giang_vien';
  }, [currentUser]);

  const isLeader = useMemo(() => {
    if (isLecturer) return false;
    return (
      currentUser?.vai_tro_trong_nhom === 'nhom_truong' ||
      currentUser?.vai_tro_nhom === 'truong_nhom' ||
      currentUser?.ma_nguoi_dung === 'u-sv-01'
    );
  }, [currentUser, isLecturer]);

  const isMember = useMemo(() => {
    return !isLecturer && !isLeader;
  }, [isLecturer, isLeader]);

  // Cả Giảng viên hướng dẫn và Nhóm trưởng đều có quyền giao việc và khóa tiến độ
  const canCreateTask = isLecturer || isLeader;
  const canLockTask = isLecturer || isLeader;

  const canEditTaskProgress = useCallback((task) => {
    if (!task) return false;
    if (task.trang_thai_khoa) return false;
    if (isLeader || isLecturer) return true;
    return task.ma_nguoi_thuc_hien === currentUserId;
  }, [isLeader, isLecturer, currentUserId]);

  // Filtered tasks (GVHD luôn xem toàn bộ, sinh viên có thể lọc việc cá nhân khi đã đăng nhập)
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (filterMilestoneId !== 'all' && t.ma_moc !== filterMilestoneId) {
        return false;
      }
      if (currentUserId && !isLecturer && scopeFilter === 'my' && t.ma_nguoi_thuc_hien !== currentUserId) {
        return false;
      }
      return true;
    });
  }, [tasks, filterMilestoneId, scopeFilter, currentUserId, isLecturer]);

  // KPIs
  const kpis = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter(t => t.trang_thai === 'can_lam').length;
    const inProgress = tasks.filter(t => t.trang_thai === 'dang_lam').length;
    const done = tasks.filter(t => t.trang_thai === 'hoan_thanh').length;
    const locked = tasks.filter(t => t.trang_thai_khoa === 1).length;
    const overallProgress = project?.project?.tien_do_tong ?? project?.tien_do_tong ?? 0;

    return { total, todo, inProgress, done, locked, overallProgress };
  }, [tasks, project]);

  // Selected task detail
  const selectedTask = useMemo(() => {
    if (!selectedTaskId) return null;
    return tasks.find(t => t.ma_cong_viec === selectedTaskId) || null;
  }, [tasks, selectedTaskId]);

  // Action: Create Task
  const handleCreateTask = async (taskData) => {
    try {
      const created = await apiService.createTask(taskData);
      setTasks(prev => [created, ...prev]);
      
      // Refresh project to get updated overall progress
      const updatedProj = await apiService.getProject();
      setProject(updatedProj);
      setIsTaskModalOpen(false);
      return created;
    } catch (err) {
      alert(`Lỗi tạo công việc: ${err.message}`);
      throw err;
    }
  };

  // Action: Update Task Progress & Status
  const handleUpdateTaskProgress = async (taskId, progress, status = null) => {
    try {
      const payload = { phan_tram_tien_do: Number(progress) };
      if (status) payload.trang_thai = status;
      else {
        if (payload.phan_tram_tien_do === 100) payload.trang_thai = 'hoan_thanh';
        else if (payload.phan_tram_tien_do > 0) payload.trang_thai = 'dang_lam';
        else payload.trang_thai = 'can_lam';
      }

      const updated = await apiService.updateTask(taskId, payload);
      setTasks(prev => prev.map(t => t.ma_cong_viec === taskId ? updated : t));

      const updatedProj = await apiService.getProject();
      setProject(updatedProj);
    } catch (err) {
      alert(`Lỗi cập nhật tiến độ: ${err.message}`);
    }
  };

  // Action: Toggle Task Lock
  const handleToggleTaskLock = async (taskId, locked) => {
    try {
      let updated;
      if (locked) {
        updated = await apiService.lockTask(taskId, currentUserId);
      } else {
        updated = await apiService.unlockTask(taskId);
      }
      setTasks(prev => prev.map(t => t.ma_cong_viec === taskId ? updated : t));
    } catch (err) {
      alert(`Lỗi thay đổi trạng thái khóa: ${err.message}`);
    }
  };

  // Action: Tự chấm tiến độ cho bản thân (Thành viên & Nhóm trưởng)
  const selfRateTask = useCallback(async (taskId, newProgress) => {
    try {
      const targetTask = tasks.find(t => t.ma_cong_viec === taskId);
      if (!targetTask) return;
      if (targetTask.trang_thai_khoa) {
        alert('Công việc này đã được chốt và khóa tiến độ, không thể tự chỉnh!');
        return;
      }

      const isAssignee = targetTask.ma_nguoi_thuc_hien === currentUserId;
      if (!isAssignee && !isLeader && !isLecturer) {
        alert('Bạn chỉ có quyền tự chấm tiến độ cho công việc được phân công cho mình!');
        return;
      }

      const p = Math.max(0, Math.min(100, Math.round(Number(newProgress))));
      let newStatus = targetTask.trang_thai;
      if (p === 100) {
        newStatus = 'hoan_thanh';
      } else if (p > 0 && targetTask.trang_thai === 'can_lam') {
        newStatus = 'dang_lam';
      }

      await apiService.updateTask(taskId, {
        phan_tram_tien_do: p,
        trang_thai: newStatus
      });

      await loadData();
    } catch (err) {
      console.error('Lỗi tự chấm tiến độ:', err);
      alert(`Lỗi tự chấm tiến độ: ${err.message}`);
    }
  }, [tasks, currentUserId, isLeader, isLecturer, loadData]);

  const value = {
    project,
    users,
    milestones,
    tasks,
    teamMembers,
    notifications,
    authUser,
    currentUserId,
    activeTab,
    filterMilestoneId,
    scopeFilter,
    selectedTaskId,
    selectedTask,
    isTaskModalOpen,
    isLoginModalOpen,
    loading,
    error,
    chibiMode,
    currentUser,
    isLecturer,
    isLeader,
    isMember,
    canCreateTask,
    canLockTask,
    canEditTaskProgress,
    filteredTasks,
    kpis,
    // Setters & Actions
    setCurrentUserId,
    setActiveTab,
    setFilterMilestoneId,
    setScopeFilter,
    setSelectedTaskId,
    setIsTaskModalOpen,
    setIsLoginModalOpen,
    toggleChibiMode,
    login,
    logout,
    selfRateTask,
    createTask: handleCreateTask,
    updateTaskProgress: handleUpdateTaskProgress,
    toggleTaskLock: handleToggleTaskLock,
    reload: loadData
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
