const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Read the HTML file
  const htmlPath = path.join(__dirname, 'minetrans-mining-contractor-brochure.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

  // Set viewport for the design
  await page.setViewport({ width: 1200, height: 1600 });

  // Load the HTML
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  // Generate PDF with precise settings
  await page.pdf({
    path: path.join(__dirname, 'minetrans-mining-contractor-brochure.pdf'),
    format: 'Letter',
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    printBackground: true,
    scale: 1
  });

  await browser.close();
  console.log('PDF generated: minetrans-mining-contractor-brochure.pdf');
})();
