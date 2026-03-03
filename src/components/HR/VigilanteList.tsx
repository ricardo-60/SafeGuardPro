import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, MoreVertical, Download } from 'lucide-react';
import { api } from '../../lib/api';
import { Vigilante } from '../../types';

export default function VigilanteList() {
  const [vigilantes, setVigilantes] = useState<Vigilante[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    bi_number: '', 
    contact: '', 
    base_salary: '',
    status: 'active' as 'active' | 'suspended' | 'dismissed'
  });

  useEffect(() => {
    loadVigilantes();
  }, []);

  const loadVigilantes = async () => {
    const data = await api.getVigilantes();
    setVigilantes(data);
  };

  const handleEdit = (v: Vigilante) => {
    setFormData({ 
      name: v.name, 
      bi_number: v.bi_number, 
      contact: v.contact, 
      base_salary: v.base_salary.toString(),
      status: v.status
    });
    setEditingId(v.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este vigilante?')) {
      await api.deleteVigilante(id);
      loadVigilantes();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      base_salary: parseFloat(formData.base_salary)
    };
    
    if (editingId) {
      await api.updateVigilante(editingId, data);
    } else {
      await api.createVigilante(data);
    }
    
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', bi_number: '', contact: '', base_salary: '', status: 'active' });
    loadVigilantes();
  };

  const openNewModal = () => {
    setFormData({ name: '', bi_number: '', contact: '', base_salary: '', status: 'active' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary/40" size={18} />
          <input 
            type="text" 
            placeholder="Buscar vigilante por nome ou BI..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-brand-primary/10 focus:border-brand-accent outline-none transition-colors"
          />
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 bg-white border border-brand-primary/10 font-bold text-xs uppercase tracking-widest hover:bg-brand-primary hover:text-brand-bg transition-all">
            <Filter size={16} className="mr-2" /> Filtrar
          </button>
          <button className="flex items-center px-4 py-2 bg-white border border-brand-primary/10 font-bold text-xs uppercase tracking-widest hover:bg-brand-primary hover:text-brand-bg transition-all">
            <Download size={16} className="mr-2" /> Exportar
          </button>
          <button 
            onClick={openNewModal}
            className="flex items-center px-6 py-2 bg-brand-accent text-brand-primary font-bold text-xs uppercase tracking-widest hover:bg-brand-primary hover:text-brand-bg transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]"
          >
            <Plus size={16} className="mr-2" /> Novo Vigilante
          </button>
        </div>
      </div>

      <div className="card-brutalist overflow-hidden p-0">
        <div className="grid grid-cols-6 gap-4 p-4 bg-brand-primary text-brand-bg text-[10px] font-bold uppercase tracking-widest">
          <div className="col-span-2">Nome Completo</div>
          <div>Nº BI</div>
          <div>Contacto</div>
          <div>Status</div>
          <div className="text-right">Ações</div>
        </div>
        <div className="divide-y divide-brand-primary/10">
          {vigilantes.map((v) => (
            <div key={v.id} className="grid grid-cols-6 gap-4 p-4 items-center hover:bg-brand-bg/50 transition-colors group">
              <div className="col-span-2 flex items-center">
                <div className="w-8 h-8 bg-brand-primary/10 rounded-full flex items-center justify-center mr-3 font-bold text-xs">
                  {v.name.charAt(0)}
                </div>
                <span className="font-semibold text-sm">{v.name}</span>
              </div>
              <div className="font-mono text-xs">{v.bi_number}</div>
              <div className="text-sm">{v.contact}</div>
              <div>
                <span className={cn(
                  "px-2 py-1 text-[10px] font-bold uppercase rounded",
                  v.status === 'active' ? "bg-emerald-100 text-emerald-700" : 
                  v.status === 'suspended' ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                )}>
                  {v.status === 'active' ? 'Ativo' : v.status === 'suspended' ? 'Suspenso' : 'Demitido'}
                </span>
              </div>
              <div className="text-right flex justify-end space-x-2">
                <button 
                  onClick={() => handleEdit(v)}
                  className="p-1 hover:bg-brand-primary/10 rounded transition-colors"
                >
                  <MoreVertical size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(v.id)}
                  className="p-1 hover:bg-rose-100 text-rose-600 rounded transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
          {vigilantes.length === 0 && (
            <div className="p-12 text-center text-brand-primary/40 italic">
              Nenhum vigilante cadastrado.
            </div>
          )}
        </div>
      </div>

      {/* Simple Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-brand-primary/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-brutalist w-full max-w-lg bg-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg uppercase tracking-widest">{editingId ? 'Editar Vigilante' : 'Novo Vigilante'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1">Nome Completo</label>
                <input 
                  required
                  className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Nº BI</label>
                  <input 
                    required
                    className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent"
                    value={formData.bi_number}
                    onChange={e => setFormData({...formData, bi_number: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Contacto</label>
                  <input 
                    required
                    className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent"
                    value={formData.contact}
                    onChange={e => setFormData({...formData, contact: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Salário Base (Kz)</label>
                  <input 
                    type="number"
                    required
                    className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent"
                    value={formData.base_salary}
                    onChange={e => setFormData({...formData, base_salary: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Status</label>
                  <select 
                    className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent bg-white"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                  >
                    <option value="active">Ativo</option>
                    <option value="suspended">Suspenso</option>
                    <option value="dismissed">Demitido</option>
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
                  className="px-8 py-2 bg-brand-primary text-brand-bg font-bold text-xs uppercase tracking-widest hover:bg-brand-accent hover:text-brand-primary transition-all"
                >
                  {editingId ? 'Atualizar Cadastro' : 'Salvar Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
