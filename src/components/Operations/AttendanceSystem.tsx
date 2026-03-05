import React, { useState, useEffect } from 'react';
import { MapPin, Clock, CheckCircle2, XCircle, Loader2, Navigation } from 'lucide-react';
import { api } from '../../lib/api';
import { Post, Vigilante } from '../../types';
import { cn } from '../../lib/utils';

export default function AttendanceSystem() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [vigilantes, setVigilantes] = useState<Vigilante[]>([]);
    const [selectedPost, setSelectedPost] = useState<string>('');
    const [selectedVigilante, setSelectedVigilante] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);

    useEffect(() => {
        Promise.all([api.getPosts(), api.getVigilantes()]).then(([p, v]) => {
            setPosts(p);
            setVigilantes(v);
        });

        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.warn('GPS Error:', err),
                { enableHighAccuracy: true }
            );
        }
    }, []);

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // in metres
    };

    const handleClockIn = async (type: 'clock_in' | 'clock_out') => {
        if (!selectedPost || !selectedVigilante || !coords) {
            setStatus({ type: 'error', msg: 'Selecione o posto, vigilante e garanta o GPS ativo.' });
            return;
        }

        setLoading(true);
        const post = posts.find(p => p.id === parseInt(selectedPost));
        if (!post || !post.latitude || !post.longitude) {
            setStatus({ type: 'error', msg: 'Este posto não tem coordenadas geográficas configuradas.' });
            setLoading(false);
            return;
        }

        const distance = calculateDistance(coords.lat, coords.lng, post.latitude, post.longitude);
        const isWithinRadius = distance <= (post.radius_meters || 100);

        try {
            await api.createAttendance({
                vigilante_id: parseInt(selectedVigilante),
                post_id: post.id,
                timestamp: new Date().toISOString(),
                latitude: coords.lat,
                longitude: coords.lng,
                is_within_radius: isWithinRadius,
                type: type
            });

            if (isWithinRadius) {
                setStatus({ type: 'success', msg: `${type === 'clock_in' ? 'Entrada' : 'Saída'} registada com sucesso dentro do raio do posto.` });
            } else {
                setStatus({ type: 'error', msg: `Atenção: Ponto registado FORA do raio permitido (${Math.round(distance)}m de distância).` });
            }
        } catch (err) {
            setStatus({ type: 'error', msg: 'Erro ao registar ponto.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="card-brutalist bg-white">
                <div className="flex items-center space-x-3 mb-8">
                    <div className="p-3 bg-brand-primary text-brand-bg rounded">
                        <Navigation size={24} />
                    </div>
                    <h2 className="text-xl font-bold uppercase tracking-tight">Registo de Ponto Biométrico (GPS)</h2>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-bold uppercase mb-2">Vigilante</label>
                            <select
                                className="w-full p-3 border-2 border-brand-primary outline-none focus:bg-brand-bg/5 transition-colors"
                                value={selectedVigilante}
                                onChange={e => setSelectedVigilante(e.target.value)}
                            >
                                <option value="">Selecionar Vigilante</option>
                                {vigilantes.map(v => <option key={v.id} value={v.id.toString()}>{v.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase mb-2">Posto de Serviço</label>
                            <select
                                className="w-full p-3 border-2 border-brand-primary outline-none focus:bg-brand-bg/5 transition-colors"
                                value={selectedPost}
                                onChange={e => setSelectedPost(e.target.value)}
                            >
                                <option value="">Selecionar Posto</option>
                                {posts.map(p => <option key={p.id} value={p.id.toString()}>{p.name} - {p.client_name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="p-4 bg-brand-bg border-2 border-brand-primary/10 rounded flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <MapPin className={cn(coords ? "text-emerald-500" : "text-rose-500")} size={20} />
                            <div>
                                <p className="text-[10px] font-bold uppercase opacity-60">Status do GPS</p>
                                <p className="text-xs font-mono">{coords ? `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}` : 'A localizar...'}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <Clock className="text-brand-primary/40 inline-block mb-1" size={16} />
                            <p className="text-xs font-bold">{new Date().toLocaleTimeString()}</p>
                        </div>
                    </div>

                    {status && (
                        <div className={cn(
                            "p-4 border-l-4 flex items-center space-x-3",
                            status.type === 'success' ? "bg-emerald-50 border-emerald-500 text-emerald-800" : "bg-rose-50 border-rose-500 text-rose-800"
                        )}>
                            {status.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                            <span className="text-sm font-bold uppercase tracking-tight">{status.msg}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handleClockIn('clock_in')}
                            disabled={loading}
                            className="py-4 bg-brand-primary text-brand-bg font-bold uppercase tracking-widest text-xs shadow-[4px_4px_0px_0px_rgba(242,125,38,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Entrada (Clock In)'}
                        </button>
                        <button
                            onClick={() => handleClockIn('clock_out')}
                            disabled={loading}
                            className="py-4 bg-white border-2 border-brand-primary text-brand-primary font-bold uppercase tracking-widest text-xs shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Saída (Clock Out)'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="card-brutalist bg-brand-primary text-brand-bg p-6">
                <h3 className="font-bold text-xs uppercase tracking-widest mb-4 text-brand-accent italic">💡 Regra de Geofencing</h3>
                <p className="text-xs leading-relaxed opacity-80">
                    O ponto biométrico do SafeGuard Pro utiliza a tecnologia de Geofencing. O registo só será considerado "Em Conformidade" se o vigilante estiver num raio de até 100 metros do centro do posto configurado. Registos fora do raio são marcados a vermelho para auditoria financeira imediata.
                </p>
            </div>
        </div>
    );
}
