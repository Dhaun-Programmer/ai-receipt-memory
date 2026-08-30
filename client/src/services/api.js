import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const receiptAPI = {
  upload: (formData) => api.post('/receipts/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: (params) => api.get('/receipts', { params }),
  getPending: () => api.get('/receipts/pending'),
  getOne: (id) => api.get(`/receipts/${id}`),
  update: (id, data) => api.put(`/receipts/${id}`, data),
  confirm: (id, data) => api.put(`/receipts/${id}/confirm`, data),
  delete: (id) => api.delete(`/receipts/${id}`),
};

export const aiAPI = {
  analyzeReceipt: (formData) => api.post('/ai/analyze-receipt', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  chat: (message) => api.post('/ai/chat', { message }),
};

export const warrantyAPI = {
  getAll: () => api.get('/warranties'),
  getExpiring: () => api.get('/warranties/expiring'),
  getReturns: () => api.get('/warranties/returns'),
};

export const analyticsAPI = {
  getSummary: () => api.get('/analytics/summary'),
  getMonthly: () => api.get('/analytics/monthly'),
  getCategories: () => api.get('/analytics/categories'),
  getStores: () => api.get('/analytics/stores'),
};

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAllRead: () => api.put('/notifications/read'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  generate: () => api.post('/notifications/generate'),
};

export const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const base = import.meta.env.VITE_API_URL || '';
  return `${base}${path}`;
};

export default api;
