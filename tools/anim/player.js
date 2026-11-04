// Trình phát hoạt hình chạy trong trang (Playwright). Nhận STORY đã tính thời gian từ make-anim.mjs.
// render(t) vẽ đúng khung hình ở thời điểm t (giây) — hoàn toàn tất định, không dùng CSS transition.
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const COLORS = { cp: '#ed7100', st: '#7aa116', db: '#c925d1', nw: '#8c4fff', sec: '#dd344c', mg: '#e7157b', ai: '#01a88d', dv: '#3b48cc', an: '#8c4fff', gen: '#545b64', bad: '#111827' };
  const LINE = { def: '#64748b', ok: '#16a34a', bad: '#dc2626', go: '#ff9900', blue: '#2563eb', sec: '#dd344c' };
  const GROUP = {
    cloud: ['#232f3e', ''], region: ['#00a4a6', '7 5'], vpc: ['#8c4fff', ''], az: ['#00a4a6', '4 4'], public: ['#7aa116', ''],
    private: ['#00a4a6', ''], account: ['#e7157b', ''], ou: ['#e7157b', '6 4'], onprem: ['#7d8998', ''], plain: ['#94a3b8', ''], bad: ['#dc2626', ''], ok: ['#16a34a', ''],
  };
  const FILL = { public: 'rgba(122,161,22,.08)', private: 'rgba(0,164,166,.07)', onprem: 'rgba(125,137,152,.08)', bad: 'rgba(220,38,38,.06)', ok: 'rgba(22,163,74,.06)', plain: 'rgba(241,245,249,.7)' };

  const clamp = (x) => Math.max(0, Math.min(1, x));
  const easeOut = (p) => 1 - Math.pow(1 - p, 3);
  const easeBack = (p) => { const c = 1.6; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
  const el = (tag, attrs = {}, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const div = (cls, parent, html) => { const d = document.createElement('div'); d.className = cls; if (html != null) d.innerHTML = html; parent.appendChild(d); return d; };

  const S = window.STORY;
  const stage = document.getElementById('stage');
  const svgRoot = document.getElementById('svg');
  const sub = document.getElementById('sub');
  const head = document.getElementById('head');
  const scenes = [];

  function nodePad(n) { return n.sub ? 86 : n.label ? 64 : 38; }

  function route(a, b, opt) {
    const dx = b.x - a.x, dy = b.y - a.y, sx = Math.sign(dx) || 1, sy = Math.sign(dy) || 1;
    let r = opt.route || (Math.abs(dy) < 6 ? 'h' : Math.abs(dx) < 6 ? 'v' : 'hvh');
    const outV = (n, dir) => (dir > 0 ? n.y + nodePad(n) : n.y - 38);
    const inV = (n, dir) => (dir > 0 ? n.y - 40 : n.y + nodePad(n) + 2);
    if (r === 'h') return [[a.x + 38 * sx, a.y], [b.x - 40 * sx, a.y]];
    if (r === 'v') return [[a.x, outV(a, sy)], [a.x, inV(b, sy)]];
    if (r === 'hv') return [[a.x + 38 * sx, a.y], [b.x, a.y], [b.x, inV(b, sy)]];
    if (r === 'vh') return [[a.x, outV(a, sy)], [a.x, b.y], [b.x - 40 * sx, b.y]];
    if (r === 'vhv') { const m = opt.mid != null ? +opt.mid : (a.y + b.y) / 2; return [[a.x, outV(a, sy)], [a.x, m], [b.x, m], [b.x, inV(b, sy)]]; }
    const m = opt.mid != null ? +opt.mid : (a.x + b.x) / 2; // hvh
    return [[a.x + 38 * sx, a.y], [m, a.y], [m, b.y], [b.x - 40 * sx, b.y]];
  }
  const segLen = (p) => p.slice(1).reduce((s, q, i) => s + Math.hypot(q[0] - p[i][0], q[1] - p[i][1]), 0);
  function pointAt(p, d) {
    for (let i = 1; i < p.length; i++) {
      const l = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
      if (d <= l) { const k = l ? d / l : 0; return [p[i - 1][0] + (p[i][0] - p[i - 1][0]) * k, p[i - 1][1] + (p[i][1] - p[i - 1][1]) * k]; }
      d -= l;
    }
    return p[p.length - 1];
  }

  // ---------- Dựng từng cảnh ----------
  S.scenes.forEach((sc, si) => {
    const g = el('g', { class: 'scene' }, svgRoot);
    const html = div('hscene', stage);
    const items = {}; // id → đối tượng
    const anims = []; // {start, dur, fn(p)} áp theo thứ tự thời gian
    const resets = [];

    const mkNode = (id, [x, y, svc, label, subl]) => {
      const [abbr, cat] = S.svc[svc] || [svc.toUpperCase().slice(0, 4), 'gen'];
      const n = { id, x, y, label, sub: subl, kind: 'node' };
      n.g = el('g', {}, g);
      n.inner = el('g', {}, n.g);
      n.box = el('rect', { x: -34, y: -34, width: 68, height: 68, rx: 13, fill: COLORS[cat] || COLORS.gen }, n.inner);
      n.ring = el('rect', { x: -40, y: -40, width: 80, height: 80, rx: 17, fill: 'none', stroke: '#ff9900', 'stroke-width': 4, opacity: 0 }, n.inner);
      const t = el('text', { y: abbr.length > 4 ? 6 : 8, 'text-anchor': 'middle', class: 'abbr', 'font-size': abbr.length > 4 ? 15 : abbr.length > 3 ? 18 : 22 }, n.inner);
      t.textContent = abbr;
      if (label) { const l = el('text', { y: 58, 'text-anchor': 'middle', class: 'nl' }, n.g); l.textContent = label; n.lt = l; }
      if (subl) { const s = el('text', { y: 79, 'text-anchor': 'middle', class: 'ns' }, n.g); s.textContent = subl; n.st = s; }
      n.cross = el('g', { opacity: 0 }, n.inner);
      el('line', { x1: -26, y1: -26, x2: 26, y2: 26, stroke: '#dc2626', 'stroke-width': 7, 'stroke-linecap': 'round' }, n.cross);
      el('line', { x1: 26, y1: -26, x2: -26, y2: 26, stroke: '#dc2626', 'stroke-width': 7, 'stroke-linecap': 'round' }, n.cross);
      n.check = el('g', { opacity: 0, transform: 'translate(30,-30)' }, n.inner);
      el('circle', { r: 14, fill: '#16a34a', stroke: '#fff', 'stroke-width': 3 }, n.check);
      el('path', { d: 'M-6 0 L-1 5 L7 -5', stroke: '#fff', 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round' }, n.check);
      n.badges = [];
      items[id] = n;
      resets.push(() => {
        n.g.setAttribute('opacity', 0);
        n.g.setAttribute('transform', `translate(${x},${y})`);
        n.inner.setAttribute('transform', 'scale(1)');
        n.ring.setAttribute('opacity', 0);
        n.cross.setAttribute('opacity', 0);
        n.check.setAttribute('opacity', 0);
        n.box.setAttribute('opacity', 1);
        n.badges.forEach((b) => b.setAttribute('opacity', 0));
      });
    };
    const mkGroup = (id, [x, y, w, h, kind, label]) => {
      const [stroke, dash] = GROUP[kind] || GROUP.plain;
      const gg = el('g', {}, g);
      el('rect', { x, y, width: w, height: h, rx: 12, fill: FILL[kind] || 'rgba(255,255,255,.6)', stroke, 'stroke-width': 2.5, 'stroke-dasharray': dash }, gg);
      const t = el('text', { x: x + 14, y: y + 26, class: 'gl', fill: stroke }, gg);
      t.textContent = label || '';
      items[id] = { kind: 'group', g: gg };
      resets.push(() => gg.setAttribute('opacity', 0));
    };
    for (const id in sc.groups || {}) mkGroup(id, sc.groups[id]);
    // nhóm vẽ trước để nằm dưới
    const edgeLayer = el('g', {}, g);
    for (const id in sc.nodes || {}) mkNode(id, sc.nodes[id]);
    const topLayer = el('g', {}, g); // thứ tự lớp: nhóm, đường nối, nút, nhãn / chấm dữ liệu

    // tiêu đề cảnh
    const title = div('stitle', html, sc.title || '');
    resets.push(() => { title.style.opacity = 0; title.style.transform = 'translateX(-30px)'; });
    anims.push({ start: sc.start + 0.05, dur: 0.5, fn: (p) => { title.style.opacity = easeOut(p); title.style.transform = `translateX(${-30 * (1 - easeOut(p))}px)`; } });

    let tipBox = null;
    const listBox = sc.panel ? div('panel', html) : null;
    if (listBox) Object.assign(listBox.style, { left: sc.panel[0] + 'px', top: sc.panel[1] + 'px', width: (sc.panel[2] || 400) + 'px' });

    for (const a of sc.actions) {
      const T = a.t;
      const ids = (a.args[0] || '').split(',');
      switch (a.verb) {
        case 'show':
          for (const id of ids) {
            const it = items[id];
            if (!it) throw new Error('không có ' + id + ' ở cảnh ' + sc.title);
            if (it.kind === 'group') anims.push({ start: T, dur: a.dur, fn: (p) => it.g.setAttribute('opacity', easeOut(p)) });
            else if (it.kind === 'node') anims.push({ start: T, dur: a.dur, fn: (p) => { it.g.setAttribute('opacity', clamp(p * 2)); it.inner.setAttribute('transform', `scale(${0.4 + 0.6 * easeBack(p)})`); } });
            else anims.push({ start: T, dur: a.dur, fn: (p) => it.show(p) });
          }
          break;
        case 'hide':
          for (const id of ids) {
            const it = items[id];
            anims.push({ start: T, dur: a.dur, fn: (p) => (it.hide ? it.hide(p) : it.g.setAttribute('opacity', 1 - p)) });
          }
          break;
        case 'edge': {
          const [ia, ib] = a.args;
          const A = items[ia], B = items[ib];
          if (!A || !B) throw new Error('edge thiếu nút ' + ia + ' ' + ib);
          const pts = a.opt.pts ? JSON.parse(a.opt.pts) : route(A, B, a.opt);
          const color = LINE[a.opt.c] || LINE.def;
          const d = 'M' + pts.map((p) => p.join(' ')).join(' L');
          const path = el('path', { d, fill: 'none', stroke: color, 'stroke-width': 3.5, 'stroke-linejoin': 'round' }, edgeLayer);
          const len = segLen(pts);
          const mk = `ar${si}_${color.slice(1)}`;
          if (!svgRoot.querySelector('#' + mk)) {
            const m = el('marker', { id: mk, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 5, markerHeight: 5, orient: 'auto-start-reverse' }, svgRoot.querySelector('defs'));
            el('path', { d: 'M0 0 L10 5 L0 10 z', fill: color }, m);
          }
          let lab = null;
          if (a.str[0]) {
            let best = 1, bl = -1;
            for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (l > bl) { bl = l; best = i; } }
            const p0 = pts[best - 1], p1 = pts[best];
            const horiz = Math.abs(p0[1] - p1[1]) < 1;
            const lx = (p0[0] + p1[0]) / 2, ly = (p0[1] + p1[1]) / 2;
            lab = el('g', {}, topLayer);
            const bg = el('rect', { rx: 6, fill: '#fff', stroke: color, 'stroke-width': 1.5 }, lab);
            const tx = el('text', { class: 'el', 'text-anchor': horiz ? 'middle' : 'start', x: horiz ? lx : lx + 14, y: horiz ? ly - 14 : ly + 5, fill: color === LINE.def ? '#334155' : color }, lab);
            tx.textContent = a.str[0];
            lab._fit = () => { const b = tx.getBBox(); bg.setAttribute('x', b.x - 7); bg.setAttribute('y', b.y - 3); bg.setAttribute('width', b.width + 14); bg.setAttribute('height', b.height + 6); };
          }
          const e = { kind: 'edge', path, pts, len, color, lab, g: path };
          items[a.opt.id || `${ia}>${ib}`] = e;
          e.hide = (p) => { path.setAttribute('opacity', 1 - p); if (lab) lab.setAttribute('opacity', 1 - p); };
          resets.push(() => {
            path.setAttribute('stroke-dasharray', a.opt.dash ? '9 7' : `${len} ${len}`);
            path.setAttribute('stroke-dashoffset', a.opt.dash ? 0 : len);
            path.setAttribute('opacity', a.opt.dash ? 0 : 1);
            path.removeAttribute('marker-end');
            path.removeAttribute('marker-start');
            if (lab) lab.setAttribute('opacity', 0);
          });
          anims.push({ start: T, dur: a.dur, fn: (p) => {
            if (a.opt.dash) path.setAttribute('opacity', easeOut(p));
            else path.setAttribute('stroke-dashoffset', len * (1 - easeOut(p)));
            if (p >= 0.97) { path.setAttribute('marker-end', `url(#${mk})`); if (a.opt.both) path.setAttribute('marker-start', `url(#${mk})`); }
          } });
          if (lab) anims.push({ start: T + a.dur * 0.7, dur: 0.35, fn: (p) => { if (!lab._done) { lab._fit(); lab._done = 1; } lab.setAttribute('opacity', p); } });
          break;
        }
        case 'flow': {
          const e = items[a.opt.id || `${a.args[0]}>${a.args[1]}`] || items[`${a.args[1]}>${a.args[0]}`];
          if (!e) throw new Error('flow: chưa có đường ' + a.args.join('>'));
          const rev = !items[a.opt.id || `${a.args[0]}>${a.args[1]}`];
          const n = +(a.opt.n || 3);
          const color = LINE[a.opt.c] || (e.color === LINE.def ? LINE.go : e.color);
          for (let k = 0; k < n; k++) {
            const dot = el('circle', { r: 8, fill: color, stroke: '#fff', 'stroke-width': 3 }, topLayer);
            resets.push(() => dot.setAttribute('opacity', 0));
            anims.push({ start: T + k * 0.3, dur: 1.0, fn: (p) => {
              const q = rev ? 1 - p : p;
              const [x, y] = pointAt(e.pts, e.len * q);
              dot.setAttribute('cx', x); dot.setAttribute('cy', y);
              dot.setAttribute('opacity', p >= 1 ? 0 : Math.min(1, p * 6, (1 - p) * 6));
            } });
          }
          break;
        }
        case 'hl':
          for (const id of ids) {
            const n = items[id];
            if (!n) throw new Error('hl: không có ' + id);
            if (n.kind === 'html') {
              anims.push({ start: T, dur: a.dur, fn: (p) => { n.el.style.boxShadow = p >= 1 ? '' : `0 0 0 ${6 * Math.sin(p * Math.PI)}px rgba(255,153,0,.55), 0 6px 20px rgba(15,23,42,.12)`; } });
              continue;
            }
            anims.push({ start: T, dur: a.dur, fn: (p) => {
              const k = (p * 2) % 1;
              n.ring.setAttribute('opacity', p >= 1 ? (a.opt.keep ? 1 : 0) : 1 - k);
              n.ring.setAttribute('transform', `scale(${p >= 1 ? 1 : 1 + 0.35 * k})`);
              n.inner.setAttribute('transform', `scale(${p >= 1 ? 1 : 1 + 0.08 * Math.sin(p * Math.PI)})`);
            } });
          }
          break;
        case 'bad':
          for (const id of ids) { const n = items[id]; anims.push({ start: T, dur: a.dur, fn: (p) => { n.cross.setAttribute('opacity', easeOut(p)); n.box.setAttribute('opacity', 1 - 0.45 * p); } }); }
          break;
        case 'ok':
          for (const id of ids) { const n = items[id]; anims.push({ start: T, dur: a.dur, fn: (p) => { n.check.setAttribute('opacity', p); n.check.setAttribute('transform', `translate(30,-30) scale(${0.3 + 0.7 * easeBack(p)})`); } }); }
          break;
        case 'badge': {
          const n = items[a.args[0]];
          const color = LINE[a.opt.c] || '#0f172a';
          const b = el('g', {}, n.g);
          const bg = el('rect', { rx: 11, fill: color, height: 24, y: -66 }, b);
          const tx = el('text', { class: 'bdg', 'text-anchor': 'middle', y: -48 }, b);
          tx.textContent = a.str[0];
          n.badges.forEach((old) => anims.push({ start: T, dur: 0.2, fn: (p) => old.setAttribute('opacity', Math.min(+old.getAttribute('opacity'), 1 - p)) }));
          n.badges.push(b);
          resets.push(() => b.setAttribute('opacity', 0));
          anims.push({ start: T, dur: a.dur, fn: (p) => { if (!b._f) { const w = tx.getBBox().width + 20; bg.setAttribute('x', -w / 2); bg.setAttribute('width', w); b._f = 1; } b.setAttribute('opacity', p); b.setAttribute('transform', `translate(0,${8 * (1 - easeOut(p))})`); } });
          break;
        }
        case 'text': {
          const [id, x, y] = a.args;
          const t = el('text', { x, y, class: 'ft' + (a.opt.size ? '' : ''), 'font-size': a.opt.size || 20, 'font-weight': a.opt.bold ? 800 : 600, fill: LINE[a.opt.c] || a.opt.c || '#0f172a', 'text-anchor': a.opt.anchor || 'middle' }, topLayer);
          t.textContent = a.str[0];
          items[id] = { g: t, kind: 'text' };
          resets.push(() => t.setAttribute('opacity', 0));
          anims.push({ start: T, dur: a.dur, fn: (p) => t.setAttribute('opacity', p) });
          break;
        }
        case 'note': {
          const [id, x, y, w] = a.args;
          const d = div('note' + (a.opt.c ? ' c-' + a.opt.c : ''), html, a.str[0]);
          Object.assign(d.style, { left: x + 'px', top: y + 'px', width: (w || 300) + 'px' });
          items[id] = { kind: 'html', el: d, show: (p) => { d.style.opacity = p; d.style.transform = `translateY(${12 * (1 - easeOut(p))}px)`; }, hide: (p) => (d.style.opacity = 1 - p) };
          resets.push(() => { d.style.opacity = 0; d.style.boxShadow = ''; });
          anims.push({ start: T, dur: a.dur, fn: items[id].show });
          break;
        }
        case 'tip': {
          // có toạ độ: thẻ đặt cạnh sơ đồ. Không có: thẻ nổi giữa màn hình, làm mờ sơ đồ, tự ẩn cuối bước
          if (!a.args[0]) {
            const d = div('tipov', html, `<div><i class="th">Mẹo thi</i>${a.str[0]}</div>`);
            resets.push(() => (d.style.opacity = 0));
            anims.push({ start: T, dur: a.dur, fn: (p) => { d.style.opacity = p; d.firstChild.style.transform = `translateY(${30 * (1 - easeOut(p))}px)`; } });
            anims.push({ start: a.stepEnd - 0.35, dur: 0.3, fn: (p) => (d.style.opacity = 1 - p) });
            break;
          }
          const d = div('tip', html, `<i class="th">Mẹo thi</i>${a.str[0]}`);
          Object.assign(d.style, { left: a.args[0] + 'px', top: a.args[1] + 'px', width: (a.args[2] || 420) + 'px' });
          if (tipBox) { const old = tipBox; anims.push({ start: T, dur: 0.25, fn: (p) => (old.style.opacity = Math.min(+old.style.opacity, 1 - p)) }); }
          tipBox = d;
          resets.push(() => (d.style.opacity = 0));
          anims.push({ start: T, dur: a.dur, fn: (p) => { d.style.opacity = p; d.style.transform = `translateX(${40 * (1 - easeOut(p))}px)`; } });
          break;
        }
        case 'li': {
          const d = div('li' + (a.opt.c ? ' c-' + a.opt.c : ''), listBox, a.str[0]);
          resets.push(() => (d.style.opacity = 0));
          anims.push({ start: T, dur: a.dur, fn: (p) => { d.style.opacity = p; d.style.transform = `translateX(${-24 * (1 - easeOut(p))}px)`; } });
          break;
        }
        case 'big': {
          const d = div('big', html, `<div>${a.str[0]}${a.str[1] ? `<small>${a.str[1]}</small>` : ''}</div>`);
          resets.push(() => (d.style.opacity = 0));
          anims.push({ start: T, dur: a.dur, fn: (p) => { d.style.opacity = p; d.firstChild.style.transform = `scale(${0.85 + 0.15 * easeBack(p)})`; } });
          anims.push({ start: a.stepEnd - 0.35, dur: 0.3, fn: (p) => (d.style.opacity = 1 - p) });
          break;
        }
        case 'chart': {
          // chart id x y w h vals=10,20,.. thr=80 [m=3/5]
          const [id, x, y, w, h] = a.args.map((v, i) => (i ? +v : v));
          const vals = a.opt.vals.split(',').map(Number);
          const max = +(a.opt.max || 100), thr = a.opt.thr != null ? +a.opt.thr : null;
          const cg = el('g', {}, g);
          el('rect', { x, y, width: w, height: h, rx: 10, fill: '#fff', stroke: '#cbd5e1', 'stroke-width': 2 }, cg);
          const px = (i) => x + 30 + (i * (w - 60)) / (vals.length - 1);
          const py = (v) => y + h - 26 - (v / max) * (h - 52);
          if (thr != null) {
            el('line', { x1: x + 16, x2: x + w - 16, y1: py(thr), y2: py(thr), stroke: '#dc2626', 'stroke-width': 2.5, 'stroke-dasharray': '8 6' }, cg);
            const tl = el('text', { x: x + w - 20, y: py(thr) - 8, 'text-anchor': 'end', class: 'el', fill: '#dc2626' }, cg);
            tl.textContent = a.str[0] || `ngưỡng ${thr}`;
          }
          const pts = vals.map((v, i) => [px(i), py(v)]);
          const line = el('path', { d: 'M' + pts.map((p) => p.join(' ')).join(' L'), fill: 'none', stroke: '#2563eb', 'stroke-width': 4, 'stroke-linejoin': 'round' }, cg);
          const len = segLen(pts);
          const dots = pts.map((p, i) => el('circle', { cx: p[0], cy: p[1], r: 7, fill: thr != null && vals[i] > thr ? '#dc2626' : '#2563eb', stroke: '#fff', 'stroke-width': 2.5 }, cg));
          items[id] = { kind: 'chart', g: cg };
          resets.push(() => { cg.setAttribute('opacity', 0); line.setAttribute('stroke-dasharray', `${len} ${len}`); line.setAttribute('stroke-dashoffset', len); dots.forEach((d) => d.setAttribute('opacity', 0)); });
          anims.push({ start: T, dur: 0.3, fn: (p) => cg.setAttribute('opacity', p) });
          anims.push({ start: T + 0.2, dur: a.dur, fn: (p) => {
            line.setAttribute('stroke-dashoffset', len * (1 - p));
            dots.forEach((d, i) => d.setAttribute('opacity', p * (vals.length - 1) >= i - 0.01 ? 1 : 0));
          } });
          break;
        }
        case 'window': {
          // khung "N period gần nhất" trượt trên chart: window chartId from to
          const c = items[a.args[0]];
          const [x0, x1] = [+a.args[1], +a.args[2]];
          const [, cy, , ch] = [0, +a.opt.y, 0, +a.opt.h];
          const r = el('rect', { x: x0, y: cy, width: x1 - x0, height: ch, rx: 8, fill: 'rgba(255,153,0,.12)', stroke: '#ff9900', 'stroke-width': 3 }, c.g);
          resets.push(() => r.setAttribute('opacity', 0));
          anims.push({ start: T, dur: a.dur, fn: (p) => r.setAttribute('opacity', p) });
          break;
        }
        default:
          throw new Error('lệnh lạ: ' + a.verb);
      }
    }
    anims.sort((p, q) => p.start - q.start);
    scenes.push({ sc, g, html, anims, resets });
  });

  // ---------- render(t) ----------
  let curScene = -1;
  function render(t) {
    const i = Math.max(0, S.scenes.findIndex((s) => t >= s.start && t < s.end));
    const s = scenes[i];
    if (curScene !== i) {
      scenes.forEach((x, k) => { x.g.style.display = k === i ? '' : 'none'; x.html.style.display = k === i ? '' : 'none'; });
      curScene = i;
    }
    s.resets.forEach((f) => f());
    for (const a of s.anims) {
      if (a.start > t) break;
      a.fn(clamp((t - a.start) / a.dur));
    }
    // mờ dần khi vào / ra cảnh
    const fade = Math.min(clamp((t - s.sc.start) / 0.35), clamp((s.sc.end - t) / 0.3));
    s.g.setAttribute('opacity', fade);
    s.html.style.opacity = fade;
    // phụ đề
    const st = s.sc.steps.find((x) => t >= x.start && t < x.end);
    const txt = st && st.say ? st.say : '';
    if (sub.dataset.t !== txt) { sub.dataset.t = txt; sub.textContent = txt; }
    sub.style.opacity = txt ? 1 : 0;
    head.querySelector('.hs').textContent = `${i + 1} / ${scenes.length}`;
  }
  // khung có thay đổi so với khung trước không (để chụp lại hay dùng lại ảnh cũ)
  const marks = [];
  scenes.forEach((s) => {
    s.anims.forEach((a) => marks.push([a.start, a.start + a.dur]));
    marks.push([s.sc.start, s.sc.start + 0.4], [s.sc.end - 0.35, s.sc.end]);
    s.sc.steps.forEach((x) => marks.push([x.start - 0.01, x.start + 0.05]));
  });
  window.ANIM = {
    render,
    dirty: (t0, t1) => marks.some(([a, b]) => a < t1 + 0.001 && b > t0 - 0.001),
  };
})();
