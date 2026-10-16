import { createRequire } from 'module';
const require = createRequire('/node-tools/node_modules/');
const { chromium } = require('playwright');
import { spawn } from 'child_process';
import fs from 'fs';
const SUB=180, DUR=90, TOTAL=SUB*DUR, N=Number(process.env.WORKERS||4);
const LIMIT=Number(process.env.LIMIT||TOTAL);
const outFile=process.env.OUT||'out/video_silent.mp4';
const browser = await chromium.launch({ args:['--no-sandbox','--disable-gpu'] });
const pages=[];
for(let k=0;k<N;k++){
  const p=await browser.newPage({viewport:{width:1920,height:1080}});
  p.on('pageerror',e=>console.log('PAGEERR',e.message));
  await p.goto('file://'+process.cwd()+'/index.html');
  await p.evaluate(()=>document.fonts.load('700 100px Inter'));
  pages.push(p);
}
process.on('unhandledRejection',e=>{console.error('render failed:',e);process.exit(1);});
const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(SUB),'-c:v','mjpeg','-i','-',
  '-vf','tmix=frames=3:weights=1 1 1,select=eq(mod(n\\,3)\\,2),setpts=N/60/TB',
  '-r','60','-c:v','libx264','-preset','medium','-crf','15','-pix_fmt','yuv420p','-movflags','+faststart',outFile],{stdio:['pipe','inherit','inherit']});
ff.on('error',e=>{console.error('ffmpeg spawn error:',e.message);process.exit(1);});
const results=new Map(); let next=0, wr=0; const t0=Date.now();
async function flush(){
  while(results.has(wr)){
    const b=results.get(wr); results.delete(wr);
    if(!ff.stdin.write(b)) await new Promise(r=>ff.stdin.once('drain',r));
    wr++;
    if(wr%1800===0){ const el=(Date.now()-t0)/1000; console.log(`frame ${wr}/${LIMIT} (${(wr/SUB).toFixed(1)}s) elapsed ${el.toFixed(0)}s eta ${(el/wr*(LIMIT-wr)).toFixed(0)}s`); }
  }
}
async function worker(p){
  while(true){
    if(next>=LIMIT) return;
    if(next-wr>48){ await new Promise(r=>setTimeout(r,4)); continue; }
    const i=next++;
    const t=Math.max(0,(i-1)/SUB);          // centre each 3-subframe group on its output frame time
    await p.evaluate(t=>window.seek(t),t);
    const buf=await p.screenshot({type:'jpeg',quality:94});
    results.set(i,buf); await flush();
  }
}
await Promise.all(pages.map(worker));
await flush(); ff.stdin.end();
const code=await new Promise(r=>ff.on('close',r));
if(code!==0){ console.error('ffmpeg exited with',code); process.exit(1); }
await browser.close();
console.log('done',outFile,((Date.now()-t0)/1000).toFixed(0)+'s');
