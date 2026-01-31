import React from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
                    {subtitle && <p className="mt-2 text-slate-600">{subtitle}</p>}
                </div>
                {children}
            </div>
        </div>
    );
};
