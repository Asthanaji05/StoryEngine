import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Shield, Mail, Calendar } from 'lucide-react';

export const ProfilePage: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const getSession = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getSession();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                        S
                    </div>
                    <span className="font-bold text-slate-800 tracking-tight">Story Engine</span>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                >
                    Back to Dashboard
                </button>
            </header>

            <main className="flex-1 flex flex-col items-center py-20 px-4">
                <div className="w-full max-w-2xl bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                    {/* Cover Section */}
                    <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-500 relative">
                        <div className="absolute -bottom-12 left-12 w-24 h-24 bg-white rounded-3xl p-1.5 shadow-lg">
                            <div className="w-full h-full bg-slate-100 rounded-[1.25rem] flex items-center justify-center text-slate-400">
                                <User className="w-10 h-10" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-16 pb-12 px-12 space-y-8">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{user.email?.split('@')[0]}</h1>
                            <p className="text-sm text-slate-500 mt-1 uppercase font-semibold tracking-wider">Master Storyteller</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Mail className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Email</span>
                                </div>
                                <p className="text-sm font-semibold text-slate-700">{user.email}</p>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Joined</span>
                                </div>
                                <p className="text-sm font-semibold text-slate-700">
                                    {new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                                <Shield className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Verified Account</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-6 py-3 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-all text-sm font-bold uppercase tracking-widest"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout Session
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex items-center gap-2 text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Story Engine v2.0 // Intelligent Narrative Platform</span>
                </div>
            </main>
        </div>
    );
};
