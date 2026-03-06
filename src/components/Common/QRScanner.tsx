import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X } from 'lucide-react';

interface QRScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, onClose }) => {
    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        );

        scanner.render(
            (decodedText) => {
                onScanSuccess(decodedText);
                scanner.clear();
            },
            (errorMessage) => {
                // parse error, ignore it.
            }
        );

        return () => {
            scanner.clear().catch(error => console.error("Failed to clear scanner", error));
        };
    }, [onScanSuccess]);

    return (
        <div className="fixed inset-0 bg-brand-primary/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <div className="card-brutalist w-full max-w-lg bg-white p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-brand-bg transition-colors"
                >
                    <X size={24} />
                </button>
                <h2 className="font-bold text-lg uppercase tracking-widest text-brand-primary mb-6">Scanner de QR Code</h2>
                <div id="reader" className="w-full overflow-hidden border-2 border-brand-primary"></div>
                <p className="mt-4 text-[10px] font-bold uppercase text-brand-primary/60 text-center tracking-widest">
                    Posicione o código QR dentro do quadrado
                </p>
            </div>
        </div>
    );
};
