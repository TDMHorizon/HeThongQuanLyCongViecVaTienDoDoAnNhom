/**
 * Service giao tiếp với SQLite REST API
 */

const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  const response = await fetch(url, config);
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: `Máy chủ trả về phản hồi không hợp lệ (${response.status}).` };
  }

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }
  return data;
}

export const apiService = {
  login: (email, matKhau) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, mat_khau: matKhau })
  }),

  getClasses: () => request('/classes'),
  createClass: (data) => request('/classes', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  getProject: (projectId = 'da-dacs-01') => request(`/project?projectId=${encodeURIComponent(projectId)}`),
  getUsers: (projectId = 'da-dacs-01') => request(`/users?projectId=${encodeURIComponent(projectId)}`),
  getMilestones: (projectId = 'da-dacs-01') => request(`/milestones?projectId=${encodeURIComponent(projectId)}`),

  getTopics: () => request('/topics'),
  createTopic: (data) => request('/topics', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  deleteTopic: (topicId) => request(`/topics/${encodeURIComponent(topicId)}`, {
    method: 'DELETE'
  }),
  registerSoloTopic: (topicId, userId) => request(`/topics/${encodeURIComponent(topicId)}/register-solo`, {
    method: 'POST',
    body: JSON.stringify({ userId })
  }),
  registerTeamTopic: (topicId, data) => request(`/topics/${encodeURIComponent(topicId)}/register-team`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  resetTopicRegistration: (topicId) => request(`/topics/${encodeURIComponent(topicId)}/reset`, {
    method: 'POST'
  }),

  getTasks: (params = {}) => {
    const query = new URLSearchParams();
    if (params.projectId) {
      query.append('projectId', params.projectId);
    }
    if (params.milestoneId && params.milestoneId !== 'all') {
      query.append('milestoneId', params.milestoneId);
    }
    if (params.assigneeId) {
      query.append('assigneeId', params.assigneeId);
    }
    const qStr = query.toString();
    return request(`/tasks${qStr ? `?${qStr}` : ''}`);
  },

  createTask: (data) => request('/tasks', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  updateTask: (taskId, data) => request(`/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),

  lockTask: (taskId, userId) => request(`/tasks/${taskId}/lock`, {
    method: 'POST',
    body: JSON.stringify({ userId })
  }),

  unlockTask: (taskId) => request(`/tasks/${taskId}/unlock`, {
    method: 'POST'
  }),

  getComments: (taskId) => request(`/tasks/${taskId}/comments`),
  addComment: (taskId, data) => request(`/tasks/${taskId}/comments`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  getAttachments: (taskId) => request(`/tasks/${taskId}/attachments`),
  addAttachment: (taskId, data) => request(`/tasks/${taskId}/attachments`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  deleteAttachment: (fileId) => request(`/attachments/${encodeURIComponent(fileId)}`, {
    method: 'DELETE'
  }),

  getTeam: (projectId = 'da-dacs-01') => request(`/team?projectId=${encodeURIComponent(projectId)}`),
  getNotifications: (userId) => request(`/notifications?userId=${encodeURIComponent(userId)}`),

  // GitHub Dashboard Integration APIs
  getGithubDashboard: (projectId = 'da-dacs-01') => request(`/github/dashboard?projectId=${encodeURIComponent(projectId)}`),
  connectGithub: (data) => request('/github/connect', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  syncGithub: (projectId = 'da-dacs-01') => request(`/github/sync?projectId=${encodeURIComponent(projectId)}`, {
    method: 'POST'
  }),
  saveGithubMapping: (projectId, mapping) => request('/github/mapping', {
    method: 'POST',
    body: JSON.stringify({ projectId, mapping })
  }),
  disconnectGithub: (projectId) => request(`/github/connect?projectId=${encodeURIComponent(projectId)}`, {
    method: 'DELETE'
  })
};
