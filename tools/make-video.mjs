// Tạo video bài giảng từ trang bài đã build: slide (Playwright) + thuyết minh (say -v Linh) + ffmpeg
// Chạy trong thư mục có @playwright/test: node make-video.mjs <thư mục site> <slug...>
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const [, , SITE, ...slugs] = process.argv;
const OUTDIR = path.join(SITE, 'videos');
const TMP = path.join(SITE, 'tools', '.tmp');
fs.mkdirSync(OUTDIR, { recursive: true });

const css = fs.readFileSync(path.join(SITE, 'style.css'), 'utf8');
const W = 1280, H = 720;

// Chuẩn hoá chữ cho giọng đọc tiếng Việt
function speakable(t) {
  return t
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\s*\/\s*/g, ', ')
    .replace(/→/g, ' rồi ')
    .replace(/≥/g, ' lớn hơn hoặc bằng ')
    .replace(/[`"“”<>{}\[\]*_#|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
const cap = (t, n) => (t.length > n ? t.slice(0, t.lastIndexOf('.', n) > n * 0.5 ? t.lastIndexOf('.', n) + 1 : n) : t);

function slideHTML(s, meta) {
  const body = s.kind === 'title'
    ? `<div class="vt"><div class="code">${meta.code}</div><h1>${s.title}</h1><p>${s.lead}</p>${s.goals.length ? `<ul>${s.goals.map((g) => `<li>${g}</li>`).join('')}</ul>` : ''}</div>`
    : s.kind === 'diagram'
      ? `<div class="vd"><h2>${s.title}</h2><div class="svgbox">${s.svg}</div><p class="cap">${s.caption}</p></div>`
      : `<div class="vs"><h2>${s.title}</h2><ul>${s.items.map((i) => `<li>${i}</li>`).join('')}</ul></div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;700;800&display=swap" rel="stylesheet"><style>${css}
html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden;background:#f8fafc}
.frame{position:absolute;inset:0;padding:48px 64px;box-sizing:border-box;font-family:'Be Vietnam Pro',sans-serif;color:#0f172a}
.bar{position:absolute;left:0;right:0;bottom:0;height:44px;background:#232f3e;color:#fff;display:flex;align-items:center;padding:0 24px;font-size:16px;gap:16px}
.bar b{color:#ff9900}
.vt{display:flex;flex-direction:column;justify-content:center;height:600px}
.vt .code{display:inline-block;width:max-content;background:${meta.color};color:#fff;font-weight:800;padding:6px 16px;border-radius:99px;font-size:20px}
.vt h1{font-size:54px;line-height:1.15;margin:18px 0 12px}
.vt p{font-size:24px;color:#475569;margin:0 0 18px;max-width:1080px}
.vt li{font-size:22px;margin:6px 0}
.vs h2,.vd h2{font-size:38px;margin:0 0 22px;border-left:8px solid ${meta.color};padding-left:16px}
.vs li{font-size:25px;line-height:1.45;margin:10px 0;max-width:1130px}
.vd .svgbox{height:470px;display:flex;align-items:center;justify-content:center}
.vd svg{width:1150px!important;max-width:1150px!important;height:auto;max-height:460px;min-width:0!important}
.vd .cap{position:absolute;bottom:52px;left:64px;right:64px;font-size:17px;color:#475569;margin:0}
</style></head><body><div class="frame">${body}</div><div class="bar"><b>Ôn thi AWS</b><span>${meta.code} · Bài ${meta.no}: ${meta.title}</span></div></body></html>`;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
const reader = await browser.newPage();

for (const slug of slugs) {
  await reader.goto('file://' + path.join(SITE, slug + '.html'));
  const data = await reader.evaluate(() => {
    const t = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
    const art = document.querySelector('article.lesson');
    const meta = [...art.querySelectorAll('.l-meta span')].map(t);
    const sections = [];
    let cur = null;
    for (const el of art.querySelector('.prose').children) {
      if (el.tagName === 'H2') { cur = { h: t(el).replace(/^#/, ''), paras: [], items: [], rows: [], diagrams: [] }; sections.push(cur); continue; }
      if (!cur) continue;
      if (el.tagName === 'P') cur.paras.push(t(el));
      else if (el.tagName === 'UL' || el.tagName === 'OL') el.querySelectorAll(':scope > li').forEach((li) => cur.items.push(t(li)));
      else if (el.tagName === 'TABLE') el.querySelectorAll('tr').forEach((tr, i) => { if (i) { const c = [...tr.children].map(t); cur.rows.push(c[0] + (c[1] ? ': ' + c[1] : '')); } });
      else if (el.matches('figure.arch, figure.dg')) { const svg = el.querySelector('svg'); if (svg) cur.diagrams.push({ svg: svg.outerHTML, caption: t(el.querySelector('figcaption')) }); }
      else if (el.tagName === 'ASIDE') cur.paras.push(t(el));
    }
    return {
      code: meta[0], no: (meta.find((m) => m.startsWith('Bài ')) || '').replace('Bài ', ''),
      title: t(art.querySelector('h1')), lead: t(art.querySelector('.lead')),
      goals: [...art.querySelectorAll('.goals li')].map(t), sections,
    };
  });
  const color = data.code.startsWith('SCS') ? '#dd344c' : '#ec7211';
  const meta = { code: data.code, no: data.no, title: data.title, color };
  const slides = [{ kind: 'title', title: data.title, lead: data.lead, goals: data.goals,
    say: `${data.code}, bài ${data.no}. ${data.title}. ${data.lead}. ${data.goals.length ? 'Học xong bài này bạn sẽ: ' + data.goals.join('. ') + '.' : ''}` }];
  for (const s of data.sections) {
    const points = [...s.items, ...s.rows].map((x) => x.length > 150 ? x.slice(0, 147) + '…' : x).slice(0, 6);
    const narr = [...s.paras, ...s.items, ...s.rows].join(' ');
    if (points.length || s.paras.length) {
      slides.push({ kind: 'text', title: s.h, items: points.length ? points : s.paras.slice(0, 3).map((p) => (p.length > 220 ? p.slice(0, 217) + '…' : p)),
        say: `${s.h}. ${cap(narr, 900)}` });
    }
    for (const d of s.diagrams) slides.push({ kind: 'diagram', title: s.h, svg: d.svg, caption: d.caption, say: `Sơ đồ. ${d.caption}` });
  }
  slides.push({ kind: 'text', title: 'Tổng kết', items: [`Đọc lại bài ${data.no} trên web để xem đầy đủ bảng, cấu hình mẫu`, 'Làm các câu hỏi kiểm tra cuối bài', 'Ghi chú các từ khoá và bẫy trong đề'],
    say: `Hết bài ${data.no}. Hãy đọc lại bài trên web để xem đầy đủ các bảng và cấu hình mẫu, sau đó làm các câu hỏi kiểm tra cuối bài.` });

  const dir = path.join(TMP, slug);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const parts = [];
  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];
    const n = String(i).padStart(3, '0');
    await page.setContent(slideHTML(s, meta), { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${dir}/${n}.png` });
    execFileSync('say', ['-v', 'Linh', '-r', '175', '-o', `${dir}/${n}.aiff`, speakable(s.say)]);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-loop', '1', '-framerate', '2', '-i', `${dir}/${n}.png`, '-i', `${dir}/${n}.aiff`,
      '-af', 'apad=pad_dur=0.8', '-c:v', 'libx264', '-tune', 'stillimage', '-preset', 'veryfast', '-crf', '28', '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', '-b:a', '64k', '-ar', '44100', '-shortest', `${dir}/${n}.mp4`]);
    parts.push(`file '${n}.mp4'`);
  }
  fs.writeFileSync(`${dir}/list.txt`, parts.join('\n'));
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', `${dir}/list.txt`, '-c', 'copy', '-movflags', '+faststart', path.join(OUTDIR, slug + '.mp4')]);
  fs.rmSync(dir, { recursive: true, force: true });
  const dur = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(OUTDIR, slug + '.mp4')]).toString().trim();
  const size = (fs.statSync(path.join(OUTDIR, slug + '.mp4')).size / 1e6).toFixed(1);
  console.log(`${slug}: ${slides.length} slide, ${(+dur / 60).toFixed(1)} phút, ${size} MB`);
}
await browser.close();
