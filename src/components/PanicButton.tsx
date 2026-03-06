import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function PanicButton() {
    const [isPressing, setIsPressing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isTriggered, setIsTriggered] = useState(false);
    const { user } = useAuth();
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(0);

    const TRIGGER_TIME = 3000; // 3 seconds

    const startPress = () => {
        setIsPressing(true);
        setProgress(0);
        startTimeRef.current = Date.now();

        timerRef.current = setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            const newProgress = Math.min((elapsed / TRIGGER_TIME) * 100, 100);
            setProgress(newProgress);

            if (elapsed >= TRIGGER_TIME) {
                triggerPanic();
            }
        }, 50);
    };

    const stopPress = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setIsPressing(false);
        if (!isTriggered) setProgress(0);
    };

    const triggerPanic = async () => {
        if (isTriggered) return;
        setIsTriggered(true);
        stopPress();

        // Tactile Feedback
        if ("vibrate" in navigator) {
            navigator.vibrate([200, 100, 200]);
        }

        try {
            // Capture Battery
            let batteryLevel = 0;
            if ('getBattery' in navigator) {
                const battery: any = await (navigator as any).getBattery();
                batteryLevel = Math.round(battery.level * 100);
            }

            // Capture GPS
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    await api.createOccurrence({
                        type: 'URGENT_PANIC',
                        description: 'ALERTA DE PÂNICO SILENCIOSO ATIVADO PELO VIGILANTE',
                        priority: 'urgent',
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                        battery_level: batteryLevel,
                        date_time: new Date().toISOString()
                    });
                    setTimeout(() => setIsTriggered(false), 5000);
                },
                async (err) => {
                    // Send even without GPS
                    await api.createOccurrence({
                        type: 'URGENT_PANIC',
                        description: `ALERTA DE PÂNICO SILENCIOSO (GPS FALHOU: ${err.message})`,
                        priority: 'urgent',
                        battery_level: batteryLevel,
                        date_time: new Date().toISOString()
                    });
                    setTimeout(() => setIsTriggered(false), 5000);
                },
                { enableHighAccuracy: true, timeout: 5000 }
            );
        } catch (error) {
            console.error("Panic Trigger Error:", error);
            setIsTriggered(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-[100] pointer-events-none">
            <AnimatePresence>
                {isPressing && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute bottom-20 right-0 bg-rose-600 text-white p-3 rounded-none border-2 border-brand-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-[10px] font-black uppercase tracking-widest min-w-[150px]"
                    >
                        Mantenha pressionado...
                        <div className="mt-2 h-1.5 w-full bg-rose-900 overflow-hidden">
                            <motion.div
                                className="h-full bg-white"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onMouseDown={startPress}
                onMouseUp={stopPress}
                onMouseLeave={stopPress}
                onTouchStart={startPress}
                onTouchEnd={stopPress}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={React.useMemo(() => `
          pointer-events-auto
          w-16 h-16 rounded-full flex items-center justify-center
          transition-colors duration-300
          border-4 border-brand-primary
          shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
          ${isTriggered ? 'bg-emerald-500' : isPressing ? 'bg-rose-700' : 'bg-rose-500'}
        `, [isTriggered, isPressing])}
            >
                {isTriggered ? (
                    <Loader2 className="text-white animate-spin" />
                ) : (
                    <AlertOctagon size={32} className="text-white" />
                )}
            </motion.button>
        </div>
    );
}
