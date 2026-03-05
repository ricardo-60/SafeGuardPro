import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Base64 Placeholder para o logótipo (Pode ser substituído por um real da empresa)
const LOGO_BASE64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHJ4PSI4IiBmaWxsPSIjRjI3RDI2Ii8+PHBhdGggZD0iTTEwIDEwaDIwdjIwaC0yMHoiIGZpbGw9IndoaXRlIi8+PC9zdmc+';

export const reportHelpers = {
    generatePDF: async (title: string, headers: string[][], data: any[][], fileName: string) => {
        const doc = new jsPDF();
        const dateStr = format(new Date(), "dd/MM/yyyy HH:mm");

        // Header com Branding
        doc.setFillColor(20, 20, 20); // Brand primary
        doc.rect(0, 0, 210, 40, 'F');

        // Título
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('SafeGuard Pro', 15, 20);

        doc.setFontSize(10);
        doc.setTextColor(242, 125, 38); // Brand accent
        doc.text('RELATÓRIO EXECUTIVO OFICIAL', 15, 30);

        // Corpo do Relatório
        doc.setTextColor(20, 20, 20);
        doc.setFontSize(16);
        doc.text(title.toUpperCase(), 15, 55);

        doc.setFontSize(10);
        doc.text(`Gerado em: ${dateStr}`, 15, 62);

        (doc as any).autoTable({
            startY: 70,
            head: headers,
            body: data,
            theme: 'grid',
            headStyles: { fillColor: [20, 20, 20], textColor: [255, 255, 255], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            styles: { fontSize: 9, cellPadding: 3 },
        });

        // Marca D'água / Rodapé
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(
                'Documento confidencial gerado pelo sistema SafeGuard Pro © 2026 - Angola',
                105,
                doc.internal.pageSize.height - 10,
                { align: 'center' }
            );
            doc.text(`Página ${i} de ${pageCount}`, 190, doc.internal.pageSize.height - 10);

            // Assinatura Digital Simbólica
            doc.setDrawColor(20, 20, 20);
            doc.line(140, doc.internal.pageSize.height - 30, 190, doc.internal.pageSize.height - 30);
            doc.text('Assinatura do Responsável', 165, doc.internal.pageSize.height - 25, { align: 'center' });
        }

        doc.save(`${fileName}_${format(new Date(), 'yyyyMMdd')}.pdf`);
    },

    generateCSV: (data: any[], fileName: string) => {
        if (data.length === 0) return;

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const value = row[header];
                return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `${fileName}_${format(new Date(), 'yyyyMMdd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
