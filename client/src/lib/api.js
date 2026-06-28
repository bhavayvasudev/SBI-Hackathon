import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const customerToken = localStorage.getItem('hyperone_customer_token');
  const adminToken = sessionStorage.getItem('hyperone_admin_token');
  const token = customerToken || adminToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res.data,
  err => {
    const message = err.response?.data?.error || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export async function getRecommendations(profile) {
  return api.post('/chat/recommendations', { profile });
}

export async function createAccount(payload) {
  return api.post('/account/create', payload);
}

export async function processKYC(extractedText, documentType) {
  return api.post('/kyc/process', { extractedText, documentType });
}

export async function getDashboardStats() {
  return api.get('/analytics/dashboard');
}

export async function getAdminCustomers(params = {}) {
  return api.get('/analytics/customers', { params });
}

export async function updateCustomerKyc(id, action) {
  return api.put(`/analytics/customers/${id}/kyc`, { action });
}

export async function loginCustomer(customerId, mpin) {
  return api.post('/auth/login', { customerId, mpin });
}

export async function loginAdmin(username, password) {
  return api.post('/auth/admin-login', { username, password });
}

export async function getMyProfile() {
  return api.get('/auth/me');
}

// Copilot streaming — returns a ReadableStreamDefaultReader
export async function streamCopilotMessage(messages) {
  const token = localStorage.getItem('hyperone_customer_token');
  const res = await fetch('/api/copilot/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Server error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.body.getReader();
}

export default api;
