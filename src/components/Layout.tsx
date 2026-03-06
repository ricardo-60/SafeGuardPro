import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Shield,
  Package,
  MapPin,
  Calendar,
  AlertTriangle,
  DollarSign,
  FileText,
  Menu,
  X,
  LogOut,
  Bell,
  Building2,
  Clock,
  TrendingUp,
  Truck,
  ScanLine,
  History
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import HealthStatus from './HealthStatus';
import PanicButton from './PanicButton';



function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navGroups = [
  {
    label: null,
    items: [
      { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['ADMIN', 'OPERATOR', 'SUPERVISOR', 'VIGILANTE'] },
    ]
  },
  {
    label: 'Recursos Humanos',
    items: [
      { title: 'Efetivos / RH', icon: Users, path: '/dashboard/rh', roles: ['ADMIN', 'OPERATOR', 'SUPERVISOR'] },
      { title: 'Escalas', icon: Calendar, path: '/dashboard/escalas', roles: ['ADMIN', 'OPERATOR', 'SUPERVISOR'] },
      { title: 'Assiduidade', icon: Clock, path: '/dashboard/assiduidade', roles: ['ADMIN', 'OPERATOR', 'SUPERVISOR', 'VIGILANTE'] },
      { title: 'Folha Pagamento', icon: DollarSign, path: '/dashboard/folha-pagamento', roles: ['ADMIN', 'OPERATOR'] },
    ]
  },
  {
    label: 'Logística',
    items: [
      { title: 'Gestão de Frota', icon: Truck, path: '/dashboard/frota', roles: ['ADMIN', 'OPERATOR'] },
      { title: 'Armas e Munições', icon: Shield, path: '/dashboard/armas', roles: ['ADMIN', 'OPERATOR'] },
      { title: 'Kardex Tático', icon: ScanLine, path: '/dashboard/ativos-taticos', roles: ['ADMIN', 'OPERATOR'] },
      { title: 'Equipamentos', icon: Package, path: '/dashboard/equipamentos', roles: ['ADMIN', 'OPERATOR'] },
    ]
  },
  {
    label: 'Portaria',
    items: [
      { title: 'Postos', icon: MapPin, path: '/dashboard/postos', roles: ['ADMIN', 'OPERATOR', 'SUPERVISOR'] },
      { title: 'Ocorrências', icon: AlertTriangle, path: '/dashboard/ocorrencias', roles: ['ADMIN', 'OPERATOR', 'SUPERVISOR', 'VIGILANTE'] },
    ]
  },
  {
    label: 'Relatórios',
    items: [
      { title: 'BI Executivo', icon: TrendingUp, path: '/dashboard/executivo', roles: ['ADMIN', 'OPERATOR'] },
      { title: 'Auditoria', icon: History, path: '/dashboard/audit', roles: ['ADMIN'] },
    ]
  },
  {
    label: 'Configurações',
    items: [
      { title: 'Utilizadores', icon: Users, path: '/dashboard/usuarios', roles: ['ADMIN'] },
      { title: 'Definições', icon: Building2, path: '/dashboard/configuracoes', roles: ['ADMIN'] },
    ]
  },
];

// flat list for header title lookup
const navItems = navGroups.flatMap(g => g.items);

export default function Layout({ children }: { children?: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, role } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // user state is now managed by AuthContext
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen flex bg-brand-bg font-sans">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-brand-primary text-brand-bg transition-all duration-300 flex flex-col",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-6 flex items-center justify-between border-b border-brand-bg/10">
          {isSidebarOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-xl tracking-tighter uppercase"
            >
              SafeGuard<span className="text-brand-accent">Pro</span>
            </motion.span>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 hover:bg-brand-bg/10 rounded"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {navGroups.map((group, gi) => (
            <div key={gi} className="mb-2">
              {group.label && isSidebarOpen && (
                <p className="px-6 pt-4 pb-1 text-[9px] font-black uppercase tracking-[0.2em] text-brand-bg/30">
                  {group.label}
                </p>
              )}
              {group.label && !isSidebarOpen && gi > 0 && (
                <div className="mx-4 my-2 border-t border-brand-bg/10" />
              )}
              {group.items.filter(item => !item.roles || (role && item.roles.includes(role))).map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center px-6 py-2.5 transition-colors group relative",
                      isActive ? "bg-brand-accent text-brand-primary" : "hover:bg-brand-bg/5"
                    )}
                  >
                    <item.icon size={18} className={cn(isActive ? "text-brand-primary" : "text-brand-bg/60 group-hover:text-brand-bg")} />
                    {isSidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="ml-3 font-medium text-sm"
                      >
                        {item.title}
                      </motion.span>
                    )}
                    {!isSidebarOpen && isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-accent" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-brand-bg/10 space-y-3">
          <button
            onClick={handleLogout}
            className="flex items-center text-brand-bg/60 hover:text-brand-bg transition-colors w-full"
          >
            <LogOut size={18} />
            {isSidebarOpen && <span className="ml-3 text-sm font-medium">Sair</span>}
          </button>
          {isSidebarOpen && (
            <p className="text-[9px] text-brand-bg/25 uppercase font-bold tracking-widest text-center pt-1">
              Desenvolvido por HR-TECNOLOGIA
            </p>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-brand-primary/10 flex items-center justify-between px-8">
          <h1 className="text-lg font-semibold text-brand-primary uppercase tracking-widest">
            {navItems.find(i => i.path === location.pathname)?.title || 'Sistema'}
          </h1>

          <div className="flex items-center space-x-6">
            <button className="relative p-2 hover:bg-brand-bg/50 rounded-full transition-colors">
              <Bell size={20} className="text-brand-primary/60" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand-accent rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center space-x-3 border-l pl-6 border-brand-primary/10">
              <div className="text-right">
                <p className="text-sm font-bold text-brand-primary truncate max-w-[150px]">
                  {user?.email?.split('@')[0] || 'Usuário'}
                </p>
                <p className="text-[10px] text-brand-primary/50 uppercase font-bold tracking-tighter">Administrador</p>
              </div>
              <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center text-brand-bg font-bold uppercase">
                {user?.email?.[0] || 'U'}
              </div>
            </div>
          </div>
        </header>

        <HealthStatus />
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
        <PanicButton />
      </main>
    </div>
  );
}
