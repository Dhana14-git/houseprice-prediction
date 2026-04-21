import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const ML_URL = 'http://localhost:5001'; // Flask service port

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// FIXED: Pointing directly to Flask port 5001 for predictions
export const calculatePrediction = (data) => axios.post(`${ML_URL}/predict`, data);

export const loginUser = (userData) => api.post('/auth/login', userData);

// This will now correctly send 'username', 'email', and 'password'
export const registerUser = (userData) => api.post('/auth/register', userData);