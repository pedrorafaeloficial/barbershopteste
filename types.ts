
export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  lastVisit?: string;
  loyaltyPoints: number;
  notes?: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // em minutos
  description?: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  serviceId: string;
  service: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  price: number;
}

export interface DashboardStats {
  totalRevenue: number;
  appointmentsToday: number;
  newClientsThisMonth: number;
  averageTicket: number;
}

export enum ViewType {
  DASHBOARD = 'dashboard',
  CLIENTS = 'clients',
  SCHEDULE = 'schedule',
  SERVICES = 'services',
  AI_INSIGHTS = 'ai_insights'
}
