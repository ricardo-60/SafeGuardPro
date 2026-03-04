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

        const initializeAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;

                if (session?.user) {
                    if (mounted) setUser(session.user);
                    await fetchTenant(session.user.id);
                } else {
                    if (mounted) {
                        setUser(null);
                        setCompany(null);
                        setRole(null);
                        setLoading(false);
                    }
                }
            } catch (err) {
                console.error("Error getting session:", err);
                if (mounted) setLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!mounted) return;

            if (session?.user) {
                setUser(session.user);
                await fetchTenant(session.user.id);
            } else {
                setUser(null);
                setCompany(null);
                setRole(null);
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const fetchTenant = async (userId: string) => {
        try {
            // Fetch user role and company
            const { data: roleData, error: roleError } = await supabase
                .from('user_roles')
                .select('role, company_id, companies(id, name, logo_url, watermark_url)')
                .eq('user_id', userId)
                .limit(1)
                .maybeSingle();

            if (roleData) {
                setRole(roleData.role);
                setCompany(roleData.companies as unknown as Company);
            } else {
                setCompany(null);
                setRole(null);
            }
        } catch (e) {
            console.error('Error fetching tenant:', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, company, role, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
