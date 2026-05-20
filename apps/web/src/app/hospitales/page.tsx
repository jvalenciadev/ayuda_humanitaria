'use client';

import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  MapPin, 
  Phone, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  PlusCircle, 
  ShieldCheck,
  Search,
  CheckCircle,
  X,
  Upload,
  Globe
} from 'lucide-react';
import { HelpApi, Hospital, Departamento } from '../../lib/api';

export default function HospitalesPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [depts, setDepts] = useState<Departamento[]>([]);

  // Filters
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedOxigeno, setSelectedOxigeno] = useState<string>('ALL');
  const [selectedEstado, setSelectedEstado] = useState<string>('ALL');

  // Register Modal (Public report)
  const [showRegModal, setShowRegModal] = useState<boolean>(false);
  const [evidenciaBase64, setEvidenciaBase64] = useState<string | null>(null);
  const [form, setForm] = useState({
    nombre: '',
    departamentoId: 'LP',
    oxigenoDisponibilidad: 'LIMITADO',
    camasLibres: 0,
    estadoGeneral: 'ALERTA',
    responsableNombre: '',
    responsableContacto: '',
    socialUrl: '',
  });

  const [formMsg, setFormMsg] = useState<string | null>(null);

  useEffect(() => {
    HelpApi.init();
    setHospitals(HelpApi.getHospitales());
    setDepts(HelpApi.getDepartamentos());
  }, []);

  const oxigenoOptions = ['SUFICIENTE', 'LIMITADO', 'CRITICO', 'AGOTADO'];
  const estadoOptions = ['ESTABLE', 'ALERTA', 'EMERGENCIA'];

  // Base64 file uploader reader
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvidenciaBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Filtering
  const filteredHospitals = hospitals.filter(h => {
    const matchDept = selectedDept === 'ALL' || h.departamentoId === selectedDept;
    const matchOxi = selectedOxigeno === 'ALL' || h.oxigenoDisponibilidad === selectedOxigeno;
    const matchEst = selectedEstado === 'ALL' || h.estadoGeneral === selectedEstado;
    return matchDept && matchOxi && matchEst;
  });

  // Handle submit report
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.responsableNombre || !form.responsableContacto) {
      setFormMsg('Complete todos los campos del reporte.');
      return;
    }

    HelpApi.addHospital({
      nombre: form.nombre,
      departamentoId: form.departamentoId,
      oxigenoDisponibilidad: form.oxigenoDisponibilidad,
      camasLibres: Number(form.camasLibres),
      estadoGeneral: form.estadoGeneral,
      responsableNombre: form.responsableNombre,
      responsableContacto: form.responsableContacto,
      evidenciaMedia: evidenciaBase64 || form.socialUrl || null,
    });

    setHospitals(HelpApi.getHospitales());
    setFormMsg('Reporte registrado correctamente. La información de criticidad ha sido actualizada.');
    setTimeout(() => {
      setShowRegModal(false);
      setFormMsg(null);
      setEvidenciaBase64(null);
      setForm({
        nombre: '',
        departamentoId: 'LP',
        oxigenoDisponibilidad: 'LIMITADO',
        camasLibres: 0,
        estadoGeneral: 'ALERTA',
        responsableNombre: '',
        responsableContacto: '',
        socialUrl: '',
      });
    }, 2500);
  };

  const getOxigenoBadge = (level: string) => {
    switch (level) {
      case 'AGOTADO':
        return 'bg-rose-500 text-white font-extrabold animate-pulse border border-rose-600';
      case 'CRITICO':
        return 'bg-rose-100 text-rose-700 border-rose-250 font-extrabold';
      case 'LIMITADO':
        return 'bg-amber-100 text-amber-850 border-amber-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const getEstadoBadge = (est: string) => {
    switch (est) {
      case 'EMERGENCIA':
        return 'bg-rose-600 text-white font-bold';
      case 'ALERTA':
        return 'bg-amber-100 text-amber-900 border-amber-200 font-semibold';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
              Monitoreo Clínico y Logística de Salud
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
              <Activity className="w-6 h-6 text-rose-600 stroke-[2.2]" />
              Monitoreo de Hospitales y Abastecimiento de Oxígeno
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Indicadores en tiempo real de la disponibilidad de oxígeno medicinal, camas libres en emergencias y criticidad hospitalaria a nivel nacional.
            </p>
          </div>

          <button
            onClick={() => setShowRegModal(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider py-3 px-5 rounded-xl shadow-md hover-lift transition-all animate-pulse"
          >
            <PlusCircle className="w-4 h-4" />
            Reportar Estado Hospital
          </button>
        </div>

        {/* Stats Quick Alert Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 flex items-center gap-4 text-left">
            <ShieldAlert className="w-10 h-10 text-rose-650 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider">Estado de Oxígeno Crítico</h4>
              <p className="text-[11px] text-rose-700 mt-0.5 leading-snug">
                Establecimientos en color rojo requieren asignación prioritaria de puentes aéreos logísticos.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-center gap-4 text-left">
            <ShieldCheck className="w-10 h-10 text-blue-700 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider">Transparencia Pública</h4>
              <p className="text-[11px] text-blue-700 mt-0.5 leading-snug">
                Los datos provienen de directores médicos y verificadores del Viceministerio de Defensa Civil.
              </p>
            </div>
          </div>

          <div className="bg-slate-55/40 border border-slate-200 rounded-2xl p-5 flex items-center gap-4 text-left">
            <Activity className="w-10 h-10 text-slate-550 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Concurrencia Logística</h4>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                Coordinación con empresas privadas productoras para ruteo de cisternas de oxígeno.
              </p>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Filtro Rápido de Hospitales
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

            {/* Abastecimiento oxigeno */}
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-blue-500 transition-colors"
              value={selectedOxigeno}
              onChange={(e) => setSelectedOxigeno(e.target.value)}
            >
              <option value="ALL">Disponibilidad Oxígeno (Todas)</option>
              {oxigenoOptions.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>

            {/* Estado General */}
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-blue-500 transition-colors"
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
            >
              <option value="ALL">Estado de Criticidad (Todos)</option>
              {estadoOptions.map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHospitals.length > 0 ? (
            filteredHospitals.map(h => {
              const isCritical = h.oxigenoDisponibilidad === 'CRITICO' || h.oxigenoDisponibilidad === 'AGOTADO';
              const isLimited = h.oxigenoDisponibilidad === 'LIMITADO';
              const cardBgClass = isCritical 
                ? 'card-gradient-red border border-rose-200 glow-rose' 
                : isLimited 
                  ? 'bg-gradient-to-br from-white to-amber-50/40 border border-amber-200' 
                  : 'card-gradient-green border border-emerald-100 glow-emerald';

              const hasEvidence = !!h.evidenciaMedia;
              const isSocialUrl = hasEvidence && h.evidenciaMedia?.startsWith('http');

              return (
                <div 
                  key={h.id} 
                  className={`${cardBgClass} rounded-2xl p-6 shadow-sm flex flex-col justify-between hover-lift transition-all space-y-4 text-left`}
                >
                
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {depts.find(d => d.id === h.departamentoId)?.nombre || h.departamentoId}
                        </span>
                        <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                          {h.nombre}
                        </h3>
                      </div>
                      
                      <span className={`px-2.5 py-1 rounded-xl text-[9px] font-extrabold uppercase tracking-wider ${getEstadoBadge(h.estadoGeneral)}`}>
                        {h.estadoGeneral}
                      </span>
                    </div>

                    {/* Oxygen availability & free beds */}
                    <div className="grid grid-cols-2 gap-4 py-2 border-y border-slate-100">
                      <div className="space-y-1 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Oxígeno</span>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold inline-block ${getOxigenoBadge(h.oxigenoDisponibilidad)}`}>
                          {h.oxigenoDisponibilidad}
                        </span>
                      </div>
                      <div className="space-y-1 text-center border-l border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Camas Emergencia</span>
                        <span className="text-sm font-extrabold text-slate-800">
                          {h.camasLibres}
                        </span>
                      </div>
                    </div>

                    {/* Verified Evidence Badge (QUE SEA TODO VERIDICO) */}
                    {hasEvidence && (
                      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[9.5px] font-extrabold px-2.5 py-1 rounded-lg flex items-center justify-between gap-1 w-full tracking-wider uppercase shadow-sm">
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-white animate-pulse" />
                          Evidencia Verificada
                        </span>
                        {isSocialUrl ? (
                          <a 
                            href={h.evidenciaMedia!} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="bg-emerald-800 hover:bg-emerald-900 text-white px-2 py-0.5 rounded flex items-center gap-1 font-bold lowercase transition-all"
                          >
                            <Globe className="w-2.5 h-2.5" />
                            feed
                          </a>
                        ) : (
                          <span className="text-[8px] font-bold bg-emerald-800 text-white px-1.5 py-0.5 rounded">
                            MEDIA
                          </span>
                        )}
                      </div>
                    )}

                    {/* Small Base64 Preview Thumbnail inside the card */}
                    {hasEvidence && !isSocialUrl && (
                      <div className="w-full h-24 rounded-lg overflow-hidden border border-slate-200 mt-2 bg-slate-900">
                        {h.evidenciaMedia!.startsWith('data:video/') ? (
                          <video src={h.evidenciaMedia!} controls className="w-full h-full object-cover" />
                        ) : (
                          <img src={h.evidenciaMedia!} alt="Evidencia de Oxígeno" className="w-full h-full object-cover" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Responsible Contact information */}
                  <div className="space-y-2 text-xs text-slate-650">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Reportado por: <strong>{h.responsableNombre}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Enlace Médico: <strong>{h.responsableContacto}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 italic pt-1 flex-wrap">
                      <Clock className="w-3 h-3 animate-spin" />
                      <span>Actualizado: {new Date(h.fechaReporte).toLocaleString('es-ES')}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12 bg-white border border-slate-200 rounded-2xl text-slate-400 text-xs">
              No se encontraron establecimientos médicos con los filtros aplicados.
            </div>
          )}
        </div>
      </div>

      {/* Hospital Report Modal - Decoupled outside container layout context */}
      {showRegModal && (
        <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 relative animate-fade-in max-h-[90vh] overflow-y-auto text-xs">
            
            <button
              onClick={() => setShowRegModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5 text-left">
              <h2 className="text-base font-extrabold text-slate-950">
                Registrar Reporte de Establecimiento Hospitalario
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Actualización inmediata del nivel de criticidad nacional de un hospital de salud pública.
              </p>
            </div>

            {formMsg && (
              <div className="mb-4 p-3 rounded-xl border border-blue-150 bg-blue-50 text-xs text-blue-700 font-semibold text-left">
                {formMsg}
              </div>
            )}

            <form onSubmit={handleSubmitReport} className="space-y-4 text-xs text-left">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre del Establecimiento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Hospital Obrero N° 1 - La Paz"
                  className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Departamento *</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                    value={form.departamentoId}
                    onChange={(e) => setForm({ ...form, departamentoId: e.target.value })}
                  >
                    {depts.map(d => (
                      <option key={d.id} value={d.id}>{d.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Abastecimiento Oxígeno *</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                    value={form.oxigenoDisponibilidad}
                    onChange={(e) => setForm({ ...form, oxigenoDisponibilidad: e.target.value })}
                  >
                    {oxigenoOptions.map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Camas Libres Emergencias *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                    value={form.camasLibres}
                    onChange={(e) => setForm({ ...form, camasLibres: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estado de Criticidad *</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                    value={form.estadoGeneral}
                    onChange={(e) => setForm({ ...form, estadoGeneral: e.target.value })}
                  >
                    {estadoOptions.map(est => (
                      <option key={est} value={est}>{est}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Médico/Enlace Responsable *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nombre y cargo"
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                    value={form.responsableNombre}
                    onChange={(e) => setForm({ ...form, responsableNombre: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Celular/Teléfono de Enlace del Médico *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. +591 76819280"
                  className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                  value={form.responsableContacto}
                  onChange={(e) => setForm({ ...form, responsableContacto: e.target.value })}
                />
              </div>

              {/* Verified evidence link or visual media uploads */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Enlace de Red Social o Medio de Prensa (Opcional)</label>
                <input
                  type="url"
                  placeholder="Ej. https://facebook.com/reportes/posts/1298"
                  className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                  value={form.socialUrl}
                  onChange={(e) => setForm({ ...form, socialUrl: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cargar Evidencia Directa (Foto o Video)</label>
                <div className="mt-1 flex justify-center px-6 pt-4 pb-4 border-2 border-slate-350 border-dashed rounded-xl hover:border-blue-500 hover:bg-slate-50/50 transition-colors relative cursor-pointer group">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-8 w-8 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <div className="flex text-slate-650 justify-center">
                      <span className="relative rounded-md font-semibold text-blue-600 hover:text-blue-500 focus-within:outline-none">
                        <span>Cargar evidencia de escasez</span>
                        <input 
                          type="file" 
                          accept="image/*,video/*" 
                          className="sr-only" 
                          onChange={handleMediaUpload} 
                        />
                      </span>
                    </div>
                  </div>
                  {evidenciaBase64 && (
                    <div className="absolute inset-0 bg-slate-950/95 rounded-xl flex items-center justify-between p-3 z-10">
                      <div className="flex items-center gap-3 overflow-hidden text-left">
                        {evidenciaBase64.startsWith('data:video/') ? (
                          <video src={evidenciaBase64} className="w-12 h-12 object-cover rounded border border-slate-700" />
                        ) : (
                          <img src={evidenciaBase64} alt="Evidencia" className="w-12 h-12 object-cover rounded border border-slate-700" />
                        )}
                        <div>
                          <p className="text-[10px] font-bold text-white">Evidencia cargada</p>
                          <p className="text-[8px] text-emerald-450 font-medium">Base64</p>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setEvidenciaBase64(null)}
                        className="p-1 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-md shadow-blue-500/10"
                >
                  Guardar Reporte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
