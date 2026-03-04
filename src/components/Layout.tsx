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
  Truck,
  FileText,
  Menu,
  X,
  LogOut,
  Bell,
  Building2
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { title: 'RH / Vigilantes', icon: Users, path: '/rh' },
  { title: 'Armas e Munições', icon: Shield, path: '/armas' },
  { title: 'Equipamentos', icon: Package, path: '/equipamentos' },
  { title: 'Postos', icon: MapPin, path: '/postos' },
  { title: 'Escalas', icon: Calendar, path: '/escalas' },
  { title: 'Ocorrências', icon: AlertTriangle, path: '/ocorrencias' },
  { title: 'Financeiro', icon: DollarSign, path: '/financeiro' },
  { title: 'Viaturas', icon: Truck, path: '/viaturas' },
  { title: 'Relatórios', icon: FileText, path: '/relatorios' },
  { title: 'Utilizadores', icon: Users, path: '/usuarios' },
  { title: 'Configurações', icon: Building2, path: '/empresa', adminOnly: true },
];

export default function Layout({ children }: { children: React.ReactNode }) {
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

        <nav className="flex-1 py-6 overflow-y-auto">
          {navItems.filter(item => !item.adminOnly || role === 'admin').map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-6 py-3 transition-colors group relative",
                  isActive ? "bg-brand-accent text-brand-primary" : "hover:bg-brand-bg/5"
                )}
              >
                <item.icon size={20} className={cn(isActive ? "text-brand-primary" : "text-brand-bg/60 group-hover:text-brand-bg")} />
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="ml-4 font-medium text-sm"
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
        </nav>

        <div className="p-6 border-t border-brand-bg/10">
          <button
            onClick={handleLogout}
            className="flex items-center text-brand-bg/60 hover:text-brand-bg transition-colors w-full"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="ml-4 text-sm font-medium">Sair</span>}
          </button>
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
      </main>
    </div>
  );
}
