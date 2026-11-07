import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  let dbStatus = 'disconnected';
  try {
    await sql`SELECT 1;`;
    dbStatus = 'connected';
  } catch {
    dbStatus = 'fallback';
  }

  return NextResponse.json({
    status: 'ok',
    database: dbStatus,
    aiModel: 'gemini-3.5-flash',
    liveGeminiConfigured: true,
    region: 'ap-southeast-1 (Singapore)',
    timestamp: new Date().toISOString(),
  });
}
