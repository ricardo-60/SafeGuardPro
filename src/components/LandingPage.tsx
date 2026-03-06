import React from 'react';
import { motion } from 'framer-motion';
import {
    Shield, Users, Truck, TrendingUp, Zap, WifiOff, Lock,
    ArrowRight, CheckCircle2, Mail, Phone,
    Globe, Award, Activity, MessageCircle, HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
    {
        title: "Gestão de Efetivos",
        description: "Assiduidade com Geofencing e Escalas complexas (12x24, 24x48) adaptadas à realidade local.",
        icon: Users,
        color: "blue"
    },
    {
        title: "Logística Crítica",
        description: "Controle total de viaturas (Logbook) e Ativos Táticos (Kardex) com assinatura digital.",
        icon: Truck,
        color: "blue"
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
        color: "blue"
    }
];

const faqs = [
    {
        q: "Funciona sem internet?",
        a: "Sim. Arquitetura Offline-First integrada. Os dados sincronizam automaticamente quando a rede regressa."
    },
    {
        q: "Gere frotas e logística?",
        a: "Sim. Controle total de combustível, manutenção e ativos táticos com rastreio digital."
    },
    {
        q: "Onde os dados ficam guardados?",
        a: "Na infraestrutura segura do Supabase, com suporte a recuperação de desastres e encriptação."
    }
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#0f172a] text-white selection:bg-blue-500/30 overflow-x-hidden font-sans">
            {/* Navigation (Glassmorphism) */}
            <nav className="fixed top-0 w-full z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Shield className="text-white w-6 h-6" />
                        </div>
                        <span className="text-xl font-black tracking-tighter uppercase">
                            SafeGuard<span className="text-blue-500">Pro</span>
                        </span>
                    </div>
                    <div className="hidden md:flex items-center space-x-8 text-xs font-black uppercase tracking-widest text-slate-400">
                        <a href="#funcionalidades" className="hover:text-blue-500 transition-colors">Funcionalidades</a>
                        <a href="#offline" className="hover:text-blue-500 transition-colors">Offline-First</a>
                        <a href="#faq" className="hover:text-blue-500 transition-colors">FAQ</a>
                    </div>
                    <Link
                        to="/dashboard"
                        className="px-6 py-2.5 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-lg hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-600/20"
                    >
                        Aceder ao Portal
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[1000px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-3xl"
                    >
                        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                            <Zap size={12} />
                            <span>O Novo Padrão de Segurança Enterprise</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter mb-8 bg-gradient-to-br from-white via-white to-slate-400 bg-clip-text text-transparent">
                            SafeGuard Pro: <br />
                            <span className="text-blue-600">Gestão 360º</span> para Segurança Privada
                        </h1>
                        <p className="text-xl text-slate-400 leading-relaxed mb-10 max-w-2xl">
                            Reduza custos operacionais e aumente a confiança dos seus clientes com a gestão 360º. O ERP definitivo para logística, frotas e assiduidade.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <Link
                                to="/dashboard"
                                className="w-full sm:w-auto px-10 py-4 bg-blue-600 text-white font-black uppercase text-sm tracking-widest rounded-xl hover:bg-blue-500 hover:scale-105 transition-all flex items-center justify-center group shadow-xl shadow-blue-600/20"
                            >
                                Agendar Demo
                                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                            </Link>
                            <Link
                                to="/dashboard"
                                className="w-full sm:w-auto px-10 py-4 bg-slate-900 text-white font-black uppercase text-sm tracking-widest rounded-xl hover:bg-slate-800 transition-all text-center border border-white/10"
                            >
                                Aceder ao Portal
                            </Link>
                        </div>
                    </motion.div>

                    {/* Dashboard Preview */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="mt-20 relative"
                    >
                        <div className="aspect-[16/9] rounded-3xl overflow-hidden border-4 border-slate-800/50 shadow-2xl bg-slate-900 group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            <img
                                src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070"
                                alt="SafeGuard Pro Interface"
                                className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="p-8 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-white/10 max-w-md text-center">
                                    <Activity className="text-blue-500 w-12 h-12 mx-auto mb-4" />
                                    <h4 className="text-xl font-black uppercase tracking-tighter italic">Tempo Real. Decisão Estratégica.</h4>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.3em] mt-2">Visibilidade Total sobre a Sua Operação</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid (Stagger Children) */}
            <section id="funcionalidades" className="py-24 bg-[#0c1222] border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-white">Módulos Integrados</h2>
                        <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full" />
                    </div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                    >
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                variants={itemVariants}
                                className="group p-8 bg-slate-900/40 border border-white/5 rounded-3xl hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2 cursor-default"
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-slate-800 group-hover:bg-blue-600 transition-colors duration-500 shadow-lg`}>
                                    <f.icon className="w-8 h-8 text-blue-500 group-hover:text-white transition-colors duration-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-4 tracking-tight text-white">{f.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                    {f.description}
                                </p>
                                <div className="flex items-center text-blue-500 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                    Saber mais <ArrowRight className="ml-1" size={14} />
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Offline-First Section */}
            <section id="offline" className="py-24 relative overflow-hidden bg-[#0f172a]">
                <div className="absolute bottom-0 right-0 w-[50%] h-[500px] bg-blue-500/5 blur-[120px] rounded-full" />

                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                                <WifiOff size={12} />
                                <span>Independência Total</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8 leading-[0.9]">
                                Zero Internet? <br />
                                <span className="text-blue-500">Zero Interrupções.</span>
                            </h2>
                            <p className="text-slate-400 text-lg leading-relaxed mb-10">
                                O SafeGuard Pro foi desenhado com arquitetura **Offline-First**. Registre ocorrências e faça o controle de frotas sem internet — os dados serão sincronizados automaticamente assim que a conexão retornar.
                            </p>
                            <div className="space-y-4">
                                {["Sincronização com Backoff Inteligente", "Persistência em Banco Local", "Garantia de Entrega de Dados"].map((item, i) => (
                                    <div key={i} className="flex items-center space-x-3">
                                        <CheckCircle2 className="text-blue-500 shrink-0" size={20} />
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
                            <div className="bg-slate-900 border-2 border-blue-500/30 p-10 flex flex-col items-center justify-center text-center rounded-3xl shadow-2xl shadow-blue-500/5 hover:border-blue-500/50 transition-colors duration-500">
                                <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 border-2 border-blue-500/20">
                                    <WifiOff className="text-blue-500 w-12 h-12 animate-pulse" />
                                </div>
                                <h3 className="text-2xl font-black uppercase mb-2 italic">Continuity Engine</h3>
                                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest leading-loose">A sua operação não pode parar por falta de sinal.</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-24 bg-[#0c1222] border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">FAQ Rápido</h2>
                        <div className="w-16 h-1.5 bg-blue-600 mx-auto rounded-full" />
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {faqs.map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="p-8 bg-slate-900/50 rounded-2xl border border-white/5 hover:border-blue-500/20 transition-all"
                            >
                                <HelpCircle className="text-blue-500 mb-4" size={28} />
                                <h4 className="text-lg font-black uppercase italic mb-4 tracking-tight">{faq.q}</h4>
                                <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="pt-24 pb-12 bg-[#0f172a] border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-20 mb-20">
                        <div>
                            <h2 className="text-4xl font-black uppercase tracking-tighter mb-8 leading-none">Pronto para elevar o nível da sua segurança?</h2>
                            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                                Junte-se à elite das empresas que já confiam no SafeGuard Pro para gerenciar o que há de mais precioso: a confiança operacional.
                            </p>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10">
                                <div className="flex items-center space-x-3">
                                    <Mail className="text-blue-500" size={20} />
                                    <span className="text-sm font-bold opacity-80">contacto@safeguardpro.com</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Phone className="text-blue-500" size={20} />
                                    <span className="text-sm font-bold opacity-80">+244 923 658 211</span>
                                </div>
                                <div className="flex items-center space-x-3 pt-2 border-t border-white/5 w-full">
                                    <span className="text-[10px] font-black uppercase text-blue-500">IBAN:</span>
                                    <span className="text-xs font-mono font-bold opacity-90">AO06-0040-0000-1694-3648-10168</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
                            <h3 className="text-xl font-bold mb-6">Solicitar demonstração</h3>
                            <form className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Seu Nome completo"
                                    className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl focus:border-blue-500 outline-none text-sm transition-colors"
                                />
                                <input
                                    type="email"
                                    placeholder="E-mail Corporativo"
                                    className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl focus:border-blue-500 outline-none text-sm transition-colors"
                                />
                                <button className="w-full py-4 bg-blue-600 text-white font-black uppercase text-sm tracking-widest rounded-xl hover:bg-blue-500 hover:scale-[1.02] transition-all shadow-lg shadow-blue-600/20">
                                    Começar agora
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5 gap-6">
                        <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                                <Shield className="text-white w-4 h-4" />
                            </div>
                            <span className="text-sm font-black tracking-tighter uppercase">SafeGuardPro</span>
                        </div>
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">
                            &copy; 2026 SafeGuard Pro. Produzido por <span className="text-blue-500">HR-TECNOLOGIA</span>.
                        </p>
                    </div>
                </div>
            </footer>

            {/* WhatsApp Floating Button */}
            <a
                href="https://wa.me/244923658211"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-8 right-8 z-[60] bg-green-500 p-4 rounded-full shadow-2xl hover:bg-green-400 hover:scale-110 transition-all active:scale-95 group"
            >
                <MessageCircle size={32} className="text-white fill-current" />
                <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-black text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap shadow-xl">
                    Fale Connosco
                </span>
            </a>
        </div>
    );
}
