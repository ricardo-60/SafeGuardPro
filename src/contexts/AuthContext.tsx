import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

type Company = {
    id: string;
    name: string;
    logo_url: string;
    watermark_url: string;
};

type AuthContextType = {
    user: User | null;
    company: Company | null;
    role: string | null;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    company: null,
    role: null,
    loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [company, setCompany] = useState<Company | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const fetchTenantData = async (userId: string) => {
            try {
                const { data } = await supabase
                    .from('user_roles')
                    .select('role, company_id, companies(id, name, logo_url, watermark_url)')
                    .eq('user_id', userId)
                    .limit(1)
                    .maybeSingle();

                if (mounted) {
                    if (data) {
                        setRole(data.role);
                        setCompany(data.companies as unknown as Company);
                    } else {
                        setRole(null);
                        setCompany(null);
                    }
                }
            } catch (err) {
                console.error("Tenant fetch error", err);
            }
        };

        const initSession = async () => {
            try {
                if (mounted) setLoading(true);
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error("Auth verification error:", error);
                    return;
                }

                if (session?.user) {
                    if (mounted) setUser(session.user);
                    await fetchTenantData(session.user.id);
                } else {
                    if (mounted) {
                        setUser(null);
                        setCompany(null);
                        setRole(null);
                    }
                }
            } catch (err) {
                console.error("Session crash:", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            if (event === 'SIGNED_OUT' || !session) {
                setUser(null);
                setCompany(null);
                setRole(null);
                setLoading(false);
            } else if (event === 'SIGNED_IN') {
                setUser(session.user);
                await fetchTenantData(session.user.id);
                if (mounted) setLoading(false);
            } else if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
                // Do not trigger a full loading mask for silent refreshes
                setUser(session.user);
            }
        });

        return () => {
            mounted = false;
            authListener.subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, company, role, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
