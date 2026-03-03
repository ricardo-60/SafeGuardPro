import React, { useEffect, useState } from 'react';
import { Shield, Plus, Search, AlertCircle, X, Trash2, Edit2 } from 'lucide-react';
import { api } from '../../lib/api';
import { Weapon } from '../../types';

export default function WeaponList() {
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    type: '',
    brand: '',
    model: '',
    serial_number: '',
    caliber: '',
    status: 'available' as 'available' | 'in_use' | 'maintenance'
  });

  useEffect(() => {
    loadWeapons();
  }, []);

  const loadWeapons = async () => {
    const data = await api.getWeapons();
    setWeapons(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await api.updateWeapon(editingId, formData);
    } else {
      await api.createWeapon(formData);
    }
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ type: '', brand: '', model: '', serial_number: '', caliber: '', status: 'available' });
    loadWeapons();
  };

  const handleEdit = (w: Weapon) => {
    setFormData({
      type: w.type,
      brand: w.brand,
      model: w.model,
      serial_number: w.serial_number,
      caliber: '9mm', // Defaulting since it's not in the type yet
      status: w.status
    });
    setEditingId(w.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta arma?')) {
      await api.deleteWeapon(id);
      loadWeapons();
    }
  };

  const openNewModal = () => {
    setFormData({ type: '', brand: '', model: '', serial_number: '', caliber: '', status: 'available' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary/40" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por Nº de Série..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-brand-primary/10"
          />
        </div>
        <button 
          onClick={openNewModal}
          className="flex items-center px-6 py-2 bg-brand-accent text-brand-primary font-bold text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]"
        >
          <Plus size={16} className="mr-2" /> Cadastrar Arma
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {weapons.map((w) => (
          <div key={w.id} className="card-brutalist bg-white relative group">
            <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleEdit(w)}
                className="p-2 bg-brand-bg hover:bg-brand-primary hover:text-brand-bg rounded transition-colors"
              >
                <Edit2 size={14} />
              </button>
              <button 
                onClick={() => handleDelete(w.id)}
                className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-brand-bg rounded">
                <Shield size={20} className="text-brand-primary" />
              </div>
              <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${
                w.status === 'available' ? 'bg-emerald-100 text-emerald-700' :
                w.status === 'in_use' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {w.status === 'available' ? 'Disponível' : w.status === 'in_use' ? 'Em Uso' : 'Manutenção'}
              </span>
            </div>
            <h4 className="font-bold text-sm uppercase mb-1">{w.brand} {w.model}</h4>
            <p className="text-xs text-brand-primary/50 mb-4">Série: <span className="font-mono font-bold text-brand-primary">{w.serial_number}</span></p>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-brand-primary/5">
              <div>
                <p className="text-[10px] font-bold uppercase opacity-40">Tipo</p>
                <p className="text-sm font-semibold">{w.type}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase opacity-40">Calibre</p>
                <p className="text-sm font-semibold">9mm</p>
              </div>
            </div>

            <button className="w-full mt-6 py-2 border border-brand-primary font-bold text-[10px] uppercase tracking-widest hover:bg-brand-primary hover:text-brand-bg transition-colors">
              Histórico de Movimentação
            </button>
          </div>
        ))}
        
        {weapons.length === 0 && (
          <div className="col-span-full p-12 card-brutalist bg-white/50 border-dashed flex flex-col items-center justify-center text-brand-primary/40">
            <AlertCircle size={48} className="mb-4 opacity-20" />
            <p className="italic">Nenhum armamento registrado no sistema.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-brand-primary/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-brutalist w-full max-w-lg bg-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg uppercase tracking-widest">{editingId ? 'Editar Arma' : 'Cadastrar Arma'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Tipo</label>
                  <input 
                    required
                    placeholder="Ex: Pistola, Revólver"
                    className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Marca</label>
                  <input 
                    required
                    className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent"
                    value={formData.brand}
                    onChange={e => setFormData({...formData, brand: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Modelo</label>
                  <input 
                    required
                    className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent"
                    value={formData.model}
                    onChange={e => setFormData({...formData, model: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Nº de Série</label>
                  <input 
                    required
                    className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent"
                    value={formData.serial_number}
                    onChange={e => setFormData({...formData, serial_number: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Calibre</label>
                  <input 
                    required
                    className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent"
                    value={formData.caliber}
                    onChange={e => setFormData({...formData, caliber: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Status</label>
                  <select 
                    className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent bg-white"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                  >
                    <option value="available">Disponível</option>
                    <option value="in_use">Em Uso</option>
                    <option value="maintenance">Manutenção</option>
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
                  {editingId ? 'Atualizar Arma' : 'Salvar Arma'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
