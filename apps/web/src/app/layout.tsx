'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import './globals.css';
import { 
  ShieldCheck, 
  FileText, 
  Bell, 
  LayoutDashboard, 
  LogIn, 
  LogOut, 
  Heart,
  MapPin,
  Menu,
  X
} from 'lucide-react';
import { HelpApi } from '../lib/api';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Initialize our hybrid database store in client
    HelpApi.init();

    // Check logged user session
    const checkSession = () => {
      const storedUser = sessionStorage.getItem('ayuda_usuario');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };

    checkSession();

    // Set up window listener for custom auth changes
    window.addEventListener('auth-change', checkSession);
    return () => window.removeEventListener('auth-change', checkSession);
  }, [pathname]);

  const handleLogout = () => {
    sessionStorage.removeItem('ayuda_usuario');
    sessionStorage.removeItem('ayuda_token');
    window.dispatchEvent(new Event('auth-change'));
    router.push('/');
  };

  const navLinks = [
    { href: '/centro-informacion', label: 'Centro de Información', icon: FileText },
    { href: '/ayuda', label: 'Ayuda Humanitaria', icon: Heart },
    { href: '/reportes', label: 'Reportes Ciudadanos', icon: MapPin },
  ];

  return (
    <html lang="es">
      <head>
        <title>Plataforma Nacional de Ayuda Humanitaria y Coordinación Interinstitucional</title>
        <meta name="description" content="Portal oficial para la articulación, reporte y verificación de ayuda humanitaria ante emergencias y desastres." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-[#c8a94c] selection:text-white antialiased">
        
        {/* Institutional Top Bar Banner */}
        <div className="bg-[#8d702a] text-amber-50 text-[10px] font-bold tracking-widest uppercase py-1.5 px-4 sm:px-6 flex justify-between items-center select-none">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Estado Plurinacional de Bolivia · Plataforma Oficial</span>
          </div>
          <div className="hidden sm:flex items-center gap-5">
            <span className="flex items-center gap-1.5">🏛️ Coordinación Interinstitucional de Emergencias</span>
            <span className="flex items-center gap-1">📞 <strong>122</strong> · 800-10-1111</span>
          </div>
        </div>

        {/* Global Navigation Header */}
        <header className="sticky top-0 z-40 bg-white/96 backdrop-blur-md border-b border-slate-200/80 shadow-[0_1px_0_rgba(0,0,0,.06)] transition-all duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            
            {/* Logo and Brand */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#c8a94c] flex items-center justify-center text-white shadow-md shadow-[#c8a94c]/30 group-hover:scale-105 transition-transform duration-200">
                <ShieldCheck className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors leading-none flex items-center gap-1">
                  AYUDA HUMANITARIA
                </h1>
                <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase block mt-1">
                  Coordinación de Emergencias
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'bg-amber-50 text-[#8d702a] font-bold border border-amber-200 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#c8a94c]' : 'text-slate-400'}`} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* User Session Action Area */}
            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-1.5 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-lg shadow-sm hover-lift transition-all"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Panel Control
                  </Link>
                  <div className="h-6 w-[1px] bg-slate-200"></div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#c8a94c]/20 flex items-center justify-center text-[#8d702a] font-bold text-xs shadow-sm">
                      {user.nombre.charAt(0)}
                    </div>
                    <div className="text-left select-none">
                      <p className="text-[11px] font-bold text-slate-800 leading-tight">{user.nombre}</p>
                      <p className="text-[9px] text-slate-500 font-medium">{user.rolId}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      title="Cerrar sesión"
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-all ml-1"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 text-xs font-bold text-[#8d702a] bg-amber-50 hover:bg-amber-100 border border-amber-200 px-4 py-2 rounded-lg shadow-sm hover-lift transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Acceso Institucional
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center gap-2">
              {user && (
                <div className="w-8 h-8 rounded-full bg-[#c8a94c]/20 flex items-center justify-center text-[#8d702a] font-bold text-xs">
                  {user.nombre.charAt(0)}
                </div>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 shadow-lg animate-slide-down">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-amber-50 text-[#8d702a] font-bold border border-amber-100'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-slate-400" />
                    {link.label}
                  </Link>
                );
              })}
              <div className="h-[1px] bg-slate-150 my-2"></div>
              {user ? (
                <div className="space-y-1">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-slate-900"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Panel de Administración
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-[#8d702a] bg-amber-50 justify-center border border-amber-200 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  Acceso Institucional
                </Link>
              )}
            </div>
          )}

        </header>

        {/* Main Content Area */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#c8a94c] flex items-center justify-center text-white font-bold text-sm">
                    AH
                  </div>
                  <span className="font-bold text-sm text-slate-800 tracking-wide uppercase">
                    Ayuda Humanitaria Bolivia
                  </span>
                </div>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                  Sistema gubernamental de articulación social e interinstitucional para la mitigación, atención y monitoreo transparente de recursos en crisis y catástrofes humanitarias.
                </p>
                <div className="text-xs text-slate-400 font-medium">
                  Ministerio de Defensa Civil • Viceministerio de Telecomunicaciones
                </div>
              </div>

              <div>
                <h4 className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-3">
                  Accesos Rápidos
                </h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link href="/centro-informacion" className="text-slate-500 hover:text-slate-900 transition-colors">Comunicados Oficiales</Link>
                  </li>
                  <li>
                    <Link href="/ayuda" className="text-slate-500 hover:text-slate-900 transition-colors">Solicitudes de Asistencia</Link>
                  </li>
                  <li>
                    <Link href="/reportes" className="text-slate-500 hover:text-slate-900 transition-colors">Reportes Ciudadanos</Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-3">
                  Seguridad y Control
                </h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link href="/login" className="text-slate-500 hover:text-slate-900 transition-colors">Acceso Restringido</Link>
                  </li>
                  <li>
                    <span className="text-emerald-600 flex items-center gap-1 font-semibold select-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      Canal Cifrado SSL
                    </span>
                  </li>
                  <li className="text-slate-400 font-mono text-[10px] mt-2">
                    Versión: 2026.1.4<br />
                    ORM: Prisma 5.10
                  </li>
                </ul>
              </div>

            </div>

            <div className="h-[1px] bg-slate-200 my-8"></div>

            <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
              <p>© {new Date().getFullYear()} Plataforma Nacional de Ayuda Humanitaria. Todos los derechos reservados.</p>
              <p className="flex items-center gap-4">
                <a href="#" className="hover:text-slate-600 transition-colors">Términos de Uso</a>
                <a href="#" className="hover:text-slate-600 transition-colors">Política de Datos Confidenciales</a>
              </p>
            </div>

          </div>
        </footer>

      </body>
    </html>
  );
}
