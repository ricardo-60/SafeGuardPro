import React, { useEffect, useState } from 'react';
import { Package, Plus, Search, X, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { Equipment } from '../../types';
import { cn } from '../../lib/utils';

export default function EquipmentList() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    serial_number: '',
    status: 'available' as 'available' | 'in_use' | 'maintenance' | 'lost'
  });

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    const data = await api.getEquipment();
    setEquipment(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await api.updateEquipment(editingId, formData);
    } else {
      await api.createEquipment(formData);
    }
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', serial_number: '', status: 'available' });
    loadEquipment();
  };

  const handleEdit = (item: Equipment) => {
    setFormData({
      name: item.name,
      serial_number: item.serial_number,
      status: item.status
    });
    setEditingId(item.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este equipamento?')) {
      await api.deleteEquipment(id);
      loadEquipment();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary/40" size={18} />
          <input 
            type="text" 
            placeholder="Buscar equipamento..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-brand-primary/10"
          />
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', serial_number: '', status: 'available' });
            setIsModalOpen(true);
          }}
          className="flex items-center px-6 py-2 bg-brand-accent text-brand-primary font-bold text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]"
        >
          <Plus size={16} className="mr-2" /> Novo Equipamento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipment.map((item) => (
          <div key={item.id} className="card-brutalist bg-white group relative">
            <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleEdit(item)}
                className="p-2 bg-brand-bg hover:bg-brand-primary hover:text-brand-bg rounded transition-colors"
              >
                <Edit2 size={14} />
              </button>
              <button 
                onClick={() => handleDelete(item.id)}
                className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-3 bg-brand-bg rounded">
                <Package size={24} className="text-brand-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg uppercase tracking-tight">{item.name}</h3>
                <p className="text-xs font-mono text-brand-primary/50 mb-4">{item.serial_number}</p>
                <span className={cn(
                  "px-2 py-1 text-[10px] font-bold uppercase rounded",
                  item.status === 'available' ? "bg-emerald-100 text-emerald-700" :
                  item.status === 'in_use' ? "bg-blue-100 text-blue-700" :
                  item.status === 'maintenance' ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                )}>
                  {item.status === 'available' ? 'Disponível' : 
                   item.status === 'in_use' ? 'Em Uso' : 
                   item.status === 'maintenance' ? 'Manutenção' : 'Extraviado'}
                </span>
              </div>
            </div>
          </div>
        ))}

        {equipment.length === 0 && (
          <div className="col-span-full p-12 card-brutalist bg-white/50 border-dashed flex flex-col items-center justify-center text-brand-primary/40">
            <AlertCircle size={48} className="mb-4 opacity-20" />
            <p className="italic">Nenhum equipamento cadastrado.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-brand-primary/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-brutalist w-full max-w-lg bg-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg uppercase tracking-widest">{editingId ? 'Editar Equipamento' : 'Novo Equipamento'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1">Nome do Equipamento</label>
                <input 
                  required
                  placeholder="Ex: Rádio Comunicador, Colete Balístico"
                  className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1">Nº de Série / Patrimônio</label>
                <input 
                  required
                  className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent"
                  value={formData.serial_number}
                  onChange={e => setFormData({...formData, serial_number: e.target.value})}
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
                  <option value="lost">Extraviado</option>
                </select>
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
                  {editingId ? 'Atualizar Equipamento' : 'Salvar Equipamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
