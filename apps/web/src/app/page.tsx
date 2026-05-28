'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck, Heart, MapPin, ArrowRight, AlertTriangle,
  Clock, TrendingUp, Search, FileText, CheckCircle2,
  Plane, Activity, Bell, ChevronRight, Zap
} from 'lucide-react';
import { HelpApi, AyudaHumanitaria, Reporte } from '../lib/api';

const URGENCY_META: Record<string, { label: string; color: string; dot: string; ring: string }> = {
  CRITICA:   { label: 'Crítica', color: 'text-rose-700 bg-rose-50 border-rose-200',    dot: 'bg-rose-500',   ring: 'border-rose-200' },
  ALTA:      { label: 'Alta',    color: 'text-amber-700 bg-amber-50 border-amber-200', dot: 'bg-amber-500',  ring: 'border-amber-200' },
  MEDIA:     { label: 'Media',   color: 'text-blue-700 bg-blue-50 border-blue-200',    dot: 'bg-blue-400',   ring: 'border-blue-100' },
  BAJA:      { label: 'Baja',    color: 'text-slate-600 bg-slate-100 border-slate-200', dot: 'bg-slate-400', ring: 'border-slate-100' },
};

const ESTADO_META: Record<string, { label: string; color: string }> = {
  PENDIENTE:  { label: 'Pendiente',  color: 'text-amber-700 bg-amber-50 border-amber-200'   },
  EN_PROCESO: { label: 'En Proceso', color: 'text-blue-700 bg-blue-50 border-blue-200'      },
  ATENDIDO:   { label: 'Atendido',   color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  RECHAZADO:  { label: 'Rechazado', color: 'text-rose-700 bg-rose-50 border-rose-200'       },
};

const TIPO_META: Record<string, string> = {
  MEDICAMENTOS:      '💊',
  OXIGENO:           '🫁',
  ALIMENTOS:         '🍱',
  TRANSPORTE:        '🚛',
  REFUGIO:           '⛺',
  DONACIONES:        '📦',
  RESCATE_ANIMAL:    '🐾',
  APOYO_PSICOLOGICO: '🧠',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (h >= 24) return `Hace ${Math.floor(h / 24)}d`;
  if (h >= 1) return `Hace ${h}h`;
  if (m >= 1) return `Hace ${m}m`;
  return 'Ahora mismo';
}

export default function Home() {
  const [ayudas, setAyudas] = useState<AyudaHumanitaria[]>([]);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [comunicados, setComunicados] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  useEffect(() => {
    HelpApi.init();
    setAyudas(HelpApi.getAyudas());
    setReportes(HelpApi.getReportes());
    setComunicados(HelpApi.getComunicados());
  }, []);

  const depts = HelpApi.getDepartamentos();

  const totalAyudas    = ayudas.length;
  const pendingAyudas  = ayudas.filter(a => a.estado === 'PENDIENTE').length;
  const criticalAyudas = ayudas.filter(a => a.urgencia === 'CRITICA' && a.estado !== 'ATENDIDO').length;
  const verifiedReports = reportes.filter(r => r.estado === 'VERIFICADO').length;
  const inRevisionReports = reportes.filter(r => r.estado === 'EN_REVISION').length;

  const filteredAyudas = ayudas
    .filter(a => selectedDept === 'TODOS' || a.departamentoId === selectedDept)
    .filter(a => activeFilter === 'ALL' || a.urgencia === activeFilter)
    .filter(a =>
      searchQuery === '' ||
      a.solicitante.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const criticalAlerts = ayudas.filter(a => a.urgencia === 'CRITICA' && a.estado !== 'ATENDIDO').slice(0, 4);

  return (
    <div className="animate-fade-in">

      {/* ═══════════════════════════════════════════════════
          HERO — Mesh gradient, light institutional tone
      ═══════════════════════════════════════════════════ */}
      <section className="hero-mesh bg-gradient-to-br from-slate-50 via-white to-amber-50/40 border-b border-slate-200/60 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

            {/* Left: Branding + Search */}
            <div className="lg:col-span-7 space-y-6 opacity-0 animate-fade-in" style={{ animationDelay: '0.05s', animationFillMode: 'forwards' }}>
              
              {/* Live Status Chip */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                  Sistema en Operación · 24/7
                </span>
              </div>

              <div className="space-y-3">
                <p className="section-label">Portal Nacional · Estado Plurinacional de Bolivia</p>
                <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight text-slate-900">
                  Plataforma de{' '}
                  <span className="text-gradient-gold">Ayuda Humanitaria</span>
                  <br />y Coordinación Civil
                </h1>
                <p className="text-sm text-slate-500 max-w-2xl leading-relaxed font-medium">
                  Sistema oficial de articulación interinstitucional, registro de solicitudes de emergencia,
                  verificación ciudadana de incidentes y visualización logística en tiempo real.
                </p>
              </div>

              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-2.5 max-w-2xl">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar solicitudes, reportes o municipios..."
                    className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 shadow-sm focus:border-[#c8a94c] focus:ring-0 transition-colors"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <Link
                  href={`/ayuda?search=${searchQuery}`}
                  className="flex items-center justify-center gap-1.5 bg-[#c8a94c] hover:bg-[#b09139] text-white font-bold py-3 px-6 rounded-xl text-xs tracking-wider uppercase transition-colors shadow-md shadow-[#c8a94c]/20 whitespace-nowrap"
                >
                  <Search className="w-3.5 h-3.5" />
                  Buscar
                </Link>
              </div>

              {/* Quick Stat Pills */}
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: '🔴', label: `${criticalAyudas} alertas críticas` },
                  { icon: '⏳', label: `${pendingAyudas} pendientes` },
                  { icon: '✅', label: `${verifiedReports} reportes verificados` },
                ].map((pill, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 shadow-sm">
                    <span>{pill.icon}</span>
                    {pill.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Action Cards */}
            <div className="lg:col-span-5 opacity-0 animate-fade-in delay-200" style={{ animationFillMode: 'forwards' }}>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Acciones Inmediatas</h3>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
                </div>

                {[
                  {
                    href: '/ayuda',
                    icon: <Heart className="w-4 h-4" />,
                    color: 'bg-rose-50 border-rose-100 text-rose-700',
                    iconBg: 'bg-rose-100',
                    title: 'Solicitar Asistencia',
                    sub: 'Medicamentos, oxígeno, alimentos, refugio'
                  },
                  {
                    href: '/reportes',
                    icon: <MapPin className="w-4 h-4" />,
                    color: 'bg-blue-50 border-blue-100 text-blue-700',
                    iconBg: 'bg-blue-100',
                    title: 'Enviar Reporte Ciudadano',
                    sub: 'Incidentes, deslizamientos, inundaciones'
                  },
                  {
                    href: '/centro-informacion',
                    icon: <Bell className="w-4 h-4" />,
                    color: 'bg-amber-50 border-amber-100 text-amber-700',
                    iconBg: 'bg-amber-100',
                    title: 'Ver Boletines Oficiales',
                    sub: 'Comunicados ministeriales y puentes aéreos'
                  },
                ].map((a, i) => (
                  <Link
                    key={i}
                    href={a.href}
                    className={`flex items-center justify-between p-3.5 rounded-xl border hover:scale-[1.01] transition-all group ${a.color}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${a.iconBg}`}>
                        {a.icon}
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold leading-tight">{a.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{a.sub}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ═══════════════════════════════════════════════════
            KPI METRIC CARDS
        ═══════════════════════════════════════════════════ */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Solicitudes Registradas',
              value: totalAyudas,
              sub: `${pendingAyudas} pendientes de atención`,
              icon: <Heart className="w-5 h-5" />,
              iconClass: 'text-rose-600 bg-rose-50 border-rose-100',
              accent: 'stat-card-rose',
              trend: '+3 hoy'
            },
            {
              label: 'Alertas Críticas Activas',
              value: criticalAyudas,
              sub: 'Requieren atención inmediata',
              icon: <Zap className="w-5 h-5" />,
              iconClass: 'text-amber-600 bg-amber-50 border-amber-100',
              accent: 'stat-card-gold',
              trend: 'Tiempo real'
            },
            {
              label: 'Reportes Ciudadanos',
              value: reportes.length,
              sub: `${verifiedReports} verificados · ${inRevisionReports} en revisión`,
              icon: <FileText className="w-5 h-5" />,
              iconClass: 'text-purple-600 bg-purple-50 border-purple-100',
              accent: 'stat-card-blue',
              trend: `${inRevisionReports} en revisión`
            },
            {
              label: 'Comunicados Oficiales',
              value: comunicados.length,
              sub: 'Fuentes ministeriales verificadas',
              icon: <CheckCircle2 className="w-5 h-5" />,
              iconClass: 'text-emerald-600 bg-emerald-50 border-emerald-100',
              accent: 'stat-card-green',
              trend: 'Actualizado'
            },
          ].map((kpi, i) => (
            <div key={i} className={`card p-5 hover-lift ${kpi.accent} opacity-0 animate-fade-in`} style={{ animationDelay: `${i * 0.07}s`, animationFillMode: 'forwards' }}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${kpi.iconClass}`}>
                  {kpi.icon}
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                  {kpi.trend}
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{kpi.value}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">{kpi.label}</p>
              <p className="text-[11px] text-slate-400 mt-1">{kpi.sub}</p>
            </div>
          ))}
        </section>

        {/* ═══════════════════════════════════════════════════
            DEPARTMENT FILTER
        ═══════════════════════════════════════════════════ */}
        <section className="card p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <p className="section-label">Filtro Geográfico</p>
              <h2 className="text-sm font-extrabold text-slate-800 mt-0.5">Visualizar por Departamento</h2>
            </div>
            {selectedDept !== 'TODOS' && (
              <button
                onClick={() => setSelectedDept('TODOS')}
                className="text-xs font-bold text-[#8d702a] hover:text-[#c8a94c] transition-colors bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-lg"
              >
                × Limpiar filtro
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedDept('TODOS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedDept === 'TODOS'
                  ? 'bg-[#c8a94c] text-white shadow-md shadow-[#c8a94c]/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🗺️ Todo el País
            </button>
            {depts.map(d => (
              <button
                key={d.id}
                onClick={() => setSelectedDept(d.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedDept === d.id
                    ? 'bg-[#c8a94c] text-white shadow-md shadow-[#c8a94c]/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {d.nombre}
              </button>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            MAIN CONTENT GRID
        ═══════════════════════════════════════════════════ */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── Left: Aid Feed ──────────────────────────── */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="section-label">Solicitudes Activas</p>
                <h2 className="text-sm font-extrabold text-slate-800 mt-0.5">
                  Registros de Asistencia Humanitaria
                  <span className="ml-2 text-xs font-semibold text-slate-400 normal-case">
                    ({filteredAyudas.length} resultados)
                  </span>
                </h2>
              </div>
              <Link
                href="/ayuda"
                className="flex items-center gap-1 text-xs font-bold text-[#8d702a] hover:text-[#c8a94c] transition-colors"
              >
                Ver todas <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Urgency Filter Tabs */}
            <div className="flex gap-1.5 flex-wrap">
              {['ALL', 'CRITICA', 'ALTA', 'MEDIA', 'BAJA'].map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                    activeFilter === f
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {f === 'ALL' ? 'Todas' : f}
                </button>
              ))}
            </div>

            {/* Aid Request Cards */}
            <div className="space-y-3">
              {filteredAyudas.slice(0, 6).map((a, i) => {
                const urg = URGENCY_META[a.urgencia] || URGENCY_META.BAJA;
                const est = ESTADO_META[a.estado] || ESTADO_META.PENDIENTE;
                const emoji = TIPO_META[a.tipologia] || '📋';
                return (
                  <div
                    key={a.id}
                    className={`card p-4 opacity-0 animate-fade-in ${a.urgencia === 'CRITICA' ? 'border-rose-100 bg-rose-50/20' : ''}`}
                    style={{ animationDelay: `${i * 0.06}s`, animationFillMode: 'forwards' }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Urgency dot */}
                      <div className="shrink-0 mt-1 flex flex-col items-center gap-1">
                        <span className={`pulse-dot ${urg.dot} ${a.urgencia === 'CRITICA' ? 'w-2.5 h-2.5' : ''}`}></span>
                      </div>

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base">{emoji}</span>
                          <span className={`badge border ${urg.color}`}>{urg.label}</span>
                          <span className={`badge border ${est.color}`}>{est.label}</span>
                          <span className="badge border text-slate-500 bg-slate-50 border-slate-200">{a.tipologia.replace('_', ' ')}</span>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-900">{a.solicitante}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {a.direccion}
                          </p>
                        </div>

                        <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                          {a.descripcion}
                        </p>

                        {a.seguimiento && (
                          <div className="flex items-start gap-1.5 p-2 bg-blue-50 border border-blue-100 rounded-lg">
                            <Activity className="w-3 h-3 text-blue-600 mt-0.5 shrink-0" />
                            <p className="text-[10px] text-blue-700 font-medium">{a.seguimiento}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeAgo(a.createdAt)}
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            📞 {a.contacto}
                          </span>
                        </div>
                      </div>

                      {a.evidenciaMedia && (
                        <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                          <img src={a.evidenciaMedia} alt="Evidencia" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredAyudas.length === 0 && (
                <div className="card p-10 text-center text-slate-400">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm font-semibold">Sin resultados para los filtros seleccionados.</p>
                </div>
              )}

              {filteredAyudas.length > 6 && (
                <Link
                  href="/ayuda"
                  className="flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-all"
                >
                  Ver {filteredAyudas.length - 6} solicitudes más
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>

          {/* ── Right Sidebar ───────────────────────────── */}
          <div className="lg:col-span-4 space-y-5">

            {/* Critical Alert Panel */}
            {criticalAlerts.length > 0 && (
              <div className="card border-rose-100 bg-rose-50/30 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-700">Alertas Críticas</p>
                    <p className="text-xs font-bold text-slate-800">{criticalAlerts.length} activas ahora</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {criticalAlerts.map(a => (
                    <div key={a.id} className="p-2.5 bg-white rounded-lg border border-rose-100 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="pulse-dot bg-rose-500 w-1.5 h-1.5"></span>
                        <p className="text-[10px] font-bold text-slate-900 truncate">{a.solicitante}</p>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-2">{a.descripcion}</p>
                      <p className="text-[9px] text-slate-400">{timeAgo(a.createdAt)}</p>
                    </div>
                  ))}
                </div>
                <Link
                  href="/ayuda"
                  className="flex items-center justify-center gap-1.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors"
                >
                  Gestionar alertas <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}

            {/* Citizen Reports */}
            <div className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="section-label">Reportes Ciudadanos</p>
                  <p className="text-xs font-extrabold text-slate-800 mt-0.5">Actividad Reciente</p>
                </div>
                <Link href="/reportes" className="text-[10px] font-bold text-[#8d702a] hover:text-[#c8a94c]">
                  Ver todos →
                </Link>
              </div>
              <div className="space-y-2">
                {reportes.slice(0, 3).map(r => {
                  const isVerified = r.estado === 'VERIFICADO';
                  return (
                    <div key={r.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`badge border text-[8px] ${isVerified ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'}`}>
                          {isVerified ? '✓ Verificado' : '⏳ En revisión'}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-800 line-clamp-2">{r.titulo}</p>
                      <p className="text-[10px] text-slate-400">{timeAgo(r.createdAt)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Official Bulletin */}
            <div className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="section-label">Comunicados del Estado</p>
                  <p className="text-xs font-extrabold text-slate-800 mt-0.5">Boletines Oficiales</p>
                </div>
                <Link href="/centro-informacion" className="text-[10px] font-bold text-[#8d702a] hover:text-[#c8a94c]">
                  Ver todos →
                </Link>
              </div>
              <div className="space-y-2">
                {comunicados.slice(0, 2).map(c => (
                  <div key={c.id} className="p-3 bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3 text-[#8d702a]" />
                      <span className="text-[9px] font-bold text-[#8d702a] uppercase tracking-wider">{c.fuente}</span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-800 line-clamp-2">{c.titulo}</p>
                    <p className="text-[10px] text-slate-500 line-clamp-2">{c.contenido}</p>
                    <p className="text-[9px] text-slate-400">{new Date(c.fechaHora).toLocaleDateString('es-BO', { day: 'numeric', month: 'long' })}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Platform Guide */}
            <div className="card p-4 space-y-3">
              <p className="section-label">Guía de Uso</p>
              <h3 className="text-xs font-extrabold text-slate-800">¿Cómo funciona?</h3>
              <ol className="space-y-2.5 text-[11px] text-slate-600">
                {[
                  { n: '1', t: 'Registra', d: 'Crea una solicitud de ayuda o reporte de incidente' },
                  { n: '2', t: 'Verifica', d: 'El equipo oficial audita y valida la información' },
                  { n: '3', t: 'Coordina', d: 'Defensa Civil activa los recursos necesarios' },
                ].map(s => (
                  <li key={s.n} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#c8a94c]/15 text-[#8d702a] flex items-center justify-center shrink-0 text-[9px] font-black border border-[#c8a94c]/25">
                      {s.n}
                    </span>
                    <span><strong>{s.t}:</strong> {s.d}</span>
                  </li>
                ))}
              </ol>
              <div className="p-3 bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-xl">
                <p className="text-[10px] font-bold text-[#8d702a] uppercase tracking-wider mb-1">
                  🆘 Emergencias Graves
                </p>
                <p className="text-[11px] text-slate-700">
                  Llama al <strong>122</strong> para rescate inmediato o crisis con riesgo vital.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            AIR BRIDGES TICKER
        ═══════════════════════════════════════════════════ */}
        <section className="card overflow-hidden">
          <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Plane className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="section-label">Operaciones Logísticas</p>
              <h2 className="text-xs font-extrabold text-slate-800">Puentes Aéreos y Misiones de Rescate</h2>
            </div>
            <Link href="/centro-informacion" className="ml-auto text-[10px] font-bold text-[#8d702a] hover:text-[#c8a94c] flex items-center gap-1">
              Ver detalle <TrendingUp className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {HelpApi.getAccionesRealizadas().map(ac => {
              const isActive = ac.estado === 'EN_CURSO';
              return (
                <div key={ac.id} className={`px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isActive ? 'bg-blue-50/40' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${isActive ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                      <Plane className={`w-4 h-4 ${isActive ? 'text-amber-600 animate-bounce' : 'text-emerald-600'}`} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{ac.titulo}</p>
                      <p className="text-[10px] text-slate-500">
                        {ac.origen} → {ac.destino}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:text-right shrink-0">
                    <span className={`badge border ${isActive ? 'text-amber-700 bg-amber-50 border-amber-200 animate-pulse' : 'text-emerald-700 bg-emerald-50 border-emerald-200'}`}>
                      {isActive ? '✈ En Vuelo' : '✓ Completado'}
                    </span>
                    <span className="text-[10px] text-slate-400">{timeAgo(ac.fecha)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
