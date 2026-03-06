import React, { useEffect, useState } from 'react';
import { Calendar, Plus, Search, X, Edit2, Trash2, Clock, User, MapPin, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { Scale, Vigilante, Post, Attendance } from '../../types';
import { format, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';

export default function ScaleList() {
  const [scales, setScales] = useState<Scale[]>([]);
  const [vigilantes, setVigilantes] = useState<Vigilante[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    vigilante_id: '',
    post_id: '',
    shift_start: '',
    shift_end: '',
    status: 'scheduled' as 'scheduled' | 'completed' | 'absent',
    shift_pattern: 'normal' as Scale['shift_pattern']
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [scaleData, vigData, postData, attendanceData] = await Promise.all([
      api.getScales(),
      api.getVigilantes(),
      api.getPosts(),
      api.getAttendance()
    ]);
    setScales(scaleData);
    setVigilantes(vigData);
    setPosts(postData);
    setAttendances(attendanceData);
  };

  const isUnmanned = (scale: Scale) => {
    const now = new Date();
    const shiftStart = new Date(scale.shift_start);

    if (isAfter(now, shiftStart) && scale.status === 'scheduled') {
      const hasClockIn = attendances.some(a =>
        a.vigilante_id === scale.vigilante_id &&
        a.post_id === scale.post_id &&
        a.type === 'clock_in' &&
        Math.abs(new Date(a.timestamp).getTime() - shiftStart.getTime()) < 4 * 60 * 60 * 1000
      );
      return !hasClockIn;
    }
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      vigilante_id: parseInt(formData.vigilante_id),
      post_id: parseInt(formData.post_id),
      shift_start: formData.shift_start,
      shift_end: formData.shift_end,
      status: formData.status,
      shift_pattern: formData.shift_pattern
    };

    if (editingId) {
      await api.updateScale(editingId, data);
    } else {
      await api.createScale(data);
    }

    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ vigilante_id: '', post_id: '', shift_start: '', shift_end: '', status: 'scheduled', shift_pattern: 'normal' });
    loadData();
  };

  const handleEdit = (s: Scale) => {
    setFormData({
      vigilante_id: s.vigilante_id.toString(),
      post_id: s.post_id.toString(),
      shift_start: s.shift_start,
      shift_end: s.shift_end,
      status: s.status,
      shift_pattern: s.shift_pattern || 'normal'
    });
    setEditingId(s.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta escala?')) {
      await api.deleteScale(id);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary/40" size={18} />
          <input
            type="text"
            placeholder="Buscar escala..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-brand-primary/10"
          />
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ vigilante_id: '', post_id: '', shift_start: '', shift_end: '', status: 'scheduled', shift_pattern: 'normal' });
            setIsModalOpen(true);
          }}
          className="flex items-center px-6 py-2 bg-brand-accent text-brand-primary font-bold text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]"
        >
          <Plus size={16} className="mr-2" /> Nova Escala
        </button>
      </div>

      <div className="card-brutalist overflow-hidden p-0">
        <div className="grid grid-cols-6 gap-4 p-4 bg-brand-primary text-brand-bg text-[10px] font-bold uppercase tracking-widest">
          <div className="col-span-2">Vigilante / Posto</div>
          <div>Início</div>
          <div>Fim</div>
          <div>Status</div>
          <div className="text-right">Ações</div>
        </div>
        <div className="divide-y divide-brand-primary/10">
          {scales.map((s) => {
            const unmanned = isUnmanned(s);
            return (
              <div key={s.id} className={cn(
                "grid grid-cols-6 gap-4 p-4 items-center hover:bg-brand-bg/50 transition-colors group relative",
                unmanned && "bg-rose-50"
              )}>
                {unmanned && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-600 animate-pulse" />
                )}
                <div className="col-span-2 flex flex-col">
                  <div className="flex items-center font-bold text-sm">
                    <User size={14} className="mr-2 opacity-40" /> {s.vigilante_name}
                  </div>
                  <div className="flex items-center text-xs opacity-60 mt-1">
                    <MapPin size={12} className="mr-2" /> {s.post_name}
                    {s.shift_pattern && (
                      <span className="ml-2 text-[8px] font-black uppercase text-brand-accent px-1 border border-brand-accent/30 rounded">
                        {s.shift_pattern}
                      </span>
                    )}
                  </div>
                  {unmanned && (
                    <div className="flex items-center text-[10px] font-bold text-rose-600 uppercase mt-1">
                      <AlertCircle size={10} className="mr-1" /> Posto Desguarnecido
                    </div>
                  )}
                </div>
                <div className="text-xs font-mono">
                  {format(new Date(s.shift_start), "dd/MM HH:mm", { locale: ptBR })}
                </div>
                <div className="text-xs font-mono">
                  {format(new Date(s.shift_end), "dd/MM HH:mm", { locale: ptBR })}
                </div>
                <div>
                  <span className={cn(
                    "px-2 py-1 text-[10px] font-bold uppercase rounded",
                    s.status === 'scheduled' ? "bg-blue-100 text-blue-700" :
                      s.status === 'completed' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                  )}>
                    {s.status === 'scheduled' ? 'Agendado' : s.status === 'completed' ? 'Concluído' : 'Falta'}
                  </span>
                </div>
                <div className="text-right flex justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(s)}
                    className="p-1 hover:bg-brand-primary/10 rounded transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="p-1 hover:bg-rose-100 text-rose-600 rounded transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
          {scales.length === 0 && (
            <div className="p-12 text-center text-brand-primary/40 italic">
              Nenhuma escala cadastrada.
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-brand-primary/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-brutalist w-full max-w-lg bg-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg uppercase tracking-widest">{editingId ? 'Editar Escala' : 'Nova Escala'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Vigilante</label>
                  <select
                    required
                    className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent bg-white"
                    value={formData.vigilante_id}
                    onChange={e => setFormData({ ...formData, vigilante_id: e.target.value })}
                  >
                    <option value="">Selecionar Vigilante</option>
                    {vigilantes.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Posto</label>
                  <select
                    required
                    className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent bg-white"
                    value={formData.post_id}
                    onChange={e => setFormData({ ...formData, post_id: e.target.value })}
                  >
                    <option value="">Selecionar Posto</option>
                    {posts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Início do Turno</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent"
                    value={formData.shift_start}
                    onChange={e => setFormData({ ...formData, shift_start: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Fim do Turno</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent"
                    value={formData.shift_end}
                    onChange={e => setFormData({ ...formData, shift_end: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Padrão de Escala</label>
                  <select
                    className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent bg-white"
                    value={formData.shift_pattern}
                    onChange={e => setFormData({ ...formData, shift_pattern: e.target.value as any })}
                  >
                    <option value="normal">Manual / Único</option>
                    <option value="12x24">12x24 (Angola Standard)</option>
                    <option value="24x48">24x48 (Industrial)</option>
                    <option value="4x2">4x2 (Ronda Especial)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Status</label>
                  <select
                    className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent bg-white"
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="scheduled">Agendado</option>
                    <option value="completed">Concluído</option>
                    <option value="absent">Falta</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 font-bold text-xs uppercase tracking-widest hover:underline"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-8 py-2 bg-brand-primary text-brand-bg font-bold text-xs uppercase tracking-widest hover:bg-brand-accent hover:text-brand-primary transition-all shadow-[4px_4px_0px_0px_rgba(242,125,38,1)]"
                >
                  {editingId ? 'Atualizar Escala' : 'Salvar Escala'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
