import React, { useState, useEffect } from 'react';
import { Shield, Wifi, WifiOff, MapPin, MapPinOff, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { offlineQueue } from '../lib/offlineQueue';
import { cn } from '../lib/utils';

export default function HealthStatus() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [queueSize, setQueueSize] = useState(0);
    const [locationStatus, setLocationStatus] = useState<'searching' | 'granted' | 'denied' | 'idle'>('idle');

    useEffect(() => {
        const handleStatusChange = () => setIsOnline(navigator.onLine);
        window.addEventListener('online', handleStatusChange);
        window.addEventListener('offline', handleStatusChange);

        const updateQueueSize = async () => {
            const queue = await offlineQueue.getQueue();
            setQueueSize(queue.length);
        };

        updateQueueSize();
        const interval = setInterval(updateQueueSize, 3000);

        // Initial check for geolocation
        if ("geolocation" in navigator) {
            navigator.permissions.query({ name: 'geolocation' as PermissionName }).then(result => {
                if (result.state === 'granted') setLocationStatus('granted');
                else if (result.state === 'denied') setLocationStatus('denied');

                result.onchange = () => {
                    if (result.state === 'granted') setLocationStatus('granted');
                    else if (result.state === 'denied') setLocationStatus('denied');
                };
            });
        }

        return () => {
            window.removeEventListener('online', handleStatusChange);
            window.removeEventListener('offline', handleStatusChange);
            clearInterval(interval);
        };
    }, []);

    const isAtRisk = !isOnline || queueSize > 10 || locationStatus === 'denied';

    return (
        <div className={cn(
            "flex flex-wrap items-center gap-4 px-4 py-2 border-b-2 transition-all duration-500",
            isAtRisk ? "bg-rose-50 border-rose-500" : "bg-emerald-50 border-emerald-500"
        )}>
            <div className="flex items-center space-x-2">
                <div className={cn(
                    "p-1.5 rounded-full",
                    isAtRisk ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
                )}>
                    {isAtRisk ? <Shield size={16} className="animate-pulse" /> : <CheckCircle2 size={16} />}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">
                    Status: {isAtRisk ? 'Em Risco' : 'Protegido'}
                </span>
            </div>

            <div className="h-4 w-px bg-current opacity-10 hidden md:block" />

            <div className="flex items-center space-x-4 text-[10px] font-bold uppercase tracking-tight">
                <div className="flex items-center">
                    {isOnline ? <Wifi size={14} className="mr-1 text-emerald-600" /> : <WifiOff size={14} className="mr-1 text-rose-600" />}
                    <span>{isOnline ? 'Rede OK' : 'Modo Offline'}</span>
                </div>

                <div className="flex items-center">
                    {locationStatus === 'granted' ? <MapPin size={14} className="mr-1 text-emerald-600" /> : <MapPinOff size={14} className="mr-1 text-rose-600" />}
                    <span>{locationStatus === 'granted' ? 'GPS Ativo' : 'GPS em Falha'}</span>
                </div>

                <div className="flex items-center">
                    <AlertTriangle size={14} className={cn("mr-1", queueSize > 0 ? "text-amber-500" : "text-emerald-600")} />
                    <span>Fila: {queueSize} Itens</span>
                </div>
            </div>

            {isAtRisk && (
                <div className="ml-auto animate-bounce">
                    <span className="text-[10px] font-black text-rose-600 underline uppercase tracking-widest">
                        Ação necessária!
                    </span>
                </div>
            )}
        </div>
    );
}
