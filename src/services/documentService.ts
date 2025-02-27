import axios from 'axios';
import { Document } from '../types/document';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Configure axios with auth token
const getAuthHeaders = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`
  }
});

// Fetch all documents for the current user
export const fetchUserDocuments = async (token: string): Promise<Document[]> => {
  const response = await axios.get(`${API_URL}/documents`, getAuthHeaders(token));
  return response.data;
};

// Get a single document by ID
export const getDocument = async (token: string, id: string): Promise<Document> => {
  const response = await axios.get(`${API_URL}/documents/${id}`, getAuthHeaders(token));
  return response.data;
};

// Create a new document
export const createDocument = async (token: string, data: Partial<Document>): Promise<Document> => {
  const response = await axios.post(`${API_URL}/documents`, data, getAuthHeaders(token));
  return response.data;
};

// Update an existing document
export const updateDocument = async (token: string, id: string, data: Partial<Document>): Promise<Document> => {
  const response = await axios.put(`${API_URL}/documents/${id}`, data, getAuthHeaders(token));
  return response.data;
};

// Delete a document
export const deleteDocument = async (token: string, id: string): Promise<void> => {
  await axios.delete(`${API_URL}/documents/${id}`, getAuthHeaders(token));
}; 