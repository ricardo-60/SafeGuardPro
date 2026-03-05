import React, { useEffect, useState } from 'react';
import {
    History, ShieldCheck, User, Search,
    Filter, ArrowLeftRight, FileCode, AlertCircle, X
} from 'lucide-react';
import { api } from '../../lib/api';
import { AuditLog } from '../../types';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuditDashboard() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    useEffect(() => { loadLogs(); }, []);

    const loadLogs = async () => {
        try {
            const data = await api.getAuditLogs();
            setLogs(data);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(l =>
        l.user_name.toLowerCase().includes(filter.toLowerCase()) ||
        l.entity.toLowerCase().includes(filter.toLowerCase()) ||
        l.action.toLowerCase().includes(filter.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center animate-pulse font-bold">Acedendo à Trilha de Auditoria...</div>;

    return (
        <div className="space-y-8 pb-12">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-brand-primary flex items-center">
                        <ShieldCheck size={28} className="mr-3 text-brand-accent" /> Governação & Logs
                    </h2>
                    <p className="text-[10px] font-bold text-brand-primary/40 uppercase tracking-widest mt-1 italic">
                        Trilha de Auditoria Imutável (Immutable Audit Trail)
                    </p>
                </div>
                <div className="flex items-center bg-white border-2 border-brand-primary px-4 py-2 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                    <Search size={16} className="text-brand-primary opacity-40 mr-2" />
                    <input
                        type="text"
                        placeholder="Filtrar Usuário ou Entidade..."
                        className="outline-none text-xs font-bold uppercase w-64"
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                    />
                </div>
            </div>

            <div className="card-brutalist bg-white p-0 overflow-hidden shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
                <div className="grid grid-cols-6 gap-4 p-4 bg-brand-primary text-brand-bg text-[10px] font-bold uppercase tracking-widest">
                    <div>Data/Hora</div>
                    <div>Usuário</div>
                    <div>Ação</div>
                    <div>Entidade</div>
                    <div className="col-span-2">Detalhes (Payload)</div>
                </div>
                <div className="divide-y divide-brand-primary/10 max-h-[600px] overflow-y-auto">
                    {filteredLogs.map((log) => (
                        <div key={log.id} className="grid grid-cols-6 gap-4 p-4 items-center hover:bg-brand-bg/50 transition-colors text-[11px]">
                            <div className="font-mono opacity-60">
                                {format(new Date(log.timestamp), 'dd/MM HH:mm:ss')}
                            </div>
                            <div className="flex items-center font-bold">
                                <User size={12} className="mr-2 opacity-30" /> {log.user_name}
                            </div>
                            <div>
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full font-black uppercase text-[9px] border",
                                    log.action === 'CREATE' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                        log.action === 'DELETE' ? "bg-rose-50 text-rose-700 border-rose-200" :
                                            "bg-blue-50 text-blue-700 border-blue-200"
                                )}>
                                    {log.action}
                                </span>
                            </div>
                            <div className="uppercase font-black tracking-tighter text-brand-primary/60">
                                {log.entity}
                            </div>
                            <div className="col-span-2 flex items-center space-x-2">
                                <button
                                    className="flex items-center px-3 py-1 bg-brand-bg border border-brand-primary/20 hover:border-brand-primary text-[9px] font-bold uppercase transition-all"
                                    onClick={() => setSelectedLog(log)}
                                >
                                    <FileCode size={12} className="mr-2" /> Ver Detalhes
                                </button>
                                {log.ip_address && (
                                    <span className="text-[8px] opacity-30 font-mono">IP: {log.ip_address}</span>
                                )}
                            </div>
                        </div>
                    ))}
                    {filteredLogs.length === 0 && (
                        <div className="p-12 text-center text-brand-primary/30 italic">Nenhum registo de auditoria encontrado.</div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {selectedLog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white border-4 border-brand-primary shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] w-full max-w-2xl p-6"
                        >
                            <div className="flex justify-between items-center mb-6 border-b-2 border-brand-primary pb-4">
                                <h3 className="text-sm font-black uppercase tracking-widest flex items-center text-brand-primary">
                                    <History size={18} className="mr-2 text-brand-accent" /> Detalhes do Log #{selectedLog.id.slice(0, 8)}
                                </h3>
                                <button onClick={() => setSelectedLog(null)} className="p-1 hover:bg-brand-bg rounded transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="card-brutalist bg-brand-bg/50 p-4 border border-brand-primary/10 overflow-hidden">
                                    <p className="text-[9px] font-black uppercase opacity-40 mb-2 tracking-widest">Payload Anterior (Snapshot)</p>
                                    <pre className="text-[10px] font-mono overflow-auto max-h-48 whitespace-pre-wrap bg-white/50 p-2 border border-brand-primary/5">
                                        {JSON.stringify(selectedLog.payload_before, null, 2) || 'Vazio / Sem dados'}
                                    </pre>
                                </div>
                                <div className="card-brutalist bg-brand-primary/5 p-4 border border-brand-primary/10 overflow-hidden">
                                    <p className="text-[9px] font-black uppercase opacity-40 mb-2 tracking-widest">Payload Novo (Deltas)</p>
                                    <pre className="text-[10px] font-mono overflow-auto max-h-48 whitespace-pre-wrap bg-white p-2 border border-brand-accent/20">
                                        {JSON.stringify(selectedLog.payload_after, null, 2) || 'Sem alterações ou N/A'}
                                    </pre>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={() => setSelectedLog(null)}
                                    className="px-8 py-3 bg-brand-primary text-brand-bg font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(242,125,38,1)] transition-all active:shadow-none active:translate-x-1 active:translate-y-1"
                                >
                                    Fechar Janela
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="flex bg-amber-50 border-2 border-amber-600 p-6 space-x-4">
                <AlertCircle className="text-amber-600 shrink-0" size={24} />
                <div>
                    <h4 className="text-xs font-black uppercase text-amber-900 mb-1">Nota de Segurança de Dados</h4>
                    <p className="text-[10px] leading-relaxed text-amber-800 opacity-80 uppercase font-bold">
                        Logs de auditoria são imutáveis. Qualquer tentativa de alteração direta na base de dados será detetada pelo sistema de verificação de checksums do PostgreSQL. Esta trilha constitui prova legal em conformidade com as leis de proteção de dados e segurança privada angolana.
                    </p>
                </div>
            </div>
        </div>
    );
}
