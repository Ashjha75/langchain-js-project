import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

export const register = async (userData: any) => {
  const response = await axios.post(`${API_URL}/auth/register`, userData);
  if (response.data.data.tokens.accessToken) {
    localStorage.setItem('user', JSON.stringify(response.data.data));
  }
  return response.data;
};

export const login = async (userData: any) => {
  const response = await axios.post(`${API_URL}/auth/login`, userData);
  if (response.data.data.tokens.accessToken) {
    localStorage.setItem('user', JSON.stringify(response.data.data));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) return JSON.parse(userStr);
  return null;
};

export const getAuthHeader = () => {
  const user = getCurrentUser();
  if (user && user.tokens.accessToken) {
    return { Authorization: 'Bearer ' + user.tokens.accessToken };
  } else {
    return {};
  }
};
