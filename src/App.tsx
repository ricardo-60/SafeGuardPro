import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import VigilanteList from './components/HR/VigilanteList';
import WeaponList from './components/Weapons/WeaponList';
import OccurrenceList from './components/Occurrences/OccurrenceList';
import PostList from './components/Posts/PostList';
import ScaleList from './components/Scales/ScaleList';
import AttendanceSystem from './components/Operations/AttendanceSystem';
import EquipmentManager from './components/Operations/EquipmentManager';
import PayrollSystem from './components/HR/PayrollSystem';
import FinanceDashboard from './components/Finance/FinanceDashboard';
import VehicleList from './components/Vehicles/VehicleList';
import ReportGenerator from './components/Reports/ReportGenerator';
import UserManagement from './components/Users/UserManagement';
import CompanySettings from './components/Company/CompanySettings';
import ExecutiveDashboard from './components/Reports/ExecutiveDashboard';
import VehicleFleetManager from './components/Logistics/VehicleFleetManager';
import TacticalKardex from './components/Logistics/TacticalKardex';
import AuditDashboard from './components/Admin/AuditDashboard';
import { Login } from './components/Login';
import LandingPage from './components/LandingPage';
import { Loader2 } from 'lucide-react';

function localStorageProvider() {
  if (typeof window === 'undefined') return new Map();
  const map = new Map(JSON.parse(localStorage.getItem('safeguard-app-cache') || '[]'));
  window.addEventListener('beforeunload', () => {
    const appCache = JSON.stringify(Array.from(map.entries()));
    localStorage.setItem('safeguard-app-cache', appCache);
  });
  return map;
}

export default function App() {
  const { user, company, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <SWRConfig
      value={{
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        provider: localStorageProvider,
      }}
    >
      <Router>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth Flow */}
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={() => { }} />}
          />

          {/* Protected Dashboard Area */}
          <Route
            path="/dashboard/*"
            element={
              !user ? <Navigate to="/login" replace /> :
                !company ? (
                  <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 max-w-md text-center">
                      <h2 className="text-xl font-bold text-white mb-2">Conta Pendente</h2>
                      <p className="text-zinc-400 mb-6">
                        A sua conta foi criada, mas ainda não está associada a nenhuma empresa.
                        Por favor, contacte o administrador do sistema.
                      </p>
                      <button
                        onClick={() => supabase.auth.signOut()}
                        className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        Sair / Tentar Novamente
                      </button>
                    </div>
                  </div>
                ) : (
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/rh" element={<VigilanteList />} />
                      <Route path="/armas" element={<WeaponList />} />
                      <Route path="/ocorrencias" element={<OccurrenceList />} />
                      <Route path="/postos" element={<PostList />} />
                      <Route path="/equipamentos" element={<EquipmentManager />} />
                      <Route path="/escalas" element={<ScaleList />} />
                      <Route path="/assiduidade" element={<AttendanceSystem />} />
                      <Route path="/folha-pagamento" element={<PayrollSystem />} />
                      <Route path="/financeiro" element={<FinanceDashboard />} />
                      <Route path="/viaturas" element={<VehicleFleetManager />} />
                      <Route path="/executivo" element={<ExecutiveDashboard />} />
                      <Route path="/frota" element={<VehicleFleetManager />} />
                      <Route path="/ativos-taticos" element={<TacticalKardex />} />
                      <Route path="/relatorios" element={<ExecutiveDashboard />} />
                      <Route path="/audit" element={<AuditDashboard />} />
                      <Route path="/usuarios" element={<UserManagement />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </Layout>
                )
            }
          />

          {/* Default Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </SWRConfig>
  );
}
