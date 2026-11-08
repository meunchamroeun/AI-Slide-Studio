'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Cpu,
  Key,
  Server,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  ArrowRight,
  UserCheck,
  Clock,
  HardDrive,
  Monitor,
} from 'lucide-react';
import { AppShell } from '@/components/app/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth, ADMIN_EMAIL } from '@/components/auth/auth-provider';
import { useI18n } from '@/components/i18n-provider';
import { toast } from 'sonner';

interface AdminOverviewData {
  superAdminEmail: string;
  serverConfig: {
    hasApiKey: boolean;
    model: string;
    isLive: boolean;
  };
  stats: {
    totalPresentations: number;
    totalGenerationJobs: number;
    recentJobs: any[];
    uptimeSeconds: number;
    nodeVersion: string;
  };
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    isSuperAdmin: boolean;
    status: string;
    lastActive: string;
  }>;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, loginAdmin } = useAuth();
  const { locale } = useI18n();

  const [overview, setOverview] = useState<AdminOverviewData | null>(null);
  const [presentations, setPresentations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(false);
  const [testingKey, setTestingKey] = useState(false);

  // Form states
  const [serverApiKey, setServerApiKey] = useState('');
  const [serverModel, setServerModel] = useState('gemini-3.5-flash');
  const [showKey, setShowKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchAdminData = async () => {
    try {
      const [resOverview, resPres] = await Promise.all([
        fetch('/api/admin/overview'),
        fetch('/api/admin/presentations'),
      ]);

      if (resOverview.ok) {
        const data = await resOverview.json();
        setOverview(data);
        if (data.serverConfig?.model) {
          setServerModel(data.serverConfig.model);
        }
      }

      if (resPres.ok) {
        const presData = await resPres.json();
        setPresentations(presData);
      }
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleSaveServerConfig = async () => {
    setSavingKey(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/server-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: serverApiKey || undefined,
          model: serverModel,
        }),
      });

      if (!res.ok) throw new Error('Failed to update server configuration');
      toast.success(
        locale === 'kh'
          ? 'បានរក្សាទុកការកំណត់ Gemini API របស់ Server ដោយជោគជ័យ'
          : 'Server Gemini API configuration updated successfully'
      );
      setServerApiKey('');
      fetchAdminData();
    } catch (err: any) {
      toast.error(err?.message || 'Update failed');
    } finally {
      setSavingKey(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingKey(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: serverApiKey || undefined,
        }),
      });

      const data = await res.json();
      setTestResult(data);
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Connection test request failed',
      });
    } finally {
      setTestingKey(false);
    }
  };

  const handleDeletePresentation = async (id: string) => {
    if (!confirm(locale === 'kh' ? 'តើអ្នកប្រាកដជាចង់លុបបទបង្ហាញនេះមែនទេ?' : 'Are you sure you want to delete this presentation?')) {
      return;
    }
    try {
      const res = await fetch(`/api/presentations/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success(locale === 'kh' ? 'បានលុបបទបង្ហាញដោយជោគជ័យ' : 'Presentation deleted');
        setPresentations((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      toast.error('Failed to delete presentation');
    }
  };

  // Check admin role
  const isAdmin = user?.role === 'admin' || user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 max-w-6xl mx-auto w-full space-y-8">
        {/* Access Warning if not admin */}
        {!isAdmin && (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-6 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-6 text-amber-500 shrink-0" />
              <div>
                <h3 className="font-serif text-sm sm:text-base font-semibold text-foreground">
                  {locale === 'kh'
                    ? 'ការចូលប្រើប្រាស់កម្រិត Super Administrator'
                    : 'Super Administrator Access Required'}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {locale === 'kh'
                    ? `ទំព័រនេះសម្រាប់គណនី Admin: ${ADMIN_EMAIL}`
                    : `This management console is restricted to the administrator: ${ADMIN_EMAIL}`}
                </p>
              </div>
            </div>

            <Button
              onClick={async () => {
                await loginAdmin();
                fetchAdminData();
              }}
              size="sm"
              className="rounded-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold text-xs h-9 px-4 shrink-0 shadow-sm gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="size-3.5" />
              <span>{locale === 'kh' ? 'ចូលជា Admin ឥឡូវនេះ' : `Sign in as ${ADMIN_EMAIL}`}</span>
            </Button>
          </div>
        )}

        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <ShieldCheck className="size-3" />
                <span>SUPER ADMINISTRATOR</span>
              </span>
              <span className="text-border">·</span>
              <span className="text-xs text-muted-foreground font-mono">
                {ADMIN_EMAIL}
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-foreground">
              {locale === 'kh' ? 'ផ្ទាំងគ្រប់គ្រងរដ្ឋបាល & API Key' : 'Admin Management & API Console'}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {locale === 'kh'
                ? 'កំណត់ Gemini API Key លំនាំដើមរបស់ Server គ្រប់គ្រងអ្នកប្រើប្រាស់ និងតាមដានបទបង្ហាញ AI'
                : 'Configure server default Gemini API key, manage studio users, and inspect presentations'}
            </p>
          </div>

          <Button
            onClick={fetchAdminData}
            variant="outline"
            size="sm"
            className="rounded-full text-xs h-9 gap-1.5 border-border/80 hover:bg-secondary cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className="size-3.5" />
            <span>{locale === 'kh' ? 'ផ្ទុកទិន្នន័យឡើងវិញ' : 'Refresh Telemetry'}</span>
          </Button>
        </div>

        {/* Platform Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-border/70 bg-card/60 p-4 backdrop-blur-sm space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs">{locale === 'kh' ? 'បទបង្ហាញសរុប' : 'Total Presentations'}</span>
              <Layers className="size-4 text-brand" />
            </div>
            <div className="font-serif text-2xl font-bold text-foreground">
              {overview?.stats?.totalPresentations ?? 0}
            </div>
            <div className="text-[10px] text-muted-foreground">PostgreSQL JSON storage</div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card/60 p-4 backdrop-blur-sm space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs">{locale === 'kh' ? 'ការបង្កើតដោយ AI' : 'Generation Jobs'}</span>
              <Sparkles className="size-4 text-sky-400" />
            </div>
            <div className="font-serif text-2xl font-bold text-foreground">
              {overview?.stats?.totalGenerationJobs ?? 0}
            </div>
            <div className="text-[10px] text-muted-foreground">Completed via NestJS</div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card/60 p-4 backdrop-blur-sm space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs">{locale === 'kh' ? 'ស្ថានភាព API លើ Server' : 'Server API Status'}</span>
              <Cpu className="size-4 text-emerald-400" />
            </div>
            <div className="font-serif text-sm font-semibold text-foreground flex items-center gap-1.5 pt-1">
              {overview?.serverConfig?.hasApiKey ? (
                <>
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400">Live API Key Set</span>
                </>
              ) : (
                <>
                  <span className="size-2 rounded-full bg-amber-400" />
                  <span className="text-amber-400">Deterministic Mode</span>
                </>
              )}
            </div>
            <div className="text-[10px] text-muted-foreground font-mono truncate">
              {overview?.serverConfig?.model || 'gemini-3.5-flash'}
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card/60 p-4 backdrop-blur-sm space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs">{locale === 'kh' ? 'ពេលវេលាដំណើរការ' : 'Server Uptime'}</span>
              <Clock className="size-4 text-purple-400" />
            </div>
            <div className="font-serif text-sm font-semibold text-foreground pt-1">
              {Math.floor((overview?.stats?.uptimeSeconds ?? 0) / 60)} mins
            </div>
            <div className="text-[10px] text-muted-foreground font-mono">
              Node {overview?.stats?.nodeVersion || 'v25'}
            </div>
          </div>
        </div>

        {/* Server Default Gemini API Key Manager */}
        <div className="rounded-3xl border border-brand/40 bg-card/80 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-brand/10 border border-brand/25 text-brand flex items-center justify-center shrink-0">
                <Key className="size-5" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-semibold text-foreground">
                  {locale === 'kh'
                    ? 'កំណត់ Gemini API Key លំនាំដើមរបស់ Server'
                    : 'Server Default Gemini API Key Configuration'}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {locale === 'kh'
                    ? 'Key នេះនឹងត្រូវបានប្រើដោយស្វ័យប្រវត្តិសម្រាប់អ្នកប្រើប្រាស់ដែលជ្រើសរើស "Server Admin Default"'
                    : 'This key powers slide generation for all users who choose "Server Admin Default" (no user key required)'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">
                Current Model: <strong className="text-foreground">{overview?.serverConfig?.model}</strong>
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {/* API Key Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center justify-between">
                <span>
                  {locale === 'kh' ? 'Google Gemini API Key ថ្មីរបស់ Server' : 'Set / Update Server Gemini API Key'}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {overview?.serverConfig?.hasApiKey
                    ? (locale === 'kh' ? 'Server មាន Key រួចហើយ' : 'Server currently has an active key')
                    : (locale === 'kh' ? 'Server មិនទាន់មាន Key (កំពុងប្រើ Offline Mode)' : 'No server key configured')}
                </span>
              </label>

              <div className="relative">
                <Input
                  type={showKey ? 'text' : 'password'}
                  value={serverApiKey}
                  onChange={(e) => setServerApiKey(e.target.value)}
                  placeholder="AIzaSy... (Paste Google Gemini API Key from Google AI Studio)"
                  className="pr-10 h-11 rounded-xl bg-stone-900 border-border/80 text-xs font-mono text-stone-100 placeholder:text-stone-400"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Model Select */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  {locale === 'kh' ? 'ម៉ូឌែល Gemini លំនាំដើម' : 'Server Default Gemini Model'}
                </label>
                <select
                  value={serverModel}
                  onChange={(e) => setServerModel(e.target.value)}
                  className="w-full h-11 rounded-xl bg-stone-900 border border-border/80 px-3 text-xs text-stone-100 focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer"
                >
                  <option value="gemini-3.5-flash">gemini-3.5-flash (Recommended · Next-Gen Multimodal Free Tier)</option>
                  <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite (Ultra Fast Latency Free Tier)</option>
                  <option value="gemini-3.8-flash">gemini-3.8-flash (High Intelligence Free Tier)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  {locale === 'kh' ? 'សិទ្ធិប្រើប្រាស់' : 'Access Policy'}
                </label>
                <div className="h-11 rounded-xl bg-secondary/40 border border-border/70 px-3 flex items-center text-xs text-muted-foreground">
                  <span>Free Tier Ready · BYOK fallback allowed</span>
                </div>
              </div>
            </div>

            {/* Test Connection Result Notice */}
            {testResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                  testResult.success
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                    : 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="size-4 shrink-0 text-rose-400" />
                )}
                <span className="leading-relaxed">{testResult.message}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={testingKey}
                className="rounded-full text-xs h-10 px-4 gap-1.5 border-border/80 hover:bg-secondary cursor-pointer"
              >
                <Cpu className="size-3.5 text-sky-400" />
                <span>{testingKey ? 'Testing Connection...' : 'Test Server Connection'}</span>
              </Button>

              <Button
                type="button"
                onClick={handleSaveServerConfig}
                disabled={savingKey}
                className="rounded-full bg-primary hover:opacity-95 text-primary-foreground font-semibold text-xs h-10 px-6 gap-2 shadow-md cursor-pointer"
              >
                <CheckCircle2 className="size-3.5 text-brand" />
                <span>{savingKey ? 'Saving...' : 'Save Server Configuration'}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* User Accounts Table */}
        <div className="rounded-3xl border border-border/70 bg-card/60 p-6 backdrop-blur-xl shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base font-semibold text-foreground">
                {locale === 'kh' ? 'គណនីអ្នកប្រើប្រាស់ និងរដ្ឋបាល' : 'User Accounts & Roles'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {locale === 'kh'
                  ? 'បញ្ជីគណនីដែលមានសិទ្ធិចូលប្រើប្រាស់ និងសិទ្ធិរដ្ឋបាល'
                  : 'Platform user directory with role-based access control'}
              </p>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {overview?.users?.length ?? 2} accounts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground">
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Email Address</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {overview?.users?.map((u) => (
                  <tr key={u.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-3 font-medium text-foreground flex items-center gap-2">
                      <span>{u.name}</span>
                      {u.isSuperAdmin && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          SUPER ADMIN
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-muted-foreground">{u.email}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full font-mono text-[10px] uppercase font-semibold ${
                          u.role === 'admin'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-secondary text-foreground/80'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                        <span className="size-1.5 rounded-full bg-emerald-400" />
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">
                      {new Date(u.lastActive).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Database Presentations Overview */}
        <div className="rounded-3xl border border-border/70 bg-card/60 p-6 backdrop-blur-xl shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base font-semibold text-foreground">
                {locale === 'kh' ? 'បទបង្ហាញទាំងអស់ក្នុងប្រព័ន្ធ' : 'All Server Presentations'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {locale === 'kh'
                  ? 'គ្រប់គ្រង និងត្រួតពិនិត្យស្លាយបទបង្ហាញដែលបានបង្កើតក្នុង Server'
                  : 'Inspect and manage presentation documents stored in PostgreSQL'}
              </p>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {presentations.length} total decks
            </span>
          </div>

          {presentations.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No presentations found on server.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground">
                    <th className="py-2.5 px-3">Title</th>
                    <th className="py-2.5 px-3">Slides</th>
                    <th className="py-2.5 px-3">Theme</th>
                    <th className="py-2.5 px-3">Created</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {presentations.map((p) => (
                    <tr key={p.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-3 font-medium text-foreground max-w-xs truncate">
                        {p.title}
                      </td>
                      <td className="py-3 px-3 font-mono">{p.slideCount}</td>
                      <td className="py-3 px-3">
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-mono">
                          {p.theme}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2.5 text-xs text-brand hover:underline"
                          >
                            <Link href={`/presentations/${p.id}`}>
                              <span>Open</span>
                            </Link>
                          </Button>
                          <Button
                            onClick={() => handleDeletePresentation(p.id)}
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
