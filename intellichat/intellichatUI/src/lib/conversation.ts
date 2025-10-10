import axios from 'axios';
import { getAuthHeader } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const getConversations = async (page = 1, limit = 10) => {
  const response = await axios.get(`${API_URL}/chat/conversations`, {
    headers: getAuthHeader(),
    params: { page, limit },
  });
  return response.data.data;
};

export const getConversationById = async (id: string) => {
  const response = await axios.get(`${API_URL}/chat/conversations/${id}`, {
    headers: getAuthHeader(),
  });
  return response.data.data;
};
