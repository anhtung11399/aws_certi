// Kịch bản video: CloudFront, WAF, Shield, Global Accelerator
export default {
  scenes: [
    {
      title: 'CloudFront: cache ở gần người dùng',
      nodes: {
        u: [130, 330, 'users', 'Người dùng', 'Hà Nội'],
        edge: [470, 330, 'cloudfront', 'Edge location', 'cache'],
        s3: [880, 210, 's3', 'S3 origin', 'chỉ cho OAC'],
        alb: [880, 460, 'alb', 'ALB origin'],
      },
      steps: [
        { say: 'CloudFront đặt bản sao nội dung ở các edge location gần người dùng.', do: ['show u,edge', 'edge u edge', 'flow u edge'] },
        { say: 'Lần đầu không có trong cache, edge lấy từ origin, có thể là S3 hay ALB.', do: ['show s3,alb', 'edge edge s3 "cache miss"', 'edge edge alb', 'flow edge s3', 'badge edge "MISS" c=bad'] },
        { say: 'Những lần sau trả ngay từ edge, nhanh và giảm tải cho origin.', do: ['flow u edge c=ok', 'badge edge "HIT" c=ok @0.8'] },
        { say: 'Bucket S3 nên để riêng tư, chỉ cho CloudFront đọc bằng Origin Access Control. Người dùng không đi vòng qua CloudFront được.', do: ['hl s3', 'tip "S3 riêng tư sau CloudFront → <b>Origin Access Control (OAC)</b> + bucket policy cho <code>cloudfront.amazonaws.com</code>."'] },
      ],
    },
    {
      title: 'Cache hit ratio thấp',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Metric CacheHitRate thấp nghĩa là phần lớn request vẫn chạy về origin. Có ba nguyên nhân hay gặp.', do: [] },
        { say: 'Một: cache key chứa quá nhiều thứ, như mọi header, mọi cookie, mọi query string. Mỗi biến thể là một bản cache riêng.', do: ['li "Cache key có <b>mọi header / cookie / query</b> → quá nhiều biến thể" c=bad'] },
        { say: 'Sửa bằng cache policy chỉ giữ những gì thật sự cần. Gửi thêm dữ liệu tới origin mà không đưa vào cache key thì dùng origin request policy.', do: ['li "<b>Cache policy</b>: chỉ giữ cần thiết · <b>Origin request policy</b>: gửi origin mà không vào key" c=ok'] },
        { say: 'Hai: TTL quá ngắn, hoặc origin trả Cache-Control no-cache.', do: ['li "TTL quá ngắn / origin trả <code>Cache-Control: no-cache</code>" c=blue'] },
        { say: 'Ba: nội dung vừa đổi mà người dùng vẫn thấy bản cũ: tạo invalidation, hoặc tốt hơn là đổi tên file theo phiên bản.', do: ['tip "Nội dung cũ vẫn hiện → <b>invalidation</b> (tính phí sau 1.000 path / tháng) hoặc <b>đổi tên file theo version</b>."'] },
      ],
    },
    {
      title: 'Đọc lỗi của CloudFront',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Vài mã lỗi hay gặp.', do: [] },
        { say: '403: bucket S3 chưa cho CloudFront đọc, WAF chặn, hoặc chặn theo địa lý.', do: ['li "<b>403</b>: OAC / bucket policy, WAF, geo restriction" c=bad'] },
        { say: '502: CloudFront không bắt tay TLS được với origin, ví dụ chứng chỉ origin không khớp tên miền.', do: ['li "<b>502</b>: lỗi TLS tới origin (chứng chỉ sai tên, hết hạn)" c=bad'] },
        { say: '504: origin trả lời quá chậm, hoặc security group của origin chưa cho dải IP của CloudFront.', do: ['li "<b>504</b>: origin chậm / SG chưa cho <b>prefix list của CloudFront</b>" c=bad'] },
        { say: 'Chứng chỉ cho tên miền riêng trên CloudFront phải tạo trong ACM ở Region us-east-1.', do: ['tip "Chứng chỉ ACM cho CloudFront phải ở <b>us-east-1</b>. Origin chỉ nhận traffic từ CloudFront → SG dùng <b>managed prefix list</b>."'] },
      ],
    },
    {
      title: 'WAF, Shield, Global Accelerator',
      nodes: {
        bot: [130, 200, 'hacker', 'Bot', '5.000 request / phút'],
        u: [130, 460, 'users', 'Người dùng thật'],
        waf: [500, 330, 'waf', 'AWS WAF', 'rate-based rule'],
        cf: [820, 330, 'cloudfront', 'CloudFront / ALB'],
        sh: [500, 520, 'shield', 'Shield', 'chống DDoS'],
      },
      steps: [
        { say: 'AWS WAF gắn vào CloudFront, ALB hay API Gateway, lọc request ở tầng bảy.', do: ['show u,waf,cf', 'edge u waf route=hvh', 'edge waf cf c=ok', 'flow u waf', 'flow waf cf @1.2 c=ok'] },
        { say: 'Một IP gửi quá nhiều request: dùng rate-based rule để chặn tự động.', do: ['show bot', 'edge bot waf route=hvh c=bad', 'flow bot waf c=bad', 'bad bot @1.4'] },
        { say: 'Shield Standard chống DDoS tầng ba, bốn, miễn phí cho mọi khách hàng. Shield Advanced thêm đội phản ứng và bảo vệ chi phí.', do: ['show sh', 'note s 620 470 520 "<b>Shield Standard</b>: miễn phí · <b>Advanced</b>: DRT, bảo vệ chi phí" c=go'] },
        { say: 'Global Accelerator khác CloudFront: không cache, cho hai IP tĩnh toàn cầu, hợp với TCP, UDP, và chuyển Region nhanh.', do: ['tip "Cache nội dung HTTP → <b>CloudFront</b>. IP tĩnh toàn cầu, TCP/UDP, failover Region nhanh → <b>Global Accelerator</b>."'] },
      ],
    },
  ],
};
