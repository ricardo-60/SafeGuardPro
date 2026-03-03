import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, User as UserIcon, Shield, Mail, Calendar, Trash2, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { api } from '../../lib/api';
import { User } from '../../types';

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await api.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.createUser(formData);
            setIsModalOpen(false);
            setFormData({ name: '', email: '', password: '', role: 'user' });
            loadUsers();
        } catch (error) {
            console.error('Error creating user:', error);
            alert('Erro ao criar utilizador.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number | string) => {
        if (confirm('Tem certeza que deseja remover este utilizador?')) {
            try {
                await api.deleteUser(id);
                loadUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-brand-primary">Gestão de Utilizadores</h2>
                    <p className="text-brand-primary/60 mt-1">Gerencie os acessos ao sistema</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-brand-accent hover:bg-brand-accent/90 text-brand-primary font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                    <Plus size={20} />
                    Novo Utilizador
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-brand-primary/10 overflow-hidden">
                <div className="p-4 border-b border-brand-primary/10">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary/40" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar utilizador por nome ou e-mail..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-brand-bg rounded-lg border-none focus:ring-2 focus:ring-brand-accent/50 outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-brand-bg/50">
                            <tr>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-brand-primary/60 uppercase tracking-wider">
                                    Utilizador
                                </th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-brand-primary/60 uppercase tracking-wider">
                                    Nível de Acesso
                                </th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-brand-primary/60 uppercase tracking-wider">
                                    Data de Criação
                                </th>
                                <th className="text-right py-3 px-4 text-xs font-semibold text-brand-primary/60 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-primary/10">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-brand-primary/40 mx-auto" />
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-brand-primary/40">
                                        Nenhum utilizador encontrado
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-brand-bg/30 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-semibold">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-brand-primary">{user.name}</p>
                                                    <p className="text-sm text-brand-primary/60 flex items-center gap-1">
                                                        <Mail size={12} />
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'bg-emerald-100 text-emerald-700'
                                                }`}>
                                                {user.role === 'admin' ? <Shield size={12} /> : <UserIcon size={12} />}
                                                {user.role === 'admin' ? 'Administrador' : 'Operador'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2 text-sm text-brand-primary/70">
                                                <Calendar size={14} />
                                                {user.created_at ? format(new Date(user.created_at), "dd 'de' MMM, yyyy", { locale: ptBR }) : '-'}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Remover"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-4 border-b border-brand-primary/10 flex justify-between items-center bg-brand-bg">
                                <h3 className="text-lg font-semibold text-brand-primary text-center w-full">Novo Utilizador</h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-1 hover:bg-brand-primary/10 rounded-lg transition-colors relative right-2"
                                >
                                    <X size={20} className="text-brand-primary/60" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-brand-primary/80 mb-1">Nome Completo</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 bg-brand-bg border border-brand-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-brand-primary/80 mb-1">E-mail</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 bg-brand-bg border border-brand-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-brand-primary/80 mb-1">Senha</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-3 py-2 bg-brand-bg border border-brand-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-brand-primary/80 mb-1">Nível de Acesso</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-3 py-2 bg-brand-bg border border-brand-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                                    >
                                        <option value="user">Operador</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-4 py-2 border border-brand-primary/10 text-brand-primary font-medium rounded-lg hover:bg-brand-bg transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 px-4 py-2 bg-brand-primary text-brand-accent font-medium rounded-lg hover:bg-brand-primary/90 transition-colors flex items-center justify-center"
                                    >
                                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Criar Conta'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
}
