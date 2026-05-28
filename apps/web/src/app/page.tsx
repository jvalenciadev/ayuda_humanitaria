'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Heart, 
  MapPin, 
  ArrowRight, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Search, 
  FileText
} from 'lucide-react';
import { HelpApi, AyudaHumanitaria, Reporte } from '../lib/api';

export default function Home() {
  const [ayudas, setAyudas] = useState<AyudaHumanitaria[]>([]);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [comunicados, setComunicados] = useState<any[]>([]);

  const [selectedDept, setSelectedDept] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    // Load local storage records
    HelpApi.init();
    setAyudas(HelpApi.getAyudas());
    setReportes(HelpApi.getReportes());
    setComunicados(HelpApi.getComunicados());
  }, []);

  // Department choices
  const depts = HelpApi.getDepartamentos();

  // Stats calculation
  const totalAyudas = ayudas.length;
  const pendingAyudas = ayudas.filter(a => a.estado === 'PENDIENTE').length;
  const verifiedReports = reportes.filter(r => r.estado === 'VERIFICADO').length;

  // Filtered lists for simple quick view
  const activeCriticalAlerts = ayudas
    .filter(a => a.urgencia === 'CRITICA' && a.estado !== 'ATENDIDO')
    .slice(0, 4);

  const recentBulletins = comunicados.slice(0, 2);

  return (
    <div className="animate-fade-in space-y-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-4">
      
      {/* 1. Hero Dynamic Visual Panel - Clear/Light Theme */}
      <section className="relative overflow-hidden rounded-[2rem] shadow-sm bg-gradient-to-br from-amber-50/70 via-slate-50 to-blue-50/70 border border-slate-200/80 py-16 px-6 sm:px-10 lg:px-12">
        {/* Soft Background Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(200,169,76,0.1),transparent_70%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(59,130,246,0.05),transparent_60%)] pointer-events-none"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          <div className="lg:col-span-8 space-y-6 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c8a94c]/10 border border-[#c8a94c]/30 text-xs font-bold text-[#8d702a] uppercase tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5" />
              Portal de Seguridad Civil Institucional
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-slate-900">
              Plataforma Nacional de <br />
              <span className="text-[#a48227]">Ayuda Humanitaria</span> y Coordinación
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Herramienta oficial de articulación, registro de asistencia y verificación de reportes de incidentes en campo ante emergencias y situaciones críticas nacionales.
            </p>
            
            {/* Quick search input */}
            <div className="flex flex-col sm:flex-row items-center gap-3 max-w-xl mx-auto lg:mx-0">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar solicitudes de ayuda o reportes ciudadanos..."
                  className="w-full bg-white/90 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Link
                href={`/ayuda?search=${searchQuery}`}
                className="w-full sm:w-auto bg-[#c8a94c] hover:bg-[#b09139] text-white font-bold py-3 px-6 rounded-xl text-xs tracking-wider uppercase transition-colors shrink-0 text-center shadow-md shadow-[#c8a94c]/20"
              >
                Buscar
              </Link>
            </div>
          </div>

          {/* Quick submission shortcuts card */}
          <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Acciones Inmediatas
            </h3>
            
            <Link
              href="/ayuda"
              className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-100 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Heart className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-emerald-800">Solicitar Ayuda</p>
                  <p className="text-[10px] text-slate-500">Medicinas, agua, alimentos</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/reportes"
              className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50 hover:bg-blue-100/70 border border-blue-100 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-blue-800">Enviar Reporte Ciudadano</p>
                  <p className="text-[10px] text-slate-500">Videos, fotos y evidencias</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </section>

      {/* 2. Quick Department Selection Grid */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                : 'bg-slate-50 text-slate-650 hover:bg-slate-100'
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
                  : 'bg-slate-50 text-slate-650 hover:bg-slate-100'
              }`}
            >
              {d.nombre}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Executive Statistics Cards Grid - Rebalanced to 2 columns */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Help Requests */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-all flex items-start justify-between group">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Solicitudes de Ayuda Registradas
            </span>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {selectedDept === 'TODOS' ? totalAyudas : ayudas.filter(a => a.departamentoId === selectedDept).length}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>
                <strong className="text-slate-800">
                  {selectedDept === 'TODOS' ? pendingAyudas : ayudas.filter(a => a.departamentoId === selectedDept && a.estado === 'PENDIENTE').length}
                </strong> pendientes de atención
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform border border-emerald-100">
            <Heart className="w-6 h-6 stroke-[1.8]" />
          </div>
        </div>

        {/* Card 2: Verified Citizen Info */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-all flex items-start justify-between group">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Reportes de Incidentes Ciudadanos
            </span>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {selectedDept === 'TODOS' ? reportes.length : reportes.filter(r => r.departamentoId === selectedDept).length}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <TrendingUp className="w-3.5 h-3.5 text-purple-650" />
              <span>
                <strong className="text-slate-800">
                  {selectedDept === 'TODOS' ? verifiedReports : reportes.filter(r => r.departamentoId === selectedDept && r.estado === 'VERIFICADO').length}
                </strong> validados por moderación
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform border border-purple-100">
            <FileText className="w-6 h-6 stroke-[1.8]" />
          </div>
        </div>

      </section>

      {/* 4. Critical Alerts & Info Panels */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Urgencia Critica Help Requests (Fuller list) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeCriticalAlerts.length > 0 ? (
              activeCriticalAlerts.map(a => (
                <div 
                  key={a.id} 
                  className="p-4 rounded-xl border border-amber-100 bg-amber-50/20 flex flex-col justify-between gap-3 shadow-inner"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
                      {a.tipologia}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Hace {Math.round((Date.now() - new Date(a.createdAt).getTime()) / 3600000) || 1} horas
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 leading-relaxed min-h-[40px]">
                    "{a.descripcion}"
                  </p>
                  <div className="text-[10px] text-slate-500 border-t border-slate-100/60 pt-2 space-y-0.5">
                    <p>Solicita: <strong className="text-slate-800">{a.solicitante}</strong></p>
                    <p>Contacto: <strong className="text-slate-800">{a.contacto}</strong></p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs col-span-2">
                No se reportan solicitudes de ayuda críticas activas en este momento.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Platform instructions & Emergency Guide */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Guía de Ayuda Rápida
            </h3>
            <h4 className="text-sm font-extrabold text-slate-800">
              ¿Cómo funciona la plataforma?
            </h4>
            <ul className="space-y-3 text-xs text-slate-650">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 text-[10px] font-bold border border-blue-100">1</span>
                <span><strong>Reporta Incidentes:</strong> Envía detalles y evidencia multimedia sobre eventos en tu comunidad.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 text-[10px] font-bold border border-blue-100">2</span>
                <span><strong>Solicita Ayuda:</strong> Si necesitas provisiones o atención urgente, crea una solicitud.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 text-[10px] font-bold border border-blue-100">3</span>
                <span><strong>Validación Civil:</strong> Servidores públicos validan cada reporte antes de canalizar la ayuda oficial.</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-[#c8a94c]/10 border border-[#c8a94c]/20 p-4 rounded-xl mt-6">
            <p className="text-[11px] font-bold text-[#8d702a] uppercase tracking-wider mb-1">
              Línea Gratuita de Emergencias
            </p>
            <p className="text-xs text-slate-700 font-semibold leading-relaxed">
              Comunícate directamente con Defensa Civil al <strong>122</strong> para reportes que requieran rescate inmediato o asistencia crítica en tiempo real.
            </p>
          </div>
        </div>

      </section>

      {/* 5. Official News Center (Centro de Comunicados) */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
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
              <p className="text-xs text-slate-650 line-clamp-3 leading-relaxed">
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
      </section>

    </div>
  );
}
