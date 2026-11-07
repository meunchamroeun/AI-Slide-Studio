import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { THEMES } from '@ai-slide-studio/shared';

export const dynamic = 'force-dynamic';

function escapeHtml(str: string = ''): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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
      return new NextResponse('Presentation not found', { status: 404 });
    }

    const doc = typeof records[0].document === 'object' ? records[0].document : JSON.parse(records[0].document);
    const themeName = (doc.theme || 'modern-dark') as keyof typeof THEMES;
    const theme = THEMES[themeName] || THEMES['modern-dark'];

    const slidesHtml = (doc.slides || [])
      .map((slide: any, idx: number) => {
        const c = slide.content || {};
        return `
          <div class="slide" id="slide-${idx + 1}" data-slide="${idx + 1}">
            <div class="slide-inner">
              ${c.badge ? `<div class="badge">${escapeHtml(c.badge)}</div>` : ''}
              <h2 class="title">${escapeHtml(c.title || '')}</h2>
              ${c.subtitle ? `<p class="subtitle">${escapeHtml(c.subtitle)}</p>` : ''}
              ${c.body ? `<p class="body">${escapeHtml(c.body)}</p>` : ''}
              ${
                Array.isArray(c.takeaways) && c.takeaways.length > 0
                  ? `<div class="takeaways">
                      ${c.takeaways.map((t: string) => `<div class="takeaway-pill">${escapeHtml(t)}</div>`).join('')}
                    </div>`
                  : ''
              }
              ${
                Array.isArray(c.statistics) && c.statistics.length > 0
                  ? `<div class="stats-grid">
                      ${c.statistics
                        .map(
                          (s: any) => `
                        <div class="stat-card">
                          <div class="stat-value">${escapeHtml(s.value || '')}</div>
                          <div class="stat-label">${escapeHtml(s.label || '')}</div>
                          ${s.description ? `<div class="stat-desc">${escapeHtml(s.description)}</div>` : ''}
                        </div>
                      `
                        )
                        .join('')}
                    </div>`
                  : ''
              }
            </div>
          </div>
        `;
      })
      .join('\n');

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(doc.title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;600;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: ${theme.colors.background};
      --bg2: ${theme.colors.backgroundSecondary};
      --panel: ${theme.colors.cardBackground};
      --border: ${theme.colors.cardBorder};
      --text: ${theme.colors.textPrimary};
      --text-muted: ${theme.colors.textMuted};
      --brand: ${theme.colors.accentPrimary};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Roboto', 'Kantumruy Pro', sans-serif;
      overflow-x: hidden;
      min-height: 100vh;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }
    .header {
      border-bottom: 1px solid var(--border);
      padding-bottom: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .header h1 {
      font-size: 24px;
      font-weight: 700;
      color: var(--text);
    }
    .slide {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 48px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      transition: transform 0.3s ease;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: rgba(245, 158, 11, 0.15);
      color: var(--brand);
      border: 1px solid rgba(245, 158, 11, 0.3);
      margin-bottom: 16px;
    }
    .title {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 12px;
      line-height: 1.25;
    }
    .subtitle {
      font-size: 16px;
      color: var(--text-muted);
      margin-bottom: 24px;
      line-height: 1.5;
    }
    .body {
      font-size: 15px;
      line-height: 1.6;
      color: var(--text);
      margin-bottom: 24px;
    }
    .takeaways {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 16px;
    }
    .takeaway-pill {
      background: var(--bg2);
      border: 1px solid var(--border);
      padding: 8px 16px;
      border-radius: 12px;
      font-size: 13px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-top: 24px;
    }
    .stat-card {
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 20px;
    }
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: var(--brand);
    }
    .stat-label {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 4px;
    }
    .stat-desc {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 2px;
      opacity: 0.8;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${escapeHtml(doc.title)}</h1>
      <span style="font-size: 12px; color: var(--text-muted);">SlideStudio.ai · Standalone HTML</span>
    </div>
    ${slidesHtml}
  </div>
</body>
</html>`;

    return new NextResponse(fullHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${id}.html"`,
      },
    });
  } catch (err: any) {
    console.error('Failed to export HTML:', err);
    return new NextResponse(err.message, { status: 500 });
  }
}
