const { chromium } = require('@playwright/test');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  const filePath = 'file://' + path.resolve(__dirname, '../../../scratch/verified_all_in_one.html');
  console.log('Testing standalone file:', filePath);
  await page.goto(filePath);
  await page.waitForTimeout(1000);

  // 1. Verify Slide 1 in Dark Mode
  const firstSlideOn = await page.$eval('.slide.on', el => !!el);
  console.log('Slide 1 is active:', firstSlideOn);
  await page.screenshot({ path: path.resolve(__dirname, '../../../scratch/exported_all_in_1_dark_slide1.png') });

  // 2. Press 't' to toggle Light Mode in the standalone HTML file
  await page.keyboard.press('t');
  await page.waitForTimeout(500);
  const theme = await page.$eval('#deck', el => el.getAttribute('data-theme'));
  console.log('Theme after pressing "T":', theme);
  await page.screenshot({ path: path.resolve(__dirname, '../../../scratch/exported_all_in_1_light_slide1.png') });

  // 3. Press ArrowRight to navigate to Slide 2
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(800);
  const curNum = await page.$eval('#curNum', el => el.textContent);
  console.log('Slide number after ArrowRight:', curNum);
  await page.screenshot({ path: path.resolve(__dirname, '../../../scratch/exported_all_in_1_light_slide2.png') });

  // 4. Toggle back to Dark Mode
  await page.keyboard.press('t');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.resolve(__dirname, '../../../scratch/exported_all_in_1_dark_slide2.png') });

  await browser.close();
  console.log('All tests on all-in-one HTML completed successfully!');
})();
