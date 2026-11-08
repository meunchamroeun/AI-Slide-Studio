import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { RegenerateSlideDtoSchema } from '@ai-slide-studio/shared';
import { buildDeterministicSlide } from '@/lib/presentation-generator';

export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; slideId: string }> }
) {
  try {
    const { id, slideId } = await params;
    const body = await req.json();
    const validated = RegenerateSlideDtoSchema.parse(body);

    const records = await sql`
      SELECT document FROM presentations WHERE id = ${id} LIMIT 1;
    `;

    if (!records || records.length === 0) {
      return NextResponse.json({ message: 'Presentation not found' }, { status: 404 });
    }

    const doc = records[0].document;
    const slideIdx = doc.slides?.findIndex((s: any) => s.id === slideId);
    if (slideIdx === -1 || slideIdx === undefined) {
      return NextResponse.json({ message: 'Slide not found' }, { status: 404 });
    }

    const existingSlide = doc.slides[slideIdx];
    const layout = validated.layout || existingSlide.layout;
    const topic = validated.prompt || existingSlide.content?.title || 'Slide';

    const newSlide = buildDeterministicSlide(existingSlide.slideNumber, layout, topic);
    newSlide.id = existingSlide.id;
    if (validated.preserveNotes && existingSlide.notes) {
      newSlide.notes = existingSlide.notes;
    }

    doc.slides[slideIdx] = newSlide;

    await sql`
      UPDATE presentations
      SET document = ${JSON.stringify(doc)}, "updatedAt" = NOW()
      WHERE id = ${id};
    `;

    return NextResponse.json(newSlide);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Regeneration error' }, { status: 400 });
  }
}
