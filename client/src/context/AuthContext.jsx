import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Loader2 } from 'lucide-react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) throw error;

                if (session) {
                    setUser(session.user);
                    const { data, error: roleError } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', session.user.id)
                        .single();

                    if (roleError) throw roleError;
                    if (data) setRole(data.role);
                }
            } catch (err) {
                console.error("Auth Error:", err.message || err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session) {
                setUser(session.user);
                const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
                if (data) setRole(data.role);
            } else {
                setUser(null);
                setRole(null);
            }
            if (mounted) setLoading(false);
        });

        return () => {
            mounted = false;
            subscription?.unsubscribe();
        };
    }, []);

    // --- THE BULLETPROOF LOGOUT ---
    // --- THE TRUE INSTANT LOGOUT ---
    const logout = () => {
        // 1. Instantly clear the browser (No waiting!)
        setUser(null);
        setRole(null);
        localStorage.clear();
        sessionStorage.clear();

        // 2. Tell Supabase to sign out, but DO NOT wait for it (Fire and forget)
        supabase.auth.signOut().catch(err => console.log("Ignored background signout error", err));

        // 3. Force instant redirect
        window.location.href = '/login';
    };
    return (
        <AuthContext.Provider value={{ user, role, loading, logout }}>
            {loading ? (
                <div className="flex h-screen items-center justify-center bg-slate-50">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);