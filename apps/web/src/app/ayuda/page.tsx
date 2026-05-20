'use client';

import React, { useEffect, useState } from 'react';
import { 
  Heart, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle2, 
  AlertOctagon, 
  Search, 
  PlusCircle,
  HelpCircle,
  Activity,
  X,
  Upload
} from 'lucide-react';
import { HelpApi, AyudaHumanitaria, Departamento } from '../../lib/api';

export default function AyudaPage() {
  const [ayudas, setAyudas] = useState<AyudaHumanitaria[]>([]);
  const [depts, setDepts] = useState<Departamento[]>([]);

  // Filter States
  const [selectedTipologia, setSelectedTipologia] = useState<string>('ALL');
  const [selectedUrgencia, setSelectedUrgencia] = useState<string>('ALL');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedEstado, setSelectedEstado] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  // Register Modal States
  const [showRegModal, setShowRegModal] = useState<boolean>(false);
  const [evidenciaBase64, setEvidenciaBase64] = useState<string | null>(null);
  const [form, setForm] = useState({
    tipologia: 'OXIGENO',
    descripcion: '',
    urgencia: 'MEDIA',
    solicitante: '',
    contacto: '',
    departamentoId: 'LP',
    direccion: '',
  });

  const [formMsg, setFormMsg] = useState<string | null>(null);

  useEffect(() => {
    HelpApi.init();
    setAyudas(HelpApi.getAyudas());
    setDepts(HelpApi.getDepartamentos());
  }, []);

  const typologies = [
    { value: 'MEDICAMENTOS', label: 'Medicamentos' },
    { value: 'OXIGENO', label: 'Oxígeno' },
    { value: 'ALIMENTOS', label: 'Alimentos' },
    { value: 'TRANSPORTE', label: 'Transporte' },
    { value: 'REFUGIO', label: 'Refugio' },
    { value: 'DONACIONES', label: 'Donaciones' },
    { value: 'RESCATE_ANIMAL', label: 'Rescate Animal' },
    { value: 'APOYO_PSICOLOGICO', label: 'Apoyo Psicológico' }
  ];

  const urgencies = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];
  const states = [
    { value: 'PENDIENTE', label: 'Pendiente de Atención' },
    { value: 'EN_PROCESO', label: 'En Proceso' },
    { value: 'ATENDIDO', label: 'Atendido' }
  ];

  // Filtering Logic
  const filteredAyudas = ayudas.filter(a => {
    const matchTipo = selectedTipologia === 'ALL' || a.tipologia === selectedTipologia;
    const matchUrg = selectedUrgencia === 'ALL' || a.urgencia === selectedUrgencia;
    const matchDept = selectedDept === 'ALL' || a.departamentoId === selectedDept;
    const matchEst = selectedEstado === 'ALL' || a.estado === selectedEstado;
    const matchQuery = search === '' || 
      a.descripcion.toLowerCase().includes(search.toLowerCase()) ||
      a.solicitante.toLowerCase().includes(search.toLowerCase()) ||
      a.direccion.toLowerCase().includes(search.toLowerCase());
    return matchTipo && matchUrg && matchDept && matchEst && matchQuery;
  });

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

  // Handle submit new request
  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.descripcion || !form.solicitante || !form.contacto || !form.direccion) {
      setFormMsg('Por favor rellene todos los campos requeridos.');
      return;
    }

    HelpApi.addAyuda({
      tipologia: form.tipologia,
      descripcion: form.descripcion,
      urgencia: form.urgencia,
      solicitante: form.solicitante,
      contacto: form.contacto,
      departamentoId: form.departamentoId,
      direccion: form.direccion,
      evidenciaMedia: evidenciaBase64 || null,
    });

    setAyudas(HelpApi.getAyudas());
    setFormMsg('Solicitud enviada exitosamente. Se ha registrado en la plataforma civil nacional.');
    setTimeout(() => {
      setShowRegModal(false);
      setFormMsg(null);
      setEvidenciaBase64(null);
      setForm({
        tipologia: 'OXIGENO',
        descripcion: '',
        urgencia: 'MEDIA',
        solicitante: '',
        contacto: '',
        departamentoId: 'LP',
        direccion: '',
      });
    }, 2500);
  };

  const getUrgencyBadge = (urg: string) => {
    switch (urg) {
      case 'CRITICA':
        return 'bg-rose-100 text-rose-700 border-rose-250 animate-pulse';
      case 'ALTA':
        return 'bg-amber-100 text-amber-800 border-amber-250';
      case 'MEDIA':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getEstadoBadge = (est: string) => {
    switch (est) {
      case 'ATENDIDO':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'EN_PROCESO':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-250';
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
              Canal de Ayuda y Rescate Civil
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
              <Heart className="w-6 h-6 text-rose-600 stroke-[2.2]" />
              Centro de Ayuda Humanitaria y Solicitudes
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Registro público transparente de requerimientos de insumos, apoyo psicológico, refugio y rescate en tiempo de contingencia.
            </p>
          </div>
          
          <button
            onClick={() => setShowRegModal(true)}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider py-3 px-5 rounded-xl shadow-md shadow-emerald-500/10 hover-lift transition-all animate-bounce"
          >
            <PlusCircle className="w-4 h-4" />
            Registrar Solicitud Inmediata
          </button>
        </div>

        {/* Advanced Search & Filtering Panels */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Filtro Inteligente de Solicitudes
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Keyword Search */}
            <div className="relative lg:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar solicitud..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Tipologia */}
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-blue-500 transition-colors"
              value={selectedTipologia}
              onChange={(e) => setSelectedTipologia(e.target.value)}
            >
              <option value="ALL">Todas las Categorías</option>
              {typologies.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>

            {/* Urgencia */}
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-blue-500 transition-colors"
              value={selectedUrgencia}
              onChange={(e) => setSelectedUrgencia(e.target.value)}
            >
              <option value="ALL">Nivel de Urgencia (Todos)</option>
              {urgencies.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>

            {/* Departamento */}
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-blue-500 transition-colors"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="ALL">Todo el País (Dptos)</option>
              {depts.map(d => (
                <option key={d.id} value={d.id}>{d.nombre}</option>
              ))}
            </select>

            {/* Estado */}
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-blue-500 transition-colors"
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
            >
              <option value="ALL">Estado de Atención (Todos)</option>
              {states.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Grid View */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAyudas.length > 0 ? (
            filteredAyudas.map(a => {
              const isAtendido = a.estado === 'ATENDIDO';
              const isCritical = a.urgencia === 'CRITICA' || a.urgencia === 'ALTA';
              const isMedium = a.urgencia === 'MEDIA';
              const cardBgClass = isAtendido 
                ? 'card-gradient-green border border-emerald-100 glow-emerald' 
                : isCritical 
                  ? 'card-gradient-red border border-rose-200 glow-rose' 
                  : isMedium 
                    ? 'card-gradient-blue border border-blue-150 glow-blue' 
                    : 'bg-white border border-slate-200';

              const isSendaVerde = a.solicitante.toLowerCase().includes('senda verde') || 
                                   a.descripcion.toLowerCase().includes('senda verde') ||
                                   a.tipologia === 'RESCATE_ANIMAL';

              return (
                <div 
                  key={a.id} 
                  className={`${cardBgClass} rounded-2xl p-6 shadow-sm flex flex-col justify-between hover-lift transition-all space-y-4 text-left relative overflow-hidden`}
                >
                  
                  <div className="space-y-3">
                    {/* Media Render */}
                    {a.evidenciaMedia && (
                      <div className="relative w-full h-44 rounded-xl overflow-hidden mb-2 group bg-slate-950 border border-slate-200">
                        {a.evidenciaMedia.startsWith('data:video/') ? (
                          <video 
                            src={a.evidenciaMedia} 
                            controls 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        ) : (
                          <img 
                            src={a.evidenciaMedia} 
                            alt="Evidencia del requerimiento" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
                      </div>
                    )}

                    {/* Senda Verde Highlight Badge */}
                    {isSendaVerde && (
                      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1.5 w-max tracking-wider uppercase shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Senda Verde Wildlife Refuge
                      </div>
                    )}

                    {/* Header row */}
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-bold bg-slate-100 text-slate-800 uppercase tracking-wider border border-slate-150">
                        {a.tipologia}
                      </span>
                      
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${getUrgencyBadge(a.urgencia)}`}>
                          {a.urgencia}
                        </span>
                        <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${getEstadoBadge(a.estado)}`}>
                          {a.estado}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-800 font-medium leading-relaxed">
                      "{a.descripcion}"
                    </p>

                    {/* Location Details */}
                    <div className="flex items-start gap-1.5 text-xs text-slate-650 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-450 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-800">
                          {depts.find(d => d.id === a.departamentoId)?.nombre || a.departamentoId}
                        </span>
                        <p className="text-[10px] text-slate-500 font-normal">{a.direccion}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Metadata & Follow-up tracking */}
                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <div className="flex justify-between items-center text-xs text-slate-650">
                      <span className="font-medium flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                        Solicita: <strong className="text-slate-800 truncate max-w-[120px]">{a.solicitante}</strong>
                      </span>
                      <span className="font-semibold flex items-center gap-1 text-slate-850">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {a.contacto}
                      </span>
                    </div>

                    {/* Seguimiento log */}
                    {a.seguimiento ? (
                      <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-1">
                        <span className="text-[9px] font-bold text-blue-700 uppercase tracking-wide flex items-center gap-1">
                          <Clock className="w-3 h-3 animate-spin" />
                          Seguimiento de Coordinación:
                        </span>
                        <p className="text-[10px] text-slate-600 italic leading-snug">
                          "{a.seguimiento}"
                        </p>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-center text-[10px] text-slate-400 italic">
                        Sin asignación de seguimiento institucional todavía.
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12 bg-white border border-slate-200 rounded-2xl text-slate-400 text-xs">
              No se encontraron solicitudes de ayuda con los filtros aplicados.
            </div>
          )}
        </div>
      </div>

      {/* Request Modal Dialog - Decoupled outside container layout context */}
      {showRegModal && (
        <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 relative animate-fade-in max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setShowRegModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <h2 className="text-base font-extrabold text-slate-950">
                Registrar Requerimiento de Ayuda Humanitaria
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Su solicitud se publicará en el canal de emergencias nacional para articulación con los centros logísticos.
              </p>
            </div>

            {formMsg && (
              <div className="mb-4 p-3 rounded-xl border border-emerald-100 bg-emerald-50 text-xs text-emerald-700 font-semibold">
                {formMsg}
              </div>
            )}

            <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Categoría del Requerimiento *</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                    value={form.tipologia}
                    onChange={(e) => setForm({ ...form, tipologia: e.target.value })}
                  >
                    {typologies.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nivel de Urgencia *</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                    value={form.urgencia}
                    onChange={(e) => setForm({ ...form, urgencia: e.target.value })}
                  >
                    {urgencies.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Solicitante (Institución o Persona) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Centro de Salud Bajo Llojeta"
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                    value={form.solicitante}
                    onChange={(e) => setForm({ ...form, solicitante: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Teléfono o Celular de Enlace *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 77299380"
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                    value={form.contacto}
                    onChange={(e) => setForm({ ...form, contacto: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
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

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Dirección Exacta o Coordenadas *</label>
                  <input
                    type="text"
                    required
                    placeholder="Calle, zona o datos geográficos de referencia"
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                    value={form.direccion}
                    onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detalle del Requerimiento *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detalle exactamente lo que necesita, cantidades, especificaciones de soporte..."
                  className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                ></textarea>
              </div>

              {/* High-Fidelity Drag-and-Drop Media Uploader Zone */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Evidencia o Respaldo Visual (Foto o Video)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:border-emerald-500 hover:bg-slate-50/55 transition-all relative group cursor-pointer">
                  <div className="space-y-2 text-center">
                    <Upload className="mx-auto h-10 w-10 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                    <div className="flex text-slate-600 justify-center">
                      <span className="relative rounded-md font-semibold text-emerald-600 hover:text-emerald-500 focus-within:outline-none">
                        <span>Cargar archivo de evidencia</span>
                        <input 
                          type="file" 
                          accept="image/*,video/*" 
                          className="sr-only" 
                          onChange={handleMediaUpload} 
                        />
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">PNG, JPG, MP4 hasta 50MB</p>
                  </div>
                  {evidenciaBase64 && (
                    <div className="absolute inset-0 bg-slate-900/95 rounded-xl flex items-center justify-between p-4 z-10 animate-fade-in">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {evidenciaBase64.startsWith('data:video/') ? (
                          <video src={evidenciaBase64} className="w-16 h-16 object-cover rounded-lg border border-slate-700" />
                        ) : (
                          <img src={evidenciaBase64} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-slate-700" />
                        )}
                        <div className="text-left">
                          <p className="text-[11px] font-bold text-white truncate max-w-[180px]">Evidencia lista</p>
                          <p className="text-[9px] text-emerald-400 font-medium">Archivo codificado en Base64</p>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setEvidenciaBase64(null)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-md shadow-emerald-500/10"
                >
                  Publicar Solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

