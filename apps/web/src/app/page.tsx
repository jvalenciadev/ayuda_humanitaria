'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Users, 
  Heart, 
  Activity, 
  MapPin, 
  ArrowRight, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Search, 
  CheckCircle2,
  FileText
} from 'lucide-react';
import { HelpApi, Organizacion, AyudaHumanitaria, Hospital, Reporte } from '../lib/api';

export default function Home() {
  const [orgs, setOrgs] = useState<Organizacion[]>([]);
  const [ayudas, setAyudas] = useState<AyudaHumanitaria[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [comunicados, setComunicados] = useState<any[]>([]);

  const [selectedDept, setSelectedDept] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    // Load local storage records
    HelpApi.init();
    setOrgs(HelpApi.getOrganizaciones());
    setAyudas(HelpApi.getAyudas());
    setHospitals(HelpApi.getHospitales());
    setReportes(HelpApi.getReportes());
    setComunicados(HelpApi.getComunicados());
  }, []);

  // Department choices
  const depts = HelpApi.getDepartamentos();

  // Stats calculation
  const totalOrgs = orgs.length;
  const verifiedOrgs = orgs.filter(o => o.verificado).length;
  
  const totalAyudas = ayudas.length;
  const pendingAyudas = ayudas.filter(a => a.estado === 'PENDIENTE').length;
  const criticalAyudas = ayudas.filter(a => a.urgencia === 'CRITICA' && a.estado !== 'ATENDIDO').length;

  const totalHospReported = hospitals.length;
  const criticalHospitals = hospitals.filter(h => h.oxigenoDisponibilidad === 'CRITICO' || h.oxigenoDisponibilidad === 'AGOTADO').length;

  const verifiedReports = reportes.filter(r => r.estado === 'VERIFICADO').length;

  // Filtered lists for simple quick view
  const activeCriticalAlerts = ayudas
    .filter(a => a.urgencia === 'CRITICA' && a.estado !== 'ATENDIDO')
    .slice(0, 3);

  const activeCriticalHospitals = hospitals
    .filter(h => h.oxigenoDisponibilidad === 'CRITICO' || h.oxigenoDisponibilidad === 'AGOTADO')
    .slice(0, 3);

  const recentBulletins = comunicados.slice(0, 2);

  return (
    <div className="animate-fade-in space-y-8 pb-16">
      
      {/* 1. Hero Dynamic Visual Panel */}
      <section className="relative text-white overflow-hidden rounded-b-[2rem] shadow-xl bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 py-16 px-4 sm:px-6 lg:px-8 border-b border-blue-800">
        
        {/* Abstract Background Design */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.1),transparent)] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          <div className="lg:col-span-8 space-y-6 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-semibold text-blue-300 uppercase tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5" />
              Portal de Seguridad Civil Institucional
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Plataforma Nacional de <br />
              <span className="text-blue-400">Ayuda Humanitaria</span> y Coordinación
            </h1>
            <p className="text-sm sm:text-base text-slate-350 max-w-2xl leading-relaxed">
              Herramienta oficial de articulación, verificación en campo y visualización de recursos logísticos y de salud ante catástrofes, desastres naturales o situaciones críticas nacionales.
            </p>
            
            {/* Quick search input */}
            <div className="flex flex-col sm:flex-row items-center gap-3 max-w-xl mx-auto lg:mx-0">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar organizaciones, reportes de oxígeno o solicitudes de ayuda..."
                  className="w-full bg-slate-950/40 border border-slate-700/80 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 backdrop-blur"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Link
                href={`/ayuda?search=${searchQuery}`}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl text-xs tracking-wider uppercase transition-colors shrink-0 text-center"
              >
                Buscar
              </Link>
            </div>
          </div>

          {/* Quick submission shortcuts card */}
          <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Acciones Inmediatas
            </h3>
            
            <Link
              href="/ayuda"
              className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300">
                  <Heart className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-emerald-300">Solicitar Ayuda</p>
                  <p className="text-[10px] text-slate-350">Medicinas, oxígeno, alimentos</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/reportes"
              className="flex items-center justify-between p-3.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/25 border border-blue-500/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-300">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-blue-300">Enviar Reporte Ciudadano</p>
                  <p className="text-[10px] text-slate-350">Videos, fotos y evidencias</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/organizaciones"
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-500/10 hover:bg-slate-500/25 border border-slate-500/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-500/20 flex items-center justify-center text-slate-300">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-350">Registrar Organización</p>
                  <p className="text-[10px] text-slate-400">Sumar voluntariado o logística</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </section>

      {/* 2. Quick Department Selection Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Filtro Geográfico Inmediato
              </h3>
              <p className="text-sm font-extrabold text-slate-800">
                Visualizar indicadores por Departamento de Bolivia
              </p>
            </div>
            {selectedDept !== 'TODOS' && (
              <button
                onClick={() => setSelectedDept('TODOS')}
                className="text-xs font-bold text-blue-600 hover:text-blue-500 transition-colors"
              >
                Limpiar Filtro
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedDept('TODOS')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedDept === 'TODOS'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Todo el País
            </button>
            {depts.map(d => (
              <button
                key={d.id}
                onClick={() => setSelectedDept(d.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedDept === d.id
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {d.nombre}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Executive Statistics Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Organizations */}
          <div className="card-gradient-blue border border-blue-100 rounded-2xl p-6 glow-blue hover-lift flex items-start justify-between relative overflow-hidden group transition-all">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                Organizaciones Activas
              </span>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {selectedDept === 'TODOS' ? totalOrgs : orgs.filter(o => o.departamentoId === selectedDept).length}
              </p>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-650">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{selectedDept === 'TODOS' ? verifiedOrgs : orgs.filter(o => o.departamentoId === selectedDept && o.verificado).length} verificadas</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 stroke-[1.8]" />
            </div>
          </div>

          {/* Card 2: Help Requests */}
          <div className="card-gradient-green border border-emerald-100 rounded-2xl p-6 glow-emerald hover-lift flex items-start justify-between relative overflow-hidden group transition-all">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                Solicitudes de Ayuda
              </span>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {selectedDept === 'TODOS' ? totalAyudas : ayudas.filter(a => a.departamentoId === selectedDept).length}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-650">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>{selectedDept === 'TODOS' ? pendingAyudas : ayudas.filter(a => a.departamentoId === selectedDept && a.estado === 'PENDIENTE').length} pendientes</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <Heart className="w-6 h-6 stroke-[1.8]" />
            </div>
          </div>

          {/* Card 3: Hospital Status */}
          <div className="card-gradient-red border border-rose-100 rounded-2xl p-6 glow-rose hover-lift flex items-start justify-between relative overflow-hidden group transition-all">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                Establecimientos Monitor
              </span>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {selectedDept === 'TODOS' ? totalHospReported : hospitals.filter(h => h.departamentoId === selectedDept).length}
              </p>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-700">
                <AlertTriangle className="w-3.5 h-3.5 stroke-[2] text-rose-600 animate-pulse" />
                <span>{selectedDept === 'TODOS' ? criticalHospitals : hospitals.filter(h => h.departamentoId === selectedDept && (h.oxigenoDisponibilidad === 'CRITICO' || h.oxigenoDisponibilidad === 'AGOTADO')).length} en alerta crítica</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6 stroke-[1.8]" />
            </div>
          </div>

          {/* Card 4: Verified Citizen Info */}
          <div className="card-gradient-purple border border-purple-100 rounded-2xl p-6 glow-purple hover-lift flex items-start justify-between relative overflow-hidden group transition-all">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                Reportes Ciudadanos
              </span>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {selectedDept === 'TODOS' ? reportes.length : reportes.filter(r => r.departamentoId === selectedDept).length}
              </p>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-purple-700">
                <TrendingUp className="w-3.5 h-3.5 text-purple-650" />
                <span>{selectedDept === 'TODOS' ? verifiedReports : reportes.filter(r => r.departamentoId === selectedDept && r.estado === 'VERIFICADO').length} validados por moderación</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 stroke-[1.8]" />
            </div>
          </div>

        </div>
      </section>

      {/* 4. Critical Alerts & Hospital Oxygen Monitor Panels */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Hospital Oxygen Emergencies */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-600 animate-pulse" />
              <h2 className="text-sm font-extrabold text-slate-800">
                Monitor Crítico de Oxígeno y Camas
              </h2>
            </div>
            <Link
              href="/hospitales"
              className="text-xs font-bold text-blue-600 hover:text-blue-500 transition-colors flex items-center gap-0.5"
            >
              Ver todos
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {activeCriticalHospitals.length > 0 ? (
              activeCriticalHospitals.map(h => (
                <div 
                  key={h.id} 
                  className="p-4 rounded-xl border border-rose-100 bg-rose-50/50 flex flex-col sm:flex-row justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                      <p className="text-xs font-bold text-slate-900">{h.nombre}</p>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Departamento: {HelpApi.getDepartamentos().find(d => d.id === h.departamentoId)?.nombre || h.departamentoId}
                    </p>
                    <p className="text-[11px] text-slate-650">
                      Responsable: {h.responsableNombre} ({h.responsableContacto})
                    </p>
                  </div>
                  <div className="sm:text-right shrink-0 flex flex-col justify-center">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 uppercase tracking-wide inline-block w-fit sm:ml-auto">
                      Oxígeno: {h.oxigenoDisponibilidad}
                    </span>
                    <span className="text-[10px] text-rose-600 font-bold mt-1">
                      Camas libres: {h.camasLibres}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                No se reportan hospitales en estado crítico de oxígeno actualmente.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Urgencia Critica Help Requests */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="text-sm font-extrabold text-slate-800">
                Alertas Humanitarias Críticas Activas
              </h2>
            </div>
            <Link
              href="/ayuda"
              className="text-xs font-bold text-blue-600 hover:text-blue-500 transition-colors flex items-center gap-0.5"
            >
              Ver todas
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {activeCriticalAlerts.length > 0 ? (
              activeCriticalAlerts.map(a => (
                <div 
                  key={a.id} 
                  className="p-4 rounded-xl border border-amber-100 bg-amber-50/40 flex flex-col justify-between gap-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
                      {a.tipologia}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Hace {Math.round((Date.now() - new Date(a.createdAt).getTime()) / 3600000) || 1} horas
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 leading-relaxed">
                    "{a.descripcion}"
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 border-t border-slate-100 pt-2">
                    <span>Solicita: <strong className="text-slate-800">{a.solicitante}</strong></span>
                    <span>Contacto: <strong className="text-slate-800">{a.contacto}</strong></span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                No se reportan solicitudes de ayuda críticas activas en este momento.
              </div>
            )}
          </div>
        </div>

      </section>

      {/* 5. Official News Center (Centro de Comunicados) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                Información Oficial Institucional
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1">
                Centro de Comunicados del Estado
              </h2>
            </div>
            <Link
              href="/centro-informacion"
              className="text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/50 px-4.5 py-2.5 rounded-xl transition-all"
            >
              Centro de Noticias
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {recentBulletins.map(com => (
              <div key={com.id} className="space-y-4 text-left">
                <span className="inline-block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Publicado por: {com.fuente}
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 hover:text-blue-700 transition-colors leading-snug">
                  {com.titulo}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {com.contenido}
                </p>
                <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-2">
                  <span>{new Date(com.fechaHora).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <span>•</span>
                  <span>Verificado</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
