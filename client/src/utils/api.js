// ============================================
// API UTILITY - utils/api.js
// ============================================
// Creates an Axios instance with base URL and JWT token interceptor.
// All API calls should use this instance.

import axios from 'axios';

// Create axios instance with the backend URL
const API = axios.create({
  baseURL: 'https://wechat-1-vt2t.onrender.com/api',
});

// Request interceptor - automatically adds JWT token to every request
// This runs BEFORE each request is sent
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('chatwe_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handles expired tokens
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is expired or invalid - clear storage and redirect to login
      localStorage.removeItem('chatwe_token');
      localStorage.removeItem('chatwe_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
