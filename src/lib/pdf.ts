import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface ReportConfig {
    title: string;
    columns: string[];
    data: any[][];
    companyName?: string;
    logoUrl?: string;
    watermarkUrl?: string;
}

export class PDFBuilder {
    static async generateTableReport({ title, columns, data, companyName, logoUrl, watermarkUrl }: ReportConfig) {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        let startY = 20;

        // Add Logo if exists
        if (logoUrl) {
            try {
                const logoImg = await this.loadImage(logoUrl);
                doc.addImage(logoImg, 'PNG', 14, 10, 40, 20, undefined, 'FAST');
                startY = 40;
            } catch (e) {
                console.warn('Could not load logo for PDF', e);
            }
        }

        // Title & Company Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        doc.text(title, 14, startY);

        if (companyName) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            doc.text(companyName, 14, startY + 6);
        }

        // Date
        const dateStr = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
        doc.setFontSize(10);
        doc.text(`Gerado em: ${dateStr}`, pageWidth - 14, startY, { align: 'right' });

        let wmImg: HTMLImageElement | null = null;
        if (watermarkUrl) {
            try {
                wmImg = await this.loadImage(watermarkUrl);
            } catch (e) {
                console.warn('Could not load watermark for PDF', e);
            }
        }

        // Render Table
        autoTable(doc, {
            startY: startY + 15,
            head: [columns],
            body: data,
            theme: 'grid',
            styles: {
                font: 'helvetica',
                fontSize: 10,
                cellPadding: 4,
                textColor: [60, 60, 60],
                lineColor: [220, 220, 220],
                lineWidth: 0.1,
            },
            headStyles: {
                fillColor: [16, 185, 129], // Emerald-500
                textColor: [255, 255, 255],
                fontStyle: 'bold',
            },
            alternateRowStyles: {
                fillColor: [250, 250, 250],
            },
            margin: { top: 15, right: 14, bottom: 20, left: 14 },
            didDrawPage: (dataArg) => {
                // Watermark and Footer on every page
                if (wmImg) {
                    try {
                        doc.setGState(new (doc as any).GState({ opacity: 0.1 }));
                        // Center the watermark
                        doc.addImage(wmImg, 'PNG', (pageWidth - 100) / 2, (pageHeight - 100) / 2, 100, 100, undefined, 'FAST');
                        doc.setGState(new (doc as any).GState({ opacity: 1.0 }));
                    } catch (e) { }
                }

                // Footer Pagination
                const str = 'Página ' + doc.getCurrentPageInfo().pageNumber;
                doc.setFontSize(10);
                doc.setTextColor(150, 150, 150);
                doc.text(str, pageWidth / 2, pageHeight - 10, { align: 'center' });
            }
        });

        // Output
        doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}.pdf`);
    }

    // Helper to load image from URL to Base64 for jsPDF
    private static loadImage(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => resolve(img);
            img.onerror = (e) => reject(e);
            img.src = url;
        });
    }
}
