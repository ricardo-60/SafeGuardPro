import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, MoreVertical, Download, X, AlertTriangle, FileText, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/api';
import { Vigilante } from '../../types';
import { cn } from '../../lib/utils';

export default function VigilanteList() {
  const [vigilantes, setVigilantes] = useState<Vigilante[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    bi_number: '',
    contact: '',
    status: 'active' as 'active' | 'suspended' | 'dismissed',
    doc_police_expiry: '',
    doc_psych_expiry: '',
    doc_criminal_expiry: ''
  });

  useEffect(() => {
    loadVigilantes();
  }, []);

  const loadVigilantes = async () => {
    const data = await api.getVigilantes();
    setVigilantes(data);
  };

  const isExpiringSoon = (dateStr?: string) => {
    if (!dateStr) return false;
    const expiry = new Date(dateStr);
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    return expiry <= thirtyDaysFromNow;
  };

  const handleEdit = (v: Vigilante) => {
    setFormData({
      name: v.name,
      bi_number: v.bi_number,
      contact: v.contact,
      status: v.status,
      doc_police_expiry: v.doc_police_expiry || '',
      doc_psych_expiry: v.doc_psych_expiry || '',
      doc_criminal_expiry: v.doc_criminal_expiry || ''
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
    if (editingId) {
      await api.updateVigilante(editingId, formData);
    } else {
      await api.createVigilante(formData);
    }

    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      name: '',
      bi_number: '',
      contact: '',
      status: 'active',
      doc_police_expiry: '',
      doc_psych_expiry: '',
      doc_criminal_expiry: ''
    });
    loadVigilantes();
  };

  const openNewModal = () => {
    setFormData({
      name: '',
      bi_number: '',
      contact: '',
      status: 'active',
      doc_police_expiry: '',
      doc_psych_expiry: '',
      doc_criminal_expiry: ''
    });
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
          <button className="flex items-center px-4 py-2 bg-white border border-brand-primary/10 font-bold text-xs uppercase tracking-widest">
            <Filter size={16} className="mr-2" /> Filtrar
          </button>
          <button className="flex items-center px-4 py-2 bg-white border border-brand-primary/10 font-bold text-xs uppercase tracking-widest">
            <Download size={16} className="mr-2" /> Exportar
          </button>
          <button
            onClick={openNewModal}
            className="flex items-center px-6 py-2 bg-brand-accent text-brand-primary font-bold text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]"
          >
            <Plus size={16} className="mr-2" /> Novo Vigilante
          </button>
        </div>
      </div>

      <div className="card-brutalist overflow-hidden p-0">
        <div className="grid grid-cols-6 gap-4 p-4 bg-brand-primary text-brand-bg text-[10px] font-bold uppercase tracking-widest">
          <div className="col-span-2">Nome Completo</div>
          <div>Nº BI</div>
          <div>Conformidade</div>
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
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">{v.name}</span>
                  <span className="text-[10px] opacity-40 uppercase font-black">{v.contact}</span>
                </div>
              </div>
              <div className="font-mono text-xs">{v.bi_number}</div>
              <div className="col-span-1 flex flex-col space-y-1">
                {isExpiringSoon(v.doc_police_expiry) ? (
                  <span className="flex items-center text-[7px] font-black bg-rose-100 text-rose-700 px-1 py-0.5 border border-rose-300 uppercase animate-pulse">
                    <AlertTriangle size={8} className="mr-1" /> Cartão PN Vencido/Prox
                  </span>
                ) : v.doc_police_expiry ? (
                  <span className="flex items-center text-[7px] font-black bg-emerald-100 text-emerald-700 px-1 py-0.5 border border-emerald-300 uppercase">
                    <ShieldCheck size={8} className="mr-1" /> OK
                  </span>
                ) : null}
                {isExpiringSoon(v.doc_psych_expiry) && (
                  <span className="flex items-center text-[7px] font-black bg-amber-100 text-amber-700 px-1 py-0.5 border border-amber-300 uppercase">
                    <AlertTriangle size={8} className="mr-1" /> Psicofísico
                  </span>
                )}
              </div>
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-brand-primary/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-brutalist w-full max-w-lg bg-white p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg uppercase tracking-widest text-brand-primary">{editingId ? 'Editar Dossier' : 'Novo Vigilante'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Nome Completo</label>
                  <input
                    required
                    className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Nº BI / Identificação</label>
                  <input
                    required
                    className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent font-mono"
                    value={formData.bi_number}
                    onChange={e => setFormData({ ...formData, bi_number: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Contacto</label>
                  <input
                    required
                    className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent"
                    value={formData.contact}
                    onChange={e => setFormData({ ...formData, contact: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Status Operacional</label>
                  <select
                    className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent bg-white"
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="active">Ativo</option>
                    <option value="suspended">Suspenso</option>
                    <option value="dismissed">Demitido</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-brand-primary/10">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-primary mb-4 flex items-center">
                  <FileText size={12} className="mr-2" /> Dossier Digital (Conformidade Legal)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[8px] font-bold uppercase mb-1">Validade Cartão PN</label>
                    <input
                      type="date"
                      className={cn(
                        "w-full p-2 border text-xs outline-none",
                        isExpiringSoon(formData.doc_police_expiry) ? "border-rose-500 bg-rose-50" : "border-brand-primary/20"
                      )}
                      value={formData.doc_police_expiry}
                      onChange={e => setFormData({ ...formData, doc_police_expiry: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold uppercase mb-1">Exame Psicofísico</label>
                    <input
                      type="date"
                      className={cn(
                        "w-full p-2 border text-xs outline-none",
                        isExpiringSoon(formData.doc_psych_expiry) ? "border-amber-500 bg-amber-50" : "border-brand-primary/20"
                      )}
                      value={formData.doc_psych_expiry}
                      onChange={e => setFormData({ ...formData, doc_psych_expiry: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold uppercase mb-1">Registo Criminal</label>
                    <input
                      type="date"
                      className="w-full p-2 border border-brand-primary/20 text-xs outline-none"
                      value={formData.doc_criminal_expiry}
                      onChange={e => setFormData({ ...formData, doc_criminal_expiry: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end space-x-4">
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
                  {editingId ? 'Atualizar Dossier' : 'Criar Vigilante'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
