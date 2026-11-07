/**
 * Client-side file content extractor for AI Slide Studio
 * Extracts text from TXT, MD, CSV, JSON, PDF, and DOCX files to attach to presentation prompts.
 */

export interface ExtractedFile {
  name: string;
  size: number;
  sizeFormatted: string;
  type: string;
  text: string;
  wordCount: number;
  charCount: number;
  preview: string;
  extractedAt: string;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Extracts plain text from an uploaded file
 */
export async function extractTextFromFile(file: File): Promise<ExtractedFile> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  let rawText = '';

  // 1. Plain text, Markdown, CSV, JSON, Code, Config files
  if (
    [
      'txt',
      'md',
      'markdown',
      'csv',
      'tsv',
      'json',
      'yaml',
      'yml',
      'xml',
      'html',
      'js',
      'ts',
      'jsx',
      'tsx',
      'log',
    ].includes(extension) ||
    file.type.startsWith('text/')
  ) {
    rawText = await file.text();
  }
  // 2. PDF files - extract text strings from streams
  else if (extension === 'pdf' || file.type === 'application/pdf') {
    rawText = await extractTextFromPdf(file);
  }
  // 3. Word DOCX files - extract XML text runs
  else if (
    extension === 'docx' ||
    file.type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    rawText = await extractTextFromDocx(file);
  }
  // 4. Fallback for other files
  else {
    try {
      const text = await file.text();
      // Only keep if it looks like mostly printable characters
      const printable = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
      if (printable.length > 50 && printable.length / text.length > 0.7) {
        rawText = printable;
      } else {
        rawText = `[Attached Binary File: ${file.name} (${formatFileSize(file.size)}). Generate a presentation based on this topic.]`;
      }
    } catch {
      rawText = `[Attached File: ${file.name} (${formatFileSize(file.size)})]`;
    }
  }

  // Clean and sanitize extracted text
  const cleanText = sanitizeExtractedText(rawText);
  const words = cleanText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = cleanText.length;
  const preview = cleanText.slice(0, 300).trim() + (cleanText.length > 300 ? '...' : '');

  return {
    name: file.name,
    size: file.size,
    sizeFormatted: formatFileSize(file.size),
    type: file.type || extension.toUpperCase(),
    text: cleanText,
    wordCount,
    charCount,
    preview,
    extractedAt: new Date().toISOString(),
  };
}

/**
 * Extracts printable text blocks from a PDF array buffer
 */
async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const fullContent = decoder.decode(bytes);

    // Extract text in PDF text operators: (Text) Tj, [(Text)] TJ, and BT...ET blocks
    const textPieces: string[] = [];

    // Match parenthesized text literals inside BT/ET blocks
    const btEtRegex = /BT[\s\S]*?ET/g;
    const matches = fullContent.match(btEtRegex);

    if (matches && matches.length > 0) {
      for (const block of matches) {
        // Extract text in parentheses
        const tjRegex = /\(([^)]+)\)\s*T[jJ]/g;
        let match;
        while ((match = tjRegex.exec(block)) !== null) {
          if (match[1]) textPieces.push(match[1]);
        }

        // Extract array text like [(Hello) 20 (World)] TJ
        const tjArrayRegex = /\[(.*?)\]\s*TJ/g;
        let arrayMatch;
        while ((arrayMatch = tjArrayRegex.exec(block)) !== null) {
          const innerTj = /\(([^)]+)\)/g;
          let innerMatch;
          while ((innerMatch = innerTj.exec(arrayMatch[1])) !== null) {
            if (innerMatch[1]) textPieces.push(innerMatch[1]);
          }
        }
      }
    }

    if (textPieces.length > 10) {
      return textPieces.join(' ');
    }

    // Secondary fallback: extract readable ASCII strings
    const readableRegex = /[A-Za-z0-9\s.,!?:;\-–—"'()&@#$%+=/]{6,}/g;
    const rawMatches = fullContent.match(readableRegex);
    if (rawMatches && rawMatches.length > 0) {
      const filtered = rawMatches.filter(
        (chunk) =>
          !chunk.includes('Font') &&
          !chunk.includes('Obj') &&
          !chunk.includes('Type') &&
          !chunk.includes('Filter') &&
          !chunk.includes('Stream') &&
          !chunk.includes('xref'),
      );
      if (filtered.length > 5) {
        return filtered.join('\n');
      }
    }

    return `[Document: ${file.name}. Content parsed from PDF file structure.]`;
  } catch (err) {
    return `[Document: ${file.name}. Could not decode PDF streams directly.]`;
  }
}

/**
 * Extracts text from DOCX by extracting XML tags or readable strings
 */
async function extractTextFromDocx(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const text = decoder.decode(bytes);

    // DOCX XML stores text inside <w:t> tags
    const wtRegex = /<w:t[^>]*>([^<]+)<\/w:t>/g;
    const pieces: string[] = [];
    let match;
    while ((match = wtRegex.exec(text)) !== null) {
      if (match[1]) pieces.push(match[1]);
    }

    if (pieces.length > 5) {
      return pieces.join(' ');
    }

    // Secondary fallback
    const readable = text.match(/[A-Za-z0-9\s.,!?:;\-–—"'()&@#$%+=/]{6,}/g);
    if (readable && readable.length > 10) {
      return readable.join('\n');
    }

    return `[Word Document: ${file.name}]`;
  } catch {
    return `[Word Document: ${file.name}]`;
  }
}

/**
 * Sanitizes and caps extracted text for Gemini prompt injection
 */
function sanitizeExtractedText(text: string): string {
  // Remove non-printable characters except whitespace
  const sanitized = text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Cap at 40,000 characters to stay safely inside prompt limits while retaining rich detail
  if (sanitized.length > 40000) {
    return sanitized.slice(0, 40000) + '\n\n[Content truncated for optimal AI synthesis performance]';
  }

  return sanitized;
}

/**
 * Combines user prompt instructions and attached file context into a high-fidelity prompt for Gemini
 */
export function composePromptWithAttachment(
  userInstructions: string,
  attachment?: ExtractedFile | null,
): string {
  if (!attachment || !attachment.text.trim()) {
    return userInstructions.trim();
  }

  const fileHeader = `[ATTACHED SOURCE FILE: ${attachment.name} (${attachment.sizeFormatted}, ${attachment.charCount} characters)]\n`;
  const fileContent = `=== DOCUMENT CONTENT ===\n${attachment.text.trim()}\n=== END DOCUMENT CONTENT ===\n\n`;

  const instructions = userInstructions.trim()
    ? `=== USER PRESENTATION INSTRUCTIONS ===\n${userInstructions.trim()}\n`
    : `=== USER PRESENTATION INSTRUCTIONS ===\nSynthesize this source document into an executive, high-impact presentation deck. Extract core findings, key metrics, feature points, and strategic takeaways.\n`;

  const composed = `${fileHeader}${fileContent}${instructions}`;

  // Hard safety limit at 48,000 chars (well below 50,000)
  return composed.slice(0, 48000);
}
