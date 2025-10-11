import api from './api';

export const getConversations = async (page = 1, limit = 10) => {
  const response = await api.get('/chat/conversations', {
    params: { page, limit },
  });
  return response.data.data;
};

export const getConversationById = async (id: string) => {
  const response = await api.get(`/chat/conversations/${id}`);
  return response.data.data;
};
