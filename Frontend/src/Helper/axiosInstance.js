import axios from 'axios';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8001/api/user', // Replace with your API base URL
  timeout: 1000, // Optional: specify a timeout
  headers: { 'Content-Type': 'application/json' } // Optional: specify default headers
});

// Optional: Add request and response interceptors
axiosInstance.interceptors.request.use(
  (config) => {
    // You can modify the request config here
    // For example, adding an authentication token
    const token = localStorage.getItem('token'); // Assuming token is stored in local storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    // Handle the response data
    return response;
  },
  (error) => {
    // Handle errors
    return Promise.reject(error);
  }
);

export default axiosInstance;
