// Kịch bản video: IAM, Organizations, KMS ở góc vận hành
export default {
  scenes: [
    {
      title: 'IAM quyết định Allow hay Deny thế nào',
      nodes: {
        req: [130, 330, 'user', 'Request', 's3:GetObject'],
        d: [400, 330, 'iam', 'Có Deny tường minh?'],
        scp: [640, 330, 'organizations', 'SCP cho phép?'],
        allow: [880, 330, 'iam', 'Có Allow?', 'identity / resource'],
        ok: [1130, 210, 'iam', 'ALLOW'],
        no: [1130, 470, 'iam', 'DENY'],
      },
      steps: [
        { say: 'Mỗi request đi qua một chuỗi kiểm tra. Đầu tiên: có Deny tường minh ở bất kỳ policy nào không? Có thì từ chối ngay.', do: ['show req,d', 'edge req d', 'flow req d'] },
        { say: 'Tiếp theo: SCP của Organization có cho phép không? Không thì từ chối.', do: ['show scp', 'edge d scp "không"', 'flow d scp'] },
        { say: 'Rồi phải có một Allow, từ identity policy hoặc resource policy, và permission boundary cũng phải cho phép.', do: ['show allow', 'edge scp allow "có"', 'flow scp allow'] },
        { say: 'Không có Allow nào thì mặc định là Deny.', do: ['show ok,no', 'edge allow ok "có" c=ok', 'edge allow no "không" c=bad', 'flow allow ok c=ok'] },
        { say: 'Nhớ: Deny tường minh luôn thắng. SCP không cấp quyền, chỉ giới hạn quyền tối đa.', do: ['tip "<b>Explicit Deny</b> luôn thắng → SCP / boundary <b>chỉ giới hạn</b>, không cấp quyền → cần <b>Allow</b> → không có thì Deny ngầm định."'] },
      ],
    },
    {
      title: 'Bẫy AccessDenied: aws:SourceIp và VPC endpoint',
      groups: { vpc: [80, 160, 520, 360, 'vpc', 'VPC'] },
      nodes: {
        ec2: [220, 340, 'ec2', 'EC2', 'IP private 10.0.1.5'],
        ep: [470, 340, 'endpoint', 'Gateway endpoint'],
        s3: [900, 340, 's3', 'S3', 'policy: aws:SourceIp = IP công ty'],
      },
      steps: [
        { say: 'Bucket policy chỉ cho phép IP công khai của công ty.', do: ['show s3', 'badge s3 "aws:SourceIp"'] },
        { say: 'Máy EC2 trong VPC gọi S3 qua gateway endpoint. Request mang IP private, không khớp IP công khai.', do: ['show vpc,ec2,ep', 'edge ec2 ep', 'edge ep s3', 'flow ec2 ep', 'flow ep s3 @1.2 c=bad', 'badge s3 "AccessDenied" c=bad @2.0'] },
        { say: 'Sửa bằng điều kiện aws:SourceVpce hoặc aws:SourceVpc, không dùng SourceIp cho lưu lượng đi qua endpoint.', do: ['tip "Qua VPC endpoint → dùng <b>aws:SourceVpce</b> / <b>aws:SourceVpc</b>, không dùng <b>aws:SourceIp</b>."'] },
        { say: 'Gỡ lỗi AccessDenied: đọc thông báo lỗi, nó thường nói loại policy nào chặn. Thử bằng IAM Policy Simulator.', do: ['note s 650 470 560 "Thông báo lỗi chỉ ra policy chặn · <b>Policy Simulator</b> · tra <b>CloudTrail</b> errorCode" c=go'] },
      ],
    },
    {
      title: 'Dọn quyền và kiểm toán',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Các công cụ giữ IAM sạch sẽ.', do: [] },
        { say: 'IAM Access Analyzer: tìm tài nguyên đang được chia sẻ ra ngoài, tìm quyền và role không dùng, và sinh policy từ hoạt động thật trong CloudTrail.', do: ['li "<b>Access Analyzer</b>: chia sẻ ra ngoài · quyền không dùng · sinh policy từ CloudTrail" c=ok'] },
        { say: 'Credential report liệt kê mọi user, mật khẩu, access key, lần dùng cuối. Last accessed information cho biết dịch vụ nào chưa từng được dùng.', do: ['li "<b>Credential report</b> · <b>last accessed</b> để thu hẹp quyền" c=blue'] },
        { say: 'Xoay vòng access key: tạo key thứ hai, cập nhật ứng dụng, vô hiệu hoá key cũ, kiểm tra không lỗi, rồi mới xoá.', do: ['li "Xoay key: tạo key 2 → cập nhật app → <b>deactivate</b> key cũ → kiểm tra → xoá"'] },
        { say: 'Tài khoản root: bật MFA, không tạo access key, chỉ dùng cho việc bắt buộc root.', do: ['li "<b>Root</b>: MFA, không access key, chỉ việc bắt buộc root" c=bad'] },
      ],
    },
    {
      title: 'SCP trong Organization',
      groups: { org: [80, 150, 1120, 420, 'ou', 'Organization'] },
      nodes: {
        mg: [230, 340, 'organizations', 'Management account', 'SCP không áp dụng'],
        ou: [600, 230, 'organizations', 'OU Production', 'SCP: chặn Region lạ'],
        a1: [940, 230, 'cfn', 'Account A'],
        a2: [940, 440, 'cfn', 'Account B'],
      },
      steps: [
        { say: 'SCP gắn vào OU hoặc account, giới hạn quyền tối đa của mọi người trong đó, kể cả root của account con.', do: ['show org,mg,ou,a1,a2', 'edge mg ou', 'edge ou a1', 'edge ou a2 route=hvh', 'flow ou a1', 'flow ou a2 @1.2'] },
        { say: 'Mẫu hay gặp: chặn Region không dùng bằng aws:RequestedRegion, cấm tắt CloudTrail, Config, GuardDuty, cấm rời Organization.', do: ['note s 420 420 400 "<code>aws:RequestedRegion</code> · cấm <code>StopLogging</code> · cấm <code>LeaveOrganization</code>" c=go'] },
        { say: 'Bẫy: SCP không áp cho management account, và không áp cho service-linked role.', do: ['badge mg "không bị SCP" c=bad', 'hl mg'] },
        { say: 'SCP ở OU cha và OU con đều phải cho phép thì hành động mới được làm.', do: ['tip "SCP <b>không cấp quyền</b>, không áp cho <b>management account</b>. Cha và con <b>đều phải</b> cho phép."'] },
      ],
    },
    {
      title: 'KMS: vì sao không giải mã được',
      nodes: {
        app: [150, 330, 'lambda', 'Ứng dụng'],
        key: [560, 330, 'kms', 'KMS key', 'Regional'],
        pol: [960, 190, 'iam', 'Key policy', 'phải cho phép'],
        del: [960, 470, 'kms', 'Pending deletion', 'chờ 7–30 ngày'],
      },
      steps: [
        { say: 'Ứng dụng gọi KMS để giải mã và nhận lỗi. Có bốn nguyên nhân hay gặp.', do: ['show app,key', 'edge app key "Decrypt"', 'flow app key', 'badge key "AccessDenied" c=bad @1.2'] },
        { say: 'Một: key policy hoặc grant không cho principal đó. Với KMS, key policy là bắt buộc, IAM policy thôi là chưa đủ nếu key policy không cho phép tài khoản dùng IAM.', do: ['show pol', 'edge key pol c=bad'] },
        { say: 'Hai: key đang bị vô hiệu hoá, hoặc đang chờ xoá. Trong thời gian chờ bảy tới ba mươi ngày có thể huỷ lịch xoá.', do: ['show del', 'edge key del c=bad', 'badge del "CancelKeyDeletion" c=ok @0.8'] },
        { say: 'Ba: sai Region, vì key thuộc một Region, trừ multi-Region key. Bốn: vượt hạn mức request, lỗi ThrottlingException.', do: ['tip "Giải mã lỗi: <b>key policy</b> · key <b>disabled / pending deletion</b> · sai <b>Region</b> · <b>ThrottlingException</b> → S3 Bucket Key, data key caching."'] },
      ],
    },
    {
      title: 'Chứng chỉ và bí mật',
      nodes: {
        acm: [200, 250, 'acm', 'ACM', 'chứng chỉ public miễn phí'],
        alb: [560, 250, 'alb', 'ALB / CloudFront'],
        dns: [200, 450, 'route53', 'CNAME xác thực', 'DNS validation'],
        sm: [900, 250, 'secrets', 'Secrets Manager', 'tự xoay vòng'],
        rds: [900, 450, 'rds', 'RDS'],
      },
      steps: [
        { say: 'ACM cấp chứng chỉ TLS public miễn phí cho load balancer, CloudFront, API Gateway.', do: ['show acm,alb', 'edge acm alb', 'flow acm alb'] },
        { say: 'Chọn DNS validation thì ACM tự gia hạn, miễn là bản ghi CNAME xác thực vẫn còn. Email validation phải bấm duyệt tay.', do: ['show dns', 'edge dns acm "tự gia hạn" c=ok route=v'] },
        { say: 'Chứng chỉ tự nhập vào ACM không tự gia hạn. ACM gửi sự kiện cảnh báo trước khi hết hạn.', do: ['note c 380 470 380 "Cert <b>imported</b>: không tự gia hạn, theo dõi <code>DaysToExpiry</code>" c=bad'] },
        { say: 'Secrets Manager lưu và tự xoay vòng mật khẩu database. Parameter Store SecureString rẻ hơn nhưng không tự xoay vòng.', do: ['show sm,rds', 'edge sm rds "rotate" c=go', 'flow sm rds', 'tip 640 520 560 "Tự xoay vòng mật khẩu → <b>Secrets Manager</b>. Chỉ lưu, rẻ → <b>Parameter Store</b>."'] },
      ],
    },
  ],
};
