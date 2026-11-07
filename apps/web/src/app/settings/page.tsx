'use client';

import React, { useState, useEffect } from 'react';
import { AppShell, AppPage } from '@/components/app/app-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Settings as SettingsIcon,
  Cpu,
  Database,
  CheckCircle2,
  RefreshCw,
  FileCode,
  Key,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { api } from '@/services/api';
import { useI18n } from '@/components/i18n-provider';

export default function SettingsPage() {
  const { t } = useI18n();
  const [healthData, setHealthData] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  // User Gemini API Key settings
  const [apiKeySource, setApiKeySource] = useState<'server' | 'custom'>('server');
  const [customApiKey, setCustomApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    try {
      const savedKey = localStorage.getItem('slidestudio_custom_gemini_api_key');
      const savedSource = localStorage.getItem('slidestudio_api_key_source') as 'server' | 'custom' | null;
      if (savedKey) setCustomApiKey(savedKey);
      if (savedSource === 'custom' || savedSource === 'server') setApiKeySource(savedSource);
    } catch {}
  }, []);

  const handleSaveApiKeySource = (source: 'server' | 'custom') => {
    setApiKeySource(source);
    setTestResult(null);
    try {
      localStorage.setItem('slidestudio_api_key_source', source);
    } catch {}
  };

  const handleSaveCustomKey = (key: string) => {
    setCustomApiKey(key);
    setTestResult(null);
    try {
      localStorage.setItem('slidestudio_custom_gemini_api_key', key.trim());
    } catch {}
  };

  const handleTestKey = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res: any = await api.testConnection({
        apiKey: apiKeySource === 'custom' ? customApiKey.trim() : undefined,
      });
      setTestResult({
        success: res?.success ?? true,
        message: res?.message || 'Connection successful! Gemini API key is valid.',
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'API test failed.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const checkHealth = async () => {
    try {
      setIsChecking(true);
      const res = await api.checkHealth();
      setHealthData(res);
    } catch (err: any) {
      setHealthData({ status: 'error', message: err.message });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <AppShell>
      <AppPage title={t.settings.title}>
        <div className="space-y-6 max-w-5xl pb-12">
          <div>
            <h2 className="text-xl font-serif font-medium tracking-tight text-foreground flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-brand" />
              {t.settings.heading}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {t.settings.subtitle}
            </p>
          </div>

          {/* Gemini AI API Key BYOK vs Server Admin Default */}
          <Card className="relative overflow-hidden rounded-2xl bg-card border-border/80 shadow-md ring-1 ring-border/50 p-6 space-y-4">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/50">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                  <Key className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Gemini AI API Key Configuration</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Choose between the server administrator default key or your personal Gemini API key (BYOK)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-secondary/50 p-1 rounded-xl border border-border/60">
                <button
                  type="button"
                  onClick={() => handleSaveApiKeySource('server')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    apiKeySource === 'server'
                      ? 'bg-brand/15 text-brand shadow-xs border border-brand/30'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <ShieldCheck className="size-3.5" />
                  <span>Server Admin Default</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveApiKeySource('custom')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    apiKeySource === 'custom'
                      ? 'bg-brand/15 text-brand shadow-xs border border-brand/30'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Key className="size-3.5" />
                  <span>My Own Gemini Key (BYOK)</span>
                </button>
              </div>
            </div>

            {apiKeySource === 'custom' ? (
              <div className="space-y-3 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Personal Google Gemini API Key
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={customApiKey}
                        onChange={(e) => handleSaveCustomKey(e.target.value)}
                        placeholder="AIzaSy... paste your Gemini API key"
                        className="w-full text-xs font-mono rounded-xl border border-border/80 bg-background/80 px-3.5 py-2.5 pr-10 text-foreground placeholder:text-muted-foreground/50 focus:outline-hidden focus:border-brand/60"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showApiKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleTestKey}
                      disabled={isTesting || !customApiKey.trim()}
                      className="rounded-xl px-4 text-xs font-medium bg-brand/15 text-brand hover:bg-brand/25 border border-brand/30 cursor-pointer h-auto"
                    >
                      <Sparkles className={`size-3.5 mr-1.5 ${isTesting ? 'animate-spin' : ''}`} />
                      {isTesting ? 'Testing...' : 'Test Connection'}
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-normal">
                    Get a free key from Google AI Studio. Your key is saved locally in this browser and never stored on the server.
                  </p>
                </div>

                {testResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                      testResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-destructive/10 border-destructive/30 text-destructive'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="size-4 shrink-0" />
                    ) : (
                      <AlertCircle className="size-4 shrink-0" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/50 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
                  <span>
                    Currently using the default Gemini API key configured in the Admin Console. You do not need to provide your own key.
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleTestKey}
                  disabled={isTesting}
                  className="rounded-xl text-xs h-7 px-3 border-border/70 hover:border-brand/40 cursor-pointer"
                >
                  <Sparkles className={`size-3 mr-1.5 ${isTesting ? 'animate-spin' : ''}`} />
                  {isTesting ? 'Testing...' : 'Test Server Key'}
                </Button>
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* AI Engine Status */}
            <Card className="relative overflow-hidden rounded-2xl bg-card border-border/80 shadow-md ring-1 ring-border/50 p-5 space-y-4">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />
              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                    <Cpu className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{t.settings.geminiTitle}</h3>
                    <p className="text-[11px] text-muted-foreground">{t.settings.geminiSubtitle}</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5 text-[10px] rounded-full">
                  Online
                </Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span className="text-muted-foreground">{t.settings.activeModel}</span>
                  <span className="font-mono font-semibold text-foreground">gemini-2.5-flash</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span className="text-muted-foreground">{t.settings.outputFormat}</span>
                  <span className="font-mono text-foreground">Structured JSON Schema</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span className="text-muted-foreground">{t.settings.securityMode}</span>
                  <span className="text-foreground">Server-Side API only (No Client Key)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">{t.settings.deterministic}</span>
                  <span className="text-emerald-400 font-semibold">Enabled (High Fidelity)</span>
                </div>
              </div>
            </Card>

            {/* Database & Backend Health */}
            <Card className="relative overflow-hidden rounded-2xl bg-card border-border/80 shadow-md ring-1 ring-border/50 p-5 space-y-4">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />
              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <Database className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{t.settings.dbTitle}</h3>
                    <p className="text-[11px] text-muted-foreground">{t.settings.dbSubtitle}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={checkHealth}
                  disabled={isChecking}
                  className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground rounded-full hover:bg-accent cursor-pointer"
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
                  {t.settings.check}
                </Button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span className="text-muted-foreground">{t.settings.backendStatus}</span>
                  <span className="font-mono text-foreground">
                    {healthData?.status === 'ok' ? (
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> {t.settings.healthy}
                      </span>
                    ) : (
                      <span className="text-amber-400 font-medium">
                        {healthData?.status || 'Connecting...'}
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span className="text-muted-foreground">Database Engine</span>
                  <span className="font-mono text-foreground">PostgreSQL 14+</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">{t.settings.apiLatency}</span>
                  <span className="font-mono text-foreground">&lt; 15ms</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Export & Animation Engine Specs */}
          <Card className="relative overflow-hidden rounded-2xl bg-card border-border/80 shadow-md ring-1 ring-border/50 p-5 space-y-4">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />
            <div className="flex items-center gap-2.5 pb-3 border-b border-border/50">
              <div className="h-9 w-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                <FileCode className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{t.settings.exportEngine}</h3>
                <p className="text-[11px] text-muted-foreground">{t.settings.exportSubtitle}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/50 space-y-1">
                <span className="font-medium text-foreground block">{t.settings.zeroDeps}</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {t.settings.zeroDepsDesc}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/50 space-y-1">
                <span className="font-medium text-foreground block">{t.settings.gsapEngine}</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {t.settings.gsapDesc}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/50 space-y-1">
                <span className="font-medium text-foreground block">{t.settings.emojiFilter}</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {t.settings.emojiDesc}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </AppPage>
    </AppShell>
  );
}
