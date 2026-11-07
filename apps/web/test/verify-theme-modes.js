const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

(async () => {
  const artifactDir = '/Users/meunchamroeun/.gemini/antigravity/brain/2a3a9afc-1cd0-4ba3-a595-c5cc18ff90a6';
  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome',
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  // 1. LIGHT MODE - Khmer language, Video Demo Step 2 (Motion)
  console.log('Navigating to homepage in Light Mode...');
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  // Set theme to light
  await page.evaluate(() => {
    localStorage.setItem('theme', 'light');
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  });

  // Switch to Khmer language if needed
  const khButton = page.locator('text=ភាសាខ្មែរ (KH)');
  if (await khButton.isVisible()) {
    // already or switch
  } else {
    const langTrigger = page.locator('button:has-text("KH"), button:has-text("EN")').first();
    if (await langTrigger.isVisible()) {
      await langTrigger.click();
      await page.waitForTimeout(200);
      const optKh = page.locator('text=ភាសាខ្មែរ (KH)').first();
      if (await optKh.isVisible()) {
        await optKh.click();
        await page.waitForTimeout(300);
      }
    }
  }

  // Click Step "Motion" on the video player
  const motionTab = page.locator('button:has-text("Motion")').first();
  if (await motionTab.isVisible()) {
    await motionTab.click();
    await page.waitForTimeout(600); // Wait for transition
  }

  await page.evaluate(() => window.scrollTo(0, 380));
  await page.waitForTimeout(300);

  await page.screenshot({
    path: path.join(artifactDir, 'verified-light-mode-step2-khmer.png'),
    fullPage: false,
  });
  console.log('Saved verified-light-mode-step2-khmer.png');

  // 2. LIGHT MODE - Custom Prompt Mode
  const customPromptBtn = page.locator('button:has-text("ប្រធានបទផ្ទាល់ខ្លួន"), button:has-text("Custom Prompt"), button:has-text("សរសេរប្រធានបទផ្ទាល់ខ្លួន")').first();
  if (await customPromptBtn.isVisible()) {
    await customPromptBtn.click();
    await page.waitForTimeout(400);
  }

  await page.screenshot({
    path: path.join(artifactDir, 'verified-light-mode-custom-prompt-khmer.png'),
    fullPage: false,
  });
  console.log('Saved verified-light-mode-custom-prompt-khmer.png');

  // 3. DARK MODE - Video Demo Step 2 (Motion)
  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
  });
  await page.waitForTimeout(300);

  // Switch back to Video Demo
  const videoDemoBtn = page.locator('button:has-text("វីដេអូចលនាបង្ហាញការបង្កើត"), button:has-text("Animated Video Demo")').first();
  if (await videoDemoBtn.isVisible()) {
    await videoDemoBtn.click();
    await page.waitForTimeout(500);
  }

  const motionTabDark = page.locator('button:has-text("Motion")').first();
  if (await motionTabDark.isVisible()) {
    await motionTabDark.click();
    await page.waitForTimeout(600);
  }

  await page.evaluate(() => window.scrollTo(0, 380));
  await page.waitForTimeout(300);

  await page.screenshot({
    path: path.join(artifactDir, 'verified-dark-mode-step2-khmer.png'),
    fullPage: false,
  });
  console.log('Saved verified-dark-mode-step2-khmer.png');

  // 4. DARK MODE - Custom Prompt Mode
  if (await customPromptBtn.isVisible()) {
    await customPromptBtn.click();
    await page.waitForTimeout(400);
  }

  await page.screenshot({
    path: path.join(artifactDir, 'verified-dark-mode-custom-prompt-khmer.png'),
    fullPage: false,
  });
  console.log('Saved verified-dark-mode-custom-prompt-khmer.png');

  // 5. Check Export options in Editor
  console.log('Checking editor export dropdown...');
  await page.goto('http://localhost:3000/presentations/pres-1794037657100-bwx74');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  const exportBtn = page.locator('button:has-text("Export"), button:has-text("ទាញយក")').first();
  if (await exportBtn.isVisible()) {
    await exportBtn.click();
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(artifactDir, 'verified-editor-export-options.png'),
      fullPage: false,
    });
    console.log('Saved verified-editor-export-options.png');
  }

  await browser.close();
  console.log('All verification screenshots complete.');
})();
