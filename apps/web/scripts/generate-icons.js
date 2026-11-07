const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

async function generate() {
  const svgPath = path.resolve(__dirname, '../public/icons/icon.svg');
  const svgContent = fs.readFileSync(svgPath, 'utf8');

  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage();

  const sizes = [
    { name: 'icon-512.png', size: 512, maskable: false },
    { name: 'icon-192.png', size: 192, maskable: false },
    { name: 'apple-touch-icon.png', size: 180, maskable: false },
    { name: 'icon-maskable-512.png', size: 512, maskable: true },
  ];

  for (const { name, size, maskable } of sizes) {
    await page.setViewportSize({ width: size, height: size });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              width: ${size}px;
              height: ${size}px;
              background: #0c0a09;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            }
            .icon-wrapper {
              width: ${maskable ? Math.round(size * 0.8) : size}px;
              height: ${maskable ? Math.round(size * 0.8) : size}px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            svg {
              width: 100%;
              height: 100%;
            }
          </style>
        </head>
        <body>
          <div class="icon-wrapper">
            ${svgContent}
          </div>
        </body>
      </html>
    `;

    await page.setContent(html);
    const dest = path.resolve(__dirname, `../public/icons/${name}`);
    await page.screenshot({ path: dest, omitBackground: false });
    console.log(`Generated: ${dest} (${size}x${size})`);
  }

  // Also copy icon-192.png to public/favicon.ico or root
  const icon192 = path.resolve(__dirname, '../public/icons/icon-192.png');
  const favicon = path.resolve(__dirname, '../public/favicon.ico');
  fs.copyFileSync(icon192, favicon);
  console.log(`Updated favicon: ${favicon}`);

  await browser.close();
  console.log('All icons generated successfully!');
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
