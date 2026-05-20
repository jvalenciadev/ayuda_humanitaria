'use client';

import React, { useEffect, useState } from 'react';
import {
  FileText,
  MessageSquare,
  CheckCircle,
  MapPin,
  Calendar,
  Building,
  UserCheck,
  Megaphone,
  Plane,
  Clock
} from 'lucide-react';
import { HelpApi } from '../../lib/api';

export default function CentroInformacionPage() {
  const [comunicados, setComunicados] = useState<any[]>([]);
  const [pronunciamientos, setPronunciamientos] = useState<any[]>([]);
  const [acciones, setAcciones] = useState<any[]>([]);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'OFICIALES' | 'ORGANIZACIONES' | 'PUENTES_AEREOS'>('OFICIALES');

  // Interactive signing state
  const [signingPronId, setSigningPronId] = useState<string | null>(null);
  const [selectedOrgName, setSelectedOrgName] = useState<string>('');
  const [signingSuccess, setSigningSuccess] = useState<string | null>(null);

  useEffect(() => {
    HelpApi.init();
    setComunicados(HelpApi.getComunicados());
    setPronunciamientos(HelpApi.getPronunciamientos());
    setAcciones(HelpApi.getAccionesRealizadas());
    setOrgs(HelpApi.getOrganizaciones());
  }, []);

  const handleGiveRespaldo = (pronId: string) => {
    if (!selectedOrgName) return;

    const updated = HelpApi.respaldarPronunciamiento(pronId, selectedOrgName);
    if (updated) {
      setPronunciamientos(HelpApi.getPronunciamientos());
      setSigningSuccess(`¡Respaldo registrado con éxito como ${selectedOrgName}!`);
      setTimeout(() => {
        setSigningSuccess(null);
        setSigningPronId(null);
        setSelectedOrgName('');
      }, 2000);
    }
  };

  // Logistics metrics for Puentes Aéreos
  const totalTons = acciones
    .filter(a => a.tipo === 'PUENTE_AEREO')
    .reduce((acc, curr) => {
      const match = curr.detallesLogistica.match(/([\d.]+)\s*Toneladas/i);
      return acc + (match ? parseFloat(match[1]) : 0);
    }, 0);

  const completedFlights = acciones.filter(a => a.tipo === 'PUENTE_AEREO' && a.estado === 'COMPLETADO').length;
  const inFlightCount = acciones.filter(a => a.tipo === 'PUENTE_AEREO' && a.estado === 'EN_CURSO').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">

      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
          Información Oficial y Vocerías
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-blue-700 stroke-[2.2]" />
          Centro Nacional de Información
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Espacio consolidado para boletines ministeriales oficiales, puentes aéreos logísticos y posicionamientos/pronunciamientos de organizaciones humanitarias verificadas.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('OFICIALES')}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-[2px] shrink-0 ${activeTab === 'OFICIALES'
            ? 'border-blue-600 text-blue-600 font-extrabold'
            : 'border-transparent text-slate-550 hover:text-slate-900'
            }`}
        >
          <FileText className="w-4 h-4" />
          Boletines Oficiales ({comunicados.length})
        </button>
        <button
          onClick={() => setActiveTab('ORGANIZACIONES')}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-[2px] shrink-0 ${activeTab === 'ORGANIZACIONES'
            ? 'border-blue-600 text-blue-600 font-extrabold'
            : 'border-transparent text-slate-550 hover:text-slate-900'
            }`}
        >
          <MessageSquare className="w-4 h-4" />
          Pronunciamientos de Organizaciones ({pronunciamientos.length})
        </button>
        <button
          onClick={() => setActiveTab('PUENTES_AEREOS')}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-[2px] shrink-0 ${activeTab === 'PUENTES_AEREOS'
            ? 'border-blue-600 text-blue-600 font-extrabold'
            : 'border-transparent text-slate-550 hover:text-slate-900'
            }`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Puentes Aéreos y Logística ({acciones.length})
        </button>
      </div>

      {/* Lists Feed */}
      <div className="space-y-6">

        {/* TAB 1: BOLETINES OFICIALES */}
        {activeTab === 'OFICIALES' && (
          comunicados.length > 0 ? (
            comunicados.map(com => (
              <div
                key={com.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-slate-350 transition-all text-left space-y-4 hover-lift"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-bold bg-blue-50 text-blue-800 uppercase tracking-wider w-fit border border-blue-150">
                    Boletín Estatal Verificado
                  </span>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(com.fechaHora).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-emerald-600 font-bold">
                      <UserCheck className="w-3.5 h-3.5" />
                      Fuente: {com.fuente}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                    {com.titulo}
                  </h3>
                  <p className="text-xs text-slate-650 leading-relaxed whitespace-pre-line">
                    {com.contenido}
                  </p>
                </div>

                <div className="text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-100 flex items-center justify-between">
                  <span>Autorizado por: {com.autorNombre}</span>
                  <span className="text-emerald-600 flex items-center gap-1 font-bold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Información Oficial Verificada
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              No hay comunicados oficiales cargados.
            </div>
          )
        )}

        {/* TAB 2: PRONUNCIAMIENTOS */}
        {activeTab === 'ORGANIZACIONES' && (
          pronunciamientos.length > 0 ? (
            pronunciamientos.map(pron => (
              <div
                key={pron.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-slate-350 transition-all text-left space-y-5 hover-lift"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    {pron.organizacion?.logo ? (
                      <img
                        src={pron.organizacion.logo}
                        alt="Logo"
                        className="w-6 h-6 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <Building className="w-5 h-5 text-slate-400" />
                    )}
                    <span className="text-xs font-bold text-slate-800">
                      {pron.organizacion?.nombre || 'Organización'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wider border border-slate-150">
                      {pron.organizacion?.tipo || 'Sociedad Civil'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(pron.fechaHora).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {pron.organizacion?.ciudad}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                    {pron.titulo}
                  </h3>
                  <p className="text-xs text-slate-650 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-100 italic">
                    "{pron.contenido}"
                  </p>
                </div>

                {/* Backing signatures / Endorsements list */}
                <div className="border-t border-slate-100 pt-4 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-250 text-[10px] px-2.5 py-1 rounded-md">
                        {pron.respaldos || 0} Respaldos Institucionales
                      </span>
                      {pron.organizacionesRespaldadoras && pron.organizacionesRespaldadoras.length > 0 && (
                        <div className="flex flex-wrap gap-1 items-center">
                          <span className="text-[10px] text-slate-450 font-normal mr-1">Firmado por:</span>
                          {pron.organizacionesRespaldadoras.map((orgName: string, index: number) => (
                            <span key={index} className="bg-slate-150 text-slate-700 text-[9px] font-bold px-2 py-0.5 rounded border border-slate-200">
                              {orgName}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setSigningPronId(signingPronId === pron.id ? null : pron.id)}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase tracking-wider py-2 px-4 rounded-lg shadow-sm hover-lift transition-all flex items-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Dar Respaldo
                    </button>
                  </div>

                  {/* Endorsement Dropdown Form */}
                  {signingPronId === pron.id && (
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 animate-fade-in">
                      <p className="text-[11px] font-bold text-slate-800">
                        Seleccione su organización registrada para avalar este pronunciamiento:
                      </p>

                      {signingSuccess && (
                        <div className="p-2 border border-emerald-250 bg-emerald-50 rounded-lg text-emerald-700 font-bold text-[10px]">
                          {signingSuccess}
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-3">
                        <select
                          className="flex-1 bg-white border border-slate-350 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500"
                          value={selectedOrgName}
                          onChange={(e) => setSelectedOrgName(e.target.value)}
                        >
                          <option value="">-- Seleccionar Organización --</option>
                          {orgs.map((o) => (
                            <option key={o.id} value={o.nombre}>
                              {o.nombre} ({o.tipo})
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => handleGiveRespaldo(pron.id)}
                          disabled={!selectedOrgName}
                          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-[10px] uppercase py-2 px-5 rounded-lg transition-colors"
                        >
                          Confirmar Firma
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              No hay pronunciamientos de organizaciones registrados en el sistema.
            </div>
          )
        )}

        {/* TAB 3: PUENTES AEREOS & ACCIONES LOGISTICAS */}
        {activeTab === 'PUENTES_AEREOS' && (
          <div className="space-y-6">
            {/* Logistical Metrics Dashboard Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-5 rounded-2xl shadow-sm text-left relative overflow-hidden group">
                <div className="absolute right-3 top-3 opacity-15">
                  <Plane className="w-16 h-16 text-white group-hover:scale-110 transition-transform duration-500" />
                </div>
                <span className="text-[9px] font-bold text-blue-350 uppercase tracking-widest block">Insumos Críticos Desplazados</span>
                <span className="text-2xl font-black mt-1 block">
                  {totalTons.toFixed(1)} <span className="text-xs font-bold text-slate-350">Toneladas</span>
                </span>
                <p className="text-[10px] text-slate-350 mt-1.5 leading-snug">
                  Medicamentos, cilindros de oxígeno y raciones secas enviadas por aire.
                </p>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-left relative overflow-hidden group">
                <div className="absolute right-3 top-3 opacity-10">
                  <CheckCircle className="w-16 h-16 text-slate-900" />
                </div>
                <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block">Vuelos Completados</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">
                  {completedFlights} <span className="text-xs font-bold text-emerald-600">Exitosos</span>
                </span>
                <p className="text-[10px] text-slate-500 mt-1.5 leading-snug">
                  Operaciones logísticas que sortearon bloqueos exitosamente.
                </p>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-left relative overflow-hidden group">
                <div className="absolute right-3 top-3 opacity-10">
                  <Clock className="w-16 h-16 text-slate-900" />
                </div>
                <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block">Operaciones en Progreso</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">
                  {inFlightCount} <span className="text-xs font-bold text-amber-600">En Vuelo</span>
                </span>
                <p className="text-[10px] text-slate-500 mt-1.5 leading-snug">
                  Misiones logísticas o de evacuación actualmente en ruta.
                </p>
              </div>
            </div>

            {/* Visual departure/timeline feed */}
            {acciones.length > 0 ? (
              <div className="relative border-l-2 border-slate-200 pl-6 ml-4 space-y-8 py-3 text-left">
                {acciones.map((acc) => {
                  const isAereo = acc.tipo === 'PUENTE_AEREO';
                  const isCompleted = acc.estado === 'COMPLETADO';
                  const isEnCurso = acc.estado === 'EN_CURSO';

                  return (
                    <div key={acc.id} className="relative group">
                      {/* Timeline Dot Icon */}
                      <span className={`absolute -left-[35px] top-1.5 flex h-6.5 w-6.5 items-center justify-center rounded-full border-2 bg-white ${isCompleted
                        ? 'border-emerald-500 text-emerald-600'
                        : isEnCurso
                          ? 'border-amber-500 text-amber-600 animate-pulse'
                          : 'border-slate-300 text-slate-400'
                        }`}>
                        {isAereo ? (
                          <Plane className="w-3.5 h-3.5" />
                        ) : (
                          <Building className="w-3.5 h-3.5" />
                        )}
                      </span>

                      {/* Timeline Card */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-350 hover:shadow-md transition-all space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider w-fit border ${isCompleted
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : isEnCurso
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}>
                            {acc.estado === 'EN_CURSO' ? 'En Tránsito Aéreo' : acc.estado}
                          </span>

                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              {new Date(acc.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-base font-extrabold text-slate-900 flex flex-wrap items-center gap-2">
                            {acc.titulo}
                          </h3>
                          <p className="text-xs text-slate-650 leading-relaxed">
                            {acc.descripcion}
                          </p>
                        </div>

                        {/* Route Transit Dashboard details */}
                        <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-450 font-bold uppercase">Ruta Oficial</span>
                            <div className="flex items-center gap-2 font-bold text-slate-800">
                              <span>{acc.origen}</span>
                              <span className="text-blue-500 font-bold">➔</span>
                              <span>{acc.destino}</span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-450 font-bold uppercase">Detalles Logísticos y Carga</span>
                            <p className="font-semibold text-slate-850">{acc.detallesLogistica}</p>
                          </div>
                        </div>

                        {/* Linear Transit Progress bar for EN_CURSO */}
                        {isEnCurso && (
                          <div className="space-y-1 pt-1">
                            <div className="flex justify-between text-[9px] font-bold text-blue-700 uppercase">
                              <span>Aeronave Despegará</span>
                              <span>Actualmente en Vuelo</span>
                              <span>Arribo Estimado</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-blue-600 h-1.5 rounded-full animate-pulse" style={{ width: '65%' }}></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                No hay registros de puentes aéreos u operaciones de rescate en curso.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
