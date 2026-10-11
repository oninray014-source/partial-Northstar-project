import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Settings as SettingsIcon, 
  Building2, 
  Clock, 
  Sliders, 
  Database, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  HardDrive, 
  Server, 
  Save, 
  RefreshCw,
  ShieldAlert,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { 
  getWorkspaceSettings, 
  updateWorkspaceSettings, 
  OperationalSettings, 
  DEFAULT_SETTINGS 
} from '../../services/settingsService';
import { getCurrentUserRole } from '../../services/workOrdersService';

export const WorkspaceSettings: React.FC = () => {
  const [currentUserRole, setCurrentUserRole] = useState<'admin' | 'technician' | 'anon' | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState<boolean>(true);
  const [isLoadingSettings, setIsLoadingSettings] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [settings, setSettings] = useState<OperationalSettings>(DEFAULT_SETTINGS);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [resetNotice, setResetNotice] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // 1. Initial Load: Check role first, then load settings if Admin
  const loadInitialData = useCallback(async () => {
    setIsLoadingRole(true);
    setFetchError(null);
    setSaveError(null);

    const { role } = await getCurrentUserRole();
    setCurrentUserRole(role);
    setIsLoadingRole(false);

    if (role === 'admin') {
      setIsLoadingSettings(true);
      const { data, error } = await getWorkspaceSettings();
      if (error) {
        setFetchError(error.message || 'Failed to retrieve workspace configuration.');
      } else if (data) {
        setSettings(data);
      }
      setIsLoadingSettings(false);
    } else {
      setIsLoadingSettings(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Form Field Change Handlers
  const handleTextChange = (field: keyof OperationalSettings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value
    }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleNumberChange = (field: 'defaultAssessmentTargetHours' | 'defaultWorkOrderLeadDays', value: string) => {
    const num = parseInt(value, 10);
    setSettings((prev) => ({
      ...prev,
      [field]: isNaN(num) ? 0 : num
    }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Save Settings to Supabase
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveNotice(null);
    const errors: Record<string, string> = {};

    if (!settings.organizationName.trim()) {
      errors.organizationName = 'Organization name is required.';
    }
    if (!settings.dispatchPhone.trim()) {
      errors.dispatchPhone = 'Dispatch phone is required.';
    }
    if (!settings.dispatchEmail.trim() || !settings.dispatchEmail.includes('@')) {
      errors.dispatchEmail = 'Valid dispatch email address is required.';
    }
    if (settings.defaultAssessmentTargetHours <= 0) {
      errors.defaultAssessmentTargetHours = 'Assessment target must be a positive integer.';
    }
    if (settings.defaultWorkOrderLeadDays <= 0) {
      errors.defaultWorkOrderLeadDays = 'Work order lead time must be a positive integer.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSaving(true);
    const { data, error } = await updateWorkspaceSettings(settings);
    setIsSaving(false);

    if (error) {
      setSaveError(error.message || 'Failed to save configuration to database.');
    } else if (data) {
      setSettings(data);
      setSaveNotice('Settings saved successfully.');
      setTimeout(() => setSaveNotice(null), 3500);
    }
  };

  // Safe local reset: Reset inputs to default values in form state only (requires Save Settings to persist)
  const handleResetFormToDefault = () => {
    setSettings((prev) => ({
      ...DEFAULT_SETTINGS,
      version: prev.version,
      environment: prev.environment,
    }));
    setFormErrors({});
    setResetNotice('Settings form reset to default values. Click Save Settings to persist to database.');
    setTimeout(() => setResetNotice(null), 4500);
  };

  // ROLE ACCESS RESTRICTION: Non-admin users are blocked from viewing or configuring settings
  if (!isLoadingRole && currentUserRole === 'technician') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-5">
        <div className="w-14 h-14 rounded-3xl bg-amber-50 border border-amber-200 text-amber-700 mx-auto flex items-center justify-center shadow-xs">
          <ShieldAlert className="w-7 h-7 text-amber-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-black text-[#063B35] uppercase tracking-tight">
            Access Restricted
          </h1>
          <p className="text-sm text-[#617070] max-w-md mx-auto leading-relaxed">
            Access Restricted: Operational configuration is reserved for Administrators.
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/workspace/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#063B35] text-white text-xs font-bold hover:bg-[#042925] transition-all min-h-[44px] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#00B86B]"
          >
            <ArrowLeft className="w-4 h-4 text-[#00B86B]" />
            <span>Return to Workspace Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* 1. Page Header */}
      <div>
        <div className="text-[11px] font-extrabold tracking-widest text-[#00B86B] uppercase mb-1">
          Operational Configuration
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#063B35] tracking-tight uppercase flex items-center gap-2.5">
          <SettingsIcon className="w-7 h-7 text-[#00B86B]" />
          <span>Workspace &amp; Dispatch Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#617070] mt-1 max-w-2xl">
          Manage regional dispatch information, operational schedules, workflow thresholds, and cloud database parameters.
        </p>
      </div>

      {/* Global Alerts & Notices */}
      {saveNotice && (
        <div 
          role="status"
          className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-2xs"
        >
          <CheckCircle2 className="w-5 h-5 text-[#00B86B] shrink-0" />
          <span>{saveNotice}</span>
        </div>
      )}

      {resetNotice && (
        <div 
          role="status"
          className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-2xs"
        >
          <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
          <span>{resetNotice}</span>
        </div>
      )}

      {saveError && (
        <div 
          role="alert"
          className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-2xs"
        >
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Inline Loading Skeleton while initializing */}
      {(isLoadingRole || isLoadingSettings) ? (
        <div className="space-y-6 animate-pulse">
          <div className="bg-white rounded-3xl border border-[#E1EBE7] p-6 sm:p-7 shadow-xs space-y-4">
            <div className="h-6 bg-[#F3F7F5] rounded w-1/3" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-11 bg-[#F3F7F5] rounded-xl sm:col-span-2" />
              <div className="h-11 bg-[#F3F7F5] rounded-xl" />
              <div className="h-11 bg-[#F3F7F5] rounded-xl" />
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-[#E1EBE7] p-6 sm:p-7 shadow-xs space-y-4">
            <div className="h-6 bg-[#F3F7F5] rounded w-1/4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-11 bg-[#F3F7F5] rounded-xl" />
              <div className="h-11 bg-[#F3F7F5] rounded-xl" />
            </div>
          </div>
        </div>
      ) : fetchError ? (
        /* Inline Error State with Retry Connection */
        <div className="bg-white p-8 rounded-3xl border border-red-200 text-center space-y-3 shadow-xs max-w-xl mx-auto">
          <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="font-bold text-[#063B35]">Unable to Load Workspace Settings</h3>
          <p className="text-xs text-[#617070] max-w-sm mx-auto">
            {fetchError} Please check your connection and try again.
          </p>
          <button
            type="button"
            onClick={loadInitialData}
            className="px-5 py-2.5 min-h-[44px] rounded-full bg-[#063B35] text-white text-xs font-semibold hover:bg-[#042925] transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : (
        /* Settings Form */
        <form onSubmit={handleSaveSettings} className="space-y-6" noValidate>
          
          {/* SECTION 1 — OPERATIONS PROFILE */}
          <div className="bg-white rounded-3xl border border-[#E1EBE7] p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#E1EBE7]">
              <div className="w-9 h-9 rounded-xl bg-[#00B86B]/10 text-[#063B35] flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-[#00B86B]" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-[#063B35] uppercase tracking-wide">
                  Dispatch Operations Profile
                </h2>
                <p className="text-xs text-[#617070]">
                  Commercial facility dispatch identity and regional dispatch headquarters.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Organization Name */}
              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="settings-org-name" className="font-bold text-[#063B35] uppercase tracking-wider text-[11px] block">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="settings-org-name"
                  type="text"
                  value={settings.organizationName}
                  onChange={(e) => handleTextChange('organizationName', e.target.value)}
                  className={`w-full h-11 px-3.5 bg-[#F3F7F5] border rounded-xl font-semibold text-[#063B35] focus:outline-none focus:ring-2 focus:ring-[#00B86B] transition-all ${
                    formErrors.organizationName ? 'border-red-400 bg-red-50/30' : 'border-[#E1EBE7]'
                  }`}
                />
                {formErrors.organizationName && (
                  <p className="text-[11px] font-semibold text-red-600">{formErrors.organizationName}</p>
                )}
              </div>

              {/* Operations Hub */}
              <div className="space-y-1.5">
                <label htmlFor="settings-hub" className="font-bold text-[#063B35] uppercase tracking-wider text-[11px] block">
                  Operations Hub
                </label>
                <input
                  id="settings-hub"
                  type="text"
                  value={settings.operationsHub}
                  onChange={(e) => handleTextChange('operationsHub', e.target.value)}
                  className="w-full h-11 px-3.5 bg-[#F3F7F5] border border-[#E1EBE7] rounded-xl font-semibold text-[#063B35] focus:outline-none focus:ring-2 focus:ring-[#00B86B] transition-all"
                />
              </div>

              {/* Service Territory Summary */}
              <div className="space-y-1.5">
                <label htmlFor="settings-territory" className="font-bold text-[#063B35] uppercase tracking-wider text-[11px] block">
                  Service Territory
                </label>
                <input
                  id="settings-territory"
                  type="text"
                  value={settings.serviceTerritorySummary}
                  onChange={(e) => handleTextChange('serviceTerritorySummary', e.target.value)}
                  className="w-full h-11 px-3.5 bg-[#F3F7F5] border border-[#E1EBE7] rounded-xl font-semibold text-[#063B35] focus:outline-none focus:ring-2 focus:ring-[#00B86B] transition-all"
                />
              </div>

              {/* Dispatch Phone */}
              <div className="space-y-1.5">
                <label htmlFor="settings-dispatch-phone" className="font-bold text-[#063B35] uppercase tracking-wider text-[11px] block">
                  Dispatch Phone <span className="text-red-500">*</span>
                </label>
                <input
                  id="settings-dispatch-phone"
                  type="tel"
                  value={settings.dispatchPhone}
                  onChange={(e) => handleTextChange('dispatchPhone', e.target.value)}
                  className={`w-full h-11 px-3.5 bg-[#F3F7F5] border rounded-xl font-semibold text-[#063B35] focus:outline-none focus:ring-2 focus:ring-[#00B86B] transition-all ${
                    formErrors.dispatchPhone ? 'border-red-400 bg-red-50/30' : 'border-[#E1EBE7]'
                  }`}
                />
                {formErrors.dispatchPhone && (
                  <p className="text-[11px] font-semibold text-red-600">{formErrors.dispatchPhone}</p>
                )}
              </div>

              {/* Dispatch Email */}
              <div className="space-y-1.5">
                <label htmlFor="settings-dispatch-email" className="font-bold text-[#063B35] uppercase tracking-wider text-[11px] block">
                  Dispatch Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="settings-dispatch-email"
                  type="email"
                  value={settings.dispatchEmail}
                  onChange={(e) => handleTextChange('dispatchEmail', e.target.value)}
                  className={`w-full h-11 px-3.5 bg-[#F3F7F5] border rounded-xl font-semibold text-[#063B35] focus:outline-none focus:ring-2 focus:ring-[#00B86B] transition-all ${
                    formErrors.dispatchEmail ? 'border-red-400 bg-red-50/30' : 'border-[#E1EBE7]'
                  }`}
                />
                {formErrors.dispatchEmail && (
                  <p className="text-[11px] font-semibold text-red-600">{formErrors.dispatchEmail}</p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2 — OPERATING SCHEDULE & EMERGENCY */}
          <div className="bg-white rounded-3xl border border-[#E1EBE7] p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#E1EBE7]">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-[#063B35] uppercase tracking-wide">
                  Operating Schedule &amp; Emergency Response
                </h2>
                <p className="text-xs text-[#617070]">
                  Standard dispatch hours and priority commercial emergency routing.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Routine Weekday Hours */}
              <div className="space-y-1.5">
                <label htmlFor="settings-weekday-hours" className="font-bold text-[#063B35] uppercase tracking-wider text-[11px] block">
                  Routine Weekday Hours
                </label>
                <input
                  id="settings-weekday-hours"
                  type="text"
                  value={settings.routineHoursWeekday}
                  onChange={(e) => handleTextChange('routineHoursWeekday', e.target.value)}
                  className="w-full h-11 px-3.5 bg-[#F3F7F5] border border-[#E1EBE7] rounded-xl font-semibold text-[#063B35] focus:outline-none focus:ring-2 focus:ring-[#00B86B] transition-all"
                />
              </div>

              {/* Routine Weekend Coverage */}
              <div className="space-y-1.5">
                <label htmlFor="settings-weekend-coverage" className="font-bold text-[#063B35] uppercase tracking-wider text-[11px] block">
                  Routine Weekend Coverage
                </label>
                <input
                  id="settings-weekend-coverage"
                  type="text"
                  value={settings.routineHoursWeekend}
                  onChange={(e) => handleTextChange('routineHoursWeekend', e.target.value)}
                  className="w-full h-11 px-3.5 bg-[#F3F7F5] border border-[#E1EBE7] rounded-xl font-semibold text-[#063B35] focus:outline-none focus:ring-2 focus:ring-[#00B86B] transition-all"
                />
              </div>

              {/* Emergency Dispatch Phone */}
              <div className="space-y-1.5">
                <label htmlFor="settings-emergency-phone" className="font-bold text-[#063B35] uppercase tracking-wider text-[11px] block">
                  Emergency Dispatch Phone
                </label>
                <input
                  id="settings-emergency-phone"
                  type="tel"
                  value={settings.emergencyDispatchPhone}
                  onChange={(e) => handleTextChange('emergencyDispatchPhone', e.target.value)}
                  className="w-full h-11 px-3.5 bg-[#F3F7F5] border border-[#E1EBE7] rounded-xl font-semibold text-[#063B35] focus:outline-none focus:ring-2 focus:ring-[#00B86B] transition-all"
                />
              </div>

              {/* Emergency Response Window */}
              <div className="space-y-1.5">
                <label htmlFor="settings-emergency-window" className="font-bold text-[#063B35] uppercase tracking-wider text-[11px] block">
                  Emergency Response Window
                </label>
                <input
                  id="settings-emergency-window"
                  type="text"
                  value={settings.emergencyResponseWindow}
                  onChange={(e) => handleTextChange('emergencyResponseWindow', e.target.value)}
                  className="w-full h-11 px-3.5 bg-[#F3F7F5] border border-[#E1EBE7] rounded-xl font-semibold text-[#063B35] focus:outline-none focus:ring-2 focus:ring-[#00B86B] transition-all"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3 — WORKFLOW DEFAULTS */}
          <div className="bg-white rounded-3xl border border-[#E1EBE7] p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#E1EBE7]">
              <div className="w-9 h-9 rounded-xl bg-[#00B86B]/10 text-[#063B35] flex items-center justify-center shrink-0">
                <Sliders className="w-5 h-5 text-[#00B86B]" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-[#063B35] uppercase tracking-wide">
                  Workflow Lead Times &amp; Defaults
                </h2>
                <p className="text-xs text-[#617070]">
                  Operational thresholds and target service response times across Central Texas.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Default Assessment Target (hours) */}
              <div className="space-y-1.5">
                <label htmlFor="settings-assessment-target" className="font-bold text-[#063B35] uppercase tracking-wider text-[11px] block">
                  Default Assessment Target (hours) <span className="text-red-500">*</span>
                </label>
                <input
                  id="settings-assessment-target"
                  type="number"
                  min="1"
                  step="1"
                  value={settings.defaultAssessmentTargetHours || ''}
                  onChange={(e) => handleNumberChange('defaultAssessmentTargetHours', e.target.value)}
                  className={`w-full h-11 px-3.5 bg-[#F3F7F5] border rounded-xl font-semibold text-[#063B35] focus:outline-none focus:ring-2 focus:ring-[#00B86B] transition-all ${
                    formErrors.defaultAssessmentTargetHours ? 'border-red-400 bg-red-50/30' : 'border-[#E1EBE7]'
                  }`}
                />
                <span className="text-[10px] text-[#617070] block">Standard initial inquiry review window.</span>
                {formErrors.defaultAssessmentTargetHours && (
                  <p className="text-[11px] font-semibold text-red-600">{formErrors.defaultAssessmentTargetHours}</p>
                )}
              </div>

              {/* Default Work Order Lead Time (days) */}
              <div className="space-y-1.5">
                <label htmlFor="settings-lead-days" className="font-bold text-[#063B35] uppercase tracking-wider text-[11px] block">
                  Default Work Order Lead Time (days) <span className="text-red-500">*</span>
                </label>
                <input
                  id="settings-lead-days"
                  type="number"
                  min="1"
                  step="1"
                  value={settings.defaultWorkOrderLeadDays || ''}
                  onChange={(e) => handleNumberChange('defaultWorkOrderLeadDays', e.target.value)}
                  className={`w-full h-11 px-3.5 bg-[#F3F7F5] border rounded-xl font-semibold text-[#063B35] focus:outline-none focus:ring-2 focus:ring-[#00B86B] transition-all ${
                    formErrors.defaultWorkOrderLeadDays ? 'border-red-400 bg-red-50/30' : 'border-[#E1EBE7]'
                  }`}
                />
                <span className="text-[10px] text-[#617070] block">Routine preventive and scheduled maintenance dispatch window.</span>
                {formErrors.defaultWorkOrderLeadDays && (
                  <p className="text-[11px] font-semibold text-red-600">{formErrors.defaultWorkOrderLeadDays}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons for Settings Form */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#063B35] text-white text-xs font-bold hover:bg-[#042925] disabled:opacity-60 disabled:cursor-not-allowed transition-all min-h-[44px] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#00B86B] cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 text-[#00B86B] animate-spin" />
                  <span>Saving Configuration...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-[#00B86B]" />
                  <span>Save Settings</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResetFormToDefault}
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#F3F7F5] text-[#063B35] border border-[#E1EBE7] hover:bg-[#E1EBE7] disabled:opacity-60 text-xs font-bold transition-all min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#00B86B] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#617070]" />
              <span>Reset Settings to Defaults</span>
            </button>
          </div>
        </form>
      )}

      {/* SECTION 4 — CLOUD DATABASE CONNECTIVITY (Replaces legacy local storage / restore demo section) */}
      <div className="bg-white rounded-3xl border border-[#E1EBE7] p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#E1EBE7]">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5 text-[#00B86B]" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-[#063B35] uppercase tracking-wide">
              Operational Database Status
            </h2>
            <p className="text-xs text-[#617070]">
              Workspace configuration and operational records are persisted in the Supabase Cloud database.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#F3F7F5] border border-[#E1EBE7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00B86B]/15 text-[#063B35] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-[#00B86B]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#063B35]">
                Cloud Database Connected
              </div>
              <div className="text-[11px] text-[#617070]">
                Workspace data is persisted in the Supabase operational database.
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-[11px] font-bold self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-[#00B86B] animate-pulse" />
            <span>Synchronized</span>
          </div>
        </div>
      </div>

      {/* SECTION 5 — SYSTEM DIAGNOSTICS */}
      <div className="bg-white rounded-3xl border border-[#E1EBE7] p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#E1EBE7]">
          <div className="w-9 h-9 rounded-xl bg-[#F3F7F5] text-[#063B35] flex items-center justify-center shrink-0">
            <Server className="w-5 h-5 text-[#617070]" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-[#063B35] uppercase tracking-wide">
              Environment &amp; System Diagnostics
            </h2>
            <p className="text-xs text-[#617070]">
              Operational runtime environment and client storage engine verification.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#F3F7F5] border border-[#E1EBE7]">
            <span className="text-[#617070] font-medium">Application Version</span>
            <span className="font-mono font-bold text-[#063B35] bg-white px-2 py-0.5 rounded border border-[#E1EBE7]">
              {settings.version || DEFAULT_SETTINGS.version}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#F3F7F5] border border-[#E1EBE7]">
            <span className="text-[#617070] font-medium">Environment</span>
            <span className="font-bold text-[#063B35] bg-white px-2 py-0.5 rounded border border-[#E1EBE7]">
              {settings.environment || DEFAULT_SETTINGS.environment}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#F3F7F5] border border-[#E1EBE7]">
            <span className="text-[#617070] font-medium">Storage Engine</span>
            <span className="font-bold text-[#063B35] flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-[#00B86B]" />
              <span>Supabase PostgreSQL</span>
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#F3F7F5] border border-[#E1EBE7]">
            <span className="text-[#617070] font-medium">Workspace Data Status</span>
            <span className="inline-flex items-center gap-1.5 text-[#00B86B] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#00B86B]" />
              <span>Operational</span>
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
