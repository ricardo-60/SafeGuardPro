import { Vigilante, Weapon, Post, Occurrence, Equipment, Vehicle, Scale, Transaction, User } from '../types';
import { supabase } from './supabase';

export const api = {
  // Stats
  getStats: async () => {
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

    // Simple default structure for frontend metrics until custom views are ported
    return {
      totalPosts: p.count || 0,
      totalVigilantes: v.count || 0,
      totalWeapons: w.count || 0,
      totalOccurrences: o.count || 0,
      posts: [],
      occurrences: []
    };
  },

  // Users
  getUsers: async (): Promise<User[]> => {
    const { data } = await supabase.from('users').select('*');
    return data || [];
  },
  createUser: async (data: Partial<User> & { password?: string }) => {
    // In frontend we rely on user profile table
    const { data: result } = await supabase.from('users').insert(data).select().single();
    return result;
  },
  deleteUser: async (id: number | string) => {
    await supabase.from('users').delete().eq('id', id);
    return { success: true };
  },

  // Vigilantes
  getVigilantes: async (): Promise<Vigilante[]> => {
    const { data } = await supabase.from('vigilantes').select('*');
    return data || [];
  },
  createVigilante: async (data: Partial<Vigilante>) => {
    const { data: res } = await supabase.from('vigilantes').insert(data).select().single();
    return res;
  },
  updateVigilante: async (id: number, data: Partial<Vigilante>) => {
    const { data: res } = await supabase.from('vigilantes').update(data).eq('id', id).select().single();
    return res;
  },
  deleteVigilante: async (id: number) => {
    await supabase.from('vigilantes').delete().eq('id', id);
    return { success: true };
  },

  // Weapons
  getWeapons: async (): Promise<Weapon[]> => {
    const { data } = await supabase.from('weapons').select('*');
    return data || [];
  },
  createWeapon: async (data: Partial<Weapon>) => {
    const { data: res } = await supabase.from('weapons').insert(data).select().single();
    return res;
  },
  updateWeapon: async (id: number, data: Partial<Weapon>) => {
    const { data: res } = await supabase.from('weapons').update(data).eq('id', id).select().single();
    return res;
  },
  deleteWeapon: async (id: number) => {
    await supabase.from('weapons').delete().eq('id', id);
    return { success: true };
  },

  // Posts
  getPosts: async (): Promise<Post[]> => {
    const { data } = await supabase.from('posts').select('*');
    return data || [];
  },
  createPost: async (data: Partial<Post>) => {
    const { data: res } = await supabase.from('posts').insert(data).select().single();
    return res;
  },
  updatePost: async (id: number, data: Partial<Post>) => {
    const { data: res } = await supabase.from('posts').update(data).eq('id', id).select().single();
    return res;
  },
  deletePost: async (id: number) => {
    await supabase.from('posts').delete().eq('id', id);
    return { success: true };
  },

  // Occurrences
  getOccurrences: async (): Promise<Occurrence[]> => {
    const { data } = await supabase.from('occurrences').select(`
      *,
      vigilantes (name),
      posts (name)
    `).order('date_time', { ascending: false });

    // Map relations to flat props as expected by frontend
    return (data || []).map((o: any) => ({
      ...o,
      vigilante_name: o.vigilantes?.name,
      post_name: o.posts?.name
    }));
  },
  createOccurrence: async (data: Partial<Occurrence>) => {
    const { data: res } = await supabase.from('occurrences').insert(data).select().single();
    return res;
  },
  deleteOccurrence: async (id: number) => {
    await supabase.from('occurrences').delete().eq('id', id);
    return { success: true };
  },

  // Equipment
  getEquipment: async () => {
    const { data } = await supabase.from('equipment').select('*');
    return data || [];
  },
  createEquipment: async (data: any) => {
    const { data: res } = await supabase.from('equipment').insert(data).select().single();
    return res;
  },
  updateEquipment: async (id: number, data: any) => {
    const { data: res } = await supabase.from('equipment').update(data).eq('id', id).select().single();
    return res;
  },
  deleteEquipment: async (id: number) => {
    await supabase.from('equipment').delete().eq('id', id);
    return { success: true };
  },

  // Vehicles
  getVehicles: async () => {
    const { data } = await supabase.from('vehicles').select('*');
    return data || [];
  },
  createVehicle: async (data: any) => {
    const { data: res } = await supabase.from('vehicles').insert(data).select().single();
    return res;
  },
  updateVehicle: async (id: number, data: any) => {
    const { data: res } = await supabase.from('vehicles').update(data).eq('id', id).select().single();
    return res;
  },
  deleteVehicle: async (id: number) => {
    await supabase.from('vehicles').delete().eq('id', id);
    return { success: true };
  },

  // Scales
  getScales: async (): Promise<Scale[]> => {
    const { data } = await supabase.from('scales').select(`
      *,
      vigilantes (name),
      posts (name)
    `).order('shift_start', { ascending: true });

    return (data || []).map((s: any) => ({
      ...s,
      vigilante_name: s.vigilantes?.name,
      post_name: s.posts?.name
    }));
  },
  createScale: async (data: Partial<Scale>) => {
    const { data: res } = await supabase.from('scales').insert(data).select().single();
    return res;
  },
  updateScale: async (id: number, data: Partial<Scale>) => {
    const { data: res } = await supabase.from('scales').update(data).eq('id', id).select().single();
    return res;
  },
  deleteScale: async (id: number) => {
    await supabase.from('scales').delete().eq('id', id);
    return { success: true };
  },

  // Transactions
  getTransactions: async (): Promise<Transaction[]> => {
    const { data } = await supabase.from('transactions').select('*').order('date', { ascending: false });
    return data || [];
  },
  createTransaction: async (data: Partial<Transaction>) => {
    const { data: res } = await supabase.from('transactions').insert(data).select().single();
    return res;
  },
  deleteTransaction: async (id: number) => {
    await supabase.from('transactions').delete().eq('id', id);
    return { success: true };
  },
};
