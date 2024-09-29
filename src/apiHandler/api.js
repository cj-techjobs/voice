import axios from 'axios';


export const API_BASE_URL='http://192.168.101.164:3000'

// Base configuration for Axios
const apiClient = axios.create({
  baseURL: 'http://192.168.101.164:3000', // Replace with your API base URL
  timeout: 10000, // Request timeout in milliseconds
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Add a request interceptor
apiClient.interceptors.request.use(
  config => {
    // You can modify the request config before sending the request, e.g., add authentication headers
    const token = 'your-auth-token'; // Retrieve token from secure storage if needed
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Handle errors globally here
    if (error.response) {
      // Server responded with a status other than 200 range
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.request);
    } else {
      // Something else caused the error
      console.error('Error:', error.message);
    }
    if (error.response && error.response.data) {
      console.error('Error Data:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// Define your API methods
export const api = {
  get: (url, params = {}) => apiClient.get(url, { params }),
  post: (url, data) => apiClient.post(url, data),
  put: (url, data) => apiClient.put(url, data),
  delete: (url) => apiClient.delete(url),
  // Add other methods as needed (e.g., patch)
};
