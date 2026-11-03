// Chạy sớm (không defer) để không nháy màu khi tải trang.
try {
  var t = localStorage.getItem('aws-theme');
  if (t) document.documentElement.setAttribute('data-theme', t);
} catch (e) {}
