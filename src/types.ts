import { LucideIcon } from 'lucide-react';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}
export interface Vigilante {
  id: number;
  name: string;
  bi_number: string;
  contact: string;
  base_salary: number;
  status: 'active' | 'suspended' | 'dismissed';
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
  status: 'active' | 'maintenance' | 'inactive';
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
