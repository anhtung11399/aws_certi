# Ôn thi AWS: CloudOps SOA-C03 và Security SCS-C03

Trang tĩnh, tiếng Việt. Nội dung bài trong `src/lessons/*.html`, lộ trình trong `src/lessons.mjs`,
câu luyện đề trong `src/static/questions-soa.js` và `questions-scs.js`.

```sh
node build.mjs   # dựng toàn bộ trang ra thư mục gốc (index.html ở gốc, dùng được với GitHub Pages)
```

Video bài giảng: `videos/<slug>.mp4`, tạo tự động bằng `tools/make-video.mjs` (slide chụp bằng Playwright + giọng đọc `say -v Linh` của macOS + ffmpeg).
Chạy trong thư mục có `@playwright/test`: `node make-video.mjs ~/Documents/aws-cert <slug...>`, rồi `node build.mjs` để gắn video vào bài.
Muốn dùng video quay tay (YouTube): thêm `video: 'https://www.youtube.com/embed/<id>'` vào bài trong `src/lessons.mjs` (ưu tiên hơn file mp4).
