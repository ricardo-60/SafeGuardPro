import { Vigilante, Weapon, Post, Occurrence, Equipment, Vehicle, Scale, Transaction, User, Attendance, EquipmentAssignment, PayrollReport, VehicleMission, TacticalAsset, AssetDamageReport, AuditLog, UserRole } from '../types';
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
async function offlineMutation(action: 'insert' | 'update' | 'delete', table: string, payload: any, reqFn: () => Promise<any>, priority: 'normal' | 'high' = 'normal') {
  if (!navigator.onLine) {
    await offlineQueue.enqueue({ table, action, payload, priority });
    return payload; // Optimistic return
  }
  try {
    const res = await reqFn();
    if (res.error) throw res.error;
    return res.data;
  } catch (error: any) {
    if (error.message?.includes('Failed to fetch') || error.message?.includes('network')) {
      await offlineQueue.enqueue({ table, action, payload, priority });
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
      return (data || []).map(v => {
        const { phone, ...rest } = v;
        return { ...rest, contact: phone };
      }) as Vigilante[];
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
  createOccurrence: async (data: Partial<Occurrence>) => {
    const priority = data.priority === 'urgent' ? 'high' : 'normal';
    return offlineMutation('insert', 'occurrences', data, () => supabase.from('occurrences').insert(data).select().single() as any, priority);
  },
  deleteOccurrence: async (id: number) => offlineMutation('delete', 'occurrences', { id }, () => supabase.from('occurrences').delete().eq('id', id) as any),

  // Equipment (Legacy - will be superseded by Tactical Assets/Kardex)
  getEquipment: async () => cachedGet('equipment_cache', async () => (await supabase.from('equipment').select('*')).data || []),
  createEquipment: async (data: Partial<Equipment>) => offlineMutation('insert', 'equipment', data, () => supabase.from('equipment').insert(data).select().single() as any),
  updateEquipment: async (id: number, data: Partial<Equipment>) => offlineMutation('update', 'equipment', { id, ...data }, () => supabase.from('equipment').update(data).eq('id', id).select().single() as any),
  deleteEquipment: async (id: number) => offlineMutation('delete', 'equipment', { id }, () => supabase.from('equipment').delete().eq('id', id) as any),

  getVehicles: async (): Promise<Vehicle[]> => cachedGet('vehicles_cache', async () => (await supabase.from('vehicles').select('*')).data || []),
  createVehicle: async (data: Partial<Vehicle>) => offlineMutation('insert', 'vehicles', data, () => supabase.from('vehicles').insert(data).select().single() as any),
  updateVehicle: async (id: number, data: Partial<Vehicle>) => offlineMutation('update', 'vehicles', { id, ...data }, () => supabase.from('vehicles').update(data).eq('id', id).select().single() as any),
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

  // Attendance
  getAttendance: async (): Promise<Attendance[]> => cachedGet('attendance_cache', async () => (await supabase.from('attendance').select('*, vigilantes(name), posts(name)').order('timestamp', { ascending: false })).data || []),
  createAttendance: async (data: Partial<Attendance>) => offlineMutation('insert', 'attendance', data, () => supabase.from('attendance').insert(data).select().single() as any),

  // Equipment Assignment
  getEquipmentAssignments: async (): Promise<EquipmentAssignment[]> => {
    return cachedGet('equip_assignments_cache', async () => {
      const { data } = await supabase.from('equipment_assignments').select('*, vigilantes(name)').order('assigned_at', { ascending: false });
      return (data || []).map((e: any) => ({ ...e, vigilante_name: e.vigilantes?.name })) as EquipmentAssignment[];
    });
  },
  createEquipmentAssignment: async (data: Partial<EquipmentAssignment>) => offlineMutation('insert', 'equipment_assignments', data, () => supabase.from('equipment_assignments').insert(data).select().single() as any),
  updateEquipmentAssignment: async (id: number, data: Partial<EquipmentAssignment>) => offlineMutation('update', 'equipment_assignments', { id, ...data }, () => supabase.from('equipment_assignments').update(data).eq('id', id).select().single() as any),

  // Payroll Reports
  getPayrollReports: async (month: string): Promise<PayrollReport[]> => {
    return cachedGet(`payroll_${month}_cache`, async () => {
      const { data } = await supabase.from('payroll_reports').select('*, vigilantes(name)').eq('month', month);
      return (data || []).map((p: any) => ({ ...p, vigilante_name: p.vigilantes?.name })) as PayrollReport[];
    });
  },
  createPayrollReport: async (data: Partial<PayrollReport>) => offlineMutation('insert', 'payroll_reports', data, () => supabase.from('payroll_reports').insert(data).select().single() as any),

  // Logistics & Fleet
  getVehicleMissions: async (): Promise<VehicleMission[]> => cachedGet('missions_cache', async () => (await supabase.from('vehicle_missions').select('*, vehicles(plate), vigilantes(name)')).data || []),
  createVehicleMission: async (data: Partial<VehicleMission>) => offlineMutation('insert', 'vehicle_missions', data, () => supabase.from('vehicle_missions').insert(data).select().single() as any),

  // Tactical Assets (Kardex)
  getTacticalAssets: async (): Promise<TacticalAsset[]> => cachedGet('tassets_cache', async () => (await supabase.from('tactical_assets').select('*')).data || []),
  updateTacticalAsset: async (id: number, data: Partial<TacticalAsset>) => offlineMutation('update', 'tactical_assets', { id, ...data }, () => supabase.from('tactical_assets').update(data).eq('id', id).select().single() as any),

  createDamageReport: async (data: Partial<AssetDamageReport>) => offlineMutation('insert', 'damage_reports', data, () => supabase.from('damage_reports').insert(data).select().single() as any),

  // Governance & Audit
  getAuditLogs: async (): Promise<AuditLog[]> => {
    const { data } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false });
    return data || [];
  },
  createAuditLog: async (log: Partial<AuditLog>) => {
    // Audit logs are critical and should always be pushed to offline queue if offline
    return offlineMutation('insert', 'audit_logs', log, () => supabase.from('audit_logs').insert(log) as any);
  },
  updateUserRole: async (userId: string, role: UserRole) => {
    return offlineMutation('update', 'users', { id: userId, role }, () => supabase.from('users').update({ role }).eq('id', userId) as any);
  },
  updateUserSecurity: async (userId: string, data: { mfa_enabled?: boolean, last_login?: string, last_device?: string }) => {
    return supabase.from('users').update(data).eq('id', userId);
  },

  // Executive Stats
  getDashboardStats: async () => {
    return cachedGet('dash_stats_cache', async () => {
      const [attendance, vigilantes, scales, payroll, vehicles, assets, weapons] = await Promise.all([
        supabase.from('attendance').select('*'),
        supabase.from('vigilantes').select('*'),
        supabase.from('scales').select('*'),
        supabase.from('payroll_reports').select('*'),
        supabase.from('vehicles').select('*'),
        supabase.from('tactical_assets').select('*'),
        supabase.from('weapons').select('*')
      ]);

      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);

      // Detailed Compliance Alerts
      const alerts: { msg: string, type: 'warning' | 'error' | 'info' }[] = [];

      // Document Expiry Alerts
      const expiredVigilantes = (vigilantes.data || []).filter(v => {
        const police = v.doc_police_expiry ? new Date(v.doc_police_expiry) < now : false;
        const psych = v.doc_psych_expiry ? new Date(v.doc_psych_expiry) < now : false;

        if (police) alerts.push({ msg: `Cartão PN de ${v.name} expirado`, type: 'error' });
        else if (v.doc_police_expiry && new Date(v.doc_police_expiry) < thirtyDaysFromNow) {
          alerts.push({ msg: `Cartão PN de ${v.name} expira em breve`, type: 'warning' });
        }

        return police || psych;
      });

      // Weapon Expiry Alerts
      (weapons.data || []).forEach(w => {
        if (w.expiry_date && new Date(w.expiry_date) < now) {
          alerts.push({ msg: `Licença da Arma ${w.serial_number} (${w.model}) expirada`, type: 'error' });
        } else if (w.expiry_date && new Date(w.expiry_date) < thirtyDaysFromNow) {
          alerts.push({ msg: `Licença da Arma ${w.serial_number} expira em breve`, type: 'warning' });
        }
      });

      // Attendance Stats (Last 24h)
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const recentAttendance = (attendance.data || []).filter(a => new Date(a.timestamp) > last24h);
      const offRadius = recentAttendance.filter(a => !a.is_within_radius).length;

      if (offRadius > 0) {
        alerts.push({ msg: `${offRadius} registros de presença fora do raio GPS (últimas 24h)`, type: 'warning' });
      }

      // Fleet Alerts
      (vehicles.data || []).forEach(v => {
        if (v.status === 'maintenance') {
          alerts.push({ msg: `Viatura ${v.plate} em manutenção`, type: 'info' });
        }
      });

      return {
        totalVigilantes: vigilantes.data?.length || 0,
        expiredDocuments: expiredVigilantes.length,
        offRadiusAlerts: offRadius,
        activeScales: scales.data?.filter(s => s.status === 'scheduled').length || 0,
        totalPayrollAOA: (payroll.data || []).reduce((acc, p) => acc + (p.net_salary || 0), 0),
        activeVehicles: (vehicles.data || []).filter(v => v.status === 'active').length,
        availableAssets: (assets.data || []).filter(a => a.status === 'available').length,
        alerts: alerts.slice(0, 10) // Limit to 10 most relevant
      };
    });
  }
};
