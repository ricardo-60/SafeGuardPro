import React, { useEffect, useState } from 'react';
import { MapPin, Plus, Search, Users, X, Edit2, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import { Post } from '../../types';

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    client_name: '',
    address: '',
    vigilantes_needed: '1'
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const data = await api.getPosts();
    setPosts(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      vigilantes_needed: parseInt(formData.vigilantes_needed)
    };
    
    if (editingId) {
      await api.updatePost(editingId, data);
    } else {
      await api.createPost(data);
    }
    
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', client_name: '', address: '', vigilantes_needed: '1' });
    loadPosts();
  };

  const handleEdit = (p: Post) => {
    setFormData({
      name: p.name,
      client_name: p.client_name,
      address: p.address,
      vigilantes_needed: p.vigilantes_needed.toString()
    });
    setEditingId(p.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este posto?')) {
      await api.deletePost(id);
      loadPosts();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary/40" size={18} />
          <input 
            type="text" 
            placeholder="Buscar posto..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-brand-primary/10"
          />
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', client_name: '', address: '', vigilantes_needed: '1' });
            setIsModalOpen(true);
          }}
          className="flex items-center px-6 py-2 bg-brand-accent text-brand-primary font-bold text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]"
        >
          <Plus size={16} className="mr-2" /> Novo Posto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((p) => (
          <div key={p.id} className="card-brutalist bg-white group relative">
            <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleEdit(p)}
                className="p-2 bg-brand-bg hover:bg-brand-primary hover:text-brand-bg rounded transition-colors"
              >
                <Edit2 size={14} />
              </button>
              <button 
                onClick={() => handleDelete(p.id)}
                className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-3 bg-brand-primary text-brand-bg rounded">
                <MapPin size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg uppercase tracking-tight">{p.name}</h3>
                <p className="text-xs font-bold text-brand-accent uppercase tracking-widest mb-4">{p.client_name}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-brand-primary/60">
                    <MapPin size={16} className="mr-2 shrink-0" />
                    {p.address}
                  </div>
                  <div className="flex items-center text-sm text-brand-primary/60">
                    <Users size={16} className="mr-2 shrink-0" />
                    {p.vigilantes_needed} Vigilantes alocados
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-brand-primary/5 flex justify-between items-center">
              <button className="text-[10px] font-bold uppercase tracking-widest hover:text-brand-accent transition-colors">
                Ver Escala do Posto
              </button>
              <button className="text-[10px] font-bold uppercase tracking-widest hover:text-brand-accent transition-colors">
                Livro de Ocorrências
              </button>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="col-span-full p-12 card-brutalist bg-white/50 border-dashed flex flex-col items-center justify-center text-brand-primary/40">
            <MapPin size={48} className="mb-4 opacity-20" />
            <p className="italic">Nenhum posto de serviço cadastrado.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-brand-primary/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-brutalist w-full max-w-lg bg-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg uppercase tracking-widest">{editingId ? 'Editar Posto' : 'Novo Posto'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1">Nome do Posto</label>
                <input 
                  required
                  className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1">Cliente</label>
                <input 
                  required
                  className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent"
                  value={formData.client_name}
                  onChange={e => setFormData({...formData, client_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1">Endereço</label>
                <input 
                  required
                  className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1">Vigilantes Necessários</label>
                <input 
                  type="number"
                  required
                  min="1"
                  className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent"
                  value={formData.vigilantes_needed}
                  onChange={e => setFormData({...formData, vigilantes_needed: e.target.value})}
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
                  {editingId ? 'Atualizar Posto' : 'Salvar Posto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
