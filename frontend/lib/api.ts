import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    
    // Don't toast for expected 401s like /me on initial load without token
    if (error.response?.status === 401 && !error.config.url?.endsWith('/auth/me')) {
       toast.error(message);
    } else if (error.response?.status !== 401) {
       toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
