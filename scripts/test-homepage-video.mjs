import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';

const html = fs.readFileSync('client/public/index.html', 'utf8');
const before = execFileSync('git', ['show', 'HEAD:client/public/index.html'], {encoding:'utf8'});
const code = fs.readFileSync('client/public/homepage-video.js', 'utf8');
assert(!html.includes('id="introsplash"'));
for (const pattern of [/<h1>[\s\S]*?<\/h1>/, /<p class="lede">[\s\S]*?<\/p>/, /<p class="fsp">[\s\S]*?<\/p>/]) {
  assert.equal(html.match(pattern)[0], before.match(pattern)[0]);
}
const schemas = text => [...text.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
assert.deepEqual(schemas(html), schemas(before));
assert.equal(html.slice(0, html.indexOf('<meta name="viewport"')).replace(/\s/g,''), before.slice(0, before.indexOf('<meta name="viewport"')).replace(/\s/g,''));
for (const match of html.matchAll(/(?:href|src|data-src)="(\/(?:videos\/|homepage-video\.)[^"]+)"/g)) assert(fs.existsSync('client/public' + match[1]));
assert(fs.statSync('client/public/videos/minetrans-insurance-homepage-video.mp4').size < 500000);
assert(!/<video[^>]*\s(?:src|autoplay)=/.test(html));

function setup({mobile = false, reduced = false, saveData = false, effectiveType = '4g', reject = false} = {}) {
  const timers = [], listeners = {}, docListeners = {}, changes = {};
  let view;
  const video = {paused:true, ended:false, dataset:{src:'/videos/minetrans-insurance-homepage-video.mp4'}, classList:{add(){},remove(){}},
    getAttribute(){return this.src;}, addEventListener(name, cb){listeners[name]=cb;},
    pause(){this.paused=true;listeners.pause?.();}, async play(){if(reject)throw new Error('unavailable');this.paused=false;listeners.playing?.();}};
  const toggle = {hidden:true,addEventListener(name,cb){this.click=cb;}}, status = {hidden:true};
  const media = {mobile:{matches:mobile,addEventListener(n,f){changes.mobile=f;}},reduced:{matches:reduced,addEventListener(n,f){changes.reduced=f;}}};
  const connection = {saveData,effectiveType,addEventListener(n,f){changes.connection=f;}};
  const document = {readyState:'complete',hidden:false,getElementById(id){return {'homepage-video':video,'homepage-video-toggle':toggle,'homepage-video-status':status}[id];},addEventListener(n,f){docListeners[n]=f;}};
  const context = {document,navigator:{connection},window:{matchMedia(q){return q.includes('reduced')?media.reduced:media.mobile;},setTimeout(f){timers.push(f);}}};
  context.IntersectionObserver = class {constructor(cb){view=cb;}observe(){}};
  context.window.IntersectionObserver=context.IntersectionObserver;
  vm.runInNewContext(code, context);
  return {video,toggle,status,document,media,changes,hide(){document.hidden=true;docListeners.visibilitychange();},offscreen(){view([{isIntersecting:false}]);},async run(){timers.forEach(f=>f());await Promise.resolve();await Promise.resolve();}};
}
const desktop=setup(); assert(!desktop.video.src); await desktop.run(); assert(!desktop.video.paused); assert.equal(desktop.toggle.textContent,'Pause video');
desktop.toggle.click(); assert(desktop.video.paused); await desktop.run(); assert(desktop.video.paused);
desktop.toggle.click(); await Promise.resolve(); desktop.hide(); assert(desktop.video.paused);
const phone=setup({mobile:true});await phone.run();assert(!phone.video.paused);
assert(/<video[^>]*\sloop\s/.test(html));
assert(html.indexOf('class="intro-video"') < html.indexOf('<h1>'));
for(const settings of [{reduced:true},{saveData:true},{effectiveType:'2g'},{effectiveType:'3g'},{effectiveType:'slow-2g'}]){
  const test=setup(settings);await test.run();assert(!test.video.src);test.toggle.click();await Promise.resolve();assert(test.video.src);
}
const off=setup();await off.run();off.offscreen();assert(off.video.paused);
const changed=setup();await changed.run();changed.media.reduced.matches=true;changed.changes.reduced();assert(changed.video.paused);
const failed=setup({mobile:true,reject:true});failed.toggle.click();await new Promise(setImmediate);assert(!failed.status.hidden);
console.log('PASS: homepage content, compliance/consent preservation, JSON-LD, asset paths, file budget, deferred playback, pause, mobile, reduced motion, data saving, offscreen/background pause and failure fallback.');
