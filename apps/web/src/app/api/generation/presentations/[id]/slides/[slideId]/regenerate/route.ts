import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { RegenerateSlideDtoSchema } from '@ai-slide-studio/shared';
import { regenerateSlideWithGemini } from '@/lib/presentation-generator';

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
    const prompt = validated.prompt || existingSlide.content?.title || 'Slide';

    const newSlide = await regenerateSlideWithGemini(
      existingSlide,
      prompt,
      layout,
      validated.apiKey
    );

    newSlide.id = existingSlide.id;
    newSlide.slideNumber = existingSlide.slideNumber;
    if (validated.preserveNotes && existingSlide.notes && !newSlide.notes) {
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
    console.error('Failed to regenerate slide:', err);
    return NextResponse.json({ message: err.message || 'Regeneration error' }, { status: 400 });
  }
}
