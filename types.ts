export enum DisasterType {
  FLOOD = 'Flood',
  FIRE = 'Fire',
  ACCIDENT = 'Road Accident',
  EARTHQUAKE = 'Earthquake',
  DROUGHT = 'Drought',
  LANDSLIDE = 'Landslide',
  OTHER = 'Other',
}

export enum IncidentStatus {
  PENDING = 'Pending',
  INVESTIGATING = 'Investigating',
  RESOLVED = 'Resolved',
}

export enum SeverityLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  type: DisasterType;
  status: IncidentStatus;
  severity: SeverityLevel;
  location: Coordinates;
  timestamp: number;
  reporterName: string;
  aiAnalysis?: string;
  imageUrl?: string;
  deployedResources?: string[];
}

export interface ResourceItem {
  name: string;
  address: string;
  type: string;
  rating?: string;
}

export interface AnalysisResult {
  severity: SeverityLevel;
  summary: string;
  category: DisasterType;
  advice: string;
}

// --- Weather Types ---
export interface WeatherData {
  temperature: number;
  conditionCode: number;
  windSpeed: number;
  isDay: boolean;
  locationName: string;
}

// --- News Types ---
export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  category: string;
  imageUrl?: string;
  url: string;
}

// --- RBAC Types ---

export enum UserRole {
  ADMIN = 'ADMIN',
  CITIZEN = 'CITIZEN',
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  department?: string;
}

export const PERMISSIONS = {
  [UserRole.ADMIN]: ['view_dashboard', 'resolve_incident', 'dispatch_resources', 'delete_incident'],
  [UserRole.CITIZEN]: ['create_report', 'view_public_alerts'],
};