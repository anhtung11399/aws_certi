// Kịch bản video: Logging tập trung
export default {
  scenes: [
    {
      title: 'Account log tập trung',
      groups: { org: [60, 150, 1160, 420, 'ou', 'Organization'], arch: [780, 190, 400, 340, 'account', 'Log Archive account'] },
      nodes: {
        a1: [200, 250, 'cloudtrail', 'Account A'],
        a2: [200, 450, 'cloudtrail', 'Account B'],
        tr: [520, 350, 'cloudtrail', 'Organization trail', 'mọi account, mọi Region'],
        s3: [980, 350, 's3', 'Bucket log', 'Object Lock, KMS'],
      },
      steps: [
        { say: 'Thiết kế chuẩn: một account riêng chỉ để lưu log, gọi là Log Archive.', do: ['show org,arch,s3'] },
        { say: 'Organization trail tạo ở management account, tự áp cho mọi account. Account con nhìn thấy nhưng không sửa hay xoá được.', do: ['show a1,a2,tr', 'edge a1 tr', 'edge a2 tr', 'edge tr s3 c=ok', 'flow a1 tr', 'flow a2 tr @1.2', 'flow tr s3 @2.0'] },
        { say: 'Bucket log chỉ cho dịch vụ ghi, có versioning và Object Lock để không ai xoá được, mã hoá bằng KMS.', do: ['hl s3', 'note b 790 470 380 "Bucket policy chỉ cho <code>cloudtrail.amazonaws.com</code> + <code>aws:SourceOrgID</code>" c=ok'] },
        { say: 'Thêm SCP cấm các account con tắt CloudTrail, Config, GuardDuty.', do: ['tip "Log không thể bị xoá / tắt: <b>Log Archive account</b> + <b>Object Lock</b> + <b>SCP</b> cấm <code>StopLogging</code>, <code>DeleteTrail</code>."'] },
      ],
    },
    {
      title: 'Bật log theo mối đe doạ',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Mỗi loại tấn công cần một loại log khác nhau. Đề hay hỏi: cần bật log gì để phát hiện cái này.', do: [] },
        { say: 'Đánh cắp dữ liệu S3: CloudTrail data events cho GetObject, hoặc S3 server access logs.', do: ['li "Đánh cắp S3 → <b>CloudTrail S3 data events</b>, server access logs, GuardDuty S3" c=bad'] },
        { say: 'Rò dữ liệu qua DNS: Route 53 Resolver query logs.', do: ['li "Rò qua DNS, máy bị điều khiển → <b>Resolver query logs</b>, DNS Firewall" c=blue'] },
        { say: 'Quét cổng, kết nối lạ: VPC Flow Logs. Giữa các VPC và on-premises: Transit Gateway Flow Logs.', do: ['li "Quét cổng → <b>VPC Flow Logs</b> · giữa VPC → <b>TGW Flow Logs</b>" c=ok'] },
        { say: 'Tấn công web: WAF logs, ALB access logs. Database: Database Activity Streams.', do: ['li "Tấn công web → <b>WAF logs</b>, ALB logs · DB → <b>Database Activity Streams</b>"'] },
        { say: 'Thao tác quản trị trên máy: Session Manager session logs.', do: ['tip "Data events và Flow Logs rất nhiều → <b>advanced event selectors</b> chỉ ghi bucket / hàm quan trọng."'] },
      ],
    },
    {
      title: 'CloudTrail: các loại event',
      panel: [90, 150, 1100],
      steps: [
        { say: 'CloudTrail có bốn loại event.', do: [] },
        { say: 'Management events: tạo, sửa, xoá tài nguyên, đăng nhập console. Mặc định có trong Event history chín mươi ngày.', do: ['li "<b>Management</b>: tạo / sửa / xoá, đăng nhập. Mặc định, 90 ngày Event history" c=ok'] },
        { say: 'Data events: đọc ghi dữ liệu như S3 GetObject, Lambda Invoke. Tắt mặc định, phải bật, tính phí.', do: ['li "<b>Data events</b>: S3 object, Lambda invoke, DynamoDB item. <b>Phải bật</b>, tính phí" c=bad'] },
        { say: 'Network activity events: API đi qua VPC endpoint. Insights events: lượng API bất thường.', do: ['li "<b>Network activity</b>: qua VPC endpoint · <b>Insights</b>: API bất thường" c=blue'] },
        { say: 'Chứng minh log không bị sửa: bật log file integrity validation. CloudTrail tạo file digest ký số mỗi giờ.', do: ['tip "Chứng minh log không bị sửa / xoá → <b>log file integrity validation</b> (digest SHA-256 ký số, <code>validate-logs</code>). Log tới S3 trễ <b>5–15 phút</b>."'] },
      ],
    },
    {
      title: 'Phân tích log',
      nodes: {
        s3: [150, 330, 's3', 'Log trong S3'],
        ath: [500, 200, 'athena', 'Athena', 'SQL trên S3'],
        lake: [500, 460, 'cloudtrail', 'CloudTrail Lake', 'SQL, giữ tới 10 năm'],
        sl: [860, 200, 'securitylake', 'Security Lake', 'chuẩn OCSF'],
        os: [860, 460, 'opensearch', 'OpenSearch', 'tìm kiếm, dashboard'],
      },
      steps: [
        { say: 'Log trong S3 truy vấn bằng Athena, dùng SQL, trả tiền theo lượng dữ liệu quét. Chia partition theo ngày để rẻ hơn.', do: ['show s3,ath', 'edge s3 ath', 'flow s3 ath'] },
        { say: 'CloudTrail Lake lưu và truy vấn event bằng SQL ngay trong CloudTrail, không cần tự dựng.', do: ['show lake', 'edge s3 lake route=hvh'] },
        { say: 'Security Lake gom log bảo mật của nhiều nguồn, nhiều account về một kho chuẩn OCSF cho SIEM.', do: ['show sl', 'edge ath sl'] },
        { say: 'OpenSearch cho tìm kiếm toàn văn và dashboard gần thời gian thực.', do: ['show os', 'edge lake os', 'tip "Truy vấn CloudTrail không muốn tự dựng → <b>CloudTrail Lake</b>. Gom nhiều nguồn chuẩn hoá → <b>Security Lake (OCSF)</b>."'] },
      ],
    },
    {
      title: 'Log không về: kiểm tra gì',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Trail không ghi được vào bucket ở account khác. Kiểm tra theo thứ tự.', do: [] },
        { say: 'Một: bucket policy có cho cloudtrail.amazonaws.com ghi, đúng đường dẫn và đúng account không.', do: ['li "1. <b>Bucket policy</b> cho <code>cloudtrail.amazonaws.com</code>, đúng prefix / account"'] },
        { say: 'Hai: nếu bucket mã hoá KMS, key policy có cho CloudTrail dùng khoá không.', do: ['li "2. <b>KMS key policy</b> cho CloudTrail (encryption context của trail)" c=bad'] },
        { say: 'Ba: SCP có đang chặn không, và trail có đang bật logging không.', do: ['li "3. <b>SCP</b> chặn? Trail có <b>IsLogging</b>?" c=blue'] },
        { say: 'Với CloudWatch Logs, kiểm tra role mà CloudTrail dùng để ghi log.', do: ['li "4. Gửi CloudWatch Logs: <b>IAM role</b> của trail có <code>logs:PutLogEvents</code>" c=ok'] },
      ],
    },
  ],
};
