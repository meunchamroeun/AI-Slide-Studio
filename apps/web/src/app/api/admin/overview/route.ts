import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  let presentationCount = 0;
  let jobCount = 0;
  let recentJobs: any[] = [];

  try {
    const pRes = await sql`SELECT count(*)::int as count FROM presentations;`;
    const jRes = await sql`SELECT count(*)::int as count FROM generation_jobs;`;
    presentationCount = pRes[0]?.count ?? 0;
    jobCount = jRes[0]?.count ?? 0;

    recentJobs = await sql`
      SELECT id, "presentationId", prompt, model, status, error, "durationMs", "slideCount", "createdAt"
      FROM generation_jobs
      ORDER BY "createdAt" DESC
      LIMIT 5;
    `;
  } catch (err) {
    console.warn('Failed to query Neon for admin overview:', err);
  }

  return NextResponse.json({
    superAdminEmail: 'meunchamroeun09@gmail.com',
    serverConfig: {
      hasApiKey: true,
      model: 'gemini-3.5-flash',
      isLive: true,
    },
    stats: {
      totalPresentations: presentationCount,
      totalGenerationJobs: jobCount,
      recentJobs,
      uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 7200),
      nodeVersion: process.version || 'v25.9.0',
    },
    users: [
      {
        id: 'usr-admin-01',
        name: 'Chamroeun Meun',
        email: 'meunchamroeun09@gmail.com',
        role: 'admin',
        isSuperAdmin: true,
        status: 'Active',
        lastActive: new Date().toISOString(),
      },
      {
        id: 'usr-tg-chamroeun',
        name: 'Chamroeun Meun (@chamroeun)',
        email: 'chamroeun@telegram.user',
        role: 'admin',
        isSuperAdmin: true,
        status: 'Active',
        lastActive: new Date().toISOString(),
      },
      {
        id: 'usr-demo-01',
        name: 'Alex Morgan',
        email: 'alex.morgan@slidestudio.ai',
        role: 'user',
        isSuperAdmin: false,
        status: 'Active',
        lastActive: new Date().toISOString(),
      },
    ],
  });
}
