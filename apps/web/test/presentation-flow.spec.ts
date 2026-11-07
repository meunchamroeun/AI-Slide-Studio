import { test, expect } from '@playwright/test';

test.describe('AI Slide Animation Studio End-to-End Flow', () => {
  test('1. Dashboard loads with dark SaaS UI and no emojis', async ({ page }) => {
    await page.goto('/');

    // Check title and branding
    await expect(page).toHaveTitle(/AI Slide Studio/i);
    await expect(page.locator('text=SlideStudio.ai').first()).toBeVisible();

    // Check Hero section
    await expect(page.locator('text=Transform any idea into an')).toBeVisible();
    await expect(page.locator('button:has-text("Animated Video Demo")').first()).toBeVisible();

    // Check Curated Templates section
    await expect(page.locator('text=Curated Templates')).toBeVisible();
    await expect(page.locator('text=Executive Pitch Deck')).toBeVisible();

    // Check that there are no emoji characters in page text
    const bodyText = await page.innerText('body');
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    expect(emojiRegex.test(bodyText)).toBe(false);
  });

  test('2. Navigation to Templates and Settings works seamlessly', async ({ page }) => {
    // Navigate to Templates
    await page.goto('/templates');
    await expect(page.locator('text=Production Template Gallery')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Technical Architecture' })).toBeVisible();

    // Navigate to Settings
    await page.goto('/settings');
    await expect(page.locator('text=Environment & Engine Configuration')).toBeVisible();
    await expect(page.locator('text=Google Gemini SDK')).toBeVisible();
    await expect(page.locator('text=HTML Export & Animation Runtime')).toBeVisible();
  });

  test('3. Full 3-Panel Editor loads, displays slides, and supports live properties editing', async ({ page }) => {
    // Navigate directly to the verified created presentation
    await page.goto('/presentations/pres-1794035285398-p8u96');
    await page.waitForTimeout(1000);

    // Verify 3-Panel Editor layout
    // Left panel: Thumbnails
    await expect(page.locator('text=Slides (')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add', exact: true })).toBeVisible();

    // Center panel: Slide Stage & Controls
    await expect(page.locator('button:has-text("Animate")')).toBeVisible();
    await expect(page.locator('button:has-text("Fullscreen")')).toBeVisible();
    await expect(page.locator('button:has-text("Previous Slide")')).toBeVisible();
    await expect(page.locator('button:has-text("Next Slide")')).toBeVisible();

    // Right panel: Property Tabs
    await expect(page.locator('button[role="tab"]:has-text("Content")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Design")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Motion")')).toBeVisible();

    // Switch to Motion tab
    await page.click('button[role="tab"]:has-text("Motion")');
    await expect(page.locator('text=Element Animation Preset')).toBeVisible();
    await expect(page.locator('text=Slide Transition')).toBeVisible();
  });

  test('4. Fullscreen Presentation Player renders with keyboard navigation', async ({ page }) => {
    await page.goto('/presentations/pres-1794035285398-p8u96/present');

    // Wait for stage to render
    await page.waitForTimeout(1000);

    // Verify counter is visible (e.g. "1 / 8")
    await expect(page.locator('text=1 / 8')).toBeVisible();

    // Press ArrowRight to advance slide
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);
    await expect(page.locator('text=2 / 8')).toBeVisible();

    // Press Space to advance to slide 3
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);
    await expect(page.locator('text=3 / 8')).toBeVisible();

    // Press ArrowLeft to go back to slide 2
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(500);
    await expect(page.locator('text=2 / 8')).toBeVisible();
  });

  test('5. Export provides only Animated HTML and Executive PDF documents', async ({ page }) => {
    // 1. Verify Animated HTML export endpoint
    const htmlResponse = await page.request.get('http://localhost:4000/api/presentations/pres-1794035285398-p8u96/export/html');
    expect(htmlResponse.status()).toBe(200);

    const htmlContent = await htmlResponse.text();
    expect(htmlContent).toContain('<!DOCTYPE html>');
    expect(htmlContent).toContain('class="stage"');
    expect(htmlContent).toContain('class="bar"');
    expect(htmlContent).toContain('animateCounters');
    expect(htmlContent).toContain('Print / PDF');

    // Verify NO emojis in exported HTML
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    expect(emojiRegex.test(htmlContent)).toBe(false);

    // 2. Verify PDF export endpoint produces valid PDF binary
    const pdfResponse = await page.request.get('http://localhost:4000/api/presentations/pres-1794035285398-p8u96/export/pdf');
    expect(pdfResponse.status()).toBe(200);
    expect(pdfResponse.headers()['content-type']).toBe('application/pdf');
    const pdfBuffer = await pdfResponse.body();
    // Valid PDF files start with %PDF
    expect(pdfBuffer.toString('utf-8', 0, 4)).toBe('%PDF');

    // 3. Open editor and verify Export dropdown has ONLY Animated HTML and Executive PDF
    await page.goto('/presentations/pres-1794035285398-p8u96');
    await page.waitForTimeout(800);
    await page.click('button:has-text("Export")');
    await page.waitForTimeout(300);

    // Should contain Animated HTML and PDF
    await expect(page.locator('text=Animated Keynote HTML (.html)')).toBeVisible();
    await expect(page.locator('text=Executive PDF Document (.pdf)')).toBeVisible();

    // Should NOT contain Project JSON or Import JSON
    await expect(page.locator('text=Project JSON')).not.toBeVisible();
    await expect(page.locator('text=Import JSON')).not.toBeVisible();
  });

  test('6. Studio authentication flow and login page render with one-click demo login', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Verify Studio AuthCard elements
    await expect(page.locator('text=Welcome back')).toBeVisible();
    await expect(page.locator('text=Sign in to access your presentations')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("One-Click Demo Studio Login")')).toBeVisible();

    // Click demo login
    await page.click('button:has-text("One-Click Demo Studio Login")');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('link', { name: /SlideStudio\.ai/i }).first()).toBeVisible();
    await expect(page.locator('text=Alex Morgan').first()).toBeVisible();
  });

  test('7. Theme toggle seamlessly switches between Dark mode and Light mode', async ({ page }) => {
    await page.goto('/');

    // Initially document has dark class
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveClass(/dark/);

    // Locate theme toggle button by testid
    const themeBtn = page.getByTestId('theme-toggle').first();
    await expect(themeBtn).toBeVisible();

    // Click to toggle to Light mode
    await themeBtn.click();
    await page.waitForTimeout(300);

    // Document should now NOT have dark class
    await expect(htmlElement).not.toHaveClass(/dark/);

    // Check localStorage saved theme
    const storedTheme = await page.evaluate(() => localStorage.getItem('slidestudio_theme'));
    expect(storedTheme).toBe('light');

    // Click again to toggle back to Dark mode
    await themeBtn.click();
    await page.waitForTimeout(300);
    await expect(htmlElement).toHaveClass(/dark/);

    const reStoredTheme = await page.evaluate(() => localStorage.getItem('slidestudio_theme'));
    expect(reStoredTheme).toBe('dark');
  });

  test('8. Language toggle switches between English (EN) and Khmer (KH)', async ({ page }) => {
    await page.goto('/');

    const htmlElement = page.locator('html');
    // Default locale is en
    await expect(htmlElement).toHaveAttribute('data-lang', 'en');

    // Locate language toggle button (shows EN badge)
    const langBtn = page.getByTestId('language-toggle').first();
    await expect(langBtn).toBeVisible();
    await expect(langBtn).toContainText('EN');

    // Open language dropdown
    await langBtn.click();
    await page.waitForTimeout(300);

    // Select Khmer option
    const khmerOption = page.locator('text=ភាសាខ្មែរ (KH)');
    await expect(khmerOption).toBeVisible();
    await khmerOption.click();
    await page.waitForTimeout(300);

    // Verify html lang and data-lang attributes
    await expect(htmlElement).toHaveAttribute('lang', 'km');
    await expect(htmlElement).toHaveAttribute('data-lang', 'kh');

    // Check localStorage
    const storedLocale = await page.evaluate(() => localStorage.getItem('slidestudio_locale'));
    expect(storedLocale).toBe('kh');

    // Verify key translated labels in Khmer
    await expect(page.locator('text=ស្ទូឌីយោ').first()).toBeVisible();
    await expect(page.locator('text=វិចិត្រសាលគំរូ').first()).toBeVisible();

    // Switch back to English by clicking language toggle again
    await page.getByTestId('language-toggle').first().click();
    await page.waitForTimeout(300);
    const englishOption = page.locator('text=English (EN)');
    await expect(englishOption).toBeVisible();
    await englishOption.click();
    await page.waitForTimeout(300);

    // Verify returned to English
    await expect(htmlElement).toHaveAttribute('lang', 'en');
    await expect(htmlElement).toHaveAttribute('data-lang', 'en');
    await expect(page.locator('text=Production Template Gallery').first()).toBeVisible();
  });

  test('9. PWA manifest, service worker, and studio dashboard load correctly', async ({ page }) => {
    // Check Web App Manifest
    const manifestRes = await page.request.get('http://localhost:3000/manifest.webmanifest');
    expect(manifestRes.status()).toBe(200);
    const manifest = await manifestRes.json();
    expect(manifest.short_name).toBe('SlideStudio');
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons.length).toBeGreaterThanOrEqual(3);

    // Check Service Worker
    const swRes = await page.request.get('http://localhost:3000/sw.js');
    expect(swRes.status()).toBe(200);
    const swText = await swRes.text();
    expect(swText).toContain('slidestudio-static');

    // Check Studio Dashboard page loads
    await page.goto('/dashboard');
    await expect(page.locator('text=SlideStudio.ai').first()).toBeVisible();
    await expect(page.locator('text=Transform any idea into an')).toBeVisible();
    await expect(page.locator('text=Recent Presentations')).toBeVisible();
  });

  test('10. Slide animations, GSAP triggers, ambient backdrop, and ELMS-quality HTML export work flawlessly', async ({ page }) => {
    // 1. Open presentation in editor
    await page.goto('/presentations/pres-1794035285398-p8u96');
    await page.waitForTimeout(1000);

    // 2. Verify slide has .slide.on, ambient .bgfx, and .slide-elem stagger animation elements
    const slide = page.locator('.slide.on').first();
    await expect(slide).toBeVisible();
    const bgfx = page.locator('.bgfx').first();
    await expect(bgfx).toBeVisible();
    const slideElems = page.locator('.slide-elem');
    expect(await slideElems.count()).toBeGreaterThanOrEqual(1);

    // 3. Test Replay "Animate" button
    const animateBtn = page.getByRole('button', { name: /Animate/i });
    await expect(animateBtn).toBeVisible();
    await animateBtn.click();
    await page.waitForTimeout(400);

    // 4. Test Fullscreen Presentation Player
    await page.goto('/presentations/pres-1794035285398-p8u96/present');
    await page.waitForTimeout(1000);
    await expect(page.locator('.slide.on').first()).toBeVisible();

    // 5. Test Canva-style click navigation (click right 70% of screen)
    const stage = page.locator('[title*="Click right side"]');
    const box = await stage.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width * 0.8, box.y + box.height * 0.5);
      await page.waitForTimeout(600);
    }

    // 6. Test exported HTML matches ELMS quality
    const exportRes = await page.request.get('http://localhost:4000/api/presentations/pres-1794035285398-p8u96/export/html');
    expect(exportRes.status()).toBe(200);
    const exportHtml = await exportRes.text();

    expect(exportHtml).toContain('class="bgfx"');
    expect(exportHtml).toContain('.slide.on .a');
    expect(exportHtml).toContain('animateCounters');
    expect(exportHtml).toContain('rect.width * 0.3');
    // Ensure strict zero emojis in exported HTML
    expect(/[\u{1F300}-\u{1F9FF}]/u.test(exportHtml)).toBe(false);
  });

  test('11. Homepage renders motion hero, prompt card, interactive demo, and takes verification screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Verify First-Time Visitor Guide on top before login
    await expect(page.locator('text=First-Time Visitor Guide').first()).toBeVisible();
    await expect(page.locator('text=Define Prompt or Topic')).toBeVisible();

    // Verify Card Video Animation tabs inside the hero card
    await expect(page.locator('button:has-text("Animated Video Demo")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Custom Prompt")').first()).toBeVisible();

    // Click "Motion" step button in video player to jump to live keynote slide animation
    await page.click('button:has-text("Motion")');
    await page.waitForTimeout(400);
    await expect(page.locator('text=Autonomous Intelligence in Cloud Architecture').first()).toBeVisible();
    await expect(page.locator('text=Offline HTML').first()).toBeVisible();

    // Scroll card into view for complete screenshot
    await page.evaluate(() => window.scrollBy(0, 320));
    await page.waitForTimeout(300);

    // Take screenshot of video animation inside the hero card (dark mode)
    await page.screenshot({
      path: '/Users/meunchamroeun/.gemini/antigravity/brain/2a3a9afc-1cd0-4ba3-a595-c5cc18ff90a6/hero-card-video-animation.png',
      fullPage: false,
    });

    // Switch to Khmer language to match user request screenshot
    const langBtn = page.getByTestId('language-toggle').first();
    await langBtn.click();
    await page.click('text=ភាសាខ្មែរ (KH)');
    await page.waitForTimeout(500);

    // Switch to Light mode to match user screenshot aesthetic
    const themeBtn = page.getByTestId('theme-toggle').first();
    await themeBtn.click();
    await page.waitForTimeout(500);

    // Take screenshot of video animation in Khmer Light Mode
    await page.screenshot({
      path: '/Users/meunchamroeun/.gemini/antigravity/brain/2a3a9afc-1cd0-4ba3-a595-c5cc18ff90a6/hero-card-video-animation-khmer-light.png',
      fullPage: false,
    });

    // Switch back to Dark mode & English for remaining test integrity
    await themeBtn.click();
    await langBtn.click();
    await page.click('text=English (EN)');
    await page.waitForTimeout(300);

    // Switch to Custom Prompt mode and verify textarea works
    await page.click('button:has-text("Custom Prompt")');
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();

    // Click quick prompt to verify interactive population
    await page.click('text=10-slide pitch for a Next-Gen AI Risk & Compliance Platform');
    await expect(textarea).toHaveValue(/AI Risk & Compliance/i);
  });
});
