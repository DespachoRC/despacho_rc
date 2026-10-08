"use client";

import { LuShieldAlert, LuArrowLeft } from 'react-icons/lu';

export default function UnauthorizedPage() {
    const handleReturnToLogin = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch {
            // Ignorar error si no hay conexión
        } finally {
            window.location.href = '/auth/login';
        }
    };

    return (
        <div className="min-h-screen w-full bg-navy-950 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center gap-6">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-2">
                    <LuShieldAlert className="w-10 h-10" />
                </div>
                
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-navy-950 tracking-tight">Acceso Denegado</h1>
                    <p className="text-slate-500 font-medium">
                        No tienes los permisos necesarios para acceder a esta página o la ruta no corresponde a tu rol.
                    </p>
                </div>

                <div className="w-full pt-4">
                    <button 
                        onClick={handleReturnToLogin}
                        className="w-full flex items-center justify-center gap-2 bg-navy-600 hover:bg-navy-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 cursor-pointer"
                    >
                        <LuArrowLeft className="w-5 h-5" />
                        Regresar al inicio
                    </button>
                </div>
            </div>
        </div>
    );
}
