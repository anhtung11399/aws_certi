// Kịch bản video: Bảo mật biên (WAF, Shield, CloudFront)
export default {
  scenes: [
    {
      title: 'Mỗi mối đe doạ một lớp bảo vệ',
      nodes: {
        ddos: [140, 190, 'hacker', 'DDoS mạng', 'SYN / UDP flood'],
        http: [140, 330, 'hacker', 'HTTP flood, bot'],
        sqli: [140, 470, 'hacker', 'SQLi, XSS'],
        sh: [520, 190, 'shield', 'Shield', 'tầng 3–4'],
        waf: [520, 400, 'waf', 'AWS WAF', 'tầng 7'],
        cf: [880, 330, 'cloudfront', 'CloudFront'],
        alb: [1130, 330, 'alb', 'Origin ALB'],
      },
      steps: [
        { say: 'Mỗi loại tấn công cần một lớp bảo vệ khác nhau.', do: ['show ddos,http,sqli'] },
        { say: 'DDoS ở tầng mạng như SYN flood bị Shield Standard chặn tự động, miễn phí.', do: ['show sh', 'edge ddos sh c=bad', 'flow ddos sh c=bad'] },
        { say: 'HTTP flood, bot, SQL injection, XSS ở tầng bảy cần AWS WAF.', do: ['show waf', 'edge http waf c=bad route=hvh', 'edge sqli waf c=bad route=hvh', 'flow http waf c=bad', 'flow sqli waf c=bad @1.2'] },
        { say: 'Chỉ request sạch mới tới CloudFront và origin.', do: ['show cf,alb', 'edge waf cf c=ok route=hvh', 'edge sh cf c=ok route=hvh', 'edge cf alb c=ok', 'flow cf alb c=ok'] },
        { say: 'Đừng quên chặn kẻ tấn công đi vòng thẳng vào origin: S3 dùng OAC, ALB chỉ nhận từ prefix list của CloudFront kèm một header bí mật.', do: ['tip "Chặn đi vòng CDN: S3 → <b>OAC</b> · ALB → SG chỉ <b>prefix list CloudFront</b> + <b>custom header bí mật</b> (WAF ở ALB kiểm tra)."'] },
      ],
    },
    {
      title: 'Bên trong một web ACL',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Web ACL gồm các rule xét theo thứ tự ưu tiên, số nhỏ xét trước.', do: [] },
        { say: 'Mỗi rule có hành động: Allow, Block, Count, CAPTCHA, hoặc Challenge.', do: ['li "Hành động: <b>Allow · Block · Count · CAPTCHA · Challenge</b>"'] },
        { say: 'Managed rule group của AWS chặn sẵn các kiểu tấn công phổ biến: core rule set, SQL injection, known bad inputs, danh sách IP xấu.', do: ['li "<b>Managed rules</b>: Core rule set, SQL database, Known bad inputs, IP reputation, Anonymous IP" c=ok'] },
        { say: 'Rate-based rule đếm request trong một khoảng thời gian theo IP, header hay dấu vân tay TLS, vượt ngưỡng thì chặn.', do: ['li "<b>Rate-based</b>: theo IP, header, cookie, <b>JA3 / JA4</b> fingerprint" c=bad'] },
        { say: 'Bot Control chặn bot. Account Takeover Prevention chặn dò mật khẩu ở trang đăng nhập.', do: ['li "<b>Bot Control</b> · <b>ATP</b> (dò mật khẩu) · <b>ACFP</b> (tạo tài khoản giả)" c=blue'] },
        { say: 'Quy trình an toàn: thêm rule mới ở chế độ Count, xem log vài ngày, rồi mới chuyển sang Block.', do: ['tip "Rule mới: bật <b>Count</b> trước, xem log, rồi mới <b>Block</b>. Rule chặn nhầm → <b>rule action override</b> sang Count. Web ACL cho CloudFront tạo ở <b>us-east-1</b>."'] },
      ],
    },
    {
      title: 'Shield Advanced',
      nodes: {
        att: [150, 330, 'hacker', 'DDoS lớn'],
        sha: [520, 330, 'shield', 'Shield Advanced', 'ELB, EIP, CloudFront, GA'],
        srt: [900, 190, 'users', 'Shield Response Team', '24/7'],
        cost: [900, 470, 'file', 'Bảo vệ chi phí', 'hoàn tiền scale do DDoS'],
      },
      steps: [
        { say: 'Shield Advanced bảo vệ load balancer, Elastic IP, CloudFront, Global Accelerator trước các cuộc DDoS lớn.', do: ['show att,sha', 'edge att sha c=bad', 'flow att sha c=bad', 'ok sha @1.2'] },
        { say: 'Có đội Shield Response Team hỗ trợ hai mươi bốn bảy, và bảo vệ chi phí: hoàn tiền phần scale thêm do tấn công.', do: ['show srt,cost', 'edge sha srt', 'edge sha cost'] },
        { say: 'Tự động giảm thiểu tấn công tầng ứng dụng bằng cách tạo rule WAF. Gắn Route 53 health check để phát hiện dựa trên sức khoẻ.', do: ['tip "Shield Advanced: cho SRT <b>role truy cập</b>, bật <b>proactive engagement</b>, gắn <b>health check</b>. Áp cho cả Organization → <b>Firewall Manager</b>."'] },
      ],
    },
    {
      title: 'Log của WAF',
      nodes: {
        waf: [180, 330, 'waf', 'Web ACL'],
        cw: [580, 200, 'logs', 'CloudWatch Logs', 'aws-waf-logs-...'],
        s3: [580, 330, 's3', 'S3', 'aws-waf-logs-...'],
        fh: [580, 460, 'firehose', 'Firehose'],
        sl: [960, 330, 'securitylake', 'Security Lake', 'OCSF cho SIEM'],
      },
      steps: [
        { say: 'Log của WAF gửi tới CloudWatch Logs, S3, hoặc Firehose.', do: ['show waf,cw,s3,fh', 'edge waf cw route=hvh', 'edge waf s3', 'edge waf fh route=hvh', 'flow waf s3'] },
        { say: 'Bẫy: tên log group hay tên bucket bắt buộc phải bắt đầu bằng aws-waf-logs gạch ngang.', do: ['hl cw,s3', 'badge s3 "tên bắt đầu aws-waf-logs-" c=bad'] },
        { say: 'Che các trường nhạy cảm như header Authorization bằng redaction. Đưa vào Security Lake để phân tích chung.', do: ['show sl', 'edge s3 sl', 'tip "Log WAF: đích có tên <code>aws-waf-logs-*</code>, có <b>logging filter</b> và <b>redact</b> trường nhạy cảm."'] },
      ],
    },
  ],
};
