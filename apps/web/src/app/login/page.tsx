'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, LogIn, Key, Mail, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Simple role dispatcher for demo and localStorage persistent audit trail
    setTimeout(() => {
      let role = '';
      let nombre = '';

      if (email === 'admin@humanitaria.gob.bo' && password === 'admin123') {
        role = 'SUPER_ADMIN';
        nombre = 'Ing. Alejandro Vargas';
      } else if (email === 'moderador@humanitaria.gob.bo' && password === 'mod123') {
        role = 'MODERATOR';
        nombre = 'Lic. Claudia Mendoza';
      } else if (email === 'verificador@humanitaria.gob.bo' && password === 'verifier123') {
        role = 'VERIFIER';
        nombre = 'Dr. Fernando Rios';
      } else {
        setError('Credenciales institucionales incorrectas o cuenta inhabilitada.');
        setLoading(false);
        return;
      }

      const mockUser = {
        id: `user-${role.toLowerCase()}`,
        nombre,
        email,
        rolId: role,
      };

      sessionStorage.setItem('ayuda_usuario', JSON.stringify(mockUser));
      sessionStorage.setItem('ayuda_token', 'jwt_mock_token_key_2026_institucional');
      
      // Dispatch custom event to notify RootLayout
      window.dispatchEvent(new Event('auth-change'));
      
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full bg-white border border-slate-200 p-8 rounded-2xl shadow-xl space-y-6 text-left animate-fade-in">
        
        {/* Brand Shield */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-700 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
            <ShieldCheck className="w-7 h-7 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 leading-none">
              Acceso de Servidores Públicos
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">
              Coordinación y Moderación Gubernamental
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 flex items-center gap-2.5 text-xs text-rose-700 font-semibold leading-snug">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-650" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Correo Electrónico Institucional
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="ejemplo@humanitaria.gob.bo"
                className="w-full bg-slate-50 border border-slate-250 rounded-xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Clave de Firma Digital / Contraseña
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                className="w-full bg-slate-50 border border-slate-250 rounded-xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-600 text-white font-bold tracking-wider uppercase py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 hover-lift transition-all disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Firmando credencial...' : 'Ingresar al Servidor'}
          </button>
        </form>

        <div className="border-t border-slate-100 pt-4 text-center">
          <p className="text-[10px] text-slate-400 leading-relaxed max-w-xs mx-auto">
            Este canal está protegido con encriptación bcrypt y monitoreado bajo registro IP del Viceministerio de Defensa Civil de Bolivia.
          </p>
          
          <div className="mt-3 p-3 bg-slate-50 rounded-xl text-[10px] text-slate-500 text-left space-y-1 border border-slate-150">
            <p className="font-bold text-slate-650">Credenciales de Demostración:</p>
            <p>• Super Admin: <span className="font-mono">admin@humanitaria.gob.bo</span> / <span className="font-mono">admin123</span></p>
            <p>• Moderador: <span className="font-mono">moderador@humanitaria.gob.bo</span> / <span className="font-mono">mod123</span></p>
            <p>• Verificador: <span className="font-mono">verificador@humanitaria.gob.bo</span> / <span className="font-mono">verifier123</span></p>
          </div>
        </div>

      </div>
    </div>
  );
}
