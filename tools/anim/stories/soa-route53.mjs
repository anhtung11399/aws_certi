// Kịch bản video: Route 53 và khả năng chịu lỗi
export default {
  scenes: [
    {
      title: 'Hosted zone và alias record',
      nodes: {
        u: [130, 330, 'users', 'Người dùng', 'app.vidu.vn ?'],
        r53: [470, 330, 'route53', 'Route 53', 'hosted zone vidu.vn'],
        alb: [850, 190, 'alb', 'ALB', 'alias record'],
        cf: [850, 330, 'cloudfront', 'CloudFront', 'alias, cả zone apex'],
        s3: [850, 470, 's3', 'S3 website'],
      },
      steps: [
        { say: 'Route 53 là DNS của AWS. Hosted zone public phục vụ tên miền trên Internet, hosted zone private chỉ phân giải trong VPC.', do: ['show u,r53', 'edge u r53 "hỏi DNS"', 'flow u r53'] },
        { say: 'Alias record là tính năng riêng của Route 53: trỏ thẳng tới tài nguyên AWS như ALB, CloudFront, S3 website.', do: ['show alb,cf,s3', 'edge r53 alb', 'edge r53 cf', 'edge r53 s3', 'flow r53 cf'] },
        { say: 'Khác CNAME, alias dùng được cho tên miền gốc, như vidu chấm vn, và truy vấn alias tới tài nguyên AWS không tính phí.', do: ['tip "Tên miền gốc (zone apex) trỏ tới ALB / CloudFront → <b>Alias</b>, không dùng CNAME. Alias không đặt TTL."'] },
        { say: 'Trước khi đổi bản ghi, hãy hạ TTL xuống thấp để các máy chủ DNS khác nhanh chóng lấy giá trị mới.', do: ['note t 90 480 520 "Đổi bản ghi: <b>hạ TTL trước</b> rồi mới đổi" c=go'] },
      ],
    },
    {
      title: 'Routing policy',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Route 53 có tám cách trả lời. Mỗi cách giải một bài toán.', do: [] },
        { say: 'Weighted chia theo trọng số: canary mười phần trăm, A/B test. Trọng số bằng không để tạm ngừng.', do: ['li "<b>Weighted</b>: chia %, canary, A/B. Trọng số 0 = tạm ngừng" c=ok'] },
        { say: 'Latency trả về Region có độ trễ thấp nhất tới người dùng.', do: ['li "<b>Latency</b>: Region nhanh nhất với người dùng" c=blue'] },
        { say: 'Failover: bản chính có health check, hỏng thì trả bản phụ. Ví dụ trang bảo trì tĩnh trên S3.', do: ['li "<b>Failover</b>: primary có health check, hỏng → secondary" c=bad'] },
        { say: 'Geolocation theo quốc gia người dùng, nhớ tạo bản ghi Default. Geoproximity theo khoảng cách, có bias để kéo đẩy lưu lượng.', do: ['li "<b>Geolocation</b>: theo quốc gia, cần <b>Default</b> · <b>Geoproximity</b>: khoảng cách + bias"'] },
        { say: 'Multivalue answer trả tới tám địa chỉ khoẻ. Nó không thay được load balancer.', do: ['li "<b>Multivalue</b>: tới 8 IP khoẻ, cân tải phía client · <b>IP-based</b>: theo dải IP nhà mạng"'] },
      ],
    },
    {
      title: 'Failover với health check',
      groups: { r1: [380, 140, 300, 200, 'region', 'Singapore (primary)'], r2: [380, 380, 300, 200, 'region', 'Tokyo (secondary)'] },
      nodes: {
        r53: [150, 360, 'route53', 'Route 53', 'failover policy'],
        p: [530, 240, 'alb', 'ALB chính'],
        s: [530, 480, 's3', 'Trang dự phòng'],
        hc: [950, 240, 'cloudwatch', 'Health checker', 'khắp thế giới'],
      },
      steps: [
        { say: 'Bản ghi primary trỏ về Singapore, có health check. Health checker ở khắp thế giới gọi vào mỗi ba mươi giây.', do: ['show r53,r1,p,hc', 'edge r53 p "primary" c=ok route=vh', 'edge hc p "kiểm tra" both', 'flow hc p'] },
        { say: 'Primary hỏng, health check báo lỗi.', do: ['bad p', 'badge p "unhealthy" c=bad'] },
        { say: 'Route 53 tự trả bản ghi secondary. Người dùng được chuyển sang Tokyo.', do: ['show r2,s', 'edge r53 s "secondary" c=go route=vh', 'flow r53 s c=go'] },
        { say: 'Với alias trỏ tới ELB, bật Evaluate target health là đủ, không cần health check riêng.', do: ['note e 760 420 440 "Alias → ELB: bật <b>Evaluate target health</b>" c=ok'] },
        { say: 'Bẫy hay gặp: tài nguyên trong private subnet thì health checker từ Internet không gọi vào được. Dùng health check theo CloudWatch alarm.', do: ['tip "Tài nguyên <b>private</b> → health check dựa trên <b>CloudWatch alarm</b>. Firewall phải cho dải IP health checker. Metric health check nằm ở <b>us-east-1</b>."'] },
      ],
    },
    {
      title: 'Zonal shift: tránh một AZ đang ốm',
      groups: { a: [220, 180, 260, 300, 'az', 'AZ a'], b: [510, 180, 260, 300, 'az', 'AZ b'], c: [800, 180, 260, 300, 'az', 'AZ c'] },
      nodes: {
        e1: [350, 330, 'ec2', 'EC2'], e2: [640, 330, 'ec2', 'EC2', 'độ trễ tăng vọt'], e3: [930, 330, 'ec2', 'EC2'],
      },
      steps: [
        { say: 'Ứng dụng chạy trên ba AZ. Một AZ bắt đầu có vấn đề nhưng chưa chết hẳn, health check vẫn qua.', do: ['show a,b,c,e1,e2,e3', 'badge e2 "lỗi âm ỉ" c=bad'] },
        { say: 'Route 53 Application Recovery Controller có zonal shift: chuyển lưu lượng của load balancer khỏi AZ đó trong vài phút.', do: ['bad e2', 'hl e1,e3 @0.6'] },
        { say: 'Bật zonal autoshift để AWS tự chuyển khi phát hiện sự cố của AZ.', do: ['note z 220 510 840 "<b>Zonal shift</b> (tay) · <b>zonal autoshift</b> (AWS tự làm) · <b>routing control</b> bật tắt cả Region" c=go'] },
        { say: 'Thiết kế tốt là static stability: mỗi AZ đã đủ năm mươi phần trăm tải, mất một AZ vẫn đủ phục vụ mà không phải tạo thêm máy.', do: ['tip "<b>Static stability</b>: 3 AZ × 50% tải → mất 1 AZ vẫn đủ 100%, không phụ thuộc việc tạo máy mới lúc sự cố."'] },
      ],
    },
    {
      title: 'Nhớ gì khi đi thi',
      panel: [90, 140, 1100],
      steps: [
        { say: 'Tóm tắt Route 53.', do: [] },
        { say: 'Tên miền gốc trỏ tới tài nguyên AWS: alias, không phải CNAME.', do: ['li "Zone apex → <b>Alias</b>"'] },
        { say: 'Chia phần trăm: weighted. Nhanh nhất: latency. Dự phòng: failover. Theo quốc gia: geolocation.', do: ['li "% → <b>Weighted</b> · nhanh nhất → <b>Latency</b> · dự phòng → <b>Failover</b> · quốc gia → <b>Geolocation</b>" c=ok'] },
        { say: 'Health check cho tài nguyên private: dựa trên CloudWatch alarm.', do: ['li "Private resource → health check theo <b>CloudWatch alarm</b>" c=bad'] },
        { say: 'Tránh một AZ đang lỗi: zonal shift.', do: ['li "Tránh AZ đang lỗi → <b>ARC zonal shift</b>" c=blue'] },
        { say: 'Thử khả năng chịu lỗi bằng Fault Injection Service.', do: ['li "Diễn tập sự cố → <b>AWS Fault Injection Service</b>. Đánh giá RTO / RPO → <b>Resilience Hub</b>"'] },
      ],
    },
  ],
};
