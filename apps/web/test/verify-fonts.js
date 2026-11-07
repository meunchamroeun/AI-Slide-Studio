const { chromium } = require('@playwright/test');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('Testing font on homepage...');
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  // Check English font
  const enHeadingFont = await page.$eval('h1', el => window.getComputedStyle(el).fontFamily);
  console.log('Computed font for English H1:', enHeadingFont);

  // Switch to Khmer
  const langTrigger = page.locator('button:has-text("EN"), button:has-text("KH")').first();
  if (await langTrigger.isVisible()) {
    await langTrigger.click();
    await page.waitForTimeout(200);
    const khOpt = page.locator('text=ភាសាខ្មែរ (KH)').first();
    if (await khOpt.isVisible()) {
      await khOpt.click();
      await page.waitForTimeout(400);
    }
  }

  // Check Khmer font
  const khHeadingFont = await page.$eval('h1', el => window.getComputedStyle(el).fontFamily);
  console.log('Computed font for Khmer H1:', khHeadingFont);

  await page.screenshot({ path: path.resolve(__dirname, '../../../scratch/verified-kh-font-kantomruy-pro.png') });

  // Switch back to English
  if (await langTrigger.isVisible()) {
    await langTrigger.click();
    await page.waitForTimeout(200);
    const enOpt = page.locator('text=English (EN)').first();
    if (await enOpt.isVisible()) {
      await enOpt.click();
      await page.waitForTimeout(400);
    }
  }
  await page.screenshot({ path: path.resolve(__dirname, '../../../scratch/verified-en-font-roboto.png') });

  // Test Exported HTML
  console.log('Testing font on exported standalone presentation...');
  const exportPath = 'file://' + path.resolve(__dirname, '../../../scratch/verified_all_in_one.html');
  await page.goto(exportPath);
  await page.waitForTimeout(500);

  const exportedBodyFont = await page.$eval('body', el => window.getComputedStyle(el).fontFamily);
  console.log('Exported standalone presentation body font:', exportedBodyFont);

  await browser.close();
  console.log('Font verification finished successfully!');
})();
