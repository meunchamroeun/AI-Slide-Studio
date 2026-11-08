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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const updateData = await req.json();

    const title = updateData.title || 'Untitled Presentation';
    const description = updateData.description || '';
    const theme = updateData.theme || 'modern-dark';
    const aspectRatio = updateData.aspectRatio || '16:9';
    const slideCount = Array.isArray(updateData.slides) ? updateData.slides.length : 0;

    const updated = await sql`
      UPDATE presentations
      SET
        title = ${title},
        description = ${description},
        theme = ${theme},
        "aspectRatio" = ${aspectRatio},
        "slideCount" = ${slideCount},
        document = ${JSON.stringify(updateData)}::jsonb,
        "updatedAt" = NOW()
      WHERE id = ${id}
      RETURNING id;
    `;

    if (updated.length === 0) {
      await sql`
        INSERT INTO presentations (id, title, description, theme, "aspectRatio", "slideCount", document, "createdAt", "updatedAt")
        VALUES (
          ${id},
          ${title},
          ${description},
          ${theme},
          ${aspectRatio},
          ${slideCount},
          ${JSON.stringify(updateData)}::jsonb,
          NOW(),
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          theme = EXCLUDED.theme,
          "aspectRatio" = EXCLUDED."aspectRatio",
          "slideCount" = EXCLUDED."slideCount",
          document = EXCLUDED.document,
          "updatedAt" = NOW();
      `;
    }

    return NextResponse.json(updateData);
  } catch (err: any) {
    console.error('Failed to update presentation:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return PATCH(req, { params });
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
