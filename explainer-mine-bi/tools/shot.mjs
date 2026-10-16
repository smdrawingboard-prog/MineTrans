import { createRequire } from 'module';
const require = createRequire('/node-tools/node_modules/');
const { chromium } = require('playwright');
import fs from 'fs';
const times = process.argv.slice(2).map(Number);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args:['--no-sandbox','--disable-gpu'] }).catch(async()=>chromium.launch({args:['--no-sandbox']}));
const page = await browser.newPage({ viewport:{width:1920,height:1080} });
page.on('console', m=>console.log('console:', m.text())); page.on('pageerror', e=>console.log('PAGEERR', e.message));
await page.goto('file://'+process.cwd()+'/index.html');
await page.evaluate(()=>document.fonts.load('700 100px Inter'));
for (const t of times) {
  const t0=Date.now();
  await page.evaluate(t=>window.seek(t), t);
  await page.screenshot({ path: `frames/t${t.toFixed(1).padStart(5,"0")}.png`, type:'png' });
  console.log('t',t,Date.now()-t0,'ms');
}
await browser.close();
