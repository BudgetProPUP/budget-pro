import api from './axios';

export const getAllDepartments = () => api.get('/departments');
