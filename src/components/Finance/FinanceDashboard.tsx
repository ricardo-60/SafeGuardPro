import React, { useEffect, useState } from 'react';
import { DollarSign, Plus, Search, X, Trash2, TrendingUp, TrendingDown, FileText } from 'lucide-react';
import { api } from '../../lib/api';
import { Transaction } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';

export default function FinanceDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    const data = await api.getTransactions();
    setTransactions(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createTransaction({
      ...formData,
      amount: parseFloat(formData.amount)
    });
    setIsModalOpen(false);
    setFormData({ type: 'income', category: '', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
    loadTransactions();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      await api.deleteTransaction(id);
      loadTransactions();
    }
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="space-y-8">
      {/* Finance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-brutalist bg-white">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-50 rounded">
              <TrendingUp size={24} className="text-emerald-600" />
            </div>
          </div>
          <p className="text-xs font-bold opacity-40 uppercase tracking-widest">Receita Total</p>
          <p className="text-2xl font-bold font-mono text-emerald-600">{totalIncome.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>
        </div>
        <div className="card-brutalist bg-white">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-rose-50 rounded">
              <TrendingDown size={24} className="text-rose-600" />
            </div>
          </div>
          <p className="text-xs font-bold opacity-40 uppercase tracking-widest">Despesa Total</p>
          <p className="text-2xl font-bold font-mono text-rose-600">{totalExpense.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>
        </div>
        <div className="card-brutalist bg-brand-primary text-brand-bg">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-brand-bg/10 rounded">
              <DollarSign size={24} className="text-brand-accent" />
            </div>
          </div>
          <p className="text-xs font-bold opacity-60 uppercase tracking-widest">Saldo Atual</p>
          <p className="text-2xl font-bold font-mono text-brand-accent">{balance.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold uppercase tracking-tighter">Fluxo de Caixa</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-6 py-2 bg-brand-accent text-brand-primary font-bold text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]"
        >
          <Plus size={16} className="mr-2" /> Nova Transação
        </button>
      </div>

      <div className="card-brutalist overflow-hidden p-0">
        <div className="grid grid-cols-6 gap-4 p-4 bg-brand-primary text-brand-bg text-[10px] font-bold uppercase tracking-widest">
          <div>Data</div>
          <div className="col-span-2">Descrição / Categoria</div>
          <div>Tipo</div>
          <div className="text-right">Valor</div>
          <div className="text-right">Ações</div>
        </div>
        <div className="divide-y divide-brand-primary/10">
          {transactions.map((t) => (
            <div key={t.id} className="grid grid-cols-6 gap-4 p-4 items-center hover:bg-brand-bg/50 transition-colors">
              <div className="text-xs font-mono">
                {format(new Date(t.date), "dd/MM/yyyy", { locale: ptBR })}
              </div>
              <div className="col-span-2">
                <p className="font-bold text-sm">{t.description}</p>
                <p className="text-[10px] font-bold uppercase opacity-40">{t.category}</p>
              </div>
              <div>
                <span className={cn(
                  "px-2 py-1 text-[10px] font-bold uppercase rounded",
                  t.type === 'income' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                )}>
                  {t.type === 'income' ? 'Entrada' : 'Saída'}
                </span>
              </div>
              <div className={cn(
                "text-right font-mono font-bold",
                t.type === 'income' ? "text-emerald-600" : "text-rose-600"
              )}>
                {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString('pt-AO')}
              </div>
              <div className="text-right">
                <button 
                  onClick={() => handleDelete(t.id)}
                  className="p-1 hover:bg-rose-100 text-rose-600 rounded transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="p-12 text-center text-brand-primary/40 italic">
              Nenhuma transação registrada.
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-brand-primary/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-brutalist w-full max-w-lg bg-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg uppercase tracking-widest">Nova Transação</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Tipo</label>
                  <select 
                    className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent bg-white"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                  >
                    <option value="income">Entrada (Receita)</option>
                    <option value="expense">Saída (Despesa)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Categoria</label>
                  <input 
                    required
                    placeholder="Ex: Mensalidade, Salários, Combustível"
                    className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Valor (Kz)</label>
                  <input 
                    type="number"
                    required
                    step="0.01"
                    className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Data</label>
                  <input 
                    type="date"
                    required
                    className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1">Descrição</label>
                <input 
                  required
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
                  Salvar Transação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
