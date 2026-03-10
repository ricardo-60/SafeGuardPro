import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  const [stats, setStats] = useState<any>({
    vigilantes: 0,
    weapons: 0,
    posts: 0,
    occurrences: 0,
    monthly_income: 0,
    monthly_expense: 0,
    alerts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Use getDashboardStats instead of getStats for more detailed data
      const data = await api.getDashboardStats();
      setStats(data);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Vigilantes Ativos', value: stats.totalVigilantes || 0, icon: Users, trend: '+2.5%', isUp: true },
    { title: 'Postos Operacionais', value: stats.activeScales || stats.totalPosts || 0, icon: MapPin, trend: '+4.0%', isUp: true },
    { title: 'Conformidade Doc.', value: stats.totalVigilantes ? Math.round(((stats.totalVigilantes - stats.expiredDocuments) / stats.totalVigilantes) * 100) + '%' : '100%', icon: Shield, trend: '-1.2%', isUp: false },
    { title: 'Alertas GPS (24h)', value: stats.offRadiusAlerts || 0, icon: AlertTriangle, trend: '+12%', isUp: false },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-sm font-bold uppercase tracking-widest animate-pulse">Sincronizando Inteligência...</div>
      </div>
    );
  }

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
            {stats.alerts && stats.alerts.length > 0 ? (
              stats.alerts.map((alert: any, i: number) => (
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
              ))
            ) : (
              <div className="p-8 text-center bg-zinc-50 border border-zinc-100 italic text-zinc-400 text-sm">
                Nenhum alerta de conformidade ativo. Sistema estável.
              </div>
            )}
          </div>
        </div>

        <div className="card-brutalist bg-brand-primary text-brand-bg">
          <h3 className="font-bold text-sm uppercase tracking-widest mb-6 text-brand-accent">Resumo Financeiro (Mês)</h3>
          <div className="space-y-6">
            <div>
              <p className="text-xs opacity-60 uppercase font-bold mb-1">Folha de Faturamento</p>
              <p className="text-2xl font-bold font-mono">{(stats.totalPayrollAOA || 0).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>
            </div>
            <div className="h-px bg-brand-bg/10" />
            <div>
              <p className="text-xs opacity-60 uppercase font-bold mb-1">Disponibilidade de Frota</p>
              <p className="text-2xl font-bold font-mono">{stats.activeVehicles || 0} Viaturas</p>
            </div>
            <Link
              to="/dashboard/executivo"
              className="w-full py-3 bg-brand-accent text-brand-primary font-bold text-center block uppercase text-xs tracking-widest hover:bg-white transition-colors"
            >
              Ver Detalhes BI
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
