'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Heart, 
  Activity, 
  ShieldAlert, 
  FileText, 
  FileSpreadsheet, 
  ClipboardList, 
  Lock, 
  Check, 
  X, 
  PlusCircle, 
  UserCheck, 
  Info,
  Calendar,
  AlertTriangle,
  UserX,
  Camera,
  Eye
} from 'lucide-react';
import { HelpApi, Organizacion, AyudaHumanitaria, Hospital, Reporte, Victima, SystemLog } from '../../lib/api';

export default function DashboardPage() {
  const router = useRouter();
  
  // Auth Session
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Lists
  const [orgs, setOrgs] = useState<Organizacion[]>([]);
  const [ayudas, setAyudas] = useState<AyudaHumanitaria[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [victimas, setVictimas] = useState<Victima[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);

  // Navigation state
  const [activeTab, setActiveTab] = useState<string>('ORGANIZACIONES');

  // Lightbox modal state
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string>('');

  // Input states
  const [followUpText, setFollowUpText] = useState<{ [key: string]: string }>({});
  const [victimForm, setVictimForm] = useState({
    nombre: '',
    documentoIdentidad: '',
    edad: 30,
    genero: 'MASCULINO',
    afectacionTipo: 'LESIONADO',
    detalles: '',
    contactoFamiliar: '',
    departamentoId: 'LP',
    localidad: '',
    fotografia: '', // Added Base64 uploader support
  });

  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    // Session Guard check
    const userSession = sessionStorage.getItem('ayuda_usuario');
    if (!userSession) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userSession);
    setCurrentUser(parsedUser);

    // Initial Database loading
    HelpApi.init();
    setOrgs(HelpApi.getOrganizaciones());
    setAyudas(HelpApi.getAyudas());
    setHospitals(HelpApi.getHospitales());
    setReportes(HelpApi.getReportes());
    setVictimas(HelpApi.getVictimas());
    setLogs(HelpApi.getLogs());
  }, []);

  // Flash notification
  const triggerNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // 1. Moderate Organization verified state
  const handleVerifyOrg = (id: string, verificado: boolean) => {
    HelpApi.verifyOrganizacion(id, verificado);
    setOrgs(HelpApi.getOrganizaciones());
    setLogs(HelpApi.getLogs());
    triggerNotice(`Organización estado de verificación actualizado.`);
  };

  // 2. Moderate Aid requests
  const handleUpdateAid = (id: string, estado: string) => {
    const text = followUpText[id] || 'Coordinación gubernamental en proceso.';
    HelpApi.updateAyuda(id, { estado, seguimiento: text });
    setAyudas(HelpApi.getAyudas());
    setLogs(HelpApi.getLogs());
    triggerNotice(`Solicitud de ayuda marcada como ${estado}.`);
  };

  // 3. Hospital Status Oxygen levels
  const handleUpdateHospitalOxygen = (id: string, oxigeno: string, camas: number) => {
    HelpApi.updateHospital(id, { oxigenoDisponibilidad: oxigeno, camasLibres: Number(camas) });
    setHospitals(HelpApi.getHospitales());
    setLogs(HelpApi.getLogs());
    triggerNotice(`Indicadores de hospital actualizados con éxito.`);
  };

  // 4. Verify Citizen report
  const handleVerifyReport = (id: string, estado: string) => {
    HelpApi.verifyReporte(id, estado);
    setReportes(HelpApi.getReportes());
    setLogs(HelpApi.getLogs());
    triggerNotice(`Reporte ciudadano clasificado como ${estado}.`);
  };

  // 5. Submit Victim Profile (Confidential)
  const handleAddVictim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!victimForm.nombre || !victimForm.detalles || !victimForm.localidad) {
      triggerNotice('Por favor llene los campos requeridos de la víctima.');
      return;
    }

    HelpApi.addVictima({
      nombre: victimForm.nombre,
      documentoIdentidad: victimForm.documentoIdentidad || null,
      edad: Number(victimForm.edad),
      genero: victimForm.genero,
      afectacionTipo: victimForm.afectacionTipo,
      detalles: victimForm.detalles,
      contactoFamiliar: victimForm.contactoFamiliar || null,
      departamentoId: victimForm.departamentoId,
      localidad: victimForm.localidad,
      fotografia: victimForm.fotografia || null,
    });

    setVictimas(HelpApi.getVictimas());
    setLogs(HelpApi.getLogs());
    triggerNotice('Víctima registrada con éxito en la base confidencial nacional.');
    setVictimForm({
      nombre: '',
      documentoIdentidad: '',
      edad: 30,
      genero: 'MASCULINO',
      afectacionTipo: 'LESIONADO',
      detalles: '',
      contactoFamiliar: '',
      departamentoId: 'LP',
      localidad: '',
      fotografia: '',
    });
  };

  const handleVictimPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVictimForm(prev => ({ ...prev, fotografia: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // PDF & Excel Mock exporters
  const handleExport = (format: 'PDF' | 'EXCEL') => {
    triggerNotice(`Preparando exportación institucional cifrada en formato ${format}...`);
    setTimeout(() => {
      triggerNotice(`Descarga completa exitosa. Archivo firmado con clave digital gubernamental.`);
    }, 1500);
  };

  if (!currentUser) return null;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-6">
        
        {/* Top Banner Dashboard */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
              Panel Gubernamental Institucional
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-blue-800" />
              Consola de Coordinación y Moderación
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Gestión y auditoría en tiempo real para servidores autorizados del Viceministerio de Defensa Civil.
            </p>
          </div>

          {/* Exporters buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('EXCEL')}
              className="flex items-center gap-1.5 px-4.5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Exportar Excel
            </button>
            <button
              onClick={() => handleExport('PDF')}
              className="flex items-center gap-1.5 px-4.5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <ClipboardList className="w-4 h-4 text-rose-400" />
              Exportar Acta PDF
            </button>
          </div>
        </div>

        {/* Real-time Notice banner */}
        {notification && (
          <div className="p-3.5 bg-blue-600 border border-blue-500 rounded-xl text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/10">
            <Info className="w-4 h-4 animate-bounce" />
            <span>{notification}</span>
          </div>
        )}

        {/* Main split layout (Sidebar menu + Operations panel) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Sidebar menu & User Profile details */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* User card info */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-left">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                Firma Digital Activa
              </h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 font-extrabold flex items-center justify-center text-sm shadow-sm select-none">
                  {currentUser.nombre.charAt(0)}
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-extrabold text-slate-900 leading-snug">{currentUser.nombre}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">{currentUser.email}</p>
                </div>
              </div>
              <div className="mt-3.5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold">
                <span className="text-slate-400">ROL ASIGNADO:</span>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md uppercase tracking-wider">
                  {currentUser.rolId}
                </span>
              </div>
            </div>

            {/* Nav Drawer tabs selector */}
            <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm space-y-1 text-left">
              <button
                onClick={() => setActiveTab('ORGANIZACIONES')}
                className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'ORGANIZACIONES'
                    ? 'bg-blue-600 text-white font-extrabold shadow-md shadow-blue-500/10'
                    : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" />
                Moderar Organizaciones
              </button>

              <button
                onClick={() => setActiveTab('AYUDAS')}
                className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'AYUDAS'
                    ? 'bg-blue-600 text-white font-extrabold shadow-md shadow-blue-500/10'
                    : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Heart className="w-4 h-4" />
                Atender Solicitudes Ayuda
              </button>

              <button
                onClick={() => setActiveTab('HOSPITALES')}
                className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'HOSPITALES'
                    ? 'bg-blue-600 text-white font-extrabold shadow-md shadow-blue-500/10'
                    : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Activity className="w-4 h-4" />
                Monitoreo Oxígeno
              </button>

              <button
                onClick={() => setActiveTab('REPORTES')}
                className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'REPORTES'
                    ? 'bg-blue-600 text-white font-extrabold shadow-md shadow-blue-500/10'
                    : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                Auditar Reportes
              </button>

              {/* SENSITIVE: Victims panel */}
              <button
                onClick={() => setActiveTab('VICTIMAS')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'VICTIMAS'
                    ? 'bg-blue-600 text-white font-extrabold shadow-md shadow-blue-500/10'
                    : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4" />
                  Registro Víctimas
                </span>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-rose-100 text-rose-700 uppercase tracking-widest border border-rose-200">
                  LPD
                </span>
              </button>

              {/* SUPER ADMIN ONLY: Audit logs */}
              <button
                onClick={() => setActiveTab('LOGS')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'LOGS'
                    ? 'bg-blue-600 text-white font-extrabold shadow-md shadow-blue-500/10'
                    : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <ClipboardList className="w-4 h-4" />
                  Logs Trazabilidad
                </span>
                {currentUser.rolId !== 'SUPER_ADMIN' && <Lock className="w-3 h-3 text-slate-400" />}
              </button>

            </div>

          </div>

          {/* Right Side: Tab Details Operation center */}
          <div className="lg:col-span-9 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm min-h-[60vh] text-left">
            
            {/* TAB 1: MODERAR ORGANIZACIONES */}
            {activeTab === 'ORGANIZACIONES' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Moderación e Incorporación de Organizaciones
                  </h2>
                  <p className="text-[11px] text-slate-550 mt-1">
                    Valide el estatus oficial de las organizaciones registradas públicamente para darles insignia verificada.
                  </p>
                </div>

                <div className="space-y-4">
                  {orgs.map(org => (
                    <div 
                      key={org.id} 
                      className="p-4.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-slate-350 transition-all duration-300"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
                        {/* Organization Logo with Click-to-Lightbox */}
                        <div className="shrink-0">
                          {org.logo ? (
                            <div className="relative group w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-white">
                              <img 
                                src={org.logo} 
                                alt={org.nombre} 
                                onClick={() => { setLightboxUrl(org.logo || null); setLightboxTitle(`Logotipo de ${org.nombre}`); }}
                                className="w-full h-full object-cover cursor-zoom-in group-hover:scale-110 transition-all duration-300"
                              />
                              <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                <Eye className="w-3.5 h-3.5 text-white" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 select-none">
                              <Camera className="w-4 h-4" />
                              <span className="text-[8px] font-bold mt-0.5">S/L</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-xs font-extrabold text-slate-955">{org.nombre}</h4>
                            <span className="px-2 py-0.5 rounded text-[8px] font-extrabold bg-blue-50 text-blue-800 border border-blue-105 uppercase tracking-wider">
                              {org.tipo.replace('_', ' ')}
                            </span>
                            {org.sector && (
                              <span className="px-2 py-0.5 rounded text-[8px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
                                {org.sector}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 font-medium">Responsable: {org.responsable} • {org.contacto} • {org.email}</p>
                          <p className="text-[10px] text-slate-500 italic">"{org.descripcion}"</p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {org.verificado ? (
                          <button
                            onClick={() => handleVerifyOrg(org.id, false)}
                            className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                            Quitar Verificado
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVerifyOrg(org.id, true)}
                            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Dar Verificado
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: ATENDER SOLICITUDES DE AYUDA */}
            {activeTab === 'AYUDAS' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Gestión y Atención de Ayuda Humanitaria
                  </h2>
                  <p className="text-[11px] text-slate-550 mt-1">
                    Revise los requerimientos de la población y actualice sus estados de atención junto con los registros de seguimiento.
                  </p>
                </div>

                <div className="space-y-4">
                  {ayudas.map(ayuda => (
                    <div 
                      key={ayuda.id} 
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row justify-between gap-3 border-b border-slate-200/50 pb-3">
                        <div>
                          <span className="px-2 py-0.5 rounded text-[8px] font-extrabold bg-blue-100 text-blue-800 uppercase tracking-wider block w-fit mb-1">
                            {ayuda.tipologia}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900">Solicitante: {ayuda.solicitante}</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">Ubicación: {ayuda.direccion}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 text-amber-800 border border-amber-250 uppercase">
                            {ayuda.urgencia}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-slate-200 text-slate-700 border border-slate-300 uppercase">
                            {ayuda.estado}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 font-semibold italic">"{ayuda.descripcion}"</p>

                      {/* Media evidence if present */}
                      {ayuda.evidenciaMedia && (
                        <div className="mt-2.5 space-y-1.5 text-left">
                          <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                            Evidencia Gráfica del Caso
                          </span>
                          <div className="relative group max-w-sm rounded-xl overflow-hidden border border-slate-250 bg-slate-100">
                            <img 
                              src={ayuda.evidenciaMedia} 
                              alt={`Evidencia de ${ayuda.solicitante}`} 
                              onClick={() => { setLightboxUrl(ayuda.evidenciaMedia || null); setLightboxTitle(`Evidencia de Solicitante - ${ayuda.solicitante}`); }}
                              className="w-full h-40 object-cover cursor-zoom-in group-hover:scale-105 transition-all duration-300"
                            />
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                              <span className="bg-white/90 backdrop-blur-sm text-slate-950 px-3 py-1.5 rounded-lg text-[9px] font-extrabold shadow flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5 text-blue-700" />
                                Ampliar Evidencia
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Follow-up input form */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Actualizar Bitácora de Seguimiento
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. Cisterna de oxígeno coordinada con CAINCO. Envío programado."
                          className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs focus:outline-none focus:border-blue-500"
                          value={followUpText[ayuda.id] || ayuda.seguimiento || ''}
                          onChange={(e) => setFollowUpText({ ...followUpText, [ayuda.id]: e.target.value })}
                        />
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-2 pt-1.5 justify-end">
                        <button
                          onClick={() => handleUpdateAid(ayuda.id, 'EN_PROCESO')}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
                        >
                          Marcar En Proceso
                        </button>
                        <button
                          onClick={() => handleUpdateAid(ayuda.id, 'ATENDIDO')}
                          className="bg-emerald-650 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
                        >
                          Marcar Atendido
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: MONITOREO CLINICO */}
            {activeTab === 'HOSPITALES' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Actualización de Disponibilidad en Hospitales
                  </h2>
                  <p className="text-[11px] text-slate-550 mt-1">
                    Monitoree el oxígeno medicinal y capacidad crítica para informar a las instituciones ejecutoras de apoyo.
                  </p>
                </div>

                <div className="space-y-4">
                  {hospitals.map(h => (
                    <div 
                      key={h.id} 
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{h.nombre}</h4>
                        <span className="text-[10px] text-slate-500 block">Médico: {h.responsableNombre} ({h.responsableContacto})</span>
                        
                        {/* Media evidence if present */}
                        {h.evidenciaMedia && (
                          <div className="mt-2.5">
                            <img 
                              src={h.evidenciaMedia} 
                              alt={`Evidencia Oxígeno - ${h.nombre}`} 
                              onClick={() => { setLightboxUrl(h.evidenciaMedia || null); setLightboxTitle(`Evidencia Oxígeno - ${h.nombre}`); }}
                              className="w-24 h-16 rounded-lg object-cover cursor-zoom-in border border-slate-200 hover:brightness-90 transition-all duration-200"
                            />
                          </div>
                        )}
                      </div>

                      {/* Form elements for fast save */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Oxígeno</label>
                          <select
                            className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-[10px] focus:outline-none"
                            value={h.oxigenoDisponibilidad}
                            onChange={(e) => handleUpdateHospitalOxygen(h.id, e.target.value, h.camasLibres)}
                          >
                            <option value="SUFICIENTE">SUFICIENTE</option>
                            <option value="LIMITADO">LIMITADO</option>
                            <option value="CRITICO">CRITICO</option>
                            <option value="AGOTADO">AGOTADO</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Camas Libres</label>
                          <input
                            type="number"
                            className="w-full bg-white border border-slate-200 rounded-lg p-1 text-[10px] text-center"
                            value={h.camasLibres}
                            onChange={(e) => handleUpdateHospitalOxygen(h.id, h.oxigenoDisponibilidad, Number(e.target.value))}
                          />
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-250 uppercase">
                          Criticidad: {h.estadoGeneral}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: AUDITAR REPORTES CIUDADANOS */}
            {activeTab === 'REPORTES' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Moderación del Sistema de Verificación Ciudadana
                  </h2>
                  <p className="text-[11px] text-slate-550 mt-1">
                    Audite los reportes de incidentes o bulos que los ciudadanos registran para mantener información limpia.
                  </p>
                </div>

                <div className="space-y-4">
                  {reportes.map(r => (
                    <div 
                      key={r.id} 
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-slate-955">{r.titulo}</h4>
                        <span className="px-2 py-0.5 rounded text-[8px] font-extrabold bg-slate-200 text-slate-700 uppercase">
                          {r.estado}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-650">"{r.descripcion}"</p>
                      
                      {r.fuenteSocial && (
                        <p className="text-[10px] text-blue-655 font-semibold truncate max-w-sm">
                          Red Social / Fuente: <a href={r.fuenteSocial} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">{r.fuenteSocial}</a>
                        </p>
                      )}

                      {/* Media evidence if present */}
                      {r.evidenciaMedia && (
                        <div className="mt-2 text-left">
                          <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                            Evidencia Multimedia Cargada
                          </span>
                          <div className="relative group w-48 h-28 rounded-xl overflow-hidden border border-slate-255 bg-slate-100">
                            <img 
                              src={r.evidenciaMedia} 
                              alt={`Evidencia de ${r.titulo}`} 
                              onClick={() => { setLightboxUrl(r.evidenciaMedia || null); setLightboxTitle(`Evidencia de Reporte - ${r.titulo}`); }}
                              className="w-full h-full object-cover cursor-zoom-in group-hover:scale-105 transition-all duration-300"
                            />
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                              <span className="bg-white/95 backdrop-blur-sm text-slate-955 px-2 py-1 rounded-lg text-[9px] font-bold flex items-center gap-1 shadow">
                                <Eye className="w-3 h-3 text-blue-750" />
                                Ampliar
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/40">
                        <button
                          onClick={() => handleVerifyReport(r.id, 'INFORMACION_FALSA')}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
                        >
                          Bulo / Información Falsa
                        </button>
                        <button
                          onClick={() => handleVerifyReport(r.id, 'VERIFICADO')}
                          className="bg-emerald-650 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
                        >
                          Verificar Autenticidad
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: REGISTRO DE VICTIMAS (SENSITIVE - Restricted Access) */}
            {activeTab === 'VICTIMAS' && (
              <div className="space-y-6">
                
                {/* Permission shield banner */}
                <div className="p-4 bg-rose-50 border border-rose-150 rounded-2xl flex items-start gap-3.5">
                  <Lock className="w-8 h-8 text-rose-650 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                      Base de Datos Protegida por la Ley de Protección de Datos Personales
                    </h4>
                    <p className="text-[10px] text-rose-700 leading-relaxed">
                      El registro de damnificados, fallecidos y lesionados contiene información altamente confidencial. Su visualización y descarga está restringida y auditada. Cualquier exportación requiere justificación notariada.
                    </p>
                  </div>
                </div>

                {/* Show Restricted registration form for Admins, Moderators, Verifiers */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 text-blue-750" />
                    Agregar Víctima / Afectación Oficial
                  </h3>

                  <form onSubmit={handleAddVictim} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Nombre Completo *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. Juan Carlos Mamani"
                          className="w-full bg-white border border-slate-250 rounded-lg p-2.5 focus:outline-none"
                          value={victimForm.nombre}
                          onChange={(e) => setVictimForm({ ...victimForm, nombre: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Documento Identidad</label>
                        <input
                          type="text"
                          placeholder="Ej. 4839281 LP"
                          className="w-full bg-white border border-slate-250 rounded-lg p-2.5 focus:outline-none"
                          value={victimForm.documentoIdentidad}
                          onChange={(e) => setVictimForm({ ...victimForm, documentoIdentidad: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Edad</label>
                          <input
                            type="number"
                            className="w-full bg-white border border-slate-250 rounded-lg p-2 focus:outline-none"
                            value={victimForm.edad}
                            onChange={(e) => setVictimForm({ ...victimForm, edad: Number(e.target.value) })}
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Género</label>
                          <select
                            className="w-full bg-white border border-slate-250 rounded-lg p-2.5 focus:outline-none"
                            value={victimForm.genero}
                            onChange={(e) => setVictimForm({ ...victimForm, genero: e.target.value })}
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
                          className="w-full bg-white border border-slate-250 rounded-lg p-2.5 focus:outline-none"
                          value={victimForm.afectacionTipo}
                          onChange={(e) => setVictimForm({ ...victimForm, afectacionTipo: e.target.value })}
                        >
                          <option value="LESIONADO">LESIONADO</option>
                          <option value="DESAPARECIDO">DESAPARECIDO</option>
                          <option value="FALLECIDO">FALLECIDO</option>
                          <option value="DAMNIFICADO">DAMNIFICADO / ALBERGADO</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Contacto Familiar</label>
                        <input
                          type="text"
                          placeholder="Ej. Celular cónyuge"
                          className="w-full bg-white border border-slate-250 rounded-lg p-2.5 focus:outline-none"
                          value={victimForm.contactoFamiliar}
                          onChange={(e) => setVictimForm({ ...victimForm, contactoFamiliar: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Dpto *</label>
                          <select
                            className="w-full bg-white border border-slate-250 rounded-lg p-2.5 focus:outline-none"
                            value={victimForm.departamentoId}
                            onChange={(e) => setVictimForm({ ...victimForm, departamentoId: e.target.value })}
                          >
                            <option value="LP">La Paz</option>
                            <option value="CB">Cochabamba</option>
                            <option value="SC">Santa Cruz</option>
                            <option value="OR">Oruro</option>
                            <option value="PT">Potosí</option>
                            <option value="TJ">Tarija</option>
                            <option value="CH">Chuquisaca</option>
                            <option value="BE">Beni</option>
                            <option value="PD">Pando</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Localidad *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ej. Cliza"
                            className="w-full bg-white border border-slate-250 rounded-lg p-2 focus:outline-none"
                            value={victimForm.localidad}
                            onChange={(e) => setVictimForm({ ...victimForm, localidad: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Detalles Clínicos / Búsqueda *</label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Describa el diagnóstico médico o circunstancias de la desaparición..."
                        className="w-full bg-white border border-slate-250 rounded-lg p-2.5 focus:outline-none"
                        value={victimForm.detalles}
                        onChange={(e) => setVictimForm({ ...victimForm, detalles: e.target.value })}
                      ></textarea>
                    </div>

                    {/* Base64 Photograph Uploader */}
                    <div className="space-y-2">
                      <label className="block font-bold text-slate-700">Fotografía / Evidencia de Identidad (Opcional)</label>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-250 hover:border-blue-500 rounded-xl p-4 bg-white cursor-pointer transition-all">
                            <div className="flex flex-col items-center justify-center space-y-1">
                              <Camera className="w-5 h-5 text-slate-400" />
                              <span className="text-[11px] font-bold text-slate-655">Cargar Fotografía</span>
                              <span className="text-[9px] text-slate-400">JPG, PNG hasta 5MB</span>
                            </div>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleVictimPhotoChange}
                              className="hidden" 
                            />
                          </label>
                        </div>

                        {victimForm.fotografia && (
                          <div className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-250 bg-slate-100">
                            <img 
                              src={victimForm.fotografia} 
                              alt="Vista previa de fotografía de víctima" 
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setVictimForm(prev => ({ ...prev, fotografia: '' }))}
                              className="absolute top-1 right-1 p-1 bg-slate-900/85 hover:bg-slate-955 text-white rounded-full transition-all shadow"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="bg-rose-750 hover:bg-rose-700 text-white font-bold py-2.5 px-5 rounded-lg flex items-center gap-1.5 shadow-sm"
                    >
                      <UserCheck className="w-4 h-4" />
                      Registrar Afectado
                    </button>
                  </form>
                </div>

                {/* Listings */}
                <div className="space-y-4">
                  {victimas.map(v => (
                    <div 
                      key={v.id} 
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between gap-3 text-left hover:border-slate-350 transition-all duration-300"
                    >
                      <div className="flex gap-4 items-start flex-1">
                        {/* Portrait Thumbnail */}
                        <div className="shrink-0 mt-0.5">
                          {v.fotografia ? (
                            <div className="relative group w-14 h-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
                              <img 
                                src={v.fotografia} 
                                alt={v.nombre} 
                                onClick={() => { setLightboxUrl(v.fotografia || null); setLightboxTitle(`Retrato Oficial - ${v.nombre}`); }}
                                className="w-full h-full object-cover cursor-zoom-in group-hover:scale-110 transition-all duration-300"
                              />
                              <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                <Eye className="w-3.5 h-3.5 text-white" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 select-none">
                              <Camera className="w-4 h-4" />
                              <span className="text-[7px] font-bold mt-0.5 text-center leading-none">SIN FOTO</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1 flex-1">
                          <h4 className="text-xs font-bold text-slate-900">{v.nombre}</h4>
                          <p className="text-[10px] text-slate-550 font-semibold">CI: {v.documentoIdentidad || 'No proporcionado'} • Edad: {v.edad || 'Desconocida'} • {v.genero} • Dpto/Localidad: {v.departamentoId} ({v.localidad})</p>
                          <p className="text-[11px] text-slate-700 leading-snug">Detalles afectación: <strong>{v.detalles}</strong></p>
                        </div>
                      </div>

                      <div className="sm:text-right shrink-0 flex flex-col justify-center">
                        <span className="px-2 py-0.5 rounded text-[8px] font-extrabold bg-rose-100 text-rose-800 border border-rose-250 uppercase block w-fit sm:ml-auto">
                          {v.afectacionTipo}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold mt-1">
                          Contacto familiar: {v.contactoFamiliar || 'Ninguno'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* TAB 6: TRAZABILIDAD / AUDIT LOGS (SUPER_ADMIN ONLY) */}
            {activeTab === 'LOGS' && (
              <div className="space-y-6">
                
                {currentUser.rolId === 'SUPER_ADMIN' ? (
                  <>
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900">
                        Trazabilidad y Auditoría Institucional
                      </h2>
                      <p className="text-[11px] text-slate-550 mt-1">
                        Registro completo e inmutable de todas las acciones y modificaciones realizadas por usuarios en el sistema.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {logs.map(log => (
                        <div 
                          key={log.id} 
                          className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-750 flex flex-col sm:flex-row justify-between gap-3 text-left"
                        >
                          <div className="space-y-1 leading-snug">
                            <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold uppercase tracking-wider text-[8px]">
                                {log.accion}
                              </span>
                              Tabla: <strong className="font-mono text-[10px]">{log.tabla}</strong>
                            </p>
                            <p className="text-[11px] text-slate-600">Registro: {log.detalles}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">Realizado por: {log.usuarioNombre} ({log.usuarioEmail})</p>
                          </div>

                          <div className="sm:text-right shrink-0 flex flex-col justify-center text-[10px] text-slate-400 font-semibold">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(log.createdAt).toLocaleString()}
                            </span>
                            <span>IP: {log.ipAddress}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <UserX className="w-12 h-12 text-rose-600 animate-bounce" />
                    <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                      Acceso Totalmente Denegado
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm">
                      Los logs de trazabilidad y auditoría inmutable del sistema nacional solo pueden ser visualizados por la cuenta activa del <strong>Super Administrador</strong>.
                    </p>
                  </div>
                )}

              </div>
            )}

          </div>
        </div>

      </div>

      {/* LIGHTBOX MODAL */}
      {lightboxUrl && (
        <div 
          className="fixed inset-0 z-[999] bg-slate-955/80 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 animate-fade-in"
          onClick={() => setLightboxUrl(null)}
        >
          <div 
            className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 max-w-3xl w-full relative animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header bar */}
            <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white">
              <h3 className="text-sm font-extrabold tracking-tight">{lightboxTitle}</h3>
              <button 
                onClick={() => setLightboxUrl(null)}
                className="p-1.5 hover:bg-slate-800 rounded-xl transition-all"
              >
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            {/* Image container */}
            <div className="bg-slate-950 flex items-center justify-center max-h-[70vh] p-2">
              <img 
                src={lightboxUrl} 
                alt="Visualización de Evidencia Ampliada" 
                className="max-h-[68vh] max-w-full object-contain"
              />
            </div>

            {/* Footer bar */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-250 flex justify-between items-center text-xs text-slate-550 font-bold">
              <span>Información y Auditoría Digital</span>
              <button 
                onClick={() => setLightboxUrl(null)}
                className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-all shadow-sm"
              >
                Cerrar Vista
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
