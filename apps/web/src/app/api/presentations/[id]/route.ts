import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const records = await sql`
      SELECT id, title, description, theme, "aspectRatio", "slideCount", document, "createdAt", "updatedAt"
      FROM presentations
      WHERE id = ${id}
      LIMIT 1;
    `;

    if (records.length === 0) {
      return NextResponse.json({ message: 'Presentation not found' }, { status: 404 });
    }

    const doc = records[0].document;
    return NextResponse.json(typeof doc === 'object' ? doc : JSON.parse(doc));
  } catch (err: any) {
    console.error('Failed to get presentation by ID:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await sql`DELETE FROM generation_jobs WHERE "presentationId" = ${id};`;
    await sql`DELETE FROM presentations WHERE id = ${id};`;
    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (err: any) {
    console.error('Failed to delete presentation:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
