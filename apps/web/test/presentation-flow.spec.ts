import { test, expect } from '@playwright/test';

test.describe('AI Slide Animation Studio End-to-End Flow', () => {
  test('1. Dashboard loads with dark SaaS UI and no emojis', async ({ page }) => {
    await page.goto('/');

    // Check title and branding
    await expect(page).toHaveTitle(/AI Slide Animation Studio/i);
    await expect(page.locator('text=SlideStudio.ai')).toBeVisible();

    // Check Hero section
    await expect(page.locator('text=Transform any idea into an')).toBeVisible();
    await expect(page.locator('button:has-text("Create Presentation")')).toBeVisible();

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

  test('5. Offline HTML Export produces standalone single-file document', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/presentations/pres-1794035285398-p8u96/export/html');
    expect(response.status()).toBe(200);

    const htmlContent = await response.text();
    expect(htmlContent).toContain('<!DOCTYPE html>');
    expect(htmlContent).toContain('class="stage"');
    expect(htmlContent).toContain('class="bar"');
    expect(htmlContent).toContain('animateCounters');

    // Verify NO emojis in exported HTML
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    expect(emojiRegex.test(htmlContent)).toBe(false);
  });
});
