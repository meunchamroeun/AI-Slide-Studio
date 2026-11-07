import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const records = await sql`
      SELECT id, title, description, theme, "aspectRatio", "slideCount", document, "createdAt", "updatedAt"
      FROM presentations
      ORDER BY "updatedAt" DESC;
    `;
    // If records have document column, map to the document object
    const documents = records.map((r: any) => {
      if (r.document && typeof r.document === 'object') {
        return r.document;
      }
      return r;
    });
    return NextResponse.json(documents);
  } catch (err) {
    console.error('Failed to query presentations:', err);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = body.id || `pres-${Date.now()}`;
    const title = body.title || 'Untitled Presentation';
    const description = body.description || '';
    const theme = body.theme || 'modern-dark';
    const aspectRatio = body.aspectRatio || '16:9';
    const slideCount = Array.isArray(body.slides) ? body.slides.length : 0;

    await sql`
      INSERT INTO presentations (id, title, description, theme, "aspectRatio", "slideCount", document, "createdAt", "updatedAt")
      VALUES (${id}, ${title}, ${description}, ${theme}, ${aspectRatio}, ${slideCount}, ${JSON.stringify(body)}, NOW(), NOW())
    `;

    return NextResponse.json(body, { status: 201 });
  } catch (err: any) {
    console.error('Failed to create presentation:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
