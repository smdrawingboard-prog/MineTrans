import { createRequire } from 'module';
const require = createRequire('/node-tools/node_modules/');
const { chromium } = require('playwright');
import fs from 'fs';
const browser = await chromium.launch({ args:['--no-sandbox','--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
page.on('pageerror', e=>console.log('PAGEERR', e.message));
await page.goto('file://'+process.cwd()+'/index.html');
const t0=Date.now();
const b64 = await page.evaluate(()=>window.buildAudio());
try{ fs.writeFileSync('out/soundtrack.wav', Buffer.from(b64,'base64')); }catch(e){ console.error('could not write WAV:',e.message); process.exit(1); }
console.log('wav bytes', fs.statSync('out/soundtrack.wav').size, 'in', Date.now()-t0,'ms');
await browser.close();
