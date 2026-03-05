import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import {
    LayoutDashboard, TrendingUp, AlertTriangle, Users,
    MapPin, DollarSign, Download, Calendar, Truck, Shield
} from 'lucide-react';
import { api } from '../../lib/api';
import { reportHelpers } from '../../lib/reportHelpers';
import { format } from 'date-fns';

const COLORS = ['#F27D26', '#141414', '#10B981', '#EF4444'];

export default function ExecutiveDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await api.getDashboardStats();
            setStats(data);
        } finally {
            setLoading(false);
        }
    };

    const exportGeneralReport = async () => {
        if (!stats) return;
        const headers = [['Métrica', 'Valor', 'Status']];
        const data = [
            ['Total Vigilantes', stats.totalVigilantes, 'OK'],
            ['Documentos Vencidos', stats.expiredDocuments, stats.expiredDocuments > 0 ? 'CRÍTICO' : 'OK'],
            ['Alertas Geofencing (24h)', stats.offRadiusAlerts, stats.offRadiusAlerts > 5 ? 'AVISO' : 'OK'],
            ['Escalas Ativas', stats.activeScales, 'NORMAL'],
            ['Total Payroll (AOA)', stats.totalPayrollAOA.toLocaleString() + ' Kz', 'CONTABILIZADO'],
            ['Frota Resumo', `${stats.activeVehicles || 0} Ativas`, 'INFO'],
            ['Ativos Táticos', `${stats.availableAssets || 0} Disponíveis`, 'KARDEX']
        ];
        await reportHelpers.generatePDF('Relatório de Saúde Operacional', headers, data, 'SafeGuard_Exec_Status');
    };

    if (loading) return <div className="p-8 text-center animate-pulse font-bold">Carregando BI...</div>;

    const chartData = [
        { name: 'Vencidos', value: stats.expiredDocuments },
        { name: 'Em Dia', value: stats.totalVigilantes - stats.expiredDocuments }
    ];

    const financialData = [
        { name: 'Jan', val: 1200000 },
        { name: 'Fev', val: 1500000 },
        { name: 'Mar', val: stats.totalPayrollAOA }
    ];

    return (
        <div className="space-y-8 pb-12">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-brand-primary flex items-center">
                        <LayoutDashboard size={32} className="mr-3 text-brand-accent" /> Dashboard Executivo
                    </h2>
                    <p className="text-[10px] font-bold text-brand-primary/40 uppercase tracking-[0.2em] mt-1">
                        Business Intelligence & Operações de Risco
                    </p>
                </div>
                <button
                    onClick={exportGeneralReport}
                    className="flex items-center px-6 py-3 bg-brand-primary text-brand-bg font-bold text-xs uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(242,125,38,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                >
                    <Download size={16} className="mr-2" /> PDF Consolidado
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KPIItem
                    title="Pessoal"
                    value={stats.totalVigilantes}
                    icon={<Users size={20} />}
                    color="bg-white border-brand-primary"
                />
                <KPIItem
                    title="Risco Doc."
                    value={stats.expiredDocuments}
                    icon={<AlertTriangle size={20} />}
                    color={stats.expiredDocuments > 0 ? "bg-rose-50 border-rose-600 text-rose-600" : "bg-white border-brand-primary"}
                />
                <KPIItem
                    title="Falhas GPS"
                    value={stats.offRadiusAlerts}
                    icon={<MapPin size={20} />}
                    color={stats.offRadiusAlerts > 0 ? "bg-amber-50 border-amber-600 text-amber-600" : "bg-white border-brand-primary"}
                />
                <KPIItem
                    title="Investimento Mensal"
                    value={`${(stats.totalPayrollAOA / 1e6).toFixed(1)}M`}
                    icon={<DollarSign size={20} />}
                    color="bg-brand-primary text-brand-bg border-brand-primary"
                    subtitle="AOA (Kwanza)"
                />
            </div>

            {/* Logistics Intelligence Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card-brutalist bg-white border-brand-primary p-6 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase opacity-40">Consumo Médio (Estimado)</p>
                        <p className="text-2xl font-black">1.420 <span className="text-xs">AOA/KM</span></p>
                    </div>
                    <Truck className="text-brand-accent" size={32} />
                </div>
                <div className="card-brutalist bg-white border-brand-primary p-6 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase opacity-40">Disponibilidade de Ativos</p>
                        <div className="flex items-end space-x-2">
                            <p className="text-2xl font-black">92%</p>
                            <p className="text-[9px] font-bold text-emerald-600 mb-1 tracking-widest uppercase">Operacional</p>
                        </div>
                    </div>
                    <Shield className="text-brand-primary" size={32} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Document Compliance Chart */}
                <div className="card-brutalist bg-white">
                    <h3 className="text-xs font-black uppercase mb-6 tracking-widest border-b-2 border-brand-primary pb-2 flex items-center">
                        <Calendar size={14} className="mr-2" /> Conformidade Documental
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#EF4444' : '#10B981'} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#141414', border: 'none', color: '#fff', borderRadius: '4px' }}
                                />
                                <Legend iconType="rect" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Financial Trend */}
                <div className="card-brutalist bg-white">
                    <h3 className="text-xs font-black uppercase mb-6 tracking-widest border-b-2 border-brand-primary pb-2 flex items-center">
                        <TrendingUp size={14} className="mr-2" /> Evolução de Custos (Payroll)
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={financialData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={10} fontStyle="bold" />
                                <YAxis fontSize={10} />
                                <Tooltip
                                    cursor={{ fill: '#F27D26', opacity: 0.1 }}
                                    contentStyle={{ backgroundColor: '#141414', border: 'none', color: '#fff' }}
                                />
                                <Bar dataKey="val" fill="#141414" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="card-brutalist bg-brand-primary text-brand-bg p-8">
                <h4 className="text-xl font-bold uppercase mb-4 text-brand-accent italic">Nota do Product Owner</h4>
                <p className="text-sm opacity-80 leading-relaxed max-w-3xl">
                    Este dashboard consolida a inteligência operacional do SafeGuard Pro. Os alertas de geofencing (GPS) e a conformidade documental são os pilares da segurança humana em Angola. Utilize o relatório PDF para auditorias externas e o CSV de Payroll para integração direta com a gestão financeira.
                </p>
            </div>
        </div>
    );
}

function KPIItem({ title, value, icon, color, subtitle }: any) {
    return (
        <div className={`card-brutalist ${color} p-6 flex flex-col justify-between`}>
            <div className="flex justify-between items-start">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{title}</p>
                <div className="opacity-40">{icon}</div>
            </div>
            <div className="mt-4">
                <p className="text-4xl font-black tracking-tighter">{value}</p>
                {subtitle && <p className="text-[9px] font-bold uppercase mt-1 opacity-50">{subtitle}</p>}
            </div>
        </div>
    );
}
