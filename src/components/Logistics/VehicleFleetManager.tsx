import React, { useState, useEffect } from 'react';
import {
    Truck, Fuel, Gauge, Calendar, AlertCircle, FileText,
    Plus, History, ClipboardCheck, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { api } from '../../lib/api';
import { auditService } from '../../lib/auditService';
import { useAuth } from '../../contexts/AuthContext';
import { Vehicle, VehicleMission, Vigilante } from '../../types';
import { cn } from '../../lib/utils';
import { reportHelpers } from '../../lib/reportHelpers';
import { format } from 'date-fns';

export default function VehicleFleetManager() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [missions, setMissions] = useState<VehicleMission[]>([]);
    const [vigilantes, setVigilantes] = useState<Vigilante[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
    const { user: currentUser } = useAuth();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [v, m, vig] = await Promise.all([
            api.getVehicles(),
            api.getVehicleMissions(),
            api.getVigilantes()
        ]);
        setVehicles(v);
        setMissions(m);
        setVigilantes(vig);
    };

    const generateGuiaMarcha = async (mission: VehicleMission) => {
        const vehicle = vehicles.find(v => v.id === mission.vehicle_id);
        const vigilante = vigilantes.find(v => v.id === mission.vigilante_id);

        const headers = [['Item', 'Detalhe']];
        const data = [
            ['Viatura', `${vehicle?.model} (${vehicle?.plate})`],
            ['Vigilante/Condutor', vigilante?.name || 'N/A'],
            ['KM Inicial', mission.start_km.toString()],
            ['Combustível Inicial', `${mission.start_fuel}%`],
            ['Destino', mission.destination || 'Em serviço'],
            ['Data de Emissão', format(new Date(mission.start_time), 'dd/MM/yyyy HH:mm')]
        ];

        await reportHelpers.generatePDF('Guia de Marcha Oficinal', headers, data, `Guia_Marcha_${vehicle?.plate}`);

        if (currentUser) {
            auditService.log(currentUser.id, currentUser.email || 'Admin', 'EXPORT', 'GuiaMarcha', vehicle?.plate, null, mission);
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-brand-primary flex items-center">
                        <Truck size={28} className="mr-3 text-brand-accent" /> Gestão de Frota
                    </h2>
                    <p className="text-[10px] font-bold text-brand-primary/40 uppercase tracking-widest mt-1 italic">
                        Logbook de Missões & Manutenção Preventiva
                    </p>
                </div>
                <button className="flex items-center px-6 py-2 bg-brand-primary text-brand-bg font-bold text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(242,125,38,1)] transition-all active:shadow-none active:translate-x-1 active:translate-y-1">
                    <Plus size={16} className="mr-2" /> Nova Viatura
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Fleet List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {vehicles.map((v) => {
                            const needsService = v.next_service_km ? (v.next_service_km - v.current_km < 500) : false;
                            return (
                                <div
                                    key={v.id}
                                    onClick={() => setSelectedVehicle(v)}
                                    className={cn(
                                        "card-brutalist cursor-pointer transition-all hover:border-brand-accent group",
                                        selectedVehicle?.id === v.id ? "bg-brand-bg border-brand-accent shadow-[4px_4px_0px_0px_rgba(242,125,38,1)]" : "bg-white"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="px-3 py-1 bg-brand-primary text-brand-bg text-[10px] font-bold rounded">
                                            {v.plate}
                                        </div>
                                        {needsService && (
                                            <div className="flex items-center text-rose-600 animate-pulse">
                                                <AlertCircle size={14} className="mr-1" />
                                                <span className="text-[9px] font-bold uppercase">Revisão Próxima</span>
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-black text-lg uppercase tracking-tight mb-1">{v.model}</h3>
                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div className="flex items-center space-x-2">
                                            <Gauge size={14} className="text-brand-primary opacity-40" />
                                            <div>
                                                <p className="text-[8px] font-black uppercase opacity-60">KM Atual</p>
                                                <p className="text-xs font-bold">{v.current_km.toLocaleString()} km</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Fuel size={14} className={cn(v.fuel_level < 25 ? "text-rose-500" : "text-emerald-500")} />
                                            <div>
                                                <p className="text-[8px] font-black uppercase opacity-60">Fuel</p>
                                                <p className="text-xs font-bold">{v.fuel_level}%</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Mission History */}
                    <div className="card-brutalist bg-white p-0 overflow-hidden mt-8">
                        <div className="p-4 bg-brand-primary text-brand-bg flex justify-between items-center">
                            <h3 className="text-xs font-black uppercase tracking-widest flex items-center">
                                <History size={16} className="mr-2" /> Histórico de Missões
                            </h3>
                        </div>
                        <div className="divide-y divide-brand-primary/10">
                            {missions.length === 0 ? (
                                <div className="p-12 text-center text-brand-primary/30 italic text-sm">Sem registos de missão no sistema.</div>
                            ) : (
                                missions.map((m, idx) => (
                                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-brand-bg/50 transition-colors">
                                        <div className="flex items-center space-x-4">
                                            <div className={cn(
                                                "p-2 rounded",
                                                m.end_time ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600 animate-pulse"
                                            )}>
                                                {m.end_time ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{vehicles.find(v => v.id === m.vehicle_id)?.plate}</p>
                                                <p className="text-[9px] font-bold text-brand-primary/40 uppercase italic">
                                                    {vigilantes.find(v => v.id === m.vigilante_id)?.name} • {format(new Date(m.start_time), 'dd/MM HH:mm')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => generateGuiaMarcha(m)}
                                                className="p-2 hover:bg-brand-primary text-brand-primary hover:text-brand-bg transition-all rounded border border-brand-primary/10"
                                            >
                                                <FileText size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Status */}
                <div className="space-y-6">
                    <div className="card-brutalist bg-brand-primary text-brand-bg">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 text-brand-accent">⚠️ Próximos Vencimentos</h3>
                        <div className="space-y-4">
                            {vehicles.map(v => (
                                <div key={v.id} className="border-l-2 border-white/20 pl-4 py-2">
                                    <p className="text-[10px] font-black opacity-60 uppercase">{v.plate} - {v.model}</p>
                                    <div className="flex justify-between mt-2">
                                        <span className="text-[9px] font-bold">Seguro: {v.insurance_expiry}</span>
                                        <span className="text-[9px] font-bold text-emerald-400">Taxa: {v.tax_expiry}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card-brutalist bg-white">
                        <h3 className="text-xs font-black uppercase mb-4 tracking-widest border-b-2 border-brand-primary pb-2 flex items-center">
                            <ClipboardCheck size={14} className="mr-2" /> Checkout Rápido
                        </h3>
                        <p className="text-[10px] leading-relaxed text-brand-primary/60 mb-6">
                            O logbook eletrónico garante que a quilometragem e o combustível são auditados em cada troca de turno.
                        </p>
                        <button className="w-full py-3 bg-brand-accent text-brand-primary font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all">
                            Registrar Saída (Check-out)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
