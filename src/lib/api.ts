import { Vigilante, Weapon, Post, Occurrence, Equipment, Vehicle, Scale, Transaction, User } from '../types';

const API_BASE = '/api';

export const api = {
  getStats: async () => {
    const res = await fetch(`${API_BASE}/stats`);
    return res.json();
  },
  // Users
  getUsers: async (): Promise<User[]> => {
    const res = await fetch(`${API_BASE}/users`);
    return res.json();
  },
  createUser: async (data: Partial<User> & { password?: string }) => {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  deleteUser: async (id: number | string) => {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },
  // Vigilantes
  getVigilantes: async (): Promise<Vigilante[]> => {
    const res = await fetch(`${API_BASE}/vigilantes`);
    return res.json();
  },
  createVigilante: async (data: Partial<Vigilante>) => {
    const res = await fetch(`${API_BASE}/vigilantes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  updateVigilante: async (id: number, data: Partial<Vigilante>) => {
    const res = await fetch(`${API_BASE}/vigilantes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  deleteVigilante: async (id: number) => {
    const res = await fetch(`${API_BASE}/vigilantes/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },
  // Weapons
  getWeapons: async (): Promise<Weapon[]> => {
    const res = await fetch(`${API_BASE}/weapons`);
    return res.json();
  },
  createWeapon: async (data: Partial<Weapon>) => {
    const res = await fetch(`${API_BASE}/weapons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  updateWeapon: async (id: number, data: Partial<Weapon>) => {
    const res = await fetch(`${API_BASE}/weapons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  deleteWeapon: async (id: number) => {
    const res = await fetch(`${API_BASE}/weapons/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },
  // Posts
  getPosts: async (): Promise<Post[]> => {
    const res = await fetch(`${API_BASE}/posts`);
    return res.json();
  },
  createPost: async (data: Partial<Post>) => {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  updatePost: async (id: number, data: Partial<Post>) => {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  deletePost: async (id: number) => {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },
  // Occurrences
  getOccurrences: async (): Promise<Occurrence[]> => {
    const res = await fetch(`${API_BASE}/occurrences`);
    return res.json();
  },
  createOccurrence: async (data: Partial<Occurrence>) => {
    const res = await fetch(`${API_BASE}/occurrences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  deleteOccurrence: async (id: number) => {
    const res = await fetch(`${API_BASE}/occurrences/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },
  // Equipment
  getEquipment: async () => {
    const res = await fetch(`${API_BASE}/equipment`);
    return res.json();
  },
  createEquipment: async (data: any) => {
    const res = await fetch(`${API_BASE}/equipment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  // Vehicles
  getVehicles: async () => {
    const res = await fetch(`${API_BASE}/vehicles`);
    return res.json();
  },
  createVehicle: async (data: any) => {
    const res = await fetch(`${API_BASE}/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  updateVehicle: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE}/vehicles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  deleteVehicle: async (id: number) => {
    const res = await fetch(`${API_BASE}/vehicles/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },
  // Scales
  getScales: async (): Promise<Scale[]> => {
    const res = await fetch(`${API_BASE}/scales`);
    return res.json();
  },
  createScale: async (data: Partial<Scale>) => {
    const res = await fetch(`${API_BASE}/scales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  updateScale: async (id: number, data: Partial<Scale>) => {
    const res = await fetch(`${API_BASE}/scales/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  deleteScale: async (id: number) => {
    const res = await fetch(`${API_BASE}/scales/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },
  // Transactions
  getTransactions: async (): Promise<Transaction[]> => {
    const res = await fetch(`${API_BASE}/transactions`);
    return res.json();
  },
  createTransaction: async (data: Partial<Transaction>) => {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  deleteTransaction: async (id: number) => {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },
  // Equipment full CRUD
  updateEquipment: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE}/equipment/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  deleteEquipment: async (id: number) => {
    const res = await fetch(`${API_BASE}/equipment/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },
};
