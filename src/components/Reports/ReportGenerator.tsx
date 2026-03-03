import React, { useState } from 'react';
import { FileText, Download, PieChart, BarChart, Calendar, Filter } from 'lucide-react';
import { api } from '../../lib/api';
import { PDFBuilder } from '../../lib/pdf';
import { useAuth } from '../../contexts/AuthContext';

export default function ReportGenerator() {
  const { company } = useAuth();
  const [reportType, setReportType] = useState('general');
  const [dateRange, setDateRange] = useState('month');
  const [format, setFormat] = useState('pdf');
  const [isGenerating, setIsGenerating] = useState(false);

  const reports = [
    { id: 'general', name: 'Relatório Geral de Operações', icon: PieChart, description: 'Resumo de todas as atividades, ocorrências e presença.' },
    { id: 'hr', name: 'Relatório de RH e Efetivo', icon: FileText, description: 'Dados sobre vigilantes, faltas, admissões e escalas.' },
    { id: 'finance', name: 'Relatório Financeiro', icon: BarChart, description: 'Fluxo de caixa, faturamento por posto e despesas operacionais.' },
    { id: 'inventory', name: 'Inventário de Armas e Equipamentos', icon: Filter, description: 'Status atual de todo o patrimônio da empresa.' },
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      let data: any[] = [];
      const dLabel = new Date().toISOString().split('T')[0];
      const filename = `safeguard_relatorio_${reportType}_${dLabel}`;
      const reportName = reports.find(r => r.id === reportType)?.name || 'Relatório';

      switch (reportType) {
        case 'general':
          data = await api.getOccurrences();
          break;
        case 'hr':
          data = await api.getVigilantes();
          break;
        case 'finance':
          data = await api.getTransactions();
          break;
        case 'inventory':
          const weapons = await api.getWeapons();
          const equipment = await api.getEquipment();
          const vehicles = await api.getVehicles();
          data = [
            ...weapons.map(w => ({ ...w, category_label: 'Arma' })),
            ...equipment.map(e => ({ ...e, category_label: 'Equipamento' })),
            ...vehicles.map(v => ({ ...v, category_label: 'Viatura' }))
          ];
          break;
      }

      if (data.length === 0) {
        alert("Não existem registos para este relatório no banco de dados.");
        setIsGenerating(false);
        return;
      }

      if (format === 'excel') {
        // CSV gen
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(obj => Object.values(obj).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\\n');
        const csvContent = `${headers}\\n${rows}`;

        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel formatting
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.csv`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

      } else {
        // PDF Gen
        await PDFBuilder.generateTableReport({
          title: reportName,
          columns: Object.keys(data[0]),
          data: data.map(row => Object.values(row).map(val => val === null || val === undefined ? '-' : String(val))),
          companyName: company?.name,
          logoUrl: company?.logo_url,
          watermarkUrl: company?.watermark_url
        });
      }
    } catch (error) {
      console.error(error);
      alert("Falha de Comunicação ao tentar gerar o relatório.");
    }
    setIsGenerating(false);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-xl font-bold uppercase tracking-tighter">Gerador de Relatórios</h2>
          <div className="grid grid-cols-1 gap-4">
            {reports.map((r) => (
              <button
                key={r.id}
                onClick={() => setReportType(r.id)}
                className={`flex items-start p-4 card-brutalist transition-all text-left ${reportType === r.id ? 'bg-brand-primary text-brand-bg' : 'bg-white hover:bg-brand-bg'
                  }`}
              >
                <div className={`p-2 rounded mr-4 ${reportType === r.id ? 'bg-brand-bg/10' : 'bg-brand-bg'}`}>
                  <r.icon size={24} />
                </div>
                <div>
                  <p className="font-bold uppercase tracking-tight">{r.name}</p>
                  <p className={`text-xs mt-1 ${reportType === r.id ? 'opacity-60' : 'opacity-40'}`}>{r.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="card-brutalist bg-white space-y-6">
          <h3 className="font-bold uppercase tracking-widest text-sm">Configurações do Relatório</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">Período</label>
              <div className="grid grid-cols-3 gap-2">
                {['week', 'month', 'year'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setDateRange(p)}
                    className={`py-2 text-[10px] font-bold uppercase border border-brand-primary/10 transition-all ${dateRange === p ? 'bg-brand-primary text-brand-bg' : 'hover:bg-brand-bg'
                      }`}
                  >
                    {p === 'week' ? 'Semana' : p === 'month' ? 'Mês' : 'Ano'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1">Data Inicial</label>
                <input type="date" className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1">Data Final</label>
                <input type="date" className="w-full p-2 border border-brand-primary/20 outline-none focus:border-brand-accent" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">Formato de Saída</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="format" checked={format === 'pdf'} onChange={() => setFormat('pdf')} className="accent-brand-primary" />
                  <span className="text-xs font-bold uppercase">PDF (Impressão)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="format" checked={format === 'excel'} onChange={() => setFormat('excel')} className="accent-brand-primary" />
                  <span className="text-xs font-bold uppercase">Excel (CSV)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-brand-primary/5">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full flex items-center justify-center py-4 text-brand-primary font-bold uppercase tracking-[0.2em] transition-all shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] ${isGenerating ? 'bg-gray-300 cursor-not-allowed shadow-[0px_0px_0px_0px_rgba(20,20,20,1)] translate-x-[6px] translate-y-[6px]' : 'bg-brand-accent hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]'
                }`}
            >
              <Download size={20} className={`mr-3 ${isGenerating ? 'animate-bounce' : ''}`} />
              {isGenerating ? 'A PROCESSAR...' : 'Gerar Relatório'}
            </button>
          </div>
        </div>
      </div>

      <div className="card-brutalist bg-brand-bg/30 border-dashed p-8 text-center">
        <Calendar size={48} className="mx-auto mb-4 opacity-20" />
        <h4 className="font-bold uppercase tracking-widest text-sm mb-2">Histórico de Relatórios</h4>
        <p className="text-xs opacity-40 italic">Nenhum relatório gerado recentemente.</p>
      </div>
    </div>
  );
}
