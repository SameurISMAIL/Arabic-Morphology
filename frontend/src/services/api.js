import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Stats
export const getStats = () => apiClient.get('/stats');

// Roots
export const addRoot = (root) => apiClient.post('/roots/add', { root });
export const uploadRootsFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post(`${API_BASE_URL}/roots/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
export const getAllRoots = () => apiClient.get('/roots/all');
export const searchRoot = (root) => apiClient.get(`/roots/search/${root}`);
export const getRootWords = (root) => apiClient.get(`/roots/${root}/words`);
export const deleteRoot = (root) => apiClient.delete(`/roots/${root}`);
export const updateRoot = (old_root, new_root) => 
  apiClient.put('/roots/update', { old_root, new_root });

// Patterns
export const addPattern = (template) =>
  apiClient.post('/patterns/add', { template });
export const getAllPatterns = () => apiClient.get('/patterns/all');
export const getPattern = (template) =>
  apiClient.get(`/patterns/${template}`);
export const deletePattern = (template) =>
  apiClient.delete(`/patterns/${template}`);
export const updatePattern = (old_template, new_template) =>
  apiClient.put('/patterns/update', { old_template, new_template });

// Generator
export const generateWord = (root, template) =>
  apiClient.post('/generator/generate', { root, template });
export const generateMultiple = (root, templates) =>
  apiClient.post('/generator/generate-multiple', { root, templates });
export const generateDerivatives = (root) =>
  apiClient.post('/generator/derivatives', { root });

// Validator
export const validateWord = (word, root) =>
  apiClient.post('/validator/validate', { word, root });

// Health
export const healthCheck = () => apiClient.get('/health');
