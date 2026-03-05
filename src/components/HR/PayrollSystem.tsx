import React, { useEffect, useState } from 'react';
import { Landmark, Users, Clock, FileCheck, Download, Printer, AlertCircle, DollarSign, Calculator } from 'lucide-react';
import { api } from '../../lib/api';
import { PayrollReport, Vigilante, Attendance, Scale } from '../../types';
import { format, startOfMonth, endOfMonth, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { reportHelpers } from '../../lib/reportHelpers';

export default function PayrollSystem() {
    const [reports, setReports] = useState<PayrollReport[]>([]);
    const [vigilantes, setVigilantes] = useState<Vigilante[]>([]);
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        loadData();
    }, [selectedMonth]);

    const loadData = async () => {
        const [vigData, payrollData] = await Promise.all([
            api.getVigilantes(),
            api.getPayrollReports(selectedMonth)
        ]);
        setVigilantes(vigData);
        setReports(payrollData);
    };

    const calculatePayroll = async () => {
        setIsGenerating(true);
        try {
            const start = startOfMonth(new Date(selectedMonth));
            const end = endOfMonth(new Date(selectedMonth));

            for (const v of vigilantes) {
                const baseSalary = 75000;
                const totalHours = 192;
                const overtime = Math.random() > 0.5 ? 12 : 0;

                const report = {
                    vigilante_id: v.id,
                    month: selectedMonth,
                    total_hours: totalHours,
                    overtime_hours: overtime,
                    base_salary: baseSalary,
                    bonus: overtime * 1200,
                    deductions: 5000,
                    net_salary: (baseSalary + (overtime * 1200)) - 5000,
                    status: 'draft' as const
                };

                await api.createPayrollReport(report);
            }
            await loadData();
        } finally {
            setIsGenerating(false);
        }
    };

    const exportCSV = () => {
        const csvData = reports.map(r => ({
            Vigilante: vigilantes.find(v => v.id === r.vigilante_id)?.name || r.vigilante_id,
            Mes: r.month,
            Horas_Base: r.total_hours,
            Horas_Extra: r.overtime_hours,
            Vencimento_Base_AOA: r.base_salary,
            Bonus_AOA: r.bonus,
            Deducoes_AOA: r.deductions,
            Liquido_AOA: r.net_salary,
            Status: r.status
        }));
        reportHelpers.generateCSV(csvData, `Payroll_SafeGuard_${selectedMonth}`);
    };

    const exportPDF = async (report: PayrollReport) => {
        const headers = [['Item', 'Quantidade/Tipo', 'Valor (Kwanza)']];
        const data = [
            ['Vigilante', vigname(report.vigilante_id), '-'],
            ['Mês de Referência', report.month, '-'],
            ['Horas Base', `${report.total_hours}h`, report.base_salary.toLocaleString()],
            ['Horas Extra', `${report.overtime_hours}h`, report.bonus.toLocaleString()],
            ['Deduções Oficiais', 'IMT/Seg.Social', `-${report.deductions.toLocaleString()}`],
            ['Total Líquido', 'Transferência', report.net_salary.toLocaleString()]
        ];
        await reportHelpers.generatePDF(`Recibo de Vencimento - ${vigname(report.vigilante_id)}`, headers, data, `Recibo_${vigname(report.vigilante_id)}`);
    };

    function vigname(id: number) {
        return vigilantes.find(v => v.id === id)?.name || `Vigilante #${id}`;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="font-black text-2xl uppercase tracking-tighter text-brand-primary flex items-center">
                        <Landmark size={28} className="mr-3 text-brand-accent" /> Processamento de Salários
                    </h2>
                    <p className="text-xs font-bold text-brand-primary/40 uppercase tracking-widest mt-1">
                        Gestão Financeira & Folha de Horas (AOA)
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <input
                        type="month"
                        className="p-2 border-2 border-brand-primary text-sm font-bold uppercase outline-none focus:border-brand-accent"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    />
                    <button
                        onClick={exportCSV}
                        className="flex items-center px-6 py-2 bg-white border-2 border-brand-primary text-brand-primary font-bold text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:bg-zinc-50 transition-all"
                    >
                        <Download size={16} className="mr-2" /> Exportar CSV
                    </button>
                    <button
                        onClick={calculatePayroll}
                        disabled={isGenerating}
                        className={cn(
                            "flex items-center px-6 py-2 bg-brand-primary text-brand-bg font-bold text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(242,125,38,1)] transition-all",
                            isGenerating && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isGenerating ? <Clock className="animate-spin mr-2" size={16} /> : <Calculator size={16} className="mr-2" />}
                        Gerar Folha
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-brutalist bg-emerald-50 border-emerald-600">
                    <p className="text-[10px] font-black uppercase text-emerald-800 opacity-60">Total Bruto Estimado</p>
                    <p className="text-2xl font-black text-emerald-900 mt-1">
                        {reports.reduce((acc, r) => acc + (r.base_salary + r.bonus), 0).toLocaleString()} <span className="text-xs">AOA</span>
                    </p>
                </div>
                <div className="card-brutalist bg-brand-bg border-brand-primary">
                    <p className="text-[10px] font-black uppercase text-brand-primary opacity-60">Horas Extra Totais</p>
                    <p className="text-2xl font-black text-brand-primary mt-1">
                        {reports.reduce((acc, r) => acc + r.overtime_hours, 0)} <span className="text-xs">HRS</span>
                    </p>
                </div>
                <div className="card-brutalist bg-rose-50 border-rose-600">
                    <p className="text-[10px] font-black uppercase text-rose-800 opacity-60">Deduções Fiscais</p>
                    <p className="text-2xl font-black text-rose-900 mt-1">
                        {reports.reduce((acc, r) => acc + r.deductions, 0).toLocaleString()} <span className="text-xs">AOA</span>
                    </p>
                </div>
            </div>

            <div className="card-brutalist overflow-hidden p-0 bg-white">
                <div className="grid grid-cols-6 gap-4 p-4 bg-brand-primary text-brand-bg text-[10px] font-bold uppercase tracking-widest">
                    <div className="col-span-2">Vigilante</div>
                    <div>Horas (Base/Extra)</div>
                    <div>Vencimento Base</div>
                    <div>Líquido a Receber</div>
                    <div className="text-right">Ações</div>
                </div>
                <div className="divide-y divide-brand-primary/10">
                    {reports.map((r, idx) => (
                        <div key={idx} className="grid grid-cols-6 gap-4 p-4 items-center hover:bg-brand-bg/50 transition-colors">
                            <div className="col-span-2 flex items-center">
                                <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center mr-3">
                                    <Users size={14} className="text-brand-primary" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm tracking-tight">{vigname(r.vigilante_id)}</p>
                                    <p className="text-[9px] font-black text-brand-accent uppercase italic">Status: {r.status}</p>
                                </div>
                            </div>
                            <div className="text-xs font-mono">
                                {r.total_hours}h <span className="text-brand-accent font-bold">+{r.overtime_hours}h</span>
                            </div>
                            <div className="text-xs font-bold">
                                {r.base_salary.toLocaleString()} AOA
                            </div>
                            <div className="text-sm font-black text-emerald-700">
                                {r.net_salary.toLocaleString()} AOA
                            </div>
                            <div className="text-right flex justify-end space-x-2">
                                <button
                                    onClick={() => exportPDF(r)}
                                    className="p-2 hover:bg-brand-primary/10 rounded border border-transparent hover:border-brand-primary/20 transition-all"
                                >
                                    <Printer size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {reports.length === 0 && (
                        <div className="p-16 text-center">
                            <AlertCircle size={40} className="mx-auto text-brand-primary/10 mb-4" />
                            <p className="text-brand-primary/40 italic text-sm">Nenhum relatório gerado para este mês.</p>
                            <button
                                onClick={calculatePayroll}
                                className="mt-4 text-[10px] font-black uppercase text-brand-accent hover:underline"
                            >
                                Gerar folha agora (Simulação)
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
