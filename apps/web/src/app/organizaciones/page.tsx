'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  MapPin,
  Tag,
  Search,
  ExternalLink,
  CheckCircle2,
  Building2,
  MessageSquare,
  Globe,
  Mail,
  Phone,
  PlusCircle,
  X,
  Award,
  Sparkles,
  FileText,
  Heart,
  Upload,
  Check
} from 'lucide-react';
import { HelpApi, Organizacion, Departamento, Pronunciamiento } from '../../lib/api';

export default function OrganizacionesPage() {
  const [orgs, setOrgs] = useState<Organizacion[]>([]);
  const [depts, setDepts] = useState<Departamento[]>([]);
  const [pronunciamientos, setPronunciamientos] = useState<Pronunciamiento[]>([]);

  // Navigation tabs
  const [activeTabSection, setActiveTabSection] = useState<'DIRECTORIO' | 'PRONUNCIAMIENTOS'>('DIRECTORIO');

  // Filter States
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [selectedTipo, setSelectedTipo] = useState<string>('ALL');
  const [query, setQuery] = useState<string>('');

  // Register Form States
  const [showRegModal, setShowRegModal] = useState<boolean>(false);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [form, setForm] = useState({
    nombre: '',
    responsable: '',
    contacto: '',
    email: '',
    departamentoId: 'LP',
    ciudad: '',
    descripcion: '',
    web: '',
    tipo: 'ONG',
    sector: 'Salud', // Used for EMPRESAS PRIVADAS CLASIFICAR
  });

  // Pronunciamiento Modal States
  const [showPronModal, setShowPronModal] = useState<boolean>(false);
  const [pronForm, setPronForm] = useState({
    titulo: '',
    contenido: '',
    orgId: '',
  });

  const [formMsg, setFormMsg] = useState<string | null>(null);
  const [pronMsg, setPronMsg] = useState<string | null>(null);

  useEffect(() => {
    HelpApi.init();
    setOrgs(HelpApi.getOrganizaciones());
    setDepts(HelpApi.getDepartamentos());
    setPronunciamientos(HelpApi.getPronunciamientos());
  }, []);

  const sectors = ['Salud', 'Alimentación', 'Refugio', 'Logística', 'Industrial', 'Otros'];

  const tipos = [
    { value: 'EMPRESA_PRIVADA', label: 'Empresa Privada' },
    { value: 'ORGANIZACION_SOCIAL', label: 'Organización Social' },
    { value: 'ONG', label: 'ONG' },
    { value: 'FUNDACION', label: 'Fundación' },
    { value: 'INSTITUCION_PUBLICA', label: 'Institución Pública' },
    { value: 'COLECTIVO_CIUDADANO', label: 'Colectivo Ciudadano' },
  ];

  // Filtering Logic for Directory
  const filteredOrgs = orgs.filter(o => {
    const matchDept = selectedDept === 'ALL' || o.departamentoId === selectedDept;
    const matchSector = selectedSector === 'ALL' || o.sector === selectedSector;
    const matchTipo = selectedTipo === 'ALL' || o.tipo === selectedTipo;
    const matchQuery = query === '' ||
      o.nombre.toLowerCase().includes(query.toLowerCase()) ||
      o.descripcion.toLowerCase().includes(query.toLowerCase()) ||
      o.responsable.toLowerCase().includes(query.toLowerCase());
    return matchDept && matchSector && matchTipo && matchQuery;
  });

  // Base64 Logo Reader
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Form Submission for registering organization
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.responsable || !form.contacto || !form.email || !form.descripcion) {
      setFormMsg('Por favor complete todos los campos obligatorios.');
      return;
    }

    const newOrg = HelpApi.addOrganizacion({
      nombre: form.nombre,
      responsable: form.responsable,
      contacto: form.contacto,
      email: form.email,
      departamentoId: form.departamentoId,
      ciudad: form.ciudad || 'Capital',
      descripcion: form.descripcion,
      web: form.web || null,
      tipo: form.tipo,
      sector: form.sector,
      logo: logoBase64 || null,
    });

    // Refresh list
    setOrgs(HelpApi.getOrganizaciones());
    setFormMsg('Registro exitoso. Su organización se ha incorporado en estado pendiente de moderación administrativa.');
    setTimeout(() => {
      setShowRegModal(false);
      setFormMsg(null);
      setLogoBase64(null);
      setForm({
        nombre: '',
        responsable: '',
        contacto: '',
        email: '',
        departamentoId: 'LP',
        ciudad: '',
        descripcion: '',
        web: '',
        tipo: 'ONG',
        sector: 'Salud',
      });
    }, 3000);
  };

  // Submit Pronunciamiento
  const handleCreatePronunciamiento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pronForm.titulo || !pronForm.contenido || !pronForm.orgId) {
      setPronMsg('Por favor complete todos los campos.');
      return;
    }

    HelpApi.addPronunciamiento(pronForm.titulo, pronForm.contenido, pronForm.orgId);
    setPronunciamientos(HelpApi.getPronunciamientos());
    setPronMsg('Pronunciamiento publicado exitosamente.');
    setTimeout(() => {
      setShowPronModal(false);
      setPronMsg(null);
      setPronForm({ titulo: '', contenido: '', orgId: '' });
    }, 2500);
  };

  // Back Pronunciamiento (Dar Respaldo)
  const handleDarRespaldo = (id: string) => {
    // Find active organization names to endorse
    const activeOrgs = orgs.filter(o => o.verificado);
    if (activeOrgs.length === 0) {
      alert("Para dar respaldo a un pronunciamiento oficial, se requiere que existan organizaciones verificadas registradas en el sistema.");
      return;
    }

    // Pick first verified organization or ask user
    const selectedOrg = activeOrgs[0];
    HelpApi.respaldarPronunciamiento(id, selectedOrg.nombre);
    setPronunciamientos(HelpApi.getPronunciamientos());
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
              Directorio Institucional Integrado
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-700 stroke-[2.2]" />
              Registro y Directorio de Organizaciones
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Listado completo de actores sociales, ONGs, empresas privadas clasificadas y entidades públicas habilitadas para la coordinación humanitaria.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setShowRegModal(true)}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider py-3 px-5 rounded-xl shadow-md shadow-blue-500/10 hover-lift transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Registrar Mi Organización
            </button>

            <button
              onClick={() => setShowPronModal(true)}
              className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider py-3 px-5 rounded-xl shadow-md shadow-purple-500/10 hover-lift transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              Emitir Pronunciamiento
            </button>
          </div>
        </div>

        {/* Switcher Tabs Directorio vs Pronunciamientos */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTabSection('DIRECTORIO')}
            className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-[2px] ${activeTabSection === 'DIRECTORIO'
              ? 'border-blue-600 text-blue-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
          >
            <Building2 className="w-4 h-4" />
            Directorio de Actores ({filteredOrgs.length})
          </button>
          <button
            onClick={() => setActiveTabSection('PRONUNCIAMIENTOS')}
            className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-[2px] ${activeTabSection === 'PRONUNCIAMIENTOS'
              ? 'border-purple-650 text-purple-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
          >
            <Award className="w-4 h-4" />
            Declaraciones y Respaldos Colectivos ({pronunciamientos.length})
          </button>
        </div>

        {activeTabSection === 'DIRECTORIO' ? (
          <>
            {/* Advanced Filters Panel */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Panel de Búsqueda y Filtros Dinámicos
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por palabra clave..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>

                {/* Dept filter */}
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

                {/* Sector filter */}
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                >
                  <option value="ALL">Todos los Sectores / Clasificación</option>
                  {sectors.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                {/* Tipo filter */}
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                  value={selectedTipo}
                  onChange={(e) => setSelectedTipo(e.target.value)}
                >
                  <option value="ALL">Todas las Tipologías</option>
                  {tipos.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Directory Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrgs.length > 0 ? (
                filteredOrgs.map(o => {
                  const cardBgClass = o.verificado
                    ? 'card-gradient-blue border border-blue-100 glow-blue animate-fade-in'
                    : 'bg-white border border-slate-200 hover:border-slate-350 animate-fade-in';

                  return (
                    <div
                      key={o.id}
                      className={`${cardBgClass} rounded-2xl p-6 shadow-sm hover-lift transition-all flex flex-col justify-between space-y-4 text-left`}
                    >
                      <div className="space-y-3">
                        {/* Upper info row */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {o.logo ? (
                              <img src={o.logo} alt={o.nombre} className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-extrabold text-sm shrink-0 border border-blue-100">
                                {o.nombre.charAt(0)}
                              </div>
                            )}
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wider block">
                                  {o.tipo.replace('_', ' ')}
                                </span>
                                {o.tipo === 'EMPRESA_PRIVADA' && o.sector && (
                                  <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-purple-50 text-purple-700 uppercase tracking-wider block">
                                    {o.sector}
                                  </span>
                                )}
                              </div>
                              <h3 className="text-xs font-extrabold text-slate-900 leading-snug">
                                {o.nombre}
                              </h3>
                            </div>
                          </div>
                          {o.verificado && (
                            <span
                              title="Organización Oficial Verificada"
                              className="text-blue-600 shrink-0"
                            >
                              <CheckCircle2 className="w-5 h-5 fill-blue-50 stroke-blue-600" />
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-650 line-clamp-3 leading-relaxed">
                          {o.descripcion}
                        </p>

                        {/* Info Pills */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-800">
                            <MapPin className="w-3 h-3" />
                            {depts.find(d => d.id === o.departamentoId)?.nombre || o.departamentoId}
                          </span>
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-800">
                            <Tag className="w-3 h-3" />
                            Sector: {o.sector}
                          </span>
                        </div>
                      </div>

                      {/* Contact section */}
                      <div className="border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-650">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>Responsable: <strong>{o.responsable}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>Contacto: <strong>{o.contacto}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>Email: <strong>{o.email}</strong></span>
                        </div>
                        {o.web && (
                          <div className="flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5 text-slate-400" />
                            <a
                              href={o.web}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline font-semibold flex items-center gap-0.5"
                            >
                              Sitio Web
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  No se encontraron organizaciones con los filtros seleccionados.
                </div>
              )}
            </div>
          </>
        ) : (
          /* PRONUNCIAMIENTOS TAB */
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left flex items-start gap-4">
              <Sparkles className="w-8 h-8 text-purple-600 shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Corredor Humanitario de Pronunciamientos
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Declaraciones institucionales unificadas para el cese a la hostilidad, protección de cisternas de oxígeno y corredores médicos de auxilio nacional. Habilite el respaldo de su organización.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pronunciamientos.length > 0 ? (
                pronunciamientos.map(pron => (
                  <div
                    key={pron.id}
                    className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-5 text-left hover:border-slate-350 hover-lift transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          {pron.organizacion?.logo ? (
                            <img src={pron.organizacion.logo} alt="Logo" className="w-6 h-6 rounded-full object-cover border border-slate-200" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-[9px]">
                              {pron.organizacion?.nombre.charAt(0)}
                            </div>
                          )}
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{pron.organizacion?.nombre}</h4>
                            <span className="text-[9px] text-slate-400 font-semibold uppercase">{pron.organizacion?.tipo} • {pron.organizacion?.ciudad}</span>
                          </div>
                        </div>

                        <span className="text-[10px] text-slate-400 font-bold">
                          {new Date(pron.fechaHora).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>

                      <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                        {pron.titulo}
                      </h3>

                      <p className="text-xs text-slate-650 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-100 font-medium italic">
                        "{pron.contenido}"
                      </p>
                    </div>

                    {/* Signature / Backing drawer */}
                    <div className="border-t border-slate-100 pt-4 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-550 flex items-center gap-1">
                          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                          Respaldos Oficiales: <strong className="text-slate-800">{pron.respaldos || 0}</strong>
                        </span>

                        <button
                          onClick={() => handleDarRespaldo(pron.id)}
                          className="flex items-center gap-1 py-1.5 px-3.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Dar Respaldo
                        </button>
                      </div>

                      {pron.organizacionesRespaldadoras && pron.organizacionesRespaldadoras.length > 0 && (
                        <div className="bg-blue-50/30 border border-blue-100/50 p-3 rounded-xl space-y-1">
                          <span className="text-[8px] font-bold text-blue-700 uppercase tracking-wider block">Firmas Adicionales de Respaldo:</span>
                          <div className="flex flex-wrap gap-1">
                            {pron.organizacionesRespaldadoras.map((orgName, index) => (
                              <span key={index} className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold text-[8px] uppercase tracking-wide border border-blue-200">
                                ✓ {orgName}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  No hay pronunciamientos oficiales emitidos por organizaciones registradas.
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Registration Modal Dialog (Root Siblings for fixed overlay backdrop behavior) */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 relative animate-fade-in max-h-[90vh] overflow-y-auto">

            <button
              onClick={() => setShowRegModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5 text-left">
              <h2 className="text-base font-extrabold text-slate-950">
                Formulario de Registro Institucional
              </h2>
              <p className="text-[11px] text-slate-500">
                Ingrese la información oficial de su institución para ser incorporado al Centro Coordinador Humanitario.
              </p>
            </div>

            {formMsg && (
              <div className="mb-4 p-3 rounded-xl border border-blue-100 bg-blue-50 text-xs text-blue-750 font-semibold text-left">
                {formMsg}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4 text-xs text-left">

              {/* Logo Base64 Uploader */}
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-2">
                <label className="block font-bold text-slate-700">Logo o Escudo Institucional</label>
                <div className="flex items-center gap-4">
                  {logoBase64 ? (
                    <div className="relative w-16 h-16 rounded-xl border border-slate-200 overflow-hidden shrink-0 shadow-sm bg-white">
                      <img src={logoBase64} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setLogoBase64(null)}
                        className="absolute top-0.5 right-0.5 p-1 bg-red-600 hover:bg-red-500 text-white rounded-full transition-all"
                        title="Eliminar logo"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-white border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 shrink-0">
                      <Building2 className="w-6 h-6 text-slate-300" />
                    </div>
                  )}
                  <div className="grow">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload-input"
                    />
                    <label
                      htmlFor="logo-upload-input"
                      className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 hover:border-slate-300 rounded-xl bg-white text-slate-700 font-bold text-xs cursor-pointer shadow-sm hover:bg-slate-50 transition-all"
                    >
                      <Upload className="w-4 h-4 text-slate-500" />
                      Cargar Logo (Formatos de imagen)
                    </label>
                    <p className="text-[10px] text-slate-400 mt-1">El archivo será procesado localmente en formato Base64 seguro.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre Institucional *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Cruz Roja Boliviana"
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Responsable del Enlace *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nombre completo y cargo"
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                    value={form.responsable}
                    onChange={(e) => setForm({ ...form, responsable: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Número de Contacto / Teléfono *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. +591 77291029"
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                    value={form.contacto}
                    onChange={(e) => setForm({ ...form, contacto: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Correo Electrónico Oficial *</label>
                  <input
                    type="email"
                    required
                    placeholder="contacto@organizacion.org"
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
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
                  <label className="block font-bold text-slate-700 mb-1">Ciudad/Municipio</label>
                  <input
                    type="text"
                    placeholder="Ej. La Paz"
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                    value={form.ciudad}
                    onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sitio Web (Opcional)</label>
                  <input
                    type="url"
                    placeholder="https://su-web.org"
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                    value={form.web}
                    onChange={(e) => setForm({ ...form, web: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipología Organizacional *</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  >
                    {tipos.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sector Principal de Apoyo *</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                    value={form.sector}
                    onChange={(e) => setForm({ ...form, sector: e.target.value })}
                  >
                    {sectors.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descripción de Actividades y Capacidades Logísticas *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describa brevemente su infraestructura, vehículos, equipo técnico y su disposición en desastres..."
                  className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
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
                  Enviar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pronunciamiento Modal Dialog */}
      {showPronModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 relative animate-fade-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowPronModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-605"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5 text-left">
              <h2 className="text-base font-extrabold text-slate-950 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-650" />
                Emitir Pronunciamiento Oficial
              </h2>
              <p className="text-[11px] text-slate-500">
                Publique comunicados y actas de repudio o respaldo sobre la coyuntura nacional y coordinaciones de asistencia.
              </p>
            </div>

            {pronMsg && (
              <div className="mb-4 p-3 rounded-xl border border-purple-100 bg-purple-50 text-xs text-purple-750 font-semibold text-left">
                {pronMsg}
              </div>
            )}

            <form onSubmit={handleCreatePronunciamiento} className="space-y-4 text-xs text-left">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Organización Emisora *</label>
                <select
                  required
                  className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                  value={pronForm.orgId}
                  onChange={(e) => setPronForm({ ...pronForm, orgId: e.target.value })}
                >
                  <option value="">Seleccione una organización registrada...</option>
                  {orgs.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.nombre} ({o.verificado ? '✓ Verificada' : 'Pendiente de moderación'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Título del Pronunciamiento *</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="Ej. Respaldo y repudio de hechos de violencia..."
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500 font-semibold text-xs"
                    value={pronForm.titulo}
                    onChange={(e) => setPronForm({ ...pronForm, titulo: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPronForm({
                          ...pronForm,
                          titulo: 'Declaración Interinstitucional: Respaldo y repudio de hechos de violencia',
                          contenido:
                            'Las organizaciones firmantes expresamos nuestro absoluto rechazo y repudio ante cualquier hecho de violencia que afecte a la población civil e impida el paso de ambulancias, cisternas de oxígeno y ayuda humanitaria en los corredores viales nacionales. Exigimos respeto inmediato a las brigadas de auxilio médico y ratificamos nuestro compromiso inquebrantable de coordinar asistencia en condiciones de neutralidad e imparcialidad.'
                        })
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[9px] uppercase tracking-wide transition-all hover-lift"
                    >
                      Usar Plantilla: "Respaldo y Repudio de Violencia"
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contenido / Manifiesto Oficial *</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Escriba aquí los detalles del pronunciamiento o manifiesto de su organización..."
                  className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:outline-none focus:border-blue-500 font-medium leading-relaxed"
                  value={pronForm.contenido}
                  onChange={(e) => setPronForm({ ...pronForm, contenido: e.target.value })}
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPronModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold shadow-md shadow-purple-500/10 hover-lift transition-all"
                >
                  Publicar Pronunciamiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
