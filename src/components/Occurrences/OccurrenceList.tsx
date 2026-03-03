import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock, MapPin, User, FileText, X } from 'lucide-react';
import { api } from '../../lib/api';
import { Occurrence, Post, Vigilante } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function OccurrenceList() {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [vigilantes, setVigilantes] = useState<Vigilante[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    post_id: '',
    vigilante_id: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [occData, postData, vigData] = await Promise.all([
      api.getOccurrences(),
      api.getPosts(),
      api.getVigilantes()
    ]);
    setOccurrences(occData);
    setPosts(postData);
    setVigilantes(vigData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createOccurrence({
      type: formData.type,
      post_id: parseInt(formData.post_id),
      vigilante_id: parseInt(formData.vigilante_id),
      description: formData.description
    });
    setIsModalOpen(false);
    setFormData({ type: '', post_id: '', vigilante_id: '', description: '' });
    loadData();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold uppercase tracking-tighter">Livro de Ocorrências Digital</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-2 bg-brand-primary text-brand-bg font-bold text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(242,125,38,1)]"
        >
          Registrar Nova Ocorrência
        </button>
      </div>

      <div className="space-y-6">
        {occurrences.map((occ) => (
          <div key={occ.id} className="card-brutalist bg-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-brand-accent" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-brand-bg rounded">
                  <AlertTriangle size={20} className="text-brand-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-lg uppercase tracking-tight">{occ.type}</h3>
                  <div className="flex items-center text-xs text-brand-primary/50 font-medium mt-1">
                    <Clock size={14} className="mr-1" />
                    {format(new Date(occ.date_time), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-brand-primary text-brand-bg text-[10px] font-bold uppercase tracking-widest">
                  ID #{occ.id.toString().padStart(4, '0')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-brand-bg/30 rounded">
              <div className="flex items-start space-x-3">
                <MapPin size={18} className="text-brand-primary/40 mt-1" />
                <div>
                  <p className="text-[10px] font-bold uppercase opacity-40">Posto / Local</p>
                  <p className="text-sm font-semibold">{occ.post_name}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <User size={18} className="text-brand-primary/40 mt-1" />
                <div>
                  <p className="text-[10px] font-bold uppercase opacity-40">Vigilante Responsável</p>
                  <p className="text-sm font-semibold">{occ.vigilante_name}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-[10px] font-bold uppercase opacity-40">
                <FileText size={14} className="mr-1" /> Descrição dos Fatos
              </div>
              <p className="text-sm leading-relaxed text-brand-primary/80">
                {occ.description}
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-brand-primary/5 flex justify-between items-center">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white bg-brand-bg" />
                <div className="w-8 h-8 rounded-full border-2 border-white bg-brand-bg" />
              </div>
              <button className="text-[10px] font-bold uppercase tracking-widest hover:text-brand-accent transition-colors">
                Ver Relatório Completo →
              </button>
            </div>
          </div>
        ))}

        {occurrences.length === 0 && (
          <div className="text-center py-20 card-brutalist bg-white/50 border-dashed">
            <p className="text-brand-primary/40 italic">Nenhuma ocorrência registrada nas últimas 24 horas.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-brand-primary/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-brutalist w-full max-w-lg bg-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg uppercase tracking-widest">Registrar Ocorrência</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1">Tipo de Ocorrência</label>
                <input 
                  required
                  placeholder="Ex: Assalto, Intrusão, Falha de Equipamento"
                  className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Posto</label>
                  <select 
                    required
                    className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent bg-white"
                    value={formData.post_id}
                    onChange={e => setFormData({...formData, post_id: e.target.value})}
                  >
                    <option value="">Selecionar Posto</option>
                    {posts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Vigilante</label>
                  <select 
                    required
                    className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent bg-white"
                    value={formData.vigilante_id}
                    onChange={e => setFormData({...formData, vigilante_id: e.target.value})}
                  >
                    <option value="">Selecionar Vigilante</option>
                    {vigilantes.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1">Descrição dos Fatos</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
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
                  Salvar Ocorrência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
