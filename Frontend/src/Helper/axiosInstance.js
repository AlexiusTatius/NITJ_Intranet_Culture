import axios from 'axios';

const apiTeacherInstance = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_BASE_URL ||'http://localhost:8001'}/api/user/Teacher`,
  headers: {
    'Content-Type': 'application/json',
  },
});

const apiStudentInstance = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_BASE_URL ||'http://localhost:8001'}/api/user/Student`,
  headers: {
    'Content-Type': 'application/json',
  },
});

const addAuthToken = (config) => {
  const token = localStorage.getItem('auth-token'); // Assuming you store the token in localStorage
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
};
// Add a request interceptor to include the token in every request

apiTeacherInstance.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));
apiStudentInstance.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));

export { apiTeacherInstance, apiStudentInstance };