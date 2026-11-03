// Luyện đề: đọc window.QUESTIONS (q: câu hỏi, o: lựa chọn, a: chỉ số đáp án đúng, d: domain, why: giải thích)
(function () {
  var root = document.getElementById('exam');
  if (!root || !window.QUESTIONS) return;
  var track = root.getAttribute('data-track');
  var DOMAINS = window.DOMAINS || {};
  var ALL = window.QUESTIONS;
  var state = null;
  var timer = null;

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function best() { try { return JSON.parse(localStorage.getItem('aws-best-' + track) || 'null'); } catch (e) { return null; } }

  function setup() {
    clearInterval(timer);
    var b = best();
    var opts = Object.keys(DOMAINS).map(function (k) { return '<option value="' + k + '">Domain ' + k + ': ' + esc(DOMAINS[k]) + ' (' + ALL.filter(function (q) { return String(q.d) === k; }).length + ' câu)</option>'; }).join('');
    root.innerHTML =
      '<div class="ex-bar">' +
      '<label>Phạm vi <select id="ex-scope"><option value="all">Tất cả domain (' + ALL.length + ' câu)</option>' + opts + '</select></label>' +
      '<label>Số câu <select id="ex-count"><option value="10">10</option><option value="20">20</option><option value="65">65 (như thi thật)</option><option value="999">Tất cả</option></select></label>' +
      '<label>Chế độ <select id="ex-mode"><option value="learn">Luyện tập: xem đáp án ngay</option><option value="exam">Thi thử: có giờ, chấm cuối bài</option></select></label>' +
      '<span class="grow"></span><button class="btn" id="ex-start" type="button">Bắt đầu</button></div>' +
      (b ? '<p>Điểm thi thử cao nhất của bạn: <b>' + b.pct + '%</b> (' + b.ok + '/' + b.n + ' câu, ' + b.date + ').</p>' : '') +
      '<p>Mẹo: luyện từng domain ngay sau khi học xong domain đó. Khi thi thử cả đề đạt từ 80% trở lên vài lần liên tiếp là có thể đăng ký thi.</p>';
    document.getElementById('ex-start').onclick = start;
  }

  function start() {
    var scope = document.getElementById('ex-scope').value;
    var count = +document.getElementById('ex-count').value;
    var mode = document.getElementById('ex-mode').value;
    var pool = ALL.filter(function (q) { return scope === 'all' || String(q.d) === scope; });
    var qs = shuffle(pool).slice(0, count).map(function (q) {
      var idx = shuffle(q.o.map(function (_, i) { return i; })); // trộn thứ tự đáp án
      return { src: q, order: idx, picked: [] };
    });
    state = { qs: qs, mode: mode, start: Date.now(), done: false };
    render();
    if (mode === 'exam') {
      var limit = Math.round(qs.length * 2 * 60); // khoảng 2 phút mỗi câu như đề thật
      timer = setInterval(function () {
        var left = limit - Math.floor((Date.now() - state.start) / 1000);
        var el = document.getElementById('ex-time');
        if (el) el.textContent = Math.floor(Math.max(left, 0) / 60) + ':' + String(Math.max(left, 0) % 60).padStart(2, '0');
        if (left <= 0) finish();
      }, 1000);
    }
  }

  function qHtml(item, i) {
    var q = item.src;
    var multi = q.a.length > 1;
    var checked = state.done || (state.mode === 'learn' && item.checked);
    var opts = item.order.map(function (oi) {
      var cls = '';
      if (checked) cls = q.a.indexOf(oi) >= 0 ? 'ok' : (item.picked.indexOf(oi) >= 0 ? 'bad' : '');
      return '<label class="' + cls + '"><input type="' + (multi ? 'checkbox' : 'radio') + '" name="q' + i + '" value="' + oi + '"' + (item.picked.indexOf(oi) >= 0 ? ' checked' : '') + (checked ? ' disabled' : '') + '><span>' + esc(q.o[oi]) + '</span></label>';
    }).join('');
    var right = sameSet(item.picked, q.a);
    var why = checked ? '<div class="ex-why"><span class="ex-res ' + (right ? 'ok">Đúng' : 'bad">Sai') + '</span>. ' + q.why + '</div>' : '';
    var btn = state.mode === 'learn' && !checked ? '<button class="btn ghost" type="button" data-check="' + i + '">Kiểm tra</button>' : '';
    return '<div class="ex-q' + (checked ? ' checked' : '') + '" style="--pc:' + (window.DOMAIN_COLORS ? window.DOMAIN_COLORS[q.d] : '#64748b') + '"><div class="ex-n"><span>Câu ' + (i + 1) + '/' + state.qs.length + '</span><b>Domain ' + q.d + '</b>' + (multi ? '<span>Chọn ' + q.a.length + ' đáp án</span>' : '') + '</div><p class="stem">' + esc(q.q) + '</p>' + opts + btn + why + '</div>';
  }

  function sameSet(a, b) { return a.length === b.length && a.every(function (x) { return b.indexOf(x) >= 0; }); }

  function render() {
    var head = '<div class="ex-bar"><b>' + (state.mode === 'exam' ? 'Thi thử' : 'Luyện tập') + '</b>' + (state.mode === 'exam' && !state.done ? '<span>Còn lại <span class="ex-timer" id="ex-time">…</span></span>' : '') + '<span class="grow"></span><button class="btn ghost" type="button" id="ex-reset">Làm đề khác</button>' + (state.mode === 'exam' && !state.done ? '<button class="btn" type="button" id="ex-finish">Nộp bài</button>' : '') + '</div>';
    root.innerHTML = head + (state.done ? summary() : '') + state.qs.map(qHtml).join('') + (state.mode === 'learn' && !state.done ? '<div class="ex-bar"><span class="grow"></span><button class="btn" type="button" id="ex-finish">Xem tổng kết</button></div>' : '');
    document.getElementById('ex-reset').onclick = setup;
    var f = document.getElementById('ex-finish');
    if (f) f.onclick = finish;
  }

  function summary() {
    var ok = 0, by = {};
    state.qs.forEach(function (it) {
      var d = it.src.d;
      by[d] = by[d] || { ok: 0, n: 0 };
      by[d].n++;
      if (sameSet(it.picked, it.src.a)) { ok++; by[d].ok++; }
    });
    var pct = Math.round((ok / state.qs.length) * 100);
    var rows = Object.keys(by).sort().map(function (d) { return '<tr><td>Domain ' + d + ': ' + esc(DOMAINS[d] || '') + '</td><td>' + by[d].ok + '/' + by[d].n + '</td><td>' + Math.round(by[d].ok / by[d].n * 100) + '%</td></tr>'; }).join('');
    return '<div class="ex-sum"><div class="big">' + pct + '%</div><p>Đúng ' + ok + '/' + state.qs.length + ' câu. ' + (pct >= 80 ? 'Rất tốt, bạn đã gần sẵn sàng.' : pct >= 72 ? 'Sát ngưỡng đậu. Ôn lại các domain yếu bên dưới.' : 'Chưa đạt. Đọc lại bài của domain yếu nhất rồi làm lại.') + ' Xem giải thích từng câu ở dưới.</p><table><tr><th>Domain</th><th>Đúng</th><th>Tỉ lệ</th></tr>' + rows + '</table></div>';
  }

  function finish() {
    clearInterval(timer);
    if (state.done) return;
    state.done = true;
    if (state.mode === 'exam') {
      var ok = state.qs.filter(function (it) { return sameSet(it.picked, it.src.a); }).length;
      var pct = Math.round(ok / state.qs.length * 100);
      var b = best();
      if (!b || pct > b.pct) { try { localStorage.setItem('aws-best-' + track, JSON.stringify({ pct: pct, ok: ok, n: state.qs.length, date: new Date().toLocaleDateString('vi-VN') })); } catch (e) {} }
    }
    render();
    root.scrollIntoView({ behavior: 'smooth' });
  }

  root.addEventListener('change', function (e) {
    var inp = e.target;
    if (!state || state.done) return;
    var i = +inp.name.slice(1);
    var it = state.qs[i];
    if (it.checked) return;
    var v = +inp.value;
    if (inp.type === 'radio') it.picked = [v];
    else if (inp.checked) it.picked.push(v);
    else it.picked = it.picked.filter(function (x) { return x !== v; });
  });
  root.addEventListener('click', function (e) {
    var b = e.target.closest('[data-check]');
    if (!b) return;
    var i = +b.getAttribute('data-check');
    var it = state.qs[i];
    if (!it.picked.length) return;
    it.checked = true;
    var el = b.closest('.ex-q');
    var tmp = document.createElement('div');
    tmp.innerHTML = qHtml(it, i);
    el.replaceWith(tmp.firstChild);
  });
  setup();
})();
