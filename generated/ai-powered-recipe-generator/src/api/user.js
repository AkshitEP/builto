import axios from 'axios';

export const login = (credentials) => axios.post('/api/login', credentials);
export const register = (userData) => axios.post('/api/register', userData);