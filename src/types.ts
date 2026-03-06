import { LucideIcon } from 'lucide-react';

export type UserRole = 'ADMIN' | 'OPERATOR' | 'SUPERVISOR' | 'VIGILANTE';

export interface User {
  id: string | number;
  email: string;
  name: string;
  role: UserRole;
  company_id?: string;
  mfa_enabled?: boolean;
  last_login?: string;
  last_device?: string;
  status: 'active' | 'inactive' | 'pending';
  created_at?: string;
}

export interface AuditLog {
  id: string;
  user_id: string | number;
  user_name: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'EXPORT';
  entity: string;
  entity_id?: string;
  payload_before?: any;
  payload_after?: any;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}
export interface Vigilante {
  id: number;
  name: string;
  bi_number: string;
  contact: string;
  base_salary: number;
  status: 'active' | 'suspended' | 'dismissed';
  doc_police_expiry?: string;
  doc_psych_expiry?: string;
  doc_criminal_expiry?: string;
  last_training_date?: string;
}

export interface Weapon {
  id: number;
  type: string;
  brand: string;
  model: string;
  serial_number: string;
  status: 'available' | 'in_use' | 'maintenance';
}

export interface Post {
  id: number;
  name: string;
  client_name: string;
  address: string;
  vigilantes_needed: number;
  latitude?: number;
  longitude?: number;
  radius_meters?: number;
}

export interface Occurrence {
  id: number;
  type: string;
  date_time: string;
  post_id?: number;
  vigilante_id?: number;
  post_name?: string;
  vigilante_name?: string;
  description: string;
  latitude?: number;
  longitude?: number;
  battery_level?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical' | 'urgent';
}

export interface Equipment {
  id: number;
  name: string;
  serial_number: string;
  status: 'available' | 'in_use' | 'maintenance' | 'lost';
}

export interface Vehicle {
  id: number;
  plate: string;
  model: string;
  chassis?: string;
  insurance_expiry?: string;
  tax_expiry?: string;
  current_km: number;
  next_service_km?: number;
  fuel_level: number; // 0-100
  status: 'active' | 'maintenance' | 'inactive';
}

export interface VehicleMission {
  id: number;
  vehicle_id: number;
  vigilante_id: number;
  start_km: number;
  end_km?: number;
  start_fuel: number;
  end_fuel?: number;
  start_time: string;
  end_time?: string;
  destination?: string;
  notes?: string;
}

export interface TacticalAsset {
  id: number;
  type: 'arma' | 'radio' | 'colete' | 'outro';
  name: string;
  serial_number: string;
  status: 'available' | 'in_use' | 'damaged' | 'lost';
  last_inspection?: string;
}

export interface AssetDamageReport {
  id: number;
  asset_id: number;
  vigilante_id: number;
  description: string;
  photo_url?: string;
  reported_at: string;
  severity: 'low' | 'medium' | 'high';
}

export interface Scale {
  id: number;
  vigilante_id: number;
  vigilante_name?: string;
  post_id: number;
  post_name?: string;
  shift_start: string;
  shift_end: string;
  status: 'scheduled' | 'completed' | 'absent';
  shift_pattern?: '12x24' | '24x48' | '4x2' | 'normal';
}

export interface Attendance {
  id: number;
  vigilante_id: number;
  post_id: number;
  timestamp: string;
  latitude: number;
  longitude: number;
  is_within_radius: boolean;
  type: 'clock_in' | 'clock_out';
}

export interface EquipmentAssignment {
  id: number;
  vigilante_id: number;
  vigilante_name?: string;
  equipment_type: 'uniforme' | 'arma' | 'radio' | 'colete';
  equipment_id: string;
  assigned_at: string;
  returned_at?: string;
  status: 'assigned' | 'returned' | 'lost';
  digital_signature?: string;
}

export interface PayrollReport {
  id?: number;
  vigilante_id: number;
  vigilante_name?: string;
  month: string;
  total_hours: number;
  overtime_hours: number;
  base_salary: number;
  bonus: number;
  deductions: number;
  net_salary: number;
  status: 'draft' | 'approved' | 'paid';
}

export interface Transaction {
  id: number;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  description: string;
}

export interface NavItem {
  title: string;
  icon: LucideIcon;
  path: string;
  role?: string[];
}

