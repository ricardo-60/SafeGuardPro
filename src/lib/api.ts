import { Vigilante, Weapon, Post, Occurrence, Equipment, Vehicle, Scale, Transaction, User } from '../types';
import { supabase } from './supabase';
import { get, set } from 'idb-keyval';
import { offlineQueue } from './offlineQueue';

// Helper to cache GET requests
async function cachedGet<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  try {
    if (!navigator.onLine) throw new Error('Offline');
    const data = await fetcher();
    await set(key, data); // Save to cache
    return data;
  } catch (error) {
    const cached = await get(key);
    if (cached) return cached as T;
    return [] as unknown as T; // Return empty array if nothing in cache
  }
}

// Helper for offline mutations (Create/Update/Delete)
async function offlineMutation(action: 'insert' | 'update' | 'delete', table: string, payload: any, reqFn: () => Promise<any>) {
  if (!navigator.onLine) {
    await offlineQueue.enqueue({ table, action, payload });
    return payload; // Optimistic return
  }
  try {
    const res = await reqFn();
    if (res.error) throw res.error;
    return res.data;
  } catch (error: any) {
    if (error.message?.includes('Failed to fetch') || error.message?.includes('network')) {
      await offlineQueue.enqueue({ table, action, payload });
      return payload;
    }
    console.error(`Mutation errored on ${table}:`, error);
    throw error;
  }
}

export const api = {
  // Stats
  getStats: async () => {
    return cachedGet('stats_cache', async () => {
      const [p, v, w, o, e, ve, s, t, u] = await Promise.all([
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('vigilantes').select('*', { count: 'exact', head: true }),
        supabase.from('weapons').select('*', { count: 'exact', head: true }),
        supabase.from('occurrences').select('*', { count: 'exact', head: true }),
        supabase.from('equipment').select('*', { count: 'exact', head: true }),
        supabase.from('vehicles').select('*', { count: 'exact', head: true }),
        supabase.from('scales').select('*', { count: 'exact', head: true }),
        supabase.from('transactions').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }),
      ]);
      return {
        totalPosts: p.count || 0,
        totalVigilantes: v.count || 0,
        totalWeapons: w.count || 0,
        totalOccurrences: o.count || 0,
        posts: [],
        occurrences: []
      };
    });
  },

  // Users
  getUsers: async (): Promise<User[]> => cachedGet('users_cache', async () => (await supabase.from('users').select('*')).data || []),
  createUser: async (data: Partial<User> & { password?: string }) => offlineMutation('insert', 'users', data, () => supabase.from('users').insert(data).select().single() as any),
  deleteUser: async (id: number | string) => offlineMutation('delete', 'users', { id }, () => supabase.from('users').delete().eq('id', id) as any),

  // Vigilantes
  getVigilantes: async (): Promise<Vigilante[]> => {
    return cachedGet('vigilantes_cache', async () => {
      const { data } = await supabase.from('vigilantes').select('*');
      return (data || []).map(v => ({ ...v, contact: v.phone })) as Vigilante[];
    });
  },
  createVigilante: async (data: Partial<Vigilante>) => {
    const { contact, ...rest } = data;
    const dbPayload = { ...rest, phone: contact };
    const res = await offlineMutation('insert', 'vigilantes', dbPayload, () => supabase.from('vigilantes').insert(dbPayload).select().single() as any);
    return res ? { ...res, contact: res.phone } as Vigilante : null;
  },
  updateVigilante: async (id: number, data: Partial<Vigilante>) => {
    const { contact, ...rest } = data;
    const dbPayload = contact !== undefined ? { id, ...rest, phone: contact } : { id, ...rest };
    const res = await offlineMutation('update', 'vigilantes', dbPayload, () => supabase.from('vigilantes').update(dbPayload).eq('id', id).select().single() as any);
    return res ? { ...res, contact: res.phone } as Vigilante : null;
  },
  deleteVigilante: async (id: number) => offlineMutation('delete', 'vigilantes', { id }, () => supabase.from('vigilantes').delete().eq('id', id) as any),

  // Weapons
  getWeapons: async (): Promise<Weapon[]> => cachedGet('weapons_cache', async () => (await supabase.from('weapons').select('*')).data || []),
  createWeapon: async (data: Partial<Weapon>) => offlineMutation('insert', 'weapons', data, () => supabase.from('weapons').insert(data).select().single() as any),
  updateWeapon: async (id: number, data: Partial<Weapon>) => offlineMutation('update', 'weapons', { id, ...data }, () => supabase.from('weapons').update(data).eq('id', id).select().single() as any),
  deleteWeapon: async (id: number) => offlineMutation('delete', 'weapons', { id }, () => supabase.from('weapons').delete().eq('id', id) as any),

  // Posts
  getPosts: async (): Promise<Post[]> => cachedGet('posts_cache', async () => (await supabase.from('posts').select('*')).data || []),
  createPost: async (data: Partial<Post>) => offlineMutation('insert', 'posts', data, () => supabase.from('posts').insert(data).select().single() as any),
  updatePost: async (id: number, data: Partial<Post>) => offlineMutation('update', 'posts', { id, ...data }, () => supabase.from('posts').update(data).eq('id', id).select().single() as any),
  deletePost: async (id: number) => offlineMutation('delete', 'posts', { id }, () => supabase.from('posts').delete().eq('id', id) as any),

  // Occurrences
  getOccurrences: async (): Promise<Occurrence[]> => {
    return cachedGet('occurrences_cache', async () => {
      const { data } = await supabase.from('occurrences').select('*, vigilantes(name), posts(name)').order('date_time', { ascending: false });
      return (data || []).map((o: any) => ({ ...o, vigilante_name: o.vigilantes?.name, post_name: o.posts?.name }));
    });
  },
  createOccurrence: async (data: Partial<Occurrence>) => offlineMutation('insert', 'occurrences', data, () => supabase.from('occurrences').insert(data).select().single() as any),
  deleteOccurrence: async (id: number) => offlineMutation('delete', 'occurrences', { id }, () => supabase.from('occurrences').delete().eq('id', id) as any),

  // Equipment
  getEquipment: async () => cachedGet('equipment_cache', async () => (await supabase.from('equipment').select('*')).data || []),
  createEquipment: async (data: any) => offlineMutation('insert', 'equipment', data, () => supabase.from('equipment').insert(data).select().single() as any),
  updateEquipment: async (id: number, data: any) => offlineMutation('update', 'equipment', { id, ...data }, () => supabase.from('equipment').update(data).eq('id', id).select().single() as any),
  deleteEquipment: async (id: number) => offlineMutation('delete', 'equipment', { id }, () => supabase.from('equipment').delete().eq('id', id) as any),

  // Vehicles
  getVehicles: async () => cachedGet('vehicles_cache', async () => (await supabase.from('vehicles').select('*')).data || []),
  createVehicle: async (data: any) => offlineMutation('insert', 'vehicles', data, () => supabase.from('vehicles').insert(data).select().single() as any),
  updateVehicle: async (id: number, data: any) => offlineMutation('update', 'vehicles', { id, ...data }, () => supabase.from('vehicles').update(data).eq('id', id).select().single() as any),
  deleteVehicle: async (id: number) => offlineMutation('delete', 'vehicles', { id }, () => supabase.from('vehicles').delete().eq('id', id) as any),

  // Scales
  getScales: async (): Promise<Scale[]> => {
    return cachedGet('scales_cache', async () => {
      const { data } = await supabase.from('scales').select('*, vigilantes(name), posts(name)').order('shift_start', { ascending: true });
      return (data || []).map((s: any) => ({ ...s, vigilante_name: s.vigilantes?.name, post_name: s.posts?.name }));
    });
  },
  createScale: async (data: Partial<Scale>) => offlineMutation('insert', 'scales', data, () => supabase.from('scales').insert(data).select().single() as any),
  updateScale: async (id: number, data: Partial<Scale>) => offlineMutation('update', 'scales', { id, ...data }, () => supabase.from('scales').update(data).eq('id', id).select().single() as any),
  deleteScale: async (id: number) => offlineMutation('delete', 'scales', { id }, () => supabase.from('scales').delete().eq('id', id) as any),

  // Transactions
  getTransactions: async (): Promise<Transaction[]> => cachedGet('transactions_cache', async () => (await supabase.from('transactions').select('*').order('date', { ascending: false })).data || []),
  createTransaction: async (data: Partial<Transaction>) => offlineMutation('insert', 'transactions', data, () => supabase.from('transactions').insert(data).select().single() as any),
  deleteTransaction: async (id: number) => offlineMutation('delete', 'transactions', { id }, () => supabase.from('transactions').delete().eq('id', id) as any),
};
