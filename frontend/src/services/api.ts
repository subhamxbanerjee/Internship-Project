import axios, { AxiosInstance, isAxiosError } from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const STORAGE_KEY = 'centuryply_auth';

let apiClient: AxiosInstance = createApiClient();
let onUnauthorized: (() => void) | null = null;

function createApiClient(username?: string, password?: string): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE,
    ...(username && password ? { auth: { username, password } } : {}),
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 && onUnauthorized) {
        onUnauthorized();
      }
      return Promise.reject(error);
    }
  );

  return client;
}

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

export interface AuthUser {
  username: string;
  fullName: string;
  email: string;
  role: string;
}

export interface DocumentSummary {
  total: number;
  pdfCount: number;
  excelCount: number;
  wordCount: number;
  powerPointCount: number;
}

export interface DocumentItem {
  id: number;
  title: string;
  filename: string;
  fileType: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface PortalUser {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  active: boolean;
}

export function setAuthCredentials(username: string, password: string) {
  apiClient = createApiClient(username, password);
}

export function clearAuthCredentials() {
  apiClient = createApiClient();
}

export function updateStoredPassword(newPassword: string) {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (!stored) return;

  const credentials = JSON.parse(stored) as { username: string; password: string };
  credentials.password = newPassword;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
  setAuthCredentials(credentials.username, newPassword);
}

export async function login(username: string, password: string): Promise<void> {
  setAuthCredentials(username, password);
  await apiClient.post('/auth/login', { username, password });
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const response = await apiClient.get('/auth/me');
  return response.data;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  await apiClient.post('/auth/change-password', { currentPassword, newPassword });
  updateStoredPassword(newPassword);
}

export async function fetchDocumentSummary(): Promise<DocumentSummary> {
  const response = await apiClient.get('/documents/summary');
  return response.data;
}

export async function fetchDocuments(): Promise<DocumentItem[]> {
  const response = await apiClient.get('/documents');
  return response.data;
}

export async function fetchRecentDocuments(): Promise<DocumentItem[]> {
  const response = await apiClient.get('/documents/recent');
  return response.data;
}

export async function uploadDocument(file: File, uploadedBy: string): Promise<DocumentItem> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('uploadedBy', uploadedBy);
  const response = await apiClient.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function downloadDocument(id: number, title: string) {
  const response = await apiClient.get(`/documents/download/${id}`, { responseType: 'blob' });
  if (response.data.size === 0) {
    throw new Error('File not available for download.');
  }
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', title);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function fetchDocumentPreviewBlob(id: number, signal?: AbortSignal): Promise<Blob> {
  const response = await apiClient.get(`/documents/preview/${id}`, {
    responseType: 'blob',
    signal,
  });
  return response.data;
}

export async function fetchUsers(): Promise<PortalUser[]> {
  const response = await apiClient.get('/users');
  return response.data;
}

export async function createUser(data: {
  username: string;
  password: string;
  fullName: string;
  email: string;
  role: string;
}): Promise<PortalUser> {
  const response = await apiClient.post('/users', data);
  return response.data;
}

export async function updateUser(
  id: number,
  data: { fullName: string; email: string; role: string; active: boolean }
): Promise<PortalUser> {
  const response = await apiClient.put(`/users/${id}`, data);
  return response.data;
}

export async function deleteUser(id: number) {
  await apiClient.delete(`/users/${id}`);
}

export async function resetUserPassword(id: number, password: string) {
  await apiClient.post(`/users/${id}/reset-password`, { password });
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string') return message;
    if (error.response?.status === 401) return 'Session expired. Please login again.';
    if (error.response?.status === 403) return 'You do not have permission for this action.';
  }
  return fallback;
}

export function formatFileType(fileType: string): string {
  const type = fileType.toLowerCase();
  if (type === 'pdf') return 'PDF';
  if (type === 'xlsx' || type === 'xls') return 'Excel';
  if (type === 'docx' || type === 'doc') return 'Word';
  if (type === 'pptx' || type === 'ppt') return 'PowerPoint';
  if (type === 'png' || type === 'jpg' || type === 'jpeg' || type === 'gif' || type === 'webp' || type === 'svg') return 'Images';
  return fileType.toUpperCase();
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr${diffHours === 1 ? '' : 's'} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

export function formatRole(role: string): string {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}