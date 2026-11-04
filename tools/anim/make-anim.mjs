// Video hoạt hình cho bài học: kịch bản viết tay (stories/<slug>.mjs) → thuyết minh (edge-tts, giọng HoaiMy) → khung hình (Playwright) → ffmpeg.
// Chạy từ thư mục có @playwright/test: node <đường dẫn>/make-anim.mjs <thư mục site> <slug...> [--preview]
import { createRequire } from 'node:module';
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const { chromium } = createRequire(path.join(process.cwd(), 'x.js'))('@playwright/test');
const args = process.argv.slice(2);
const PREVIEW = args.includes('--preview'); // chỉ chụp vài khung để xem bố cục, không làm video
const TTS_ONLY = args.includes('--tts'); // chỉ lấy giọng đọc vào bộ nhớ đệm (chạy trước, chậm vì dịch vụ giới hạn)
const [SITE, ...slugs] = args.filter((a) => !a.startsWith('--'));
const HERE = path.join(SITE, 'tools', 'anim');
const TMP = path.join(SITE, 'tools', '.tmp');
const OUT = path.join(SITE, 'videos');
const FPS = 25, W = 1280, H = 720;

// Bảng biểu tượng dịch vụ lấy từ build.mjs (cùng màu, cùng chữ viết tắt với sơ đồ trên web)
const buildSrc = fs.readFileSync(path.join(SITE, 'build.mjs'), 'utf8');
const SVC = new Function('return ' + buildSrc.slice(buildSrc.indexOf('const SVC = {') + 12, buildSrc.indexOf('\n};', buildSrc.indexOf('const SVC = {')) + 2))();

const DUR = { show: 0.45, hide: 0.35, edge: 0.7, flow: 1.6, hl: 1.2, bad: 0.45, ok: 0.45, badge: 0.35, text: 0.35, note: 0.45, tip: 0.5, li: 0.4, big: 0.45, chart: 2.2, window: 0.35 };
const GAP = 0.5;

function parse(line) {
  const out = { verb: '', args: [], str: [], opt: {}, at: null };
  const toks = [];
  line.replace(/"([^"]*)"|(\S+)/g, (_, s, t) => { toks.push(s !== undefined ? { s } : t); return ''; });
  out.verb = toks.shift();
  for (const t of toks) {
    if (typeof t === 'object') out.str.push(t.s);
    else if (t.startsWith('@')) out.at = +t.slice(1);
    else if (/^[a-z]+=/.test(t)) { const i = t.indexOf('='); out.opt[t.slice(0, i)] = t.slice(i + 1); }
    else if (['dash', 'both', 'keep', 'bold'].includes(t)) out.opt[t] = true;
    else out.args.push(t);
  }
  return out;
}

function speakable(t) {
  return t
    .replace(/\s*\/\s*/g, ', ')
    .replace(/→/g, ' rồi ')
    .replace(/%/g, ' phần trăm')
    .replace(/[`"“”<>{}\[\]*_#|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
// Giọng đọc neural của Microsoft (edge-tts, miễn phí) qua tts_batch.py: một tiến trình lấy mọi câu còn thiếu,
// tự thử lại khi dịch vụ lỗi. Bộ nhớ đệm theo nội dung câu: dựng lại video không phải gọi lại.
const PY = path.join(SITE, 'tools', '.venv', 'bin', 'python');
const VOICE = process.env.VOICE || 'vi-VN-HoaiMyNeural';
const CACHE = path.join(SITE, 'tools', '.tts-cache');
fs.mkdirSync(CACHE, { recursive: true });
const cacheFile = (text) => path.join(CACHE, createHash('sha1').update(VOICE + '|+5%|' + text).digest('hex') + '.mp3');
function ttsBatch(texts, dir) {
  const jobs = [...new Set(texts)].map((text) => ({ text, out: cacheFile(text) })).filter((j) => !fs.existsSync(j.out));
  if (!jobs.length) return;
  const f = path.join(dir, 'tts.json');
  fs.writeFileSync(f, JSON.stringify(jobs));
  execFileSync(PY, [path.join(HERE, 'tts_batch.py'), f], { stdio: 'inherit', env: { ...process.env, VOICE } });
  const miss = jobs.filter((j) => !fs.existsSync(j.out));
  if (miss.length) throw new Error('thiếu giọng đọc: ' + miss[0].text.slice(0, 60));
}
const probe = (f) => +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim();

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });

for (const slug of slugs) {
  const story = (await import(pathToFileURL(path.join(HERE, 'stories', slug + '.mjs')).href + '?' + Date.now())).default;
  const lessonHTML = fs.readFileSync(path.join(SITE, slug + '.html'), 'utf8');
  const metaSpans = [...lessonHTML.matchAll(/<div class="l-meta">([\s\S]*?)<\/div>/g)][0]?.[1].match(/<span[^>]*>([^<]*)<\/span>/g)?.map((s) => s.replace(/<[^>]+>/g, '')) || [];
  const code = metaSpans[0] || '';
  const no = (metaSpans.find((m) => m.startsWith('Bài ')) || '').replace('Bài ', '');
  const title = (lessonHTML.match(/<h1>([^<]*)<\/h1>/) || [])[1] || slug;
  const color = code.startsWith('SCS') ? '#dd344c' : '#ff9900';

  const dir = path.join(TMP, 'anim-' + slug);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });

  // 1. Thuyết minh từng bước, đo độ dài
  let k = 0;
  const all = [];
  for (const sc of story.scenes) for (const st of sc.steps) { st.k = k++; st.audio = 0; if (st.say) all.push(speakable(st.speak || st.say)); }
  ttsBatch(all, dir);
  if (TTS_ONLY) { console.log(slug + ': đủ giọng đọc'); continue; }
  for (const sc of story.scenes) for (const st of sc.steps) {
    if (!st.say) continue;
    const f = path.join(dir, `s${st.k}.mp3`);
    fs.copyFileSync(cacheFile(speakable(st.speak || st.say)), f);
    st.audio = probe(f);
  }

  // 2. Tính thời gian: cảnh → bước → hành động
  let cur = 0;
  for (const sc of story.scenes) {
    sc.start = cur;
    sc.actions = [];
    sc.steps.forEach((st, i) => {
      st.start = cur;
      const base = cur + (i === 0 ? 0.7 : 0.15);
      let off = 0, lastEnd = base;
      const acts = (st.do || []).map(parse);
      for (const a of acts) {
        a.t = base + (a.at != null ? a.at : off);
        if (a.at == null) off += a.verb === 'flow' ? 0.9 : GAP;
        a.dur = a.opt.dur ? +a.opt.dur : DUR[a.verb] || 0.4;
        lastEnd = Math.max(lastEnd, a.t + a.dur + (a.verb === 'flow' ? 0.6 : 0));
      }
      st.audioAt = base - cur;
      let dur = Math.max(st.audioAt + st.audio + 0.45, lastEnd - cur + 0.3, st.min || 0);
      if (i === sc.steps.length - 1) dur += 0.5; // đuôi cảnh
      st.end = cur + dur;
      for (const a of acts) { a.stepEnd = st.end; sc.actions.push(a); }
      cur = st.end;
    });
    sc.end = cur;
  }
  const total = cur;

  // 3. Âm thanh: mỗi bước một đoạn wav đúng bằng độ dài bước, nối lại
  const list = [];
  for (const sc of story.scenes) for (const st of sc.steps) {
    const f = path.join(dir, `s${st.k}.wav`);
    const d = (st.end - st.start).toFixed(3);
    if (st.audio) execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(dir, `s${st.k}.mp3`), '-af', `adelay=${Math.round(st.audioAt * 1000)}:all=1,apad,atrim=0:${d}`, '-ar', '44100', '-ac', '1', f]);
    else execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', `anullsrc=r=44100:cl=mono`, '-t', d, f]);
    list.push(`file '${f}'`);
  }
  fs.writeFileSync(path.join(dir, 'a.txt'), list.join('\n'));
  const audio = path.join(dir, 'audio.wav');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(dir, 'a.txt'), '-c', 'copy', audio]);

  // 4. Trang phát
  const STORY = { svc: SVC, scenes: story.scenes.map((sc) => ({ title: sc.title, nodes: sc.nodes, groups: sc.groups, panel: sc.panel, start: sc.start, end: sc.end, actions: sc.actions, steps: sc.steps.map((s) => ({ say: s.say, start: s.start, end: s.end })) })) };
  const html = fs.readFileSync(path.join(HERE, 'player.html'), 'utf8')
    .replace('{{CODE}}', `${code} · Bài ${no}`).replace('{{TITLE}}', title).replace(/{{COLOR}}/g, color)
    .replace('/*STORY*/', () => 'window.STORY = ' + JSON.stringify(STORY).replace(/</g, '\\u003c') + ';')
    .replace('/*PLAYER*/', () => fs.readFileSync(path.join(HERE, 'player.js'), 'utf8'));
  const errors = [];
  page.removeAllListeners('pageerror');
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  if (errors.length) throw new Error(slug + ': ' + errors.join(' | '));

  if (PREVIEW) {
    // ảnh cuối mỗi bước để xem bố cục
    for (const sc of story.scenes) for (const st of sc.steps) {
      await page.evaluate((t) => window.ANIM.render(t), st.end - 0.6);
      await page.screenshot({ path: path.join(dir, `p${String(st.k).padStart(3, '0')}.jpg`), type: 'jpeg', quality: 80 });
    }
    console.log(`${slug}: ${(total / 60).toFixed(1)} phút, ảnh xem trước ở ${dir}`);
    continue;
  }

  // 5. Khung hình → ffmpeg (khung không đổi thì dùng lại ảnh trước)
  const out = path.join(OUT, slug + '.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-i', audio,
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '24', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k', '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', (c) => (c ? rej(new Error('ffmpeg ' + c)) : res())));
  const write = (b) => (ff.stdin.write(b) ? null : new Promise((r) => ff.stdin.once('drain', r)));
  const N = Math.ceil(total * FPS);
  let last = null, shots = 0;
  // lưu kèm ảnh cuối mỗi bước để kiểm tra bố cục
  const snap = new Map();
  for (const sc of story.scenes) for (const st of sc.steps) snap.set(Math.round((st.end - 0.6) * FPS), st.k);
  for (let f = 0; f < N; f++) {
    const t = f / FPS, t0 = (f - 1) / FPS;
    if (!last || (await page.evaluate(([a, b]) => window.ANIM.dirty(a, b), [t0, t]))) {
      await page.evaluate((x) => window.ANIM.render(x), t);
      last = await page.screenshot({ type: 'jpeg', quality: 90 });
      shots++;
    }
    if (snap.has(f)) fs.writeFileSync(path.join(dir, `p${String(snap.get(f)).padStart(3, '0')}.jpg`), last);
    const w = write(last);
    if (w) await w;
  }
  ff.stdin.end();
  await done;
  for (const f of fs.readdirSync(dir)) if (!f.endsWith('.jpg')) fs.rmSync(path.join(dir, f));
  console.log(`${slug}: ${(total / 60).toFixed(1)} phút, ${shots}/${N} khung chụp, ${(fs.statSync(out).size / 1e6).toFixed(1)} MB`);
}
await browser.close();
