import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { UserRole, User } from '../types';
import { api } from '../lib/api';

type Company = {
    id: string;
    name: string;
    logo_url: string;
    watermark_url: string;
};

type AuthContextType = {
    user: SupabaseUser | null;
    userData: User | null;
    company: Company | null;
    role: UserRole | null;
    loading: boolean;
    hasRole: (roles: UserRole[]) => boolean;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    userData: null,
    company: null,
    role: null,
    loading: true,
    hasRole: () => false
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [userData, setUserData] = useState<User | null>(null);
    const [company, setCompany] = useState<Company | null>(null);
    const [role, setRole] = useState<UserRole | null>(null);
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
                        setRole(data.role as UserRole);
                        setCompany(data.companies as unknown as Company);

                        // Capture session metadata for security
                        api.updateUserSecurity(userId, {
                            last_login: new Date().toISOString(),
                            last_device: navigator.userAgent
                        });
                    } else {
                        setRole(null);
                        setCompany(null);
                    }
                }
            } catch (err) {
                console.error("Tenant fetch error", err);
            }
        };

        const safetyFallback = setTimeout(() => {
            if (mounted) {
                console.warn("[Auth] Timeout safety hit");
                setLoading(false);
            }
        }, 5000);

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
                if (mounted) {
                    setLoading(false);
                    clearTimeout(safetyFallback);
                }
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
            clearTimeout(safetyFallback);
            authListener.subscription.unsubscribe();
        };
    }, []);

    const hasRole = (roles: UserRole[]) => {
        if (!role) return false;
        return roles.includes(role);
    };

    return (
        <AuthContext.Provider value={{ user, userData, company, role, loading, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
