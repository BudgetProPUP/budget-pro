// src/api/budget.js
import axios from 'axios';

const API_BASE_URL = 'https://your-backend-api.com/api'; // Replace with your real API

export const getBudgetSummary = () => {
  return axios.get(`${API_BASE_URL}/budget/summary`);
};

export const getExpensesList = () => {
  return axios.get(`${API_BASE_URL}/expenses`);
};
