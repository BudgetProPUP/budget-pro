import api from './axios';

export const getExpensesList = () => api.get('/expenses');
export const getExpenseById = (id) => api.get(`/expenses/${id}`);
