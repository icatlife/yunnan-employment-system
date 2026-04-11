import axios from 'axios';

const api = axios.create({
  timeout: 10000,
});

// 请求拦截器：自动附加 token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// 响应拦截器：简单处理401错误
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.error('401 Unauthorized. Redirecting to login.');
      localStorage.removeItem('token');
      // 在实际应用中，这里会重定向到登录页
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;
