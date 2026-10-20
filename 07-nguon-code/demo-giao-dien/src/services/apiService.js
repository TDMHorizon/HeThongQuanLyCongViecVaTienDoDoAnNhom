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
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Lỗi không xác định' }));
    throw new Error(err.error || `HTTP error ${response.status}`);
  }
  return response.json();
}

export const apiService = {
  getProject: () => request('/project'),
  getUsers: () => request('/users'),
  getMilestones: () => request('/milestones'),
  
  getTasks: (params = {}) => {
    const query = new URLSearchParams();
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

  getTeam: () => request('/team'),
  getNotifications: (userId) => request(`/notifications?userId=${encodeURIComponent(userId)}`)
};
