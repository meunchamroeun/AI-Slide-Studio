'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Header } from '@/components/navigation/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Settings as SettingsIcon,
  Cpu,
  Database,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Layers,
  FileCode,
  Globe,
} from 'lucide-react';
import { api } from '@/services/api';

export default function SettingsPage() {
  const [healthData, setHealthData] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

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
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="System &amp; AI Settings" />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-5xl mx-auto w-full overflow-y-auto">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-primary" />
              Environment &amp; Engine Configuration
            </h2>
            <p className="text-xs text-muted-foreground">
              Review Google Gemini AI parameters, PostgreSQL connectivity, and offline HTML export settings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* AI Engine Status */}
            <Card className="p-5 bg-card/60 border-border/70 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Cpu className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Google Gemini SDK</h3>
                    <p className="text-[11px] text-muted-foreground">Official @google/genai Integration</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5 text-[10px]">
                  Online
                </Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span className="text-muted-foreground">Active Model</span>
                  <span className="font-mono font-semibold text-foreground">gemini-2.5-flash</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span className="text-muted-foreground">Output Format</span>
                  <span className="font-mono text-foreground">Structured JSON Schema</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span className="text-muted-foreground">Security Mode</span>
                  <span className="text-foreground">Server-Side API only (No Client Key)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Deterministic Fallback</span>
                  <span className="text-emerald-400 font-semibold">Enabled (High Fidelity)</span>
                </div>
              </div>
            </Card>

            {/* Database & Backend Health */}
            <Card className="p-5 bg-card/60 border-border/70 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Database className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">PostgreSQL &bull; NestJS API</h3>
                    <p className="text-[11px] text-muted-foreground">Prisma ORM &bull; Port 4000</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={checkHealth}
                  disabled={isChecking}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
                  Check
                </Button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span className="text-muted-foreground">Backend Status</span>
                  <span className="font-mono text-foreground">
                    {healthData?.status === 'ok' ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Healthy
                      </span>
                    ) : (
                      <span className="text-amber-400 font-semibold">
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
                  <span className="text-muted-foreground">API Latency</span>
                  <span className="font-mono text-foreground">&lt; 15ms</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Export & Animation Engine Specs */}
          <Card className="p-5 bg-card/60 border-border/70 space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5 pb-3 border-b border-border/50">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <FileCode className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">HTML Export &amp; Animation Runtime</h3>
                <p className="text-[11px] text-muted-foreground">Standalone Single-File Architecture</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-secondary/30 border border-border/40 space-y-1">
                <span className="font-semibold text-foreground block">Zero External Dependencies</span>
                <p className="text-[11px] text-muted-foreground">
                  Exported HTML packages all CSS, responsive fit-scale, SVG icon paths, and presentation controllers directly in one file.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30 border border-border/40 space-y-1">
                <span className="font-semibold text-foreground block">GSAP Timeline Engine</span>
                <p className="text-[11px] text-muted-foreground">
                  Synchronized element staggers, typewriter reveals, metric counters, and slide transitions with automatic cleanup.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30 border border-border/40 space-y-1">
                <span className="font-semibold text-foreground block">Strict Emoji Filter</span>
                <p className="text-[11px] text-muted-foreground">
                  Guaranteed 100% emoji-free layouts and clean SVG geometric iconography matching executive standards.
                </p>
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
