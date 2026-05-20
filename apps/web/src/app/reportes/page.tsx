'use client';

import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  PlusCircle,
  Search,
  MapPin,
  CheckCircle,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Link2,
  Calendar,
  X,
  Users,
  User,
  Heart,
  Upload,
  Activity,
  HeartHandshake,
  Lock,
  UserPlus
} from 'lucide-react';
import { HelpApi, Reporte, Departamento, Victima } from '../../lib/api';

export default function ReportesPage() {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [depts, setDepts] = useState<Departamento[]>([]);
  const [victimas, setVictimas] = useState<Victima[]>([]);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'REPORTES' | 'VICTIMAS'>('REPORTES');

  // Filters for Reportes
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedEstado, setSelectedEstado] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  // Filters for Victims
  const [vicDept, setVicDept] = useState<string>('ALL');
  const [vicAfectacion, setVicAfectacion] = useState<string>('ALL');
  const [vicQuery, setVicQuery] = useState<string>('');

  // Register Modal (Citizen submit report)
  const [showRegModal, setShowRegModal] = useState<boolean>(false);
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    fuenteSocial: '',
    departamentoId: 'LP',
  });
  const [formMsg, setFormMsg] = useState<string | null>(null);

  // Register Victima Modal (Citizen search/support alert)
  const [showVictimaModal, setShowVictimaModal] = useState<boolean>(false);
  const [victimaPhotoBase64, setVictimaPhotoBase64] = useState<string | null>(null);
  const [victimaForm, setVictimaForm] = useState({
    nombre: '',
    documentoIdentidad: '',
    edad: '',
    genero: 'MASCULINO',
    afectacionTipo: 'DESAPARECIDO',
    detalles: '',
    contactoFamiliar: '',
    departamentoId: 'LP',
    localidad: '',
  });
  const [victimaFormMsg, setVictimaFormMsg] = useState<string | null>(null);

  useEffect(() => {
    HelpApi.init();
    setReportes(HelpApi.getReportes());
    setDepts(HelpApi.getDepartamentos());
    setVictimas(HelpApi.getVictimas());
  }, []);

  // Filtering Reportes
  const filteredReportes = reportes.filter(r => {
    const matchDept = selectedDept === 'ALL' || r.departamentoId === selectedDept;
    const matchEst = selectedEstado === 'ALL' || r.estado === selectedEstado;
    const matchQuery = search === '' ||
      r.titulo.toLowerCase().includes(search.toLowerCase()) ||
      r.descripcion.toLowerCase().includes(search.toLowerCase());
    return matchDept && matchEst && matchQuery;
  });

  // Filtering Victims
  const filteredVictimas = victimas.filter(v => {
    const matchDept = vicDept === 'ALL' || v.departamentoId === vicDept;
    const matchAfect = vicAfectacion === 'ALL' || v.afectacionTipo === vicAfectacion;
    const matchQuery = vicQuery === '' ||
      v.nombre.toLowerCase().includes(vicQuery.toLowerCase()) ||
      v.detalles.toLowerCase().includes(vicQuery.toLowerCase()) ||
      v.localidad.toLowerCase().includes(vicQuery.toLowerCase());
    return matchDept && matchAfect && matchQuery;
  });

  // Handle citizen submit report
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo || !form.descripcion) {
      setFormMsg('Por favor complete los campos obligatorios del reporte.');
      return;
    }

    HelpApi.addReporte({
      titulo: form.titulo,
      descripcion: form.descripcion,
      fuenteSocial: form.fuenteSocial || null,
      departamentoId: form.departamentoId,
    });

    setReportes(HelpApi.getReportes());
    setFormMsg('Reporte ciudadano enviado exitosamente. Se encuentra en revisión para verificación técnica de autenticidad.');
    setTimeout(() => {
      setShowRegModal(false);
      setFormMsg(null);
      setForm({
        titulo: '',
        descripcion: '',
        fuenteSocial: '',
        departamentoId: 'LP',
      });
    }, 2500);
  };

  // Base64 Victima photograph reader
  const handleVictimaPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVictimaPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle citizen submit Victima search/support alert
  const handleSubmitVictima = (e: React.FormEvent) => {
    e.preventDefault();
    if (!victimaForm.nombre || !victimaForm.detalles || !victimaForm.localidad) {
      setVictimaFormMsg('Por favor complete los campos obligatorios marcados con *.');
      return;
    }

    HelpApi.addVictima({
      nombre: victimaForm.nombre,
      documentoIdentidad: victimaForm.documentoIdentidad || null,
      edad: victimaForm.edad ? Number(victimaForm.edad) : null,
      genero: victimaForm.genero,
      afectacionTipo: victimaForm.afectacionTipo,
      detalles: victimaForm.detalles,
      contactoFamiliar: victimaForm.contactoFamiliar || null,
      departamentoId: victimaForm.departamentoId,
      localidad: victimaForm.localidad,
      fotografia: victimaPhotoBase64 || null,
    });

    setVictimas(HelpApi.getVictimas());
    setVictimaFormMsg('Alerta de búsqueda registrada exitosamente en el canal público.');
    setTimeout(() => {
      setShowVictimaModal(false);
      setVictimaFormMsg(null);
      setVictimaPhotoBase64(null);
      setVictimaForm({
        nombre: '',
        documentoIdentidad: '',
        edad: '',
        genero: 'MASCULINO',
        afectacionTipo: 'DESAPARECIDO',
        detalles: '',
        contactoFamiliar: '',
        departamentoId: 'LP',
        localidad: '',
      });
    }, 2500);
  };

  const getEstadoBadge = (est: string) => {
    switch (est) {
      case 'VERIFICADO':
        return 'bg-emerald-100 text-emerald-850 border-emerald-250 font-bold';
      case 'INFORMACION_FALSA':
        return 'bg-rose-100 text-rose-850 border-rose-250 font-bold line-through';
      default:
        return 'bg-amber-100 text-amber-850 border-amber-250';
    }
  };

  const getEstadoIcon = (est: string) => {
    switch (est) {
      case 'VERIFICADO':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'INFORMACION_FALSA':
        return <XCircle className="w-4 h-4 text-rose-600" />;
      default:
        return <HelpCircle className="w-4 h-4 text-amber-600" />;
    }
  };

  const getAfectacionBadge = (afect: string) => {
    switch (afect) {
      case 'DESAPARECIDO':
        return 'bg-rose-500 text-white font-extrabold border border-rose-600 shadow-sm shadow-rose-500/10 animate-pulse';
      case 'LESIONADO':
        return 'bg-amber-500 text-white font-extrabold border border-amber-600';
      case 'DAMNIFICADO':
        return 'bg-blue-500 text-white font-extrabold border border-blue-600';
      case 'FALLECIDO':
        return 'bg-slate-700 text-white font-extrabold border border-slate-800';
      default:
        return 'bg-slate-100 text-slate-750 border border-slate-200';
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
              Verificación Colectiva y Apoyo Familiar
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-purple-600 stroke-[2.2]" />
              Sistema de Reportes Ciudadanos y Búsqueda de Personas
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Portal nacional para auditar alertas ciudadanas de desastres y coordinar información sobre víctimas, desaparecidos y personas afectadas en zonas de conflicto.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {activeTab === 'REPORTES' ? (
              <button
                onClick={() => setShowRegModal(true)}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider py-3 px-5 rounded-xl shadow-md hover-lift transition-all animate-pulse"
              >
                <PlusCircle className="w-4 h-4" />
                Enviar Reporte Ciudadano
              </button>
            ) : (
              <button
                onClick={() => setShowVictimaModal(true)}
                className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider py-3 px-5 rounded-xl shadow-md hover-lift transition-all animate-pulse"
              >
                <UserPlus className="w-4 h-4" />
                Registrar Alerta de Búsqueda
              </button>
            )}
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('REPORTES')}
            className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-[2px] shrink-0 ${activeTab === 'REPORTES'
                ? 'border-blue-600 text-blue-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Reportes e Incidentes ({filteredReportes.length})
          </button>
          <button
            onClick={() => setActiveTab('VICTIMAS')}
            className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-[2px] shrink-0 ${activeTab === 'VICTIMAS'
                ? 'border-rose-600 text-rose-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
          >
            <Users className="w-4 h-4" />
            Víctimas y Búsqueda de Familiares ({filteredVictimas.length})
          </button>
        </div>

        {/* Dynamic Panel Feed */}
        {activeTab === 'REPORTES' ? (
          <>
            {/* Advanced Filtering for Reports */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Buscador de Reportes y Evidencias Ciudadanas
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Keyword Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por palabra clave..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {/* Departamento */}
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                >
                  <option value="ALL">Todos los Departamentos</option>
                  {depts.map(d => (
                    <option key={d.id} value={d.id}>{d.nombre}</option>
                  ))}
                </select>

                {/* Estado de Verificacion */}
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                  value={selectedEstado}
                  onChange={(e) => setSelectedEstado(e.target.value)}
                >
                  <option value="ALL">Estado de Verificación (Todos)</option>
                  <option value="VERIFICADO">Verificados (Información Real)</option>
                  <option value="EN_REVISION">En Revisión Administrativa</option>
                  <option value="INFORMACION_FALSA">Bulo / Información Falsa</option>
                </select>
              </div>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReportes.length > 0 ? (
                filteredReportes.map(r => {
                  const isVerified = r.estado === 'VERIFICADO';
                  const isFake = r.estado === 'INFORMACION_FALSA';
                  const cardBgClass = isVerified
                    ? 'card-gradient-green border border-emerald-100 glow-emerald'
                    : isFake
                      ? 'card-gradient-red border border-rose-250 glow-rose'
                      : 'bg-gradient-to-br from-white to-amber-50/45 border border-amber-200';

                  return (
                    <div
                      key={r.id}
                      className={`${cardBgClass} rounded-2xl p-6 shadow-sm flex flex-col justify-between hover-lift transition-all space-y-4 text-left`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {depts.find(d => d.id === r.departamentoId)?.nombre || r.departamentoId}
                          </span>

                          <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 ${getEstadoBadge(r.estado)}`}>
                            {getEstadoIcon(r.estado)}
                            {r.estado.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                            {r.titulo}
                          </h3>
                          <p className="text-xs text-slate-650 leading-relaxed line-clamp-4">
                            {r.descripcion}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-4 space-y-3">
                        {r.fuenteSocial && (
                          <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50/50 border border-blue-100 p-2.5 rounded-xl w-fit">
                            <Link2 className="w-3.5 h-3.5 text-blue-650" />
                            <a
                              href={r.fuenteSocial}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline font-semibold text-[10px] truncate max-w-[200px]"
                            >
                              Enlace de Evidencia Red Social
                            </a>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold pt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(r.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                          <span>Verificador de Campo</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12 bg-white border border-slate-200 rounded-2xl text-slate-400 text-xs">
                  No se encontraron reportes ciudadanos con los filtros aplicados.
                </div>
              )}
            </div>
          </>
        ) : (
          /* TAB 2: PUBLIC BOARD FOR CONFLICT VICTIMS & SEARCH ALERTS */
          <>
            {/* Disclaimer & Info */}
            <div className="bg-rose-50 border border-rose-150 p-5 rounded-2xl flex items-start gap-4 text-left">
              <HeartHandshake className="w-10 h-10 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-rose-900 uppercase tracking-widest">
                  Canal Solidario de Comunicación y Localización de Personas
                </h3>
                <p className="text-[11.5px] text-rose-750 leading-relaxed">
                  Este es un tablero de comunicación abierto y transparente para que familiares, brigadas médicas y ciudadanía reporten la búsqueda de personas desaparecidas o incomunicadas, soliciten apoyo humanitario para lesionados o canalicen ayuda humanitaria a albergues. <strong>Verifique siempre los datos de contacto y actúe de buena fe.</strong>
                </p>
              </div>
            </div>

            {/* Advanced Filtering for Victims */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Buscador y Clasificador de Víctimas y Alertas de Personas
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Keyword Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o palabra clave..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                    value={vicQuery}
                    onChange={(e) => setVicQuery(e.target.value)}
                  />
                </div>

                {/* Departamento */}
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                  value={vicDept}
                  onChange={(e) => setVicDept(e.target.value)}
                >
                  <option value="ALL">Filtrar por Departamento (Todos)</option>
                  {depts.map(d => (
                    <option key={d.id} value={d.id}>{d.nombre}</option>
                  ))}
                </select>

                {/* Afectacion Type */}
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                  value={vicAfectacion}
                  onChange={(e) => setVicAfectacion(e.target.value)}
                >
                  <option value="ALL">Tipo de Afectación (Todos)</option>
                  <option value="DESAPARECIDO">DESAPARECIDO</option>
                  <option value="LESIONADO">LESIONADO</option>
                  <option value="DAMNIFICADO">DAMNIFICADO / ALBERGADO</option>
                  <option value="FALLECIDO">FALLECIDO</option>
                </select>
              </div>
            </div>

            {/* Victims Grid Listings */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVictimas.length > 0 ? (
                filteredVictimas.map(v => (
                  <div
                    key={v.id}
                    className="bg-white border border-slate-200 hover:border-slate-350 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover-lift transition-all space-y-4 text-left overflow-hidden relative"
                  >
                    <div className="space-y-3">
                      {/* Photo evidence render */}
                      {v.fotografia ? (
                        <div className="relative w-full h-48 rounded-xl overflow-hidden mb-2 group border border-slate-200">
                          <img
                            src={v.fotografia}
                            alt={v.nombre}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />
                        </div>
                      ) : (
                        <div className="w-full h-32 rounded-xl bg-slate-50 border border-slate-150 flex flex-col items-center justify-center text-slate-400 gap-1.5 mb-2">
                          <User className="w-8 h-8 text-slate-300" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sin foto disponible</span>
                        </div>
                      )}

                      {/* Header tags */}
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {depts.find(d => d.id === v.departamentoId)?.nombre || v.departamentoId}
                        </span>

                        <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${getAfectacionBadge(v.afectacionTipo)}`}>
                          {v.afectacionTipo}
                        </span>
                      </div>

                      {/* Name & demographics */}
                      <div className="space-y-0.5">
                        <h3 className="text-sm font-extrabold text-slate-900 tracking-tight leading-snug">
                          {v.nombre}
                        </h3>
                        <p className="text-[10px] text-slate-500 font-semibold">
                          {v.edad ? `${v.edad} años` : 'Edad desconocida'} • {v.genero} {v.documentoIdentidad && `• CI: ${v.documentoIdentidad}`}
                        </p>
                      </div>

                      {/* Situation Details */}
                      <p className="text-xs text-slate-650 leading-relaxed font-medium bg-slate-50/50 border border-slate-100 p-3.5 rounded-xl">
                        "{v.detalles}"
                      </p>
                    </div>

                    {/* Footer / Contact Details */}
                    <div className="border-t border-slate-100 pt-4 space-y-3 text-xs text-slate-650">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          Localidad: <strong className="text-slate-700">{v.localidad}</strong>
                        </span>
                      </div>

                      {v.contactoFamiliar && (
                        <div className="p-2.5 bg-rose-50/30 border border-rose-100/60 rounded-xl">
                          <span className="text-[8px] font-bold text-rose-700 uppercase tracking-widest block mb-0.5">Contacto Familiar / Enlace:</span>
                          <p className="font-bold text-[11px] text-rose-900 leading-snug">{v.contactoFamiliar}</p>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-1 text-[10px] text-slate-400 font-semibold border-t border-slate-50/80">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(v.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <span className="text-rose-600 font-bold uppercase tracking-wider text-[8px]">Alerta Activa</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 bg-white border border-slate-200 rounded-2xl text-slate-400 text-xs">
                  No hay alertas de búsqueda o afectados en este momento.
                </div>
              )}
            </div>
          </>
        )}

      </div>

      {/* Decoupled Modals - Rendered as sibling React Fragment nodes for perfect backdrop rendering */}

      {/* 1. CITIZEN INCIDENT REPORT MODAL */}
      {showRegModal && (
        <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 relative animate-fade-in">

            <button
              onClick={() => setShowRegModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-650"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5 text-left">
              <h2 className="text-base font-extrabold text-slate-950">
                Registrar Evidencia de Emergencia
              </h2>
              <p className="text-[11px] text-slate-500">
                Comparta fotos, videos o enlaces de redes sociales sobre desastres o contingencias. Será evaluado por el comité de verificación.
              </p>
            </div>

            {formMsg && (
              <div className="mb-4 p-3 rounded-xl border border-blue-100 bg-blue-50 text-xs text-blue-750 font-semibold text-left">
                {formMsg}
              </div>
            )}

            <form onSubmit={handleSubmitReport} className="space-y-4 text-xs text-left">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Título Descriptivo del Incidente *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Desborde de río inunda viviendas en Zona Sur"
                  className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500 font-medium"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block font-bold text-slate-700 mb-1">Departamento *</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500 font-medium"
                    value={form.departamentoId}
                    onChange={(e) => setForm({ ...form, departamentoId: e.target.value })}
                  >
                    {depts.map(d => (
                      <option key={d.id} value={d.id}>{d.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Enlace de Evidencia (Twitter, Facebook, YouTube)</label>
                  <input
                    type="url"
                    placeholder="https://facebook.com/posts/..."
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500 font-medium"
                    value={form.fuenteSocial}
                    onChange={(e) => setForm({ ...form, fuenteSocial: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descripción Detallada de los Hechos *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detalle exactamente lo observado, hora aproximada, nivel del daño..."
                  className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500 font-medium leading-relaxed"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-md shadow-blue-500/10 hover-lift transition-all"
                >
                  Enviar Reporte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. CITIZEN VICTIMA/SEARCH ALERT MODAL */}
      {showVictimaModal && (
        <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 relative animate-fade-in max-h-[90vh] overflow-y-auto">

            <button
              onClick={() => setShowVictimaModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-650"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5 text-left">
              <h2 className="text-base font-extrabold text-slate-950 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-rose-600" />
                Registrar Alerta de Búsqueda o Solicitud de Apoyo
              </h2>
              <p className="text-[11px] text-slate-500">
                Comparta los datos y características de la persona para que las brigadas médicas, voluntarios y la ciudadanía colaboren en su localización o atención.
              </p>
            </div>

            {victimaFormMsg && (
              <div className="mb-4 p-3 rounded-xl border border-rose-100 bg-rose-50 text-xs text-rose-750 font-semibold text-left">
                {victimaFormMsg}
              </div>
            )}

            <form onSubmit={handleSubmitVictima} className="space-y-4 text-xs text-left">

              {/* Photo Upload Zone */}
              <div className="bg-slate-50 border border-slate-200 p-4.5 rounded-xl space-y-2">
                <label className="block font-bold text-slate-700">Fotografía de la Persona (Para Búsqueda y Reconocimiento)</label>

                <div className="flex items-center gap-4">
                  {victimaPhotoBase64 ? (
                    <div className="relative w-20 h-20 rounded-xl border border-slate-200 overflow-hidden shrink-0 shadow-sm bg-white">
                      <img src={victimaPhotoBase64} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setVictimaPhotoBase64(null)}
                        className="absolute top-0.5 right-0.5 p-1 bg-red-650 hover:bg-red-600 text-white rounded-full transition-all"
                        title="Eliminar fotografía"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-white border border-dashed border-slate-350 flex flex-col items-center justify-center text-slate-400 shrink-0">
                      <User className="w-7 h-7 text-slate-300" />
                    </div>
                  )}

                  <div className="grow">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleVictimaPhotoUpload}
                      className="hidden"
                      id="victima-photo-input"
                    />
                    <label
                      htmlFor="victima-photo-input"
                      className="inline-flex items-center gap-2 px-3 py-2 border border-slate-250 hover:border-slate-300 rounded-xl bg-white text-slate-700 font-bold text-xs cursor-pointer shadow-sm hover:bg-slate-50 transition-colors"
                    >
                      <Upload className="w-4 h-4 text-slate-500" />
                      Cargar Fotografía
                    </label>
                    <p className="text-[10px] text-slate-400 mt-1">Sugerido: Imagen en primer plano clara para facilitar la identificación.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nombre(s) y Apellidos"
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500 font-medium"
                    value={victimaForm.nombre}
                    onChange={(e) => setVictimaForm({ ...victimaForm, nombre: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Documento Identidad (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej. 1298374 SC"
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500 font-medium"
                    value={victimaForm.documentoIdentidad}
                    onChange={(e) => setVictimaForm({ ...victimaForm, documentoIdentidad: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Edad (Aprox.)</label>
                    <input
                      type="number"
                      placeholder="Años"
                      className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2 focus:outline-none focus:border-blue-500 font-medium text-center"
                      value={victimaForm.edad}
                      onChange={(e) => setVictimaForm({ ...victimaForm, edad: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Género</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500 font-medium"
                      value={victimaForm.genero}
                      onChange={(e) => setVictimaForm({ ...victimaForm, genero: e.target.value })}
                    >
                      <option value="MASCULINO">Masc</option>
                      <option value="FEMENINO">Fem</option>
                      <option value="OTRO">Otro</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Afectación *</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500 font-medium font-bold text-rose-700"
                    value={victimaForm.afectacionTipo}
                    onChange={(e) => setVictimaForm({ ...victimaForm, afectacionTipo: e.target.value })}
                  >
                    <option value="DESAPARECIDO">DESAPARECIDO (Búsqueda Urgente)</option>
                    <option value="LESIONADO">LESIONADO (Requiere asistencia médica)</option>
                    <option value="DAMNIFICADO">DAMNIFICADO / ALBERGADO</option>
                    <option value="FALLECIDO">FALLECIDO</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Celular de Contacto Familiar *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 77299102 (Nombre contacto)"
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500 font-medium"
                    value={victimaForm.contactoFamiliar}
                    onChange={(e) => setVictimaForm({ ...victimaForm, contactoFamiliar: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Dpto *</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500 font-medium"
                      value={victimaForm.departamentoId}
                      onChange={(e) => setVictimaForm({ ...victimaForm, departamentoId: e.target.value })}
                    >
                      {depts.map(d => (
                        <option key={d.id} value={d.id}>{d.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Localidad/Zona *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. San Borja"
                      className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2 focus:outline-none focus:border-blue-500 font-medium"
                      value={victimaForm.localidad}
                      onChange={(e) => setVictimaForm({ ...victimaForm, localidad: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descripción y Detalles del Caso *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detalle descripción física (vestimenta, señas particulares), circunstancias de la última vez visto, diagnóstico clínico o necesidades de auxilio..."
                  className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500 font-medium leading-relaxed"
                  value={victimaForm.detalles}
                  onChange={(e) => setVictimaForm({ ...victimaForm, detalles: e.target.value })}
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowVictimaModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold animate-pulse"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold shadow-md shadow-rose-500/10 hover-lift transition-all"
                >
                  Publicar Alerta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
