import { apiClient } from './api';
import type { Incident, IncidentUser } from '../types/incident';

export async function fetchIncidents(): Promise<Incident[]> {
  const response = await apiClient.get<Incident[]>('/incidents');
  return response.data;
}

export async function createIncident(data: {
  title: string;
  description: string;
  department: string;
  priority: string;
}): Promise<Incident> {
  const response = await apiClient.post<Incident>('/incidents', data);
  return response.data;
}

export async function assignIncident(id: number, assignedTo: string): Promise<Incident> {
  const response = await apiClient.put<Incident>(`/incidents/${id}/assign`, { assignedTo });
  return response.data;
}

export async function updateIncidentStatus(id: number, status: string): Promise<Incident> {
  const response = await apiClient.put<Incident>(`/incidents/${id}/status`, { status });
  return response.data;
}

export async function updateIncidentPriority(id: number, priority: string): Promise<Incident> {
  const response = await apiClient.put<Incident>(`/incidents/${id}/priority`, { priority });
  return response.data;
}

export async function addIncidentComment(id: number, comment: string): Promise<Incident> {
  const response = await apiClient.put<Incident>(`/incidents/${id}/comment`, { comment });
  return response.data;
}

export async function closeIncident(id: number): Promise<Incident> {
  const response = await apiClient.put<Incident>(`/incidents/${id}/close`);
  return response.data;
}

export async function deleteIncident(id: number): Promise<void> {
  await apiClient.delete(`/incidents/${id}`);
}

export async function fetchAssignableUsers(): Promise<IncidentUser[]> {
  const response = await apiClient.get<IncidentUser[]>('/users');
  return response.data.filter((user) => user.active && user.role === 'EMPLOYEE');
}
