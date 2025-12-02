import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Posts API
export const getPosts = () => api.get('/posts');
export const getPost = (id) => api.get(`/posts/${id}`);
export const incrementPostView = (id) => api.post(`/posts/${id}/view`);
export const getTotalSiteViews = () => api.get('/posts/stats/total-views');
export const createPost = (postData) => api.post('/posts', postData);
export const updatePost = (id, postData) => api.put(`/posts/${id}`, postData);
export const deletePost = (id) => api.delete(`/posts/${id}`);
export const getPostsByCategory = (categoryId) => api.get(`/posts/category/${categoryId}`);
export const getPostsByUser = (userId) => api.get(`/posts/user/${userId}`);

// Categories API
export const getCategories = () => api.get('/categories');
export const getCategory = (id) => api.get(`/categories/${id}`);
export const createCategory = (categoryData) => api.post('/categories', categoryData);
export const updateCategory = (id, categoryData) => api.put(`/categories/${id}`, categoryData);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// Authentication API
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const googleOAuthCallback = (googleData) => api.post('/oauth2/google/callback', googleData);
export const checkEmail = (email) => api.get(`/users/check-email?email=${email}`);

// Users API
export const getUsers = () => api.get('/users');
export const getUser = (id) => api.get(`/users/${id}`);
export const getCurrentUser = () => api.get('/users/me');
export const getUserProfile = () => api.get('/users/profile');
export const createUser = (userData) => api.post('/users', userData);
export const updateUser = (id, userData) => api.put(`/users/${id}`, userData);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Comments API
export const getComments = (postId, page = 0, size = 10) => 
  api.get(`/comments/post/${postId}?page=${page}&size=${size}`);
export const getAllComments = (postId) => 
  api.get(`/comments/post/${postId}/all`);  // Get all comments with nested structure
export const createComment = (commentData) => api.post('/comments', commentData);
export const updateComment = (id, commentData) => api.put(`/comments/${id}`, commentData);
export const deleteComment = (id) => api.delete(`/comments/${id}`);

// Likes API
export const toggleLike = (postId, userId) => 
  api.post('/likes/toggle', { postId, userId });
export const checkLiked = (postId, userId) => 
  api.get(`/likes/post/${postId}/user/${userId}`);
export const getLikeCount = (postId) => 
  api.get(`/likes/post/${postId}/count`);

// Search API
export const searchPosts = (keyword, categoryId = null, page = 0, size = 10) => {
  const params = new URLSearchParams({ keyword, page, size });
  if (categoryId) params.append('categoryId', categoryId);
  return api.get(`/posts/search?${params.toString()}`);
};

// File Upload API
export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export default api;


