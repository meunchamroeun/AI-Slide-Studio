import { NextResponse } from 'next/server';
import { RewriteContentDtoSchema } from '@ai-slide-studio/shared';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = RewriteContentDtoSchema.parse(body);
    const { text, instruction } = validated;

    let rewritten = text;
    switch (instruction) {
      case 'shorten':
        rewritten = text.split('.').slice(0, 2).join('. ').trim() + (text.includes('.') ? '.' : '');
        break;
      case 'expand':
        rewritten = `${text} This delivers measurable strategic advantage, streamlining operations and accelerating overall performance.`;
        break;
      case 'more-professional':
        rewritten = `Strategic initiative: ${text.replace(/really|very|good|stuff/gi, 'optimal')}`;
        break;
      case 'bullet-points':
        rewritten = text
          .split(/[,.]/)
          .filter((s) => s.trim().length > 3)
          .map((s) => `• ${s.trim()}`)
          .join('\n');
        break;
      case 'punchy':
        rewritten = `${text.split(' ')[0].toUpperCase()}: ${text}`;
        break;
      default:
        rewritten = text;
    }

    return NextResponse.json({ text: rewritten });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Rewrite error' }, { status: 400 });
  }
}
