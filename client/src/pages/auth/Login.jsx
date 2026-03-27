// client/src/pages/auth/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import toast, { Toaster } from 'react-hot-toast';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // 1. Authenticate with Supabase
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            // 2. Fetch the user's role
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', authData.user.id)
                .single();

            // BUG FIX: Prevent the "Limbo" state. If profile fetch fails, log them out immediately!
            if (profileError || !profileData) {
                await supabase.auth.signOut();
                throw new Error('Could not verify user role. Contact Admin.');
            }

            toast.success('Login Successful!');
            const userRole = profileData.role;

            // BUG FIX: Removed the 1-second setTimeout. Modern apps should navigate instantly.
            // Your AuthContext and ProtectedRoutes will handle any micro-loading states.
            if (userRole === 'admin') navigate('/admin');
            else if (userRole === 'lead') navigate('/lead');
            else navigate('/agent');

        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            {/* Note: If you have a <Toaster /> in App.jsx, you can remove this one to prevent double toasts! */}
            <Toaster position="top-center" reverseOrder={false} />

            <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <img src="/logo.jpg" alt="BPO Portal Logo" className="h-16 w-auto object-contain" />
                    </div>
                    <p className="text-gray-500 mt-2">Sign in to your account</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input
                            type="email"
                            required
                            className="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center">
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                                Forgot password?
                            </Link>
                        </div>
                        <input
                            type="password"
                            required
                            className="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}