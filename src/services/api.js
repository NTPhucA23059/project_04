import axios from 'axios';

const API_BASE_URL =
  typeof import.meta !== "undefined" && import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL
    : (typeof window !== "undefined" && window.location.origin.includes("localhost")
        ? "http://localhost:8080"
        : window.location.origin.replace(/:\d+$/, ":8080"));

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Xử lý errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Xử lý network errors
    if (!error.response) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        error.message = 'Request timeout - Please try again';
      } else if (error.message.includes('Network Error')) {
        error.message = 'Unable to connect to server. Please check your network connection.';
      }
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const data = error.response?.data;

    // Xử lý authentication errors (401, 403)
    if (status === 401 || status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Chỉ redirect nếu không phải đang ở trang login
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/admin/login')) {
        // Redirect về login phù hợp (customer hoặc admin)
        if (currentPath.includes('/admin')) {
          window.location.href = '/admin/login';
        } else {
          window.location.href = '/login';
        }
      }
    }

    // Cải thiện error message từ server
    if (data) {
      if (data.message) {
        error.message = data.message;
      } else if (data.error) {
        error.message = data.error;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
