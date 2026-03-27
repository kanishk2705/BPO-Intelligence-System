// client/src/pages/auth/ForgotPassword.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { KeyRound, ArrowLeft, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // BUG FIX: Make the redirect URL dynamic for production (Vercel/Render)
            const resetUrl = `${window.location.origin}/login`;

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: resetUrl, 
            });

            if (error) throw error;

            setIsSent(true);
            toast.success('Reset link sent to your email!');
        } catch (error) {
            toast.error(error.message || 'Failed to send reset email');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8">

                <div className="flex justify-center mb-6">
                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <KeyRound className="h-8 w-8" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Reset Password</h2>

                {!isSent ? (
                    <>
                        <p className="text-center text-slate-500 text-sm mb-8">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>

                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="h-5 w-5 absolute left-3 top-2.5 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="agent@bpo.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-sm disabled:opacity-70"
                            >
                                {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center space-y-4 mb-6">
                        <p className="text-emerald-600 font-medium bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                            Check your inbox! If an account exists for {email}, a reset link has been sent.
                        </p>
                    </div>
                )}

                <div className="mt-8 text-center">
                    <Link to="/login" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Login
                    </Link>
                </div>

            </div>
        </div>
    );
}