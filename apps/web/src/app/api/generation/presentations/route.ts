import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { GeneratePresentationDtoSchema } from '@ai-slide-studio/shared';
import { generatePresentationDocument } from '@/lib/presentation-generator';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const startTime = Date.now();
  let jobId = `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  let validatedDto: any = null;

  try {
    const body = await req.json();
    validatedDto = GeneratePresentationDtoSchema.parse(body);

    // 1. Create a generation job record in Neon DB
    try {
      await sql`
        INSERT INTO generation_jobs (id, prompt, model, status, "slideCount", "createdAt")
        VALUES (${jobId}, ${validatedDto.prompt}, 'gemini-2.5-flash', 'pending', ${validatedDto.slideCount}, NOW())
      `;
    } catch (dbErr) {
      console.warn('Could not record initial generation job:', dbErr);
    }

    // 2. Generate presentation document
    const document = await generatePresentationDocument(validatedDto);

    // 3. Persist presentation into Neon DB
    try {
      await sql`
        INSERT INTO presentations (id, title, description, theme, "aspectRatio", "slideCount", document, "createdAt", "updatedAt")
        VALUES (
          ${document.id},
          ${document.title},
          ${document.description || ''},
          ${document.theme || 'modern-dark'},
          ${document.aspectRatio || '16:9'},
          ${document.slides.length},
          ${JSON.stringify(document)},
          NOW(),
          NOW()
        )
      `;

      // 4. Update generation job as completed
      const durationMs = Date.now() - startTime;
      await sql`
        UPDATE generation_jobs
        SET "presentationId" = ${document.id}, status = 'completed', "durationMs" = ${durationMs}
        WHERE id = ${jobId}
      `;
    } catch (saveErr) {
      console.error('Failed to save presentation to database:', saveErr);
      // Still return the generated document so the user can see and work with it
    }

    return NextResponse.json(document, { status: 201 });
  } catch (err: any) {
    console.error('Generation API error:', err);
    const durationMs = Date.now() - startTime;

    try {
      await sql`
        UPDATE generation_jobs
        SET status = 'failed', error = ${err.message || 'Generation error'}, "durationMs" = ${durationMs}
        WHERE id = ${jobId}
      `;
    } catch {
      // Ignore secondary db error
    }

    return NextResponse.json(
      { message: err.message || 'Failed to generate presentation' },
      { status: 500 }
    );
  }
}
