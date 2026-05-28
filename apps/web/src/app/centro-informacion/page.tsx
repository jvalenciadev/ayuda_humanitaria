'use client';

import React, { useEffect, useState } from 'react';
import {
  FileText,
  CheckCircle,
  MapPin,
  Calendar,
  Megaphone,
  Plane,
  Clock,
  UserCheck,
  Building
} from 'lucide-react';
import { HelpApi } from '../../lib/api';

export default function CentroInformacionPage() {
  const [comunicados, setComunicados] = useState<any[]>([]);
  const [acciones, setAcciones] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'OFICIALES' | 'PUENTES_AEREOS'>('OFICIALES');


  useEffect(() => {
    HelpApi.init();
    setComunicados(HelpApi.getComunicados());
    setAcciones(HelpApi.getAccionesRealizadas());
  }, []);


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

        {/* TAB 3: PUENTES AEREOS & ACCIONES LOGISTICAS */}
        {activeTab === 'PUENTES_AEREOS' && (
          <div className="space-y-6">
            {/* Logistical Metrics Dashboard Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl shadow-sm text-left relative overflow-hidden group">
                <div className="absolute right-3 top-3 opacity-15">
                  <Plane className="w-16 h-16 text-blue-600 group-hover:scale-110 transition-transform duration-500" />
                </div>
                <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest block">Insumos Críticos Desplazados</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">
                  {totalTons.toFixed(1)} <span className="text-xs font-bold text-slate-500">Toneladas</span>
                </span>
                <p className="text-[10px] text-slate-500 mt-1.5 leading-snug">
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
