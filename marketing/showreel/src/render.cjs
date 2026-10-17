// Render minetrans-showreel.html to MP4: 60fps, 3 subframes blended with tmix, Web Audio track muxed in.
// Usage: node render.cjs [reel] [stills]
//   reel   = minetrans-showreel (default) or minetrans-the-mine-30s
//   stills = one PNG per beat into ./beats/<reel> for review, instead of the MP4
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { spawn } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const REEL = process.argv.find(a => a.startsWith('minetrans-')) || 'minetrans-showreel';
const PAGE = 'file://' + path.join(ROOT, REEL + '.html');
const FPS = 60, SUB = 3;
let DUR = 15;

function run(cmd, args, opts = {}) {
  const p = spawn(cmd, args, { stdio: ['pipe', 'inherit', 'inherit'], ...opts });
  const done = new Promise((res, rej) => {
    p.on('error', rej);
    p.on('close', code => code === 0 ? res() : rej(new Error(`${cmd} exited with ${code}`)));
  });
  return { p, done };
}

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', e => { throw e; });
  await page.goto(PAGE);
  await page.waitForFunction(() => window.__ready === true || !!window.__error, { timeout: 30000 });
  const err = await page.evaluate(() => window.__error);
  if (err) throw new Error(err);
  DUR = await page.evaluate(() => window.DURATION || 15);
  return page;
}

async function stills(page) {
  const out = path.join(__dirname, 'beats', REEL);
  fs.mkdirSync(out, { recursive: true });
  for (let b = 0; b < DUR * 2; b++) {
    const t = b * 0.5 + 0.22;
    await page.evaluate(t => seek(t), t);
    await page.screenshot({ path: path.join(out, `beat${String(b).padStart(2, '0')}.png`) });
  }
  console.log('wrote', out);
}

async function video(page) {
  const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'reel-'));
  const wav = path.join(tmp, 'track.wav'), silent = path.join(tmp, 'video.mp4');
  fs.writeFileSync(wav, Buffer.from(await page.evaluate(() => renderAudio()), 'base64'));
  const ff = run('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS * SUB), '-c:v', 'mjpeg', '-i', '-',
    '-vf', "tmix=frames=3:weights='1 1 1',select='eq(mod(n\\,3)\\,2)',setpts=N/(60*TB)", '-r', String(FPS),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-pix_fmt', 'yuv420p', silent]);
  const N = FPS * DUR * SUB;
  for (let j = 0; j < N; j++) {
    await page.evaluate(t => seek(t), Math.max(0, (j - 1) / (FPS * SUB)));   // subframes centred on each frame
    const buf = await page.screenshot({ type: 'jpeg', quality: 94 });
    if (!ff.p.stdin.write(buf)) await new Promise(r => ff.p.stdin.once('drain', r));
    if (j % 300 === 0) console.log(`frame ${j}/${N}`);
  }
  ff.p.stdin.end();
  await ff.done;
  await run('ffmpeg', ['-loglevel', 'error', '-y', '-i', silent, '-i', wav, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k',
    '-shortest', '-movflags', '+faststart', path.join(ROOT, REEL + '.mp4')]).done;
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('wrote', path.join(ROOT, REEL + '.mp4'));
}

(async () => {
  const browser = await chromium.launch();
  try {
    const page = await openPage(browser);
    await (process.argv.includes('stills') ? stills(page) : video(page));
  } finally {
    await browser.close();
  }
})().catch(e => { console.error('render failed:', e.message); process.exit(1); });
