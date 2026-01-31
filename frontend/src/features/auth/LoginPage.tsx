import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AuthLayout } from '../../components/AuthLayout';
import { useNavigate, Link } from 'react-router-dom';

export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            navigate('/');
        }
    };

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Connect with your narrative intelligence"
        >
            <form onSubmit={handleLogin} className="mt-8 space-y-6">
                {error && (
                    <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100">
                        {error}
                    </div>
                )}
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700">Email Address</label>
                        <input
                            type="email"
                            required
                            className="mt-1 block w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700">Password</label>
                        <input
                            type="password"
                            required
                            className="mt-1 block w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                    {loading ? 'Entering...' : 'Enter Story Engine'}
                </button>

                <p className="text-center text-sm text-slate-600">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-indigo-600 font-medium hover:underline">
                        Begin your journey
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
};
