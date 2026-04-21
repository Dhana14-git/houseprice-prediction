import axios from 'axios';

const API_URL = "https://houseprice-prediction-1-0dif.onrender.com"
const ML_URL = "https://houseprice-prediction-ej1n.onrender.com"//Flask service port

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