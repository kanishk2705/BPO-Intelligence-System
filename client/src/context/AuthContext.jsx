// client/src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { Loader2 } from 'lucide-react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        // Helper function to fetch role, preventing duplicate code
        const fetchRole = async (userId) => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', userId)
                    .single();

                if (error) throw error;
                if (mounted && data) setRole(data.role);
            } catch (err) {
                console.error("Auth Error (Fetching Role):", err.message);
                if (mounted) {
                    setUser(null);
                    setRole(null);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        // Get initial session
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                console.error("Session Error:", error);
                if (mounted) setLoading(false);
                return;
            }
            if (mounted && session) {
                setUser(session.user);
                fetchRole(session.user.id);
            } else if (mounted) {
                setLoading(false);
            }
        });

        // Listen for auth events (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (mounted && session) {
                // Only update and fetch if the user actually changed to avoid redundant network calls
                setUser(prevUser => {
                    if (prevUser?.id !== session.user.id) {
                        fetchRole(session.user.id);
                        return session.user;
                    }
                    return prevUser;
                });
            } else if (mounted && !session) {
                setUser(null);
                setRole(null);
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription?.unsubscribe();
        };
    }, []);

    const logout = async () => {
        setUser(null);
        setRole(null);
        // Using targeted removal is safer than clear() which might destroy app preferences/themes
        localStorage.removeItem('supabase.auth.token'); 
        
        await supabase.auth.signOut().catch(err => console.log("Ignored signout error", err));
        window.location.href = '/login';
    };

    // PERFORMANCE FIX: Memoize the value so it doesn't cause child re-renders unless state actually changes
    const value = useMemo(() => ({
        user,
        role,
        loading,
        logout
    }), [user, role, loading]);

    return (
        <AuthContext.Provider value={value}>
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