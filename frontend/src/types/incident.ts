export type IncidentDepartment = 'HR' | 'ACCOUNTS' | 'IT';
export type IncidentPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type IncidentStatus = 'OPEN' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'CLOSED';

export interface Incident {
  id: number;
  incidentNumber: string;
  title: string;
  description: string;
  department: IncidentDepartment;
  priority: IncidentPriority;
  status: IncidentStatus;
  createdBy: string | null;
  assignedTo: string | null;
  employeeComment: string | null;
  createdAt: string;
  updatedAt: string;
  closedAt?: string | null;
  closedBy?: string | null;
}

export interface IncidentFormValues {
  title: string;
  description: string;
  department: IncidentDepartment;
  priority: IncidentPriority;
  assignedTo: string;
}

export interface IncidentUser {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  active: boolean;
}
