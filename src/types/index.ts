export interface Area {
  id: string;
  name: string;
  maxCapacity: number;
  currentCount: number;
  status: "enabled" | "disabled";
  createdAt: string;
  createdBy: string;
}

export interface LogEntry {
  type: "IN" | "OUT";
  areaId: string;
  timestamp: string;
  userId: string;
}

export interface AreaAudit {
  areaId: string;
  areaName: string;
  logEntries: LogEntry[];
  lastUpdated: string;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin?: boolean;
  isVolunteer?: boolean;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName?: string;
  addedAt: string;
  addedBy: string;
  status: "active" | "inactive";
}

export interface VolunteerUser {
  uid: string;
  email: string;
  displayName?: string;
  addedAt: string;
  addedBy: string;
  status: "active" | "inactive";
  permissions: {
    canAccessTicker: boolean;
    assignedAreas?: string[]; // Optional: restrict to specific areas
  };
}
