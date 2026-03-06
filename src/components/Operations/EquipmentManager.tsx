import React, { useEffect, useState } from 'react';
import { Package, User, Calendar, CheckCircle, Clock, Shield, Signature, Plus, Search, X } from 'lucide-react';
import { api } from '../../lib/api';
import { EquipmentAssignment, Vigilante, Equipment } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { QRScanner } from '../Common/QRScanner';


export default function EquipmentManager() {
    const [assignments, setAssignments] = useState<EquipmentAssignment[]>([]);
    const [vigilantes, setVigilantes] = useState<Vigilante[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        vigilante_id: '',
        equipment_type: 'uniforme' as EquipmentAssignment['equipment_type'],
        equipment_id: '',
        status: 'assigned' as EquipmentAssignment['status']
    });
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [assignData, vigData] = await Promise.all([
            api.getEquipmentAssignments(),
            api.getVigilantes()
        ]);
        setAssignments(assignData);
        setVigilantes(vigData);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            vigilante_id: parseInt(formData.vigilante_id),
            equipment_type: formData.equipment_type,
            equipment_id: formData.equipment_id,
            assigned_at: new Date().toISOString(),
            status: formData.status,
            digital_signature: `SIGNED_BY_${formData.vigilante_id}_${Date.now()}` // Mock signature
        };

        await api.createEquipmentAssignment(data);
        setIsModalOpen(false);
        setFormData({ vigilante_id: '', equipment_type: 'uniforme', equipment_id: '', status: 'assigned' });
        loadData();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="font-black text-xl uppercase tracking-tighter text-brand-primary flex items-center">
                    <Package size={24} className="mr-2 text-brand-accent" /> Inventário & Fardamento
                </h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-6 py-2 bg-brand-primary text-brand-bg font-bold text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(242,125,38,1)]"
                >
                    <Plus size={16} className="mr-2" /> Atribuir Equipamento
                </button>
            </div>

            <div className="card-brutalist overflow-hidden p-0">
                <div className="grid grid-cols-5 gap-4 p-4 bg-brand-primary text-brand-bg text-[10px] font-bold uppercase tracking-widest">
                    <div className="col-span-2">Vigilante / Equipamento</div>
                    <div>Data Atribuição</div>
                    <div>Status</div>
                    <div className="text-right">Assinatura</div>
                </div>
                <div className="divide-y divide-brand-primary/10">
                    {assignments.map((a) => (
                        <div key={a.id} className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-brand-bg/50 transition-colors">
                            <div className="col-span-2 flex items-center">
                                <div className="w-10 h-10 border-2 border-brand-primary/20 flex items-center justify-center mr-4 bg-white">
                                    {a.equipment_type === 'arma' ? <Shield size={20} className="text-rose-600" /> :
                                        a.equipment_type === 'radio' ? <Clock size={20} className="text-blue-600" /> :
                                            <Package size={20} className="text-brand-primary/40" />}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm tracking-tight">{a.vigilante_name}</span>
                                    <span className="text-[10px] font-black uppercase text-brand-accent italic">
                                        {a.equipment_type}: {a.equipment_id}
                                    </span>
                                </div>
                            </div>
                            <div className="text-xs font-mono">
                                {format(new Date(a.assigned_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </div>
                            <div>
                                <span className={cn(
                                    "px-2 py-0.5 text-[8px] font-black uppercase border-2",
                                    a.status === 'assigned' ? "border-blue-600 text-blue-600" :
                                        a.status === 'returned' ? "border-emerald-600 text-emerald-600" : "border-rose-600 text-rose-600"
                                )}>
                                    {a.status === 'assigned' ? 'Em Uso' : a.status === 'returned' ? 'Devolvido' : 'Extraviado'}
                                </span>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center justify-end text-[8px] font-bold text-emerald-600 opacity-60">
                                    <Signature size={12} className="mr-1" /> DIGITAL_OK
                                </div>
                            </div>
                        </div>
                    ))}
                    {assignments.length === 0 && (
                        <div className="p-12 text-center text-brand-primary/40 italic">
                            Nenhum equipamento atribuído recentemente.
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-brand-primary/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="card-brutalist w-full max-w-lg bg-white p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-bold text-lg uppercase tracking-widest text-brand-primary">Nova Atribuição</h2>
                            <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase mb-1">Vigilante Responsável</label>
                                <select
                                    required
                                    className="w-full p-3 border-2 border-brand-primary outline-none focus:border-brand-accent bg-white text-sm"
                                    value={formData.vigilante_id}
                                    onChange={e => setFormData({ ...formData, vigilante_id: e.target.value })}
                                >
                                    <option value="">Selecionar Vigilante</option>
                                    {vigilantes.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase mb-1">Categoria</label>
                                    <select
                                        className="w-full p-3 border-2 border-brand-primary outline-none focus:border-brand-accent bg-white text-sm"
                                        value={formData.equipment_type}
                                        onChange={e => setFormData({ ...formData, equipment_type: e.target.value as any })}
                                    >
                                        <option value="uniforme">Uniforme Completo</option>
                                        <option value="arma">Armamento (AK-47/Pistol)</option>
                                        <option value="radio">Rádio Transmissor</option>
                                        <option value="colete">Colete Balístico</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase mb-1">ID / Nº de Série</label>
                                    <div className="flex gap-2">
                                        <input
                                            required
                                            placeholder="Ex: SN-99202"
                                            className="flex-1 p-3 border-2 border-brand-primary outline-none focus:border-brand-accent text-sm"
                                            value={formData.equipment_id}
                                            onChange={e => setFormData({ ...formData, equipment_id: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setIsScannerOpen(true)}
                                            className="p-3 bg-brand-primary text-brand-bg hover:bg-brand-accent transition-colors"
                                            title="Scan QR Code"
                                        >
                                            <Search size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {isScannerOpen && (
                                <QRScanner
                                    onScanSuccess={(code) => {
                                        setFormData({ ...formData, equipment_id: code });
                                        setIsScannerOpen(false);
                                    }}
                                    onClose={() => setIsScannerOpen(false)}
                                />
                            )}

                            <div className="bg-brand-bg p-4 border-2 border-brand-primary border-dashed">
                                <p className="text-[10px] font-bold uppercase mb-2 text-brand-primary/60">Termo de Responsabilidade</p>
                                <p className="text-[9px] leading-tight mb-4">
                                    Confirmo que recebi o equipamento acima em perfeitas condições e comprometo-me a zelar pelo mesmo,
                                    sob pena de sanções disciplinares e patrimoniais conforme a lei angolana.
                                </p>
                                <div className="h-20 bg-white border border-brand-primary/20 flex items-center justify-center cursor-crosshair group">
                                    <span className="text-[8px] font-black text-brand-primary/20 group-hover:hidden italic">Assine Digitalmente Aqui (Mock)</span>
                                    <div className="hidden group-hover:block font-signature text-2xl text-brand-primary"> Ricardo Silva </div>
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
                                    className="px-8 py-3 bg-brand-primary text-brand-bg font-bold text-xs uppercase tracking-widest hover:bg-brand-accent hover:text-brand-primary transition-all shadow-[6px_6px_0px_0px_#F27D26]"
                                >
                                    Confirmar Entrega
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
