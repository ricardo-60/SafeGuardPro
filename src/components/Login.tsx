import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isLogin) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;
        onLoginSuccess();
      } else {
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (authError) throw authError;
        setSuccessMsg("Conta criada com sucesso! Verifique o seu e-mail para confirmar ou faça o login se não for necessário a verificação da conta.");
        setIsLogin(true); // Volta para o modo de login após o registo com sucesso
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/30">
              <Shield className="text-emerald-500 w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">SafeGuard Pro</h1>
            <p className="text-zinc-400 text-sm mt-1">{isLogin ? 'Gestão Operacional de Segurança' : 'Criar Nova Conta'}</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-start gap-3 text-sm animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl flex items-start gap-3 text-sm animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{successMsg}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-800/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Senha</label>
                {isLogin && <button type="button" className="text-xs text-emerald-500 hover:text-emerald-400 font-medium transition-colors">Esqueceu a senha?</button>}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-800/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-black font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-2 active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                isLogin ? 'Acessar Sistema' : 'Registar Conta'
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-zinc-500 text-sm">
              {isLogin ? (
                <>Não tem uma conta? <button type="button" onClick={() => setIsLogin(false)} className="text-emerald-500 hover:text-emerald-400 font-semibold transition-colors">Solicitar acesso</button></>
              ) : (
                <>Já tem uma conta? <button type="button" onClick={() => setIsLogin(true)} className="text-emerald-500 hover:text-emerald-400 font-semibold transition-colors">Entrar</button></>
              )}
            </p>
          </div>
        </div>

        <p className="text-center text-zinc-600 text-[10px] uppercase font-black tracking-widest mt-8">
          &copy; 2026 SafeGuard Pro. Desenvolvido por <span className="text-emerald-500">HR-TECNOLOGIA</span>
        </p>
      </motion.div>
    </div>
  );
};
