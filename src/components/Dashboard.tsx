import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Shield, 
  MapPin, 
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts';
import { api } from '../lib/api';

import { cn } from '../lib/utils';

const data = [
  { name: 'Seg', ocorrencias: 4, presenca: 95 },
  { name: 'Ter', ocorrencias: 3, presenca: 98 },
  { name: 'Qua', ocorrencias: 7, presenca: 92 },
  { name: 'Qui', ocorrencias: 2, presenca: 96 },
  { name: 'Sex', ocorrencias: 5, presenca: 94 },
  { name: 'Sab', ocorrencias: 8, presenca: 88 },
  { name: 'Dom', ocorrencias: 6, presenca: 90 },
];

const COLORS = ['#141414', '#F27D26', '#E4E3E0', '#8E9299'];

export default function Dashboard() {
  const [stats, setStats] = useState({ 
    vigilantes: 0, 
    weapons: 0, 
    posts: 0, 
    occurrences: 0,
    monthly_income: 0,
    monthly_expense: 0
  });

  useEffect(() => {
    api.getStats().then(setStats);
  }, []);

  const statCards = [
    { title: 'Vigilantes Ativos', value: stats.vigilantes, icon: Users, trend: '+2.5%', isUp: true },
    { title: 'Armas em Uso', value: stats.weapons, icon: Shield, trend: '-1.2%', isUp: false },
    { title: 'Postos Operacionais', value: stats.posts, icon: MapPin, trend: '+4.0%', isUp: true },
    { title: 'Ocorrências (Mês)', value: stats.occurrences, icon: AlertTriangle, trend: '+12%', isUp: false },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="card-brutalist group hover:bg-brand-primary hover:text-brand-bg transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-brand-bg group-hover:bg-brand-bg/10 rounded">
                <stat.icon size={24} className="text-brand-primary group-hover:text-brand-bg" />
              </div>
              <div className={`flex items-center text-xs font-bold ${stat.isUp ? 'text-emerald-600' : 'text-rose-600'} group-hover:text-brand-bg`}>
                {stat.trend}
                {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              </div>
            </div>
            <p className="text-sm font-medium opacity-60 uppercase tracking-wider">{stat.title}</p>
            <p className="text-3xl font-bold mt-1 font-mono tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-brutalist">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-sm uppercase tracking-widest flex items-center">
              <TrendingUp size={18} className="mr-2 text-brand-accent" />
              Ocorrências por Dia
            </h3>
            <select className="text-xs font-bold bg-brand-bg border-none px-3 py-1 rounded">
              <option>Últimos 7 dias</option>
              <option>Último mês</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E3E0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(242, 125, 38, 0.1)' }}
                  contentStyle={{ border: '1px solid #141414', borderRadius: '0px' }}
                />
                <Bar dataKey="ocorrencias" fill="#141414" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 5 ? '#F27D26' : '#141414'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-brutalist">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-sm uppercase tracking-widest flex items-center">
              <Users size={18} className="mr-2 text-brand-accent" />
              Taxa de Presença (%)
            </h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-brand-accent rounded-full" />
              <span className="text-xs font-bold uppercase">Meta: 95%</span>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E3E0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600 }}
                  domain={[80, 100]}
                />
                <Tooltip 
                  contentStyle={{ border: '1px solid #141414', borderRadius: '0px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="presenca" 
                  stroke="#F27D26" 
                  strokeWidth={3} 
                  dot={{ r: 6, fill: '#F27D26', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity / Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card-brutalist">
          <h3 className="font-bold text-sm uppercase tracking-widest mb-6">Alertas de Conformidade</h3>
          <div className="space-y-4">
            {[
              { msg: 'Licença de Arma (AK-47 #992) expira em 5 dias', type: 'warning' },
              { msg: 'Vigilante João Silva: Certificado de Formação vencido', type: 'error' },
              { msg: 'Manutenção preventiva da Viatura LD-22-44 pendente', type: 'info' },
            ].map((alert, i) => (
              <div key={i} className={cn(
                "p-4 border-l-4 flex items-center justify-between",
                alert.type === 'warning' ? "bg-amber-50 border-amber-500 text-amber-800" :
                alert.type === 'error' ? "bg-rose-50 border-rose-500 text-rose-800" :
                "bg-blue-50 border-blue-500 text-blue-800"
              )}>
                <div className="flex items-center">
                  <AlertTriangle size={18} className="mr-3" />
                  <span className="text-sm font-medium">{alert.msg}</span>
                </div>
                <button className="text-xs font-bold uppercase hover:underline">Resolver</button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="card-brutalist bg-brand-primary text-brand-bg">
          <h3 className="font-bold text-sm uppercase tracking-widest mb-6 text-brand-accent">Resumo Financeiro (Mês)</h3>
          <div className="space-y-6">
            <div>
              <p className="text-xs opacity-60 uppercase font-bold mb-1">Receita Mensal</p>
              <p className="text-2xl font-bold font-mono">{stats.monthly_income.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>
            </div>
            <div className="h-px bg-brand-bg/10" />
            <div>
              <p className="text-xs opacity-60 uppercase font-bold mb-1">Despesa Mensal</p>
              <p className="text-2xl font-bold font-mono">{stats.monthly_expense.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>
            </div>
            <button className="w-full py-3 bg-brand-accent text-brand-primary font-bold uppercase text-xs tracking-widest hover:bg-white transition-colors">
              Ver Fluxo de Caixa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
