// axiosInstance.ts
import axios from 'axios';
import { auth } from '@/lib/firebase';
import toast from 'react-hot-toast';

const axiosInstance = axios.create({
  baseURL: process.env.API_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Firebase JWT to every request
axiosInstance.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken(); // Firebase JWT
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    toast.error('Request error'); // show toast on request failure
    return Promise.reject(error);
  }
);

// Global response error handling with toast
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';
    toast.error(message); // show toast with API error
    console.error('Axios error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
