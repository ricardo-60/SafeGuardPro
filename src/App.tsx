import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import VigilanteList from './components/HR/VigilanteList';
import WeaponList from './components/Weapons/WeaponList';
import OccurrenceList from './components/Occurrences/OccurrenceList';
import PostList from './components/Posts/PostList';
import EquipmentList from './components/Equipment/EquipmentList';
import ScaleList from './components/Scales/ScaleList';
import FinanceDashboard from './components/Finance/FinanceDashboard';
import VehicleList from './components/Vehicles/VehicleList';
import ReportGenerator from './components/Reports/ReportGenerator';
import UserManagement from './components/Users/UserManagement';
import { Login } from './components/Login';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription?.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Login onLoginSuccess={() => { }} />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rh" element={<VigilanteList />} />
          <Route path="/armas" element={<WeaponList />} />
          <Route path="/ocorrencias" element={<OccurrenceList />} />
          <Route path="/postos" element={<PostList />} />
          <Route path="/equipamentos" element={<EquipmentList />} />
          <Route path="/escalas" element={<ScaleList />} />
          <Route path="/financeiro" element={<FinanceDashboard />} />
          <Route path="/viaturas" element={<VehicleList />} />
          <Route path="/relatorios" element={<ReportGenerator />} />
          <Route path="/usuarios" element={<UserManagement />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
