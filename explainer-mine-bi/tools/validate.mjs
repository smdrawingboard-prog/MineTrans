import { createRequire } from 'module';
const require = createRequire('/node-tools/node_modules/');
const { chromium } = require('playwright');
const browser = await chromium.launch({ args:['--no-sandbox'] });
const page = await browser.newPage({ viewport:{width:1920,height:1080} });
page.on('pageerror', e=>console.log('PAGEERR', e.message));
await page.goto('file://'+process.cwd()+'/index.html');
const words = await page.evaluate(()=>window.WORDS());
const caps = await page.evaluate(()=>window.CAPS);
let max=0, at=0;
for(let t=0;t<90;t+=1/60){ let n=0; for(const w of words) if(t>=w.s && t<=w.e) n++; if(n>max){max=n;at=t;} }
console.log('max simultaneous words:',max,'at t=',at.toFixed(2));
const short = words.filter(w=>w.hold<0.3);
console.log('words with hold<0.3s:',short.length, short.slice(0,5));
// caption exit/entry separation
for(let i=1;i<caps.length;i++){ const gap=caps[i].a-0.3-(Math.min(caps[i-1].b,90)+0.55); if(gap<0) console.log('caption overlap risk',i,gap.toFixed(2)); }
await browser.close();
