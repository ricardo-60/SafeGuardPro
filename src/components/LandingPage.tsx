import React from 'react';
import { motion } from 'framer-motion';
import {
    Shield, Users, Truck, ScanLine,
    TrendingUp, Zap, WifiOff, Lock,
    ArrowRight, CheckCircle2, Mail, Phone,
    Globe, Award, Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
    {
        title: "Gestão de Efetivos",
        description: "Assiduidade com Geofencing e Escalas complexas (12x24, 24x48) adaptadas à realidade local.",
        icon: Users,
        color: "emerald"
    },
    {
        title: "Logística Crítica",
        description: "Controle total de viaturas (Logbook) e Ativos Táticos (Kardex) com assinatura digital.",
        icon: Truck,
        color: "orange"
    },
    {
        title: "BI & Reporting",
        description: "Dashboards executivos com métricas em Kwanza (AOA) e exportação PDF com marca d'água.",
        icon: TrendingUp,
        color: "blue"
    },
    {
        title: "Segurança Total",
        description: "Botão de Pânico Silencioso e Trilha de Auditoria Imutável para conformidade técnica.",
        icon: Shield,
        color: "purple"
    }
];

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-brand-accent/30 overflow-x-hidden">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center shadow-lg shadow-brand-accent/20">
                            <Shield className="text-brand-primary w-6 h-6" />
                        </div>
                        <span className="text-xl font-black tracking-tighter uppercase">
                            SafeGuard<span className="text-brand-accent">Pro</span>
                        </span>
                    </div>
                    <div className="hidden md:flex items-center space-x-8 text-sm font-bold uppercase tracking-widest text-zinc-400">
                        <a href="#funcionalidades" className="hover:text-brand-accent transition-colors">Funcionalidades</a>
                        <a href="#offline" className="hover:text-brand-accent transition-colors">Offline-First</a>
                        <a href="#confianca" className="hover:text-brand-accent transition-colors">Confiança</a>
                    </div>
                    <Link
                        to="/login"
                        className="px-6 py-2.5 bg-brand-accent text-brand-primary font-black text-xs uppercase tracking-widest rounded-lg hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-accent/20"
                    >
                        Aceder ao Portal
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[1000px] bg-brand-accent/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl"
                    >
                        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                            <Zap size={12} />
                            <span>O Novo Padrão de Segurança em Angola</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter mb-8 bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent">
                            SafeGuard Pro: <br />
                            <span className="text-brand-accent">Inteligência</span> que Protege Angola
                        </h1>
                        <p className="text-xl text-zinc-400 leading-relaxed mb-10 max-w-2xl">
                            O ERP definitivo para Segurança Humana. Controle de frotas, armamento e assiduidade em uma única plataforma robusta, resiliente e auditável.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <button className="w-full sm:w-auto px-10 py-4 bg-white text-black font-black uppercase text-sm tracking-widest rounded-xl hover:scale-105 transition-all flex items-center justify-center group shadow-xl shadow-white/10">
                                Agendar Demo
                                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                            </button>
                            <Link
                                to="/login"
                                className="w-full sm:w-auto px-10 py-4 bg-zinc-900 text-white font-black uppercase text-sm tracking-widest rounded-xl hover:bg-zinc-800 transition-all text-center border border-white/10"
                            >
                                Aceder ao Portal
                            </Link>
                        </div>
                    </motion.div>

                    {/* Floating Element / Dashboard Preview */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-20 relative"
                    >
                        <div className="aspect-[16/9] rounded-3xl overflow-hidden border-4 border-white/5 shadow-2xl bg-zinc-900 group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-brand-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            <img
                                src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070"
                                alt="SafeGuard Pro Interface"
                                className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="p-8 bg-black/80 backdrop-blur-md rounded-2xl border border-white/10 max-w-md text-center">
                                    <Activity className="text-brand-accent w-12 h-12 mx-auto mb-4" />
                                    <h4 className="text-xl font-black uppercase tracking-tighter italic">Tempo Real. Decisão Estratégica.</h4>
                                    <p className="text-[10px] uppercase font-bold text-white/40 tracking-[0.3em] mt-2">Visibilidade Total sobre a Força de Trabalho</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="funcionalidades" className="py-24 bg-[#080808] border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">Módulos Integrados</h2>
                        <div className="w-20 h-1.5 bg-brand-accent mx-auto rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group p-8 bg-zinc-900/40 border border-white/5 rounded-3xl hover:border-brand-accent/50 transition-all duration-500 hover:-translate-y-2"
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-zinc-800 group-hover:bg-brand-accent transition-colors duration-500`}>
                                    <f.icon className="w-8 h-8 text-brand-accent group-hover:text-brand-primary transition-colors duration-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-4 tracking-tight">{f.title}</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                                    {f.description}
                                </p>
                                <div className="flex items-center text-brand-accent text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                    Saber mais <ArrowRight className="ml-1" size={14} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Offline-First Section */}
            <section id="offline" className="py-24 relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-[50%] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full" />

                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                                <WifiOff size={12} />
                                <span>Independência de Rede</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8 leading-[0.9]">
                                Zero Internet? <br />
                                <span className="text-emerald-400">Zero Falhas.</span>
                            </h2>
                            <p className="text-zinc-400 text-lg leading-relaxed mb-10">
                                Sabemos que em Angola a conectividade pode ser um desafio. O SafeGuard Pro foi desenhado com arquitetura **Offline-First**. Registre ocorrências, faça o ponto e controle o armamento sem internet — os dados serão sincronizados automaticamente assim que a conexão retornar.
                            </p>
                            <div className="space-y-4">
                                {["Sincronização com Exponential Backoff", "Persistência em IndexedDB", "Fila de Alta Prioridade para Pânico"].map((item, i) => (
                                    <div key={i} className="flex items-center space-x-3">
                                        <CheckCircle2 className="text-emerald-400 shrink-0" size={20} />
                                        <span className="text-sm font-bold opacity-80">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="card-brutalist bg-zinc-900 border-emerald-500/50 p-10 flex flex-col items-center justify-center text-center shadow-[12px_12px_0px_0px_rgba(16,185,129,0.3)]">
                                <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border-2 border-emerald-500/20">
                                    <WifiOff className="text-emerald-400 w-12 h-12 animate-pulse" />
                                </div>
                                <h3 className="text-2xl font-black uppercase mb-2 italic">Continuity Engine</h3>
                                <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">A sua operação não pode parar por falta de sinal.</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Trust Section */}
            <section id="confianca" className="py-24 bg-white text-black">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                        <div className="max-w-2xl text-left">
                            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 leading-none">Confiança Enterprise</h2>
                            <div className="w-16 h-2 bg-brand-accent rounded-full" />
                        </div>
                        <div className="text-right flex items-center space-x-8">
                            <div className="text-center">
                                <p className="text-4xl font-black italic">99.9%</p>
                                <p className="text-[8px] font-black uppercase opacity-60">Uptime Garantido</p>
                            </div>
                            <div className="text-center border-l-2 border-black/10 pl-8">
                                <p className="text-4xl font-black italic">+500</p>
                                <p className="text-[8px] font-black uppercase opacity-60">Vigilantes Monitorados</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            { icon: Lock, title: "Segurança de Dados", text: "Encriptação ponta-a-ponta e conformidade com o RGPD e leis angolanas." },
                            { icon: Globe, title: "Suporte Local", text: "Equipa técnica dedicada em Luanda disponível 24/7." },
                            { icon: Award, title: "Excelência Operacional", text: "Redução comprovada de 30% em custos operacionais e faltas." }
                        ].map((item, i) => (
                            <div key={i} className="space-y-4">
                                <div className="w-12 h-12 bg-black text-brand-accent flex items-center justify-center rounded-xl shadow-[4px_4px_0px_0px_rgba(242,125,38,1)] transition-transform hover:-translate-y-1">
                                    <item.icon size={24} />
                                </div>
                                <h4 className="text-lg font-black uppercase italic">{item.title}</h4>
                                <p className="text-sm opacity-70 leading-relaxed font-medium">
                                    {item.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA / Footer */}
            <footer className="pt-24 pb-12 bg-[#0a0a0a] border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-20 mb-20">
                        <div>
                            <h2 className="text-4xl font-black uppercase tracking-tighter mb-8 leading-none">Pronto para elevar o nível da sua segurança?</h2>
                            <p className="text-zinc-400 text-lg mb-10 leading-relaxed">
                                Junte-se à elite das empresas de segurança que já confiam no SafeGuard Pro para gerenciar o que há de mais precioso: a vida e os ativos dos seus clientes.
                            </p>
                            <div className="flex items-center space-x-6">
                                <div className="flex items-center space-x-3">
                                    <Mail className="text-brand-accent" size={20} />
                                    <span className="text-sm font-bold">contacto@safeguard.ao</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Phone className="text-brand-accent" size={20} />
                                    <span className="text-sm font-bold">+244 9XX XXX XXX</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
                            <h3 className="text-xl font-bold mb-6">Solicitar demonstração</h3>
                            <form className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Seu Nome completo"
                                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:border-brand-accent outline-none text-sm transition-colors"
                                />
                                <input
                                    type="email"
                                    placeholder="E-mail Corporativo"
                                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:border-brand-accent outline-none text-sm transition-colors"
                                />
                                <button className="w-full py-4 bg-brand-accent text-brand-primary font-black uppercase text-sm tracking-widest rounded-xl hover:scale-[1.02] transition-all shadow-lg shadow-brand-accent/20">
                                    Começar agora
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5 gap-6">
                        <div className="flex items-center space-x-2 grayscale opacity-50">
                            <div className="w-6 h-6 bg-brand-accent rounded flex items-center justify-center">
                                <Shield className="text-brand-primary w-4 h-4" />
                            </div>
                            <span className="text-sm font-black tracking-tighter uppercase">SafeGuardPro</span>
                        </div>
                        <p className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest">
                            &copy; 2026 SafeGuard Pro Angola. Todos os direitos reservados.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
