import React, { useState, useEffect } from 'react';
import {
    Shield, Radio, Package, ScanLine,
    AlertTriangle, CheckSquare, Search, Camera,
    UserCheck, Signature
} from 'lucide-react';
import { api } from '../../lib/api';
import { auditService } from '../../lib/auditService';
import { useAuth } from '../../contexts/AuthContext';
import { TacticalAsset, Vigilante } from '../../types';
import { cn } from '../../lib/utils';
import { reportHelpers } from '../../lib/reportHelpers';
import { format } from 'date-fns';

export default function TacticalKardex() {
    const [assets, setAssets] = useState<TacticalAsset[]>([]);
    const [vigilantes, setVigilantes] = useState<Vigilante[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAsset, setSelectedAsset] = useState<TacticalAsset | null>(null);
    const { user: currentUser } = useAuth();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [a, v] = await Promise.all([
            api.getTacticalAssets(),
            api.getVigilantes()
        ]);
        setAssets(a);
        setVigilantes(v);
    };

    const generateTermoResponsabilidade = async (asset: TacticalAsset) => {
        const headers = [['Campo', 'Informação']];
        const data = [
            ['Equipamento', asset.name],
            ['Tipo', asset.type.toUpperCase()],
            ['Nº de Série', asset.serial_number],
            ['Status na Entrega', 'Totalmente Operacional'],
            ['Data de Atribuição', format(new Date(), 'dd/MM/yyyy HH:mm')],
            ['Responsável (Vigilante)', 'Assinatura Digital no App']
        ];

        await reportHelpers.generatePDF('Termo de Responsabilidade de Ativo Tático', headers, data, `Termo_${asset.serial_number}`);

        if (currentUser) {
            auditService.log(currentUser.id, currentUser.email || 'Admin', 'EXPORT', 'TermoResponsabilidade', asset.serial_number, null, asset);
        }
    };

    const filteredAssets = assets.filter(a =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.serial_number.toLowerCase().includes(searchTerm.toLowerCase())
);

return (
    <div className="space-y-8 pb-12">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-brand-primary flex items-center">
                    <ScanLine size={28} className="mr-3 text-brand-accent" /> Kardex de Ativos Táticos
                </h2>
                <p className="text-[10px] font-bold text-brand-primary/40 uppercase tracking-widest mt-1 italic">
                    Controle de Armamento, Rádios e Equipamento de Intervenção
                </p>
            </div>
            <div className="flex items-center bg-white border-2 border-brand-primary px-4 py-2 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                <Search size={16} className="text-brand-primary opacity-40 mr-2" />
                <input
                    type="text"
                    placeholder="Pesquisar por Série..."
                    className="outline-none text-xs font-bold uppercase w-48"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {['arma', 'radio', 'colete', 'outro'].map(type => (
                <div key={type} className="card-brutalist bg-white border-brand-primary flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-black uppercase opacity-40">{type}</p>
                        <p className="text-2xl font-black">{assets.filter(a => a.type === type).length}</p>
                    </div>
                    <div className="p-3 bg-brand-bg rounded">
                        {type === 'arma' ? <Shield size={20} /> : type === 'radio' ? <Radio size={20} /> : <Package size={20} />}
                    </div>
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 card-brutalist bg-white p-0 overflow-hidden">
                <div className="p-4 bg-brand-primary text-brand-bg text-[10px] font-bold uppercase tracking-widest grid grid-cols-5 gap-4">
                    <div className="col-span-2">Equipamento / Série</div>
                    <div>Tipo</div>
                    <div>Status</div>
                    <div className="text-right">Ações</div>
                </div>
                <div className="divide-y divide-brand-primary/10">
                    {filteredAssets.map((a) => (
                        <div key={a.id} className="p-4 grid grid-cols-5 gap-4 items-center hover:bg-brand-bg transition-colors">
                            <div className="col-span-2">
                                <p className="font-bold text-sm tracking-tight">{a.name}</p>
                                <p className="text-[9px] font-black text-brand-accent uppercase">{a.serial_number}</p>
                            </div>
                            <div className="text-[10px] font-black uppercase opacity-60">{a.type}</div>
                            <div>
                                <span className={cn(
                                    "px-2 py-0.5 text-[8px] font-black uppercase rounded border",
                                    a.status === 'available' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                        a.status === 'in_use' ? "bg-blue-50 text-blue-700 border-blue-200" :
                                            "bg-rose-50 text-rose-700 border-rose-200"
                                )}>
                                    {a.status}
                                </span>
                            </div>
                            <div className="text-right flex justify-end space-x-2">
                                <button
                                    onClick={() => generateTermoResponsabilidade(a)}
                                    className="p-2 hover:bg-brand-primary/10 rounded border border-transparent hover:border-brand-primary/20 transition-all"
                                >
                                    <UserCheck size={14} />
                                </button>
                                <button className="p-2 hover:bg-rose-50 hover:text-rose-600 rounded border border-transparent transition-all">
                                    <AlertTriangle size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                <div className="card-brutalist bg-brand-primary text-brand-bg">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-brand-accent italic flex items-center">
                        <Signature size={16} className="mr-2" /> Entrega de Turno Digital
                    </h3>
                    <p className="text-xs opacity-80 leading-relaxed mb-6">
                        A assinatura digital confirma que o vigilante inspecionou o ativo tático e aceitou a responsabilidade civil e criminal sobre o mesmo durante a missão.
                    </p>
                    <div className="h-32 bg-white/10 border-2 border-white/20 rounded flex items-center justify-center border-dashed">
                        <p className="text-[10px] uppercase font-bold text-white/40">Painel de Assinatura (Touch)</p>
                    </div>
                    <button className="w-full mt-4 py-3 bg-brand-accent text-brand-primary font-black uppercase text-xs shadow-none border-2 border-brand-accent hover:bg-transparent hover:text-brand-accent transition-all">
                        Confirmar Recebimento
                    </button>
                </div>

                <div className="card-brutalist bg-rose-50 border-rose-600">
                    <h3 className="text-xs font-black uppercase mb-4 tracking-widest text-rose-800 flex items-center">
                        <Camera size={14} className="mr-2" /> Reportar Dano/Avaria
                    </h3>
                    <textarea
                        className="w-full h-20 bg-white border border-rose-200 p-2 text-xs outline-none focus:border-rose-500 mb-3"
                        placeholder="Descreva a avaria detetada no equipamento..."
                    ></textarea>
                    <button className="w-full py-2 bg-rose-600 text-white font-bold uppercase text-[10px] tracking-widest shadow-[3px_3px_0px_0px_rgba(20,20,20,1)] active:shadow-none transition-all">
                        Enviar Relatório Fotográfico
                    </button>
                </div>
            </div>
        </div>
    </div>
);
}
