import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { apiService } from '../services/apiService.js';

const ProjectContext = createContext(null);

// Lấy thông tin phiên đăng nhập đã lưu từ localStorage (nếu có)
function getSavedAuth() {
  try {
    const raw = localStorage.getItem('dacs_auth_user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.email) {
      parsed.email = parsed.email.replace(/@(huflit|hutech)\.edu\.vn$/i, '@gmail.com');
    }
    return parsed;
  } catch {
    return null;
  }
}

export function ProjectProvider({ children }) {
  const [activeProjectId, setActiveProjectId] = useState('da-dacs-01');
  const [classes, setClasses] = useState([]);
  const [activeClassId, setActiveClassId] = useState('21DTHC5');
  const [project, setProject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [users, setUsers] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState({ members: [], instructor: null });
  const [notifications, setNotifications] = useState([]);

  const [authUser, setAuthUser] = useState(() => getSavedAuth());
  const [currentUserId, setCurrentUserId] = useState(() => {
    const saved = getSavedAuth();
    return saved?.ma_nguoi_dung || null;
  });
  const [activeTab, setActiveTab] = useState('classroom');
  const [filterMilestoneId, setFilterMilestoneId] = useState('all');
  const [scopeFilter, setScopeFilter] = useState('all');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(() => !getSavedAuth());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Đăng nhập: lưu phiên làm việc và điều hướng về Cổng Môn học
  const login = useCallback((user) => {
    setAuthUser(user);
    setCurrentUserId(user.ma_nguoi_dung);
    setActiveTab('classroom');
    setIsLoginModalOpen(false);
    try {
      localStorage.setItem('dacs_auth_user', JSON.stringify(user));
    } catch (e) {
      console.warn('Không thể lưu auth vào localStorage:', e);
    }
  }, []);

  // Đăng xuất: xóa phiên và mở lại màn hình đăng nhập
  const logout = useCallback(() => {
    setAuthUser(null);
    setCurrentUserId(null);
    setScopeFilter('all');
    setActiveTab('classroom');
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

  // Load data for activeProjectId
  const loadData = useCallback(async (targetProjId = activeProjectId) => {
    try {
      setLoading(true);
      const [projData, usersData, msData, tasksData, teamData, topicsData, notifsData, classesData] = await Promise.all([
        apiService.getProject(targetProjId),
        apiService.getUsers(targetProjId),
        apiService.getMilestones(targetProjId),
        apiService.getTasks({ projectId: targetProjId }),
        apiService.getTeam(targetProjId),
        apiService.getTopics(),
        currentUserId ? apiService.getNotifications(currentUserId) : Promise.resolve([]),
        apiService.getClasses().catch(() => [])
      ]);

      setProject(projData);
      setUsers(usersData);
      setMilestones(msData);
      setTasks(tasksData);
      setTeamMembers(teamData);
      setTopics(topicsData);
      setNotifications(notifsData);
      if (classesData && classesData.length > 0) {
        setClasses(classesData);
      }
      setError(null);
    } catch (err) {
      console.error('[ProjectContext] Lỗi nạp dữ liệu:', err);
      setError(err.message || 'Không thể kết nối đến máy chủ SQLite');
    } finally {
      setLoading(false);
    }
  }, [activeProjectId, currentUserId]);

  useEffect(() => {
    loadData(activeProjectId);
  }, [activeProjectId, loadData]);

  // Action: Tạo Lớp học phần mới (GVPTMH)
  const handleCreateClass = useCallback(async (classData) => {
    const res = await apiService.createClass(classData);
    const updated = await apiService.getClasses().catch(() => []);
    setClasses(updated);
    if (res?.ma_lop) {
      setActiveClassId(res.ma_lop);
    }
    return res;
  }, []);

  // Điều hướng chuyển tầng: Đi vào Không gian Làm việc (Kanban hoặc GitHub) của 1 nhóm
  const enterWorkspace = useCallback((projectId, targetTab = 'kanban') => {
    setFilterMilestoneId('all');
    setSelectedTaskId(null);
    if (projectId) setActiveProjectId(projectId);
    setActiveTab(targetTab);
  }, []);

  // Điều hướng chuyển tầng: Quay lại Cổng Môn học & Lớp học phần (GVPTMH / SV)
  const returnToClassroom = useCallback(() => {
    setActiveTab('classroom');
  }, []);

  // Update notifications when switching user
  useEffect(() => {
    if (currentUserId) {
      apiService.getNotifications(currentUserId)
        .then(setNotifications)
        .catch(err => console.error('Lỗi nạp thông báo:', err));
    }
  }, [currentUserId]);

  // Switch active workspace project (Nhóm hoặc Cá nhân trong lớp học phần)
  const switchProject = useCallback((newProjectId, goToKanban = false) => {
    setFilterMilestoneId('all');
    setSelectedTaskId(null);
    setActiveProjectId(newProjectId);
    if (goToKanban) {
      setActiveTab('kanban');
    }
  }, []);

  // Action: Giảng viên tạo đề tài mới trong lớp học phần
  const handleCreateTopic = useCallback(async (topicData) => {
    const res = await apiService.createTopic(topicData);
    await loadData(activeProjectId);
    return res;
  }, [activeProjectId, loadData]);

  // Action: Sinh viên chọn & nhận đề tài cá nhân (1 người)
  const handleRegisterSoloTopic = useCallback(async (topicId, userId) => {
    const res = await apiService.registerSoloTopic(topicId, userId);
    setFilterMilestoneId('all');
    setActiveProjectId(topicId);
    setActiveTab('kanban');
    await loadData(topicId);
    return res;
  }, [loadData]);

  // Action: Sinh viên tạo nhóm (tên nhóm, nhóm trưởng, thành viên) & đăng ký đề tài nhóm
  const handleRegisterTeamTopic = useCallback(async (topicId, teamData) => {
    const res = await apiService.registerTeamTopic(topicId, teamData);
    setFilterMilestoneId('all');
    setActiveProjectId(topicId);
    setActiveTab('kanban');
    await loadData(topicId);
    return res;
  }, [loadData]);

  // Action: Đặt lại đề tài về trạng thái trống chưa đăng ký (hỗ trợ demo nhiều lần)
  const handleResetTopicRegistration = useCallback(async (topicId) => {
    await apiService.resetTopicRegistration(topicId);
    const nextProj = activeProjectId === topicId ? 'da-dacs-01' : activeProjectId;
    setActiveProjectId(nextProj);
    await loadData(nextProj);
  }, [activeProjectId, loadData]);

  // Action: Giảng viên xóa đề tài khỏi Ngân hàng đề tài
  const handleDeleteTopic = useCallback(async (topicId) => {
    // Optimistic update: xóa ngay khỏi state topics trên giao diện người dùng
    setTopics(prev => prev.filter(t => t.ma_do_an !== topicId));

    try {
      const res = await apiService.deleteTopic(topicId);
      const nextProj = activeProjectId === topicId ? 'da-dacs-01' : activeProjectId;
      if (activeProjectId === topicId) {
        setActiveProjectId('da-dacs-01');
      }
      await loadData(nextProj);
      return res;
    } catch (err) {
      // Nếu có lỗi từ server, nạp lại trạng thái thực tế từ CSDL
      await loadData(activeProjectId).catch(() => {});
      throw err;
    }
  }, [activeProjectId, loadData]);

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
      currentUser?.vai_tro_nhom === 'truong_nhom'
    );
  }, [currentUser, isLecturer]);

  const isMember = useMemo(() => {
    return !isLecturer && !isLeader;
  }, [isLecturer, isLeader]);

  // Thông tin Đề tài / Nhóm của sinh viên hiện tại (nếu đã tham gia)
  const studentProject = useMemo(() => {
    if (isLecturer || !currentUser) return null;
    return currentUser.danh_sach_nhom?.[0] || null;
  }, [currentUser, isLecturer]);

  // Cả Giảng viên hướng dẫn và Nhóm trưởng đều có quyền giao việc và khóa tiến độ
  const canCreateTask = isLecturer || isLeader;
  const canLockTask = isLecturer || isLeader;

  const canEditTaskProgress = useCallback((task) => {
    if (!task || !currentUserId) return false;
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
      const created = await apiService.createTask({
        ...taskData,
        ma_do_an: activeProjectId
      });
      setTasks(prev => [created, ...prev]);
      
      // Refresh project & topics to get updated overall progress
      const [updatedProj, updatedTopics] = await Promise.all([
        apiService.getProject(activeProjectId),
        apiService.getTopics()
      ]);
      setProject(updatedProj);
      setTopics(updatedTopics);
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

      const [updatedProj, updatedTopics] = await Promise.all([
        apiService.getProject(activeProjectId),
        apiService.getTopics()
      ]);
      setProject(updatedProj);
      setTopics(updatedTopics);
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

      await loadData(activeProjectId);
    } catch (err) {
      console.error('Lỗi tự chấm tiến độ:', err);
      alert(`Lỗi tự chấm tiến độ: ${err.message}`);
    }
  }, [tasks, currentUserId, isLeader, isLecturer, loadData, activeProjectId]);

  const value = {
    classes,
    activeClassId,
    setActiveClassId,
    activeProjectId,
    project,
    topics,
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
    studentProject,
    canCreateTask,
    canLockTask,
    canEditTaskProgress,
    filteredTasks,
    kpis,
    // Setters & Actions
    setCurrentUserId,
    setActiveTab,
    enterWorkspace,
    returnToClassroom,
    createClass: handleCreateClass,
    setFilterMilestoneId,
    setScopeFilter,
    setSelectedTaskId,
    setIsTaskModalOpen,
    setIsLoginModalOpen,
    toggleChibiMode,
    login,
    logout,
    switchProject,
    createTopic: handleCreateTopic,
    deleteTopic: handleDeleteTopic,
    registerSoloTopic: handleRegisterSoloTopic,
    registerTeamTopic: handleRegisterTeamTopic,
    resetTopicRegistration: handleResetTopicRegistration,
    selfRateTask,
    createTask: handleCreateTask,
    updateTaskProgress: handleUpdateTaskProgress,
    toggleTaskLock: handleToggleTaskLock,
    reload: () => loadData(activeProjectId)
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
