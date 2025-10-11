import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('user');
      const errorMessage = error.response.data.message || 'Your session has expired. Please log in again.';
      window.location.href = `/login?error=${encodeURIComponent(errorMessage)}`;
    }
    return Promise.reject(error);
  }
);

export const getAuthHeader = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    if (user && user.tokens.accessToken) {
      return { Authorization: 'Bearer ' + user.tokens.accessToken };
    }
  }
  return {};
};

import { AxiosRequestHeaders } from 'axios';

api.interceptors.request.use((config) => {
  const authHeaders = getAuthHeader();
  config.headers = {
    ...config.headers,
    ...authHeaders,
  } as AxiosRequestHeaders;
  return config;
});

export default api;
