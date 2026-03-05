import Database from 'better-sqlite3';
import { supabaseAdmin } from './supabaseAdmin';

const dbPath = process.env.DB_PATH || 'safeguard.db';
const db = new Database(dbPath);

const useSupabase = !!(process.env.VITE_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

export const dbService = {
  async getStats() {
    if (useSupabase) {
      const { data: vigilantes } = await supabaseAdmin.from('vigilantes').select('id', { count: 'exact' }).eq('status', 'active');
      const { data: weapons } = await supabaseAdmin.from('weapons').select('id', { count: 'exact' }).eq('status', 'in_use');
      const { data: posts } = await supabaseAdmin.from('posts').select('id', { count: 'exact' });
      const { data: occurrences } = await supabaseAdmin.from('occurrences').select('id', { count: 'exact' }).gte('date_time', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const { data: incomeData } = await supabaseAdmin.from('transactions').select('amount').eq('type', 'income').gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());
      const { data: expenseData } = await supabaseAdmin.from('transactions').select('amount').eq('type', 'expense').gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

      return {
        vigilantes: vigilantes?.length || 0,
        weapons: weapons?.length || 0,
        posts: posts?.length || 0,
        occurrences: occurrences?.length || 0,
        monthly_income: incomeData?.reduce((acc, t) => acc + t.amount, 0) || 0,
        monthly_expense: expenseData?.reduce((acc, t) => acc + t.amount, 0) || 0
      };
    } else {
      const vigilantesCount = db.prepare("SELECT COUNT(*) as count FROM vigilantes WHERE status = 'active'").get().count;
      const weaponsCount = db.prepare("SELECT COUNT(*) as count FROM weapons WHERE status = 'in_use'").get().count;
      const postsCount = db.prepare("SELECT COUNT(*) as count FROM posts").get().count;
      const occurrencesCount = db.prepare("SELECT COUNT(*) as count FROM occurrences WHERE date_time >= date('now', '-30 days')").get().count;

      const income = db.prepare("SELECT SUM(amount) as total FROM transactions WHERE type = 'income' AND date >= date('now', 'start of month')").get().total || 0;
      const expense = db.prepare("SELECT SUM(amount) as total FROM transactions WHERE type = 'expense' AND date >= date('now', 'start of month')").get().total || 0;

      return {
        vigilantes: vigilantesCount,
        weapons: weaponsCount,
        posts: postsCount,
        occurrences: occurrencesCount,
        monthly_income: income,
        monthly_expense: expense
      };
    }
  },

  // Users
  async getUsers() {
    if (useSupabase) {
      // requires service role key
      const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
      if (error) console.error(error);
      return users?.map(u => ({ id: u.id, email: u.email, name: u.user_metadata?.name || 'User', role: u.user_metadata?.role || 'admin', created_at: u.created_at })) || [];
    }
    return db.prepare("SELECT id, name, email, role, created_at FROM users ORDER BY name").all();
  },

  async createUser(data: any) {
    if (useSupabase) {
      const { data: result, error } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: { name: data.name, role: data.role || 'user' }
      });
      if (error) throw error;
      return result.user;
    }
    const { name, email, password, role } = data;
    const result = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run(
      name, email, password, role || 'user'
    );
    return { id: result.lastInsertRowid };
  },

  async deleteUser(id: string | number) {
    if (useSupabase) {
      await supabaseAdmin.auth.admin.deleteUser(id.toString());
      return;
    }
    db.prepare("DELETE FROM users WHERE id = ?").run(id);
  },

  async getVigilantes() {
    if (useSupabase) {
      const { data } = await supabaseAdmin.from('vigilantes').select('*').order('name');
      return data;
    }
    return db.prepare("SELECT * FROM vigilantes ORDER BY name").all();
  },

  async createVigilante(data: any) {
    if (useSupabase) {
      const { data: result, error } = await supabaseAdmin.from('vigilantes').insert(data).select().single();
      if (error) throw error;
      return result;
    }
    const { name, bi_number, birth_date, address, phone, nif, inss, contract_type, status, photo_url } = data;
    const result = db.prepare(`
      INSERT INTO vigilantes (name, bi_number, birth_date, address, phone, nif, inss, contract_type, status, photo_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, bi_number, birth_date, address, phone, nif, inss, contract_type, status || 'active', photo_url);
    return { id: result.lastInsertRowid };
  },

  async deleteVigilante(id: string | number) {
    if (useSupabase) {
      await supabaseAdmin.from('vigilantes').delete().eq('id', id);
      return;
    }
    db.prepare("DELETE FROM vigilantes WHERE id = ?").run(id);
  },

  // Weapons
  async getWeapons() {
    if (useSupabase) {
      const { data } = await supabaseAdmin.from('weapons').select('*').order('serial_number');
      return data;
    }
    return db.prepare("SELECT * FROM weapons ORDER BY serial_number").all();
  },

  async createWeapon(data: any) {
    if (useSupabase) {
      const { data: result } = await supabaseAdmin.from('weapons').insert(data).select().single();
      return result;
    }
    const { serial_number, type, model, caliber, status } = data;
    const result = db.prepare("INSERT INTO weapons (serial_number, type, model, caliber, status) VALUES (?, ?, ?, ?, ?)").run(
      serial_number, type, model, caliber, status || 'available'
    );
    return { id: result.lastInsertRowid };
  },

  async deleteWeapon(id: any) {
    if (useSupabase) return supabaseAdmin.from('weapons').delete().eq('id', id);
    return db.prepare("DELETE FROM weapons WHERE id = ?").run(id);
  },

  // Equipment
  async getEquipment() {
    if (useSupabase) return (await supabaseAdmin.from('equipment').select('*').order('name')).data;
    return db.prepare("SELECT * FROM equipment ORDER BY name").all();
  },

  async createEquipment(data: any) {
    if (useSupabase) return (await supabaseAdmin.from('equipment').insert(data).select().single()).data;
    const { name, serial_number, type, status } = data;
    const result = db.prepare("INSERT INTO equipment (name, serial_number, type, status) VALUES (?, ?, ?, ?)").run(
      name, serial_number, type, status || 'available'
    );
    return { id: result.lastInsertRowid };
  },

  async deleteEquipment(id: any) {
    if (useSupabase) return supabaseAdmin.from('equipment').delete().eq('id', id);
    return db.prepare("DELETE FROM equipment WHERE id = ?").run(id);
  },

  // Posts
  async getPosts() {
    if (useSupabase) return (await supabaseAdmin.from('posts').select('*').order('name')).data;
    return db.prepare("SELECT * FROM posts ORDER BY name").all();
  },

  async createPost(data: any) {
    if (useSupabase) return (await supabaseAdmin.from('posts').insert(data).select().single()).data;
    const { name, location, client_name, status } = data;
    const result = db.prepare("INSERT INTO posts (name, location, client_name, status) VALUES (?, ?, ?, ?)").run(
      name, location, client_name, status || 'active'
    );
    return { id: result.lastInsertRowid };
  },

  async deletePost(id: any) {
    if (useSupabase) return supabaseAdmin.from('posts').delete().eq('id', id);
    return db.prepare("DELETE FROM posts WHERE id = ?").run(id);
  },

  // Occurrences
  async getOccurrences() {
    if (useSupabase) {
      const { data } = await supabaseAdmin.from('occurrences').select(`
        *,
        posts (name),
        vigilantes (name)
      `).order('date_time', { ascending: false });
      return data?.map(o => ({
        ...o,
        post_name: (o as any).posts?.name,
        vigilante_name: (o as any).vigilantes?.name
      }));
    }
    return db.prepare(`
      SELECT o.*, p.name as post_name, v.name as vigilante_name 
      FROM occurrences o
      LEFT JOIN posts p ON o.post_id = p.id
      LEFT JOIN vigilantes v ON o.vigilante_id = v.id
      ORDER BY o.date_time DESC
    `).all();
  },

  async createOccurrence(data: any) {
    if (useSupabase) return (await supabaseAdmin.from('occurrences').insert(data).select().single()).data;
    const { type, post_id, vigilante_id, description } = data;
    const result = db.prepare("INSERT INTO occurrences (type, post_id, vigilante_id, description) VALUES (?, ?, ?, ?)").run(
      type, post_id, vigilante_id, description
    );
    return { id: result.lastInsertRowid };
  },

  async deleteOccurrence(id: any) {
    if (useSupabase) return supabaseAdmin.from('occurrences').delete().eq('id', id);
    return db.prepare("DELETE FROM occurrences WHERE id = ?").run(id);
  },

  // Vehicles
  async getVehicles() {
    if (useSupabase) return (await supabaseAdmin.from('vehicles').select('*').order('plate')).data;
    return db.prepare("SELECT * FROM vehicles ORDER BY plate").all();
  },

  async createVehicle(data: any) {
    if (useSupabase) return (await supabaseAdmin.from('vehicles').insert(data).select().single()).data;
    const { plate, model, status } = data;
    const result = db.prepare("INSERT INTO vehicles (plate, model, status) VALUES (?, ?, ?)").run(
      plate, model, status || 'active'
    );
    return { id: result.lastInsertRowid };
  },

  async updateVehicle(id: any, data: any) {
    if (useSupabase) return supabaseAdmin.from('vehicles').update(data).eq('id', id);
    const { plate, model, status } = data;
    return db.prepare("UPDATE vehicles SET plate = ?, model = ?, status = ? WHERE id = ?").run(
      plate, model, status, id
    );
  },

  async deleteVehicle(id: any) {
    if (useSupabase) return supabaseAdmin.from('vehicles').delete().eq('id', id);
    return db.prepare("DELETE FROM vehicles WHERE id = ?").run(id);
  },

  // Scales
  async getScales() {
    if (useSupabase) {
      const { data } = await supabaseAdmin.from('scales').select(`
        *,
        vigilantes (name),
        posts (name)
      `).order('shift_start');
      return data?.map(s => ({
        ...s,
        vigilante_name: (s as any).vigilantes?.name,
        post_name: (s as any).posts?.name
      }));
    }
    return db.prepare(`
      SELECT s.*, v.name as vigilante_name, p.name as post_name 
      FROM scales s
      JOIN vigilantes v ON s.vigilante_id = v.id
      JOIN posts p ON s.post_id = p.id
      ORDER BY s.shift_start ASC
    `).all();
  },

  async createScale(data: any) {
    if (useSupabase) return (await supabaseAdmin.from('scales').insert(data).select().single()).data;
    const { vigilante_id, post_id, shift_start, shift_end, status } = data;
    const result = db.prepare("INSERT INTO scales (vigilante_id, post_id, shift_start, shift_end, status) VALUES (?, ?, ?, ?, ?)").run(
      vigilante_id, post_id, shift_start, shift_end, status || 'scheduled'
    );
    return { id: result.lastInsertRowid };
  },

  async updateScale(id: any, data: any) {
    if (useSupabase) return supabaseAdmin.from('scales').update(data).eq('id', id);
    const { vigilante_id, post_id, shift_start, shift_end, status } = data;
    return db.prepare("UPDATE scales SET vigilante_id = ?, post_id = ?, shift_start = ?, shift_end = ?, status = ? WHERE id = ?").run(
      vigilante_id, post_id, shift_start, shift_end, status, id
    );
  },

  async deleteScale(id: any) {
    if (useSupabase) return supabaseAdmin.from('scales').delete().eq('id', id);
    return db.prepare("DELETE FROM scales WHERE id = ?").run(id);
  },

  // Transactions
  async getTransactions() {
    if (useSupabase) return (await supabaseAdmin.from('transactions').select('*').order('date', { ascending: false })).data;
    return db.prepare("SELECT * FROM transactions ORDER BY date DESC").all();
  },

  async createTransaction(data: any) {
    if (useSupabase) return (await supabaseAdmin.from('transactions').insert(data).select().single()).data;
    const { type, category, amount, description, date } = data;
    const result = db.prepare("INSERT INTO transactions (type, category, amount, description, date) VALUES (?, ?, ?, ?, ?)").run(
      type, category, amount, description, date || new Date().toISOString().split('T')[0]
    );
    return { id: result.lastInsertRowid };
  },

  async deleteTransaction(id: any) {
    if (useSupabase) return supabaseAdmin.from('transactions').delete().eq('id', id);
    return db.prepare("DELETE FROM transactions WHERE id = ?").run(id);
  },
};

export { db };
