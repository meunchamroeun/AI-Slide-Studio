import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const records = await sql`
      SELECT id, title, theme, "aspectRatio", "slideCount", "createdAt", "updatedAt"
      FROM presentations
      ORDER BY "updatedAt" DESC;
    `;
    return NextResponse.json(records);
  } catch (err) {
    console.error('Failed to query admin presentations:', err);
    return NextResponse.json([]);
  }
}
