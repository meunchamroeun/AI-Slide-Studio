import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { THEMES } from '@ai-slide-studio/shared';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const dynamic = 'force-dynamic';

function parseCssColor(color: string, fallback = { r: 1, g: 1, b: 1 }): { r: number; g: number; b: number } {
  if (!color || typeof color !== 'string') return fallback;
  color = color.trim().toLowerCase();

  // rgba or rgb
  const rgbaMatch = color.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbaMatch) {
    const r = Math.min(255, Math.max(0, parseInt(rgbaMatch[1], 10))) / 255;
    const g = Math.min(255, Math.max(0, parseInt(rgbaMatch[2], 10))) / 255;
    const b = Math.min(255, Math.max(0, parseInt(rgbaMatch[3], 10))) / 255;
    return { r, g, b };
  }

  // hex
  if (color.startsWith('#')) {
    const clean = color.slice(1);
    if (clean.length === 3 || clean.length === 4) {
      const r = parseInt(clean[0] + clean[0], 16) / 255;
      const g = parseInt(clean[1] + clean[1], 16) / 255;
      const b = parseInt(clean[2] + clean[2], 16) / 255;
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return { r, g, b };
    }
    if (clean.length >= 6) {
      const r = parseInt(clean.substring(0, 2), 16) / 255;
      const g = parseInt(clean.substring(2, 4), 16) / 255;
      const b = parseInt(clean.substring(4, 6), 16) / 255;
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return { r, g, b };
    }
  }

  return fallback;
}

function toPdfRgb(color: string, fallback = { r: 1, g: 1, b: 1 }) {
  const c = parseCssColor(color, fallback);
  return rgb(c.r, c.g, c.b);
}

function wrapText(text: string, maxChars = 60): string[] {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = current ? current + ' ' + word : word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// Sanitize string to remove characters unsupported by PDF standard fonts
function sanitizeText(str: string = ''): string {
  if (!str) return '';
  return str
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const doc =
      typeof records[0].document === 'object'
        ? records[0].document
        : JSON.parse(records[0].document);

    const themeName = (doc.theme || 'modern-dark') as keyof typeof THEMES;
    const theme = THEMES[themeName] || THEMES['modern-dark'];

    const is169 = doc.aspectRatio !== '4:3';
    const width = is169 ? 1920 : 1440;
    const height = 1080;

    const bgRgb = toPdfRgb(theme.colors.background, { r: 0.05, g: 0.05, b: 0.05 });
    const cardBgRgb = toPdfRgb(theme.colors.cardBackground, { r: 0.1, g: 0.1, b: 0.1 });
    const borderRgb = toPdfRgb(theme.colors.cardBorder, { r: 0.2, g: 0.2, b: 0.2 });
    const textRgb = toPdfRgb(theme.colors.textPrimary, { r: 0.98, g: 0.98, b: 0.98 });
    const textMutedRgb = toPdfRgb(theme.colors.textMuted, { r: 0.65, g: 0.65, b: 0.65 });
    const brandRgb = toPdfRgb(theme.colors.accentPrimary, { r: 0.96, g: 0.62, b: 0.04 });

    const pdfDoc = await PDFDocument.create();
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const slides = Array.isArray(doc.slides) ? doc.slides : [];

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const page = pdfDoc.addPage([width, height]);
      const c = slide.content || {};

      // 1. Background Fill
      page.drawRectangle({
        x: 0,
        y: 0,
        width,
        height,
        color: bgRgb,
      });

      // 2. Top Accent Glow Bar
      page.drawRectangle({
        x: 0,
        y: height - 6,
        width,
        height: 6,
        color: brandRgb,
      });

      // 3. Eyebrow Badge
      let cursorY = height - 120;
      if (c.badge) {
        const badgeText = sanitizeText(String(c.badge).toUpperCase());
        if (badgeText) {
          const badgeWidth = fontBold.widthOfTextAtSize(badgeText, 14) + 32;
          page.drawRectangle({
            x: 100,
            y: cursorY - 6,
            width: Math.min(badgeWidth, 500),
            height: 28,
            color: toPdfRgb('#261e14'),
            borderColor: brandRgb,
            borderWidth: 1,
          });
          page.drawText(badgeText, {
            x: 116,
            y: cursorY,
            size: 14,
            font: fontBold,
            color: brandRgb,
          });
          cursorY -= 55;
        }
      }

      // 4. Slide Title
      const titleText = sanitizeText(c.title || `Slide ${i + 1}`);
      const titleLines = wrapText(titleText, 48);
      for (const line of titleLines) {
        page.drawText(line, {
          x: 100,
          y: cursorY,
          size: slide.layout === 'cover' ? 56 : 46,
          font: fontBold,
          color: textRgb,
        });
        cursorY -= slide.layout === 'cover' ? 68 : 56;
      }

      // 5. Slide Subtitle
      if (c.subtitle) {
        cursorY -= 8;
        const subText = sanitizeText(c.subtitle);
        const subLines = wrapText(subText, 72);
        for (const line of subLines) {
          page.drawText(line, {
            x: 100,
            y: cursorY,
            size: 22,
            font: fontRegular,
            color: textMutedRgb,
          });
          cursorY -= 30;
        }
      }

      // 6. Layout-specific Content Cards
      if (slide.layout === 'cover') {
        // Decorative Hero Box on Cover
        cursorY -= 40;
        page.drawRectangle({
          x: 100,
          y: cursorY - 180,
          width: width - 200,
          height: 180,
          color: cardBgRgb,
          borderColor: borderRgb,
          borderWidth: 1.5,
        });
        page.drawText('PRECISION ENTERPRISE KEYNOTE', {
          x: 140,
          y: cursorY - 60,
          size: 16,
          font: fontBold,
          color: brandRgb,
        });
        page.drawText(sanitizeText(doc.title), {
          x: 140,
          y: cursorY - 100,
          size: 24,
          font: fontBold,
          color: textRgb,
        });
        page.drawText('Synthesized with Gemini AI Motion Precision Architecture', {
          x: 140,
          y: cursorY - 135,
          size: 16,
          font: fontRegular,
          color: textMutedRgb,
        });
      } else if (slide.layout === 'feature-grid' && Array.isArray(c.features) && c.features.length > 0) {
        cursorY -= 40;
        const cols = Math.min(c.features.length, 4);
        const cardGap = 24;
        const totalCardsWidth = width - 200;
        const cardWidth = (totalCardsWidth - (cols - 1) * cardGap) / cols;
        const cardHeight = 380;

        for (let fi = 0; fi < cols; fi++) {
          const feat = c.features[fi];
          const cardX = 100 + fi * (cardWidth + cardGap);
          const cardY = cursorY - cardHeight;

          page.drawRectangle({
            x: cardX,
            y: cardY,
            width: cardWidth,
            height: cardHeight,
            color: cardBgRgb,
            borderColor: borderRgb,
            borderWidth: 1.5,
          });

          // Top gradient accent
          page.drawRectangle({
            x: cardX,
            y: cardY + cardHeight - 4,
            width: cardWidth,
            height: 4,
            color: brandRgb,
          });

          let fy = cardY + cardHeight - 50;
          if (feat.title) {
            const fTitleLines = wrapText(sanitizeText(feat.title), Math.floor(cardWidth / 12));
            for (const line of fTitleLines) {
              page.drawText(line, {
                x: cardX + 28,
                y: fy,
                size: 24,
                font: fontBold,
                color: textRgb,
              });
              fy -= 30;
            }
          }

          fy -= 12;
          if (feat.description) {
            const fDescLines = wrapText(sanitizeText(feat.description), Math.floor(cardWidth / 9.5));
            for (const line of fDescLines) {
              page.drawText(line, {
                x: cardX + 28,
                y: fy,
                size: 16,
                font: fontRegular,
                color: textMutedRgb,
              });
              fy -= 24;
            }
          }
        }
      } else if (slide.layout === 'statistics' && Array.isArray(c.statistics) && c.statistics.length > 0) {
        cursorY -= 40;
        const cols = Math.min(c.statistics.length, 4);
        const cardGap = 24;
        const cardWidth = (width - 200 - (cols - 1) * cardGap) / cols;
        const cardHeight = 360;

        for (let si = 0; si < cols; si++) {
          const stat = c.statistics[si];
          const cardX = 100 + si * (cardWidth + cardGap);
          const cardY = cursorY - cardHeight;

          page.drawRectangle({
            x: cardX,
            y: cardY,
            width: cardWidth,
            height: cardHeight,
            color: cardBgRgb,
            borderColor: borderRgb,
            borderWidth: 1.5,
          });

          // Stat Value
          const statVal = sanitizeText(stat.value || '');
          page.drawText(statVal, {
            x: cardX + 28,
            y: cardY + cardHeight - 80,
            size: 48,
            font: fontBold,
            color: brandRgb,
          });

          // Stat Label
          const statLabel = sanitizeText(stat.label || '');
          const labelLines = wrapText(statLabel, Math.floor(cardWidth / 12));
          let sy = cardY + cardHeight - 125;
          for (const line of labelLines) {
            page.drawText(line, {
              x: cardX + 28,
              y: sy,
              size: 20,
              font: fontBold,
              color: textRgb,
            });
            sy -= 26;
          }

          // Stat Desc
          if (stat.description) {
            sy -= 8;
            const descLines = wrapText(sanitizeText(stat.description), Math.floor(cardWidth / 9.5));
            for (const line of descLines) {
              page.drawText(line, {
                x: cardX + 28,
                y: sy,
                size: 15,
                font: fontRegular,
                color: textMutedRgb,
              });
              sy -= 22;
            }
          }
        }
      } else if (slide.layout === 'timeline' && Array.isArray(c.milestones) && c.milestones.length > 0) {
        cursorY -= 40;
        const steps = Math.min(c.milestones.length, 5);
        const stepWidth = (width - 200 - (steps - 1) * 20) / steps;
        const stepHeight = 360;

        for (let mi = 0; mi < steps; mi++) {
          const m = c.milestones[mi];
          const stepX = 100 + mi * (stepWidth + 20);
          const stepY = cursorY - stepHeight;

          page.drawRectangle({
            x: stepX,
            y: stepY,
            width: stepWidth,
            height: stepHeight,
            color: cardBgRgb,
            borderColor: borderRgb,
            borderWidth: 1.5,
          });

          // Step Number & Date
          const dateText = sanitizeText(m.date || `STEP 0${mi + 1}`);
          page.drawText(dateText, {
            x: stepX + 24,
            y: stepY + stepHeight - 48,
            size: 14,
            font: fontBold,
            color: brandRgb,
          });

          let my = stepY + stepHeight - 85;
          const mTitle = sanitizeText(m.title || '');
          const mTitleLines = wrapText(mTitle, Math.floor(stepWidth / 12));
          for (const line of mTitleLines) {
            page.drawText(line, {
              x: stepX + 24,
              y: my,
              size: 20,
              font: fontBold,
              color: textRgb,
            });
            my -= 26;
          }

          my -= 10;
          if (m.description) {
            const mDescLines = wrapText(sanitizeText(m.description), Math.floor(stepWidth / 9.5));
            for (const line of mDescLines) {
              page.drawText(line, {
                x: stepX + 24,
                y: my,
                size: 15,
                font: fontRegular,
                color: textMutedRgb,
              });
              my -= 22;
            }
          }
        }
      } else {
        // Standard Title & Content / Bullet Points Layout
        cursorY -= 35;
        const cardHeight = Math.max(380, cursorY - 140);
        const cardY = cursorY - cardHeight;

        page.drawRectangle({
          x: 100,
          y: cardY,
          width: width - 200,
          height: cardHeight,
          color: cardBgRgb,
          borderColor: borderRgb,
          borderWidth: 1.5,
        });

        // Top accent
        page.drawRectangle({
          x: 100,
          y: cardY + cardHeight - 4,
          width: width - 200,
          height: 4,
          color: brandRgb,
        });

        let innerY = cursorY - 50;
        if (c.body) {
          const bodyLines = wrapText(sanitizeText(c.body), 85);
          for (const line of bodyLines) {
            page.drawText(line, {
              x: 140,
              y: innerY,
              size: 22,
              font: fontRegular,
              color: textRgb,
            });
            innerY -= 34;
          }
          innerY -= 18;
        }

        if (Array.isArray(c.bulletPoints)) {
          for (const pt of c.bulletPoints) {
            page.drawCircle({
              x: 152,
              y: innerY + 6,
              size: 4.5,
              color: brandRgb,
            });
            const ptLines = wrapText(sanitizeText(pt), 78);
            for (let li = 0; li < ptLines.length; li++) {
              page.drawText(ptLines[li], {
                x: 175,
                y: innerY,
                size: 20,
                font: fontRegular,
                color: textRgb,
              });
              innerY -= 32;
            }
            innerY -= 8;
          }
        }
      }

      // 7. Footer
      const footerTitle = sanitizeText(doc.title);
      page.drawText(footerTitle, {
        x: 100,
        y: 45,
        size: 13,
        font: fontRegular,
        color: textMutedRgb,
      });

      const pageNumText = `Slide ${i + 1} of ${slides.length}`;
      const pageNumWidth = fontBold.widthOfTextAtSize(pageNumText, 13);
      page.drawText(pageNumText, {
        x: width - 100 - pageNumWidth,
        y: 45,
        size: 13,
        font: fontBold,
        color: brandRgb,
      });
    }

    const pdfBytes = await pdfDoc.save();
    const safeTitle = (doc.title || 'presentation')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_');

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeTitle}.pdf"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err: any) {
    console.error('Failed to export PDF:', err);
    return new NextResponse(err.message, { status: 500 });
  }
}
