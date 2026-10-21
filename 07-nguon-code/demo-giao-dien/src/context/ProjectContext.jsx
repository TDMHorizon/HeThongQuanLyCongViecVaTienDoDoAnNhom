import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { apiService } from '../services/apiService.js';

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  const [currentUserId, setCurrentUserId] = useState('u-sv-01');
  const [activeTab, setActiveTab] = useState('kanban');
  const [filterMilestoneId, setFilterMilestoneId] = useState('all');
  const [scopeFilter, setScopeFilter] = useState('all');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 880) {
      return true;
    }
    return false;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Filtered tasks (GVHD luôn xem toàn bộ, sinh viên có thể lọc việc cá nhân)
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (filterMilestoneId !== 'all' && t.ma_moc !== filterMilestoneId) {
        return false;
      }
      if (!isLecturer && scopeFilter === 'my' && t.ma_nguoi_thuc_hien !== currentUserId) {
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

  const value = {
    project,
    users,
    milestones,
    tasks,
    teamMembers,
    notifications,
    currentUserId,
    activeTab,
    filterMilestoneId,
    scopeFilter,
    selectedTaskId,
    selectedTask,
    isTaskModalOpen,
    loading,
    error,
    currentUser,
    isLecturer,
    isLeader,
    isMember,
    canCreateTask,
    canLockTask,
    canEditTaskProgress,
    filteredTasks,
    kpis,
    sidebarCollapsed,
    setSidebarCollapsed,
    // Setters & Actions
    setCurrentUserId,
    setActiveTab,
    setFilterMilestoneId,
    setScopeFilter,
    setSelectedTaskId,
    setIsTaskModalOpen,
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
