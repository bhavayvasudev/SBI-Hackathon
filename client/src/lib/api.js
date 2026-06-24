import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  res => res.data,
  err => {
    const message = err.response?.data?.error || err.message || 'Something went wrong';
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

export default api;
