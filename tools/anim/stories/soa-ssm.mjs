// Kịch bản video: Systems Manager
export default {
  scenes: [
    {
      title: 'Ba điều kiện để máy được SSM quản lý',
      groups: { vpc: [380, 150, 420, 400, 'private', 'Private subnet'] },
      nodes: {
        ec2: [590, 330, 'ec2', 'EC2', 'managed node'],
        ssm: [1060, 330, 'ssm', 'Systems Manager'],
        ep: [590, 490, 'endpoint', 'VPC endpoints', 'ssm, ssmmessages, ec2messages'],
        iam: [170, 330, 'iam', 'Instance profile', 'AmazonSSMManagedInstanceCore'],
      },
      steps: [
        { say: 'Systems Manager quản lý hàng nghìn máy chủ: chạy lệnh, vá lỗi, vào shell, tự động hoá. Nhưng máy phải đủ ba điều kiện.', do: ['show vpc,ec2,ssm'] },
        { say: 'Một: có SSM Agent. AMI Amazon Linux, Ubuntu, Windows của AWS có sẵn.', do: ['badge ec2 "1. SSM Agent" c=ok'] },
        { say: 'Hai: có quyền. Gắn instance profile có policy AmazonSSMManagedInstanceCore.', do: ['show iam', 'edge iam ec2 "2. quyền" c=ok', 'flow iam ec2'] },
        { say: 'Ba: có đường mạng ra cổng 443 tới ba endpoint ssm, ssmmessages, ec2messages. Qua NAT, hoặc qua VPC interface endpoint.', do: ['show ep', 'edge ec2 ssm "3. HTTPS 443 ra ngoài" c=ok', 'flow ec2 ssm', 'hl ep @1.0'] },
        { say: 'Máy không hiện trong Fleet Manager, kiểm tra đúng thứ tự: agent, quyền, mạng. Đáp án mở cổng 22 hay gắn Elastic IP luôn sai, vì SSM không cần cổng vào nào.', do: ['tip "Máy không hiện: <b>agent → IAM role → mạng 443 ra</b>. Mở cổng 22 / gắn EIP = <b>sai</b>."'] },
        { say: 'Máy on-premises đăng ký bằng hybrid activation, có mã bắt đầu bằng mi.', do: ['note h 80 470 280 "On-prem: <b>hybrid activation</b> → ID <code>mi-xxxx</code>" c=go'] },
      ],
    },
    {
      title: 'Run Command: một lệnh, năm trăm máy',
      nodes: {
        op: [150, 330, 'admin', 'Quản trị viên'],
        ssm: [460, 330, 'ssm', 'Run Command', 'AWS-RunShellScript'],
        m1: [800, 180, 'ec2', 'Env=Prod'],
        m2: [800, 330, 'ec2', 'Env=Prod'],
        m3: [800, 480, 'ec2', 'Env=Prod'],
        s3: [1100, 330, 's3', 'S3 / Logs', 'output đầy đủ'],
      },
      steps: [
        { say: 'Run Command chạy một document trên nhiều máy ngay bây giờ, không cần SSH.', do: ['show op,ssm', 'edge op ssm', 'flow op ssm'] },
        { say: 'Chọn máy theo tag, ví dụ mọi máy có Env bằng Prod.', do: ['show m1,m2,m3', 'edge ssm m1', 'edge ssm m2', 'edge ssm m3', 'flow ssm m1', 'flow ssm m2 @1.3', 'flow ssm m3 @1.6'] },
        { say: 'Rate control: chạy bao nhiêu máy cùng lúc, và dừng khi số máy lỗi vượt ngưỡng.', do: ['note r 80 470 340 "<b>Concurrency</b>: 10% máy mỗi lần<br><b>Error threshold</b>: dừng khi 5 máy lỗi" c=go', 'bad m3 @1.0'] },
        { say: 'Console chỉ hiện 2.500 ký tự output. Muốn đầy đủ, ghi ra S3 hoặc CloudWatch Logs. Mọi lần chạy đều được CloudTrail ghi lại.', do: ['show s3', 'edge m2 s3 "output"', 'flow m2 s3'] },
      ],
    },
    {
      title: 'Automation: runbook nhiều bước',
      nodes: {
        trg: [140, 330, 'alarm', 'Alarm / EventBridge', 'Config remediation'],
        rb: [440, 330, 'ssm', 'Runbook', 'AutomationAssumeRole'],
        s1: [760, 180, 'snapshot', '1. Snapshot EBS'],
        s2: [760, 330, 'ec2', '2. Đợi hoàn tất'],
        s3: [760, 480, 'ebs', '3. Mở rộng volume'],
      },
      steps: [
        { say: 'Automation là quy trình nhiều bước, chạy phía AWS, mỗi bước gọi một API hoặc chạy một script.', do: ['show rb'] },
        { say: 'Ví dụ: ổ đĩa sắp đầy. Bước một chụp snapshot, bước hai đợi xong, bước ba mở rộng volume.', do: ['show s1,s2,s3', 'edge rb s1', 'edge rb s2', 'edge rb s3', 'flow rb s1', 'flow rb s2 @1.4', 'flow rb s3 @2.0', 'ok s1 @1.2', 'ok s2 @2.4', 'ok s3 @3.0'] },
        { say: 'Runbook có thể được gọi tay, theo lịch, bởi alarm, bởi EventBridge, hoặc bởi Config remediation.', do: ['show trg', 'edge trg rb', 'flow trg rb'] },
        { say: 'Điểm hay thi: runbook chạy bằng AutomationAssumeRole, không dùng quyền của người bấm. Người vận hành chỉ cần quyền chạy runbook.', do: ['tip "Runbook chạy bằng <b>AutomationAssumeRole</b>. Người dùng chỉ cần quyền <code>ssm:StartAutomationExecution</code>, không cần quyền trực tiếp lên tài nguyên."'] },
      ],
    },
    {
      title: 'Patch Manager',
      nodes: {
        mw: [150, 450, 'scheduler', 'Maintenance Window', 'CN 2:00, 3 giờ'],
        pb: [470, 190, 'ssm', 'Patch baseline', 'Security, Critical, sau 7 ngày'],
        run: [470, 450, 'ssm', 'AWS-RunPatchBaseline', 'Install'],
        g1: [820, 320, 'ec2', 'Patch Group = prod', '20% mỗi lần'],
        rep: [1110, 320, 'securityhub', 'Compliance', 'thiếu bản vá gì'],
      },
      steps: [
        { say: 'Patch baseline là luật vá: hệ điều hành nào, loại bản vá nào, tự duyệt sau bao nhiêu ngày.', do: ['show pb'] },
        { say: 'Máy gắn với baseline bằng tag Patch Group. Một máy chỉ thuộc một patch group.', do: ['show g1', 'edge pb g1 "tag Patch Group" route=hvh'] },
        { say: 'Quy trình chuẩn: Maintenance Window định khung giờ, ví dụ Chủ nhật hai giờ sáng.', do: ['show mw'] },
        { say: 'Trong khung giờ đó, chạy document AWS-RunPatchBaseline với Install, vá hai mươi phần trăm máy mỗi lần.', do: ['show run', 'edge mw run', 'edge run g1 route=hvh', 'flow mw run', 'flow run g1 @1.3'] },
        { say: 'Scan chỉ kiểm tra và báo cáo. Install mới cài và có thể khởi động lại máy. Kết quả hiện trong báo cáo compliance.', do: ['show rep', 'edge g1 rep', 'flow g1 rep c=ok', 'tip 830 440 400 "<b>Scan</b> = chỉ báo cáo. <b>Install</b> = cài + có thể reboot."'] },
      ],
    },
    {
      title: 'Run Command, State Manager hay Maintenance Window',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Ba tính năng hay bị nhầm.', do: [] },
        { say: 'Run Command: chạy một lần, ngay bây giờ.', do: ['li "<b>Run Command</b>: chạy MỘT lần, ngay bây giờ"'] },
        { say: 'State Manager: giữ trạng thái liên tục. Máy nào khớp tag phải luôn có cấu hình đó, máy mới cũng tự được áp. Đây là cách chống lệch cấu hình.', do: ['li "<b>State Manager</b>: LUÔN giữ cấu hình (association), máy mới tự áp, chống drift" c=ok'] },
        { say: 'Maintenance Window: khung giờ được phép làm việc gây gián đoạn, như vá lỗi và khởi động lại.', do: ['li "<b>Maintenance Window</b>: KHUNG GIỜ cho việc gián đoạn (vá, reboot, chụp AMI)" c=blue'] },
        { say: 'Ví dụ: luôn cài CloudWatch agent trên mọi máy Prod, kể cả máy mới tạo, là State Manager.', do: ['tip "“Mọi máy, kể cả máy mới, luôn phải có X” → <b>State Manager association</b>."'] },
      ],
    },
    {
      title: 'Session Manager: thay bastion host',
      groups: { vpc: [430, 150, 380, 380, 'private', 'Private subnet · không mở cổng vào'] },
      nodes: {
        u: [150, 330, 'laptop', 'Kỹ sư', 'IAM + MFA'],
        ssm: [620, 230, 'ssm', 'Session Manager'],
        ec2: [620, 430, 'ec2', 'EC2'],
        rds: [1060, 430, 'rds', 'RDS', 'port forwarding'],
        log: [1060, 230, 'logs', 'S3 / CloudWatch Logs', 'ghi toàn bộ phiên'],
        bas: [150, 500, 'server', 'Bastion + SSH key'],
      },
      steps: [
        { say: 'Cách cũ: bastion host mở cổng 22, phát SSH key cho từng người. Khó quản lý và có rủi ro.', do: ['show bas', 'bad bas @0.8'] },
        { say: 'Session Manager mở shell tới máy trong private subnet mà không mở cổng vào nào, không cần key SSH.', do: ['show vpc,u,ssm,ec2', 'edge u ssm "HTTPS"', 'edge ssm ec2 "phiên shell" both', 'flow u ssm', 'flow ssm ec2 @1.4'] },
        { say: 'Ai được vào máy nào kiểm soát bằng IAM. Toàn bộ phiên được ghi về S3 hoặc CloudWatch Logs.', do: ['show log', 'edge ssm log c=go', 'flow ssm log'] },
        { say: 'Port forwarding cho phép từ laptop vào thẳng database RDS trong private subnet, đi qua máy EC2.', do: ['show rds', 'edge ec2 rds "chuyển tiếp cổng" c=ok', 'flow ec2 rds'] },
        { say: 'Đề hỏi truy cập máy an toàn, có ghi log, ít vận hành nhất: đáp án là Session Manager.', do: ['tip "Truy cập shell an toàn, có audit, không bastion, không cổng 22 → <b>Session Manager</b>."'] },
      ],
    },
    {
      title: 'Parameter Store',
      nodes: {
        app: [170, 330, 'lambda', 'Ứng dụng'],
        ps: [540, 330, 'ssm', 'Parameter Store', '/myapp/prod/db/url'],
        kms: [540, 500, 'kms', 'KMS', 'SecureString'],
        sm: [920, 200, 'secrets', 'Secrets Manager', 'xoay vòng tự động'],
        ami: [920, 460, 'ami', 'Public parameter', 'AMI mới nhất'],
      },
      steps: [
        { say: 'Parameter Store lưu cấu hình theo đường dẫn phân cấp, như myapp, prod, db, url. Phân quyền IAM theo đường dẫn.', do: ['show app,ps', 'edge app ps "GetParametersByPath"', 'flow ps app'] },
        { say: 'Giá trị bí mật dùng kiểu SecureString, mã hoá bằng KMS.', do: ['show kms', 'edge ps kms route=v'] },
        { say: 'Bản Standard miễn phí, tối đa 4 KB. Bản Advanced tới 8 KB, có chính sách hết hạn và chia sẻ cross-account.', do: ['note t 90 160 360 "<b>Standard</b>: 10.000 tham số, 4 KB, miễn phí<br><b>Advanced</b>: 8 KB, có expiration policy, tính phí"'] },
        { say: 'Cần xoay vòng mật khẩu tự động thì dùng Secrets Manager, không phải Parameter Store.', do: ['show sm', 'edge ps sm "tham chiếu" dash'] },
        { say: 'Public parameter của AWS cho biết ID của AMI mới nhất. CloudFormation dùng nó để luôn lấy AMI mới.', do: ['show ami', 'edge ps ami route=hvh', 'tip 80 470 400 "Xoay vòng mật khẩu tự động → <b>Secrets Manager</b>. AMI mới nhất → public parameter <code>/aws/service/ami-...</code>"'] },
      ],
    },
    {
      title: 'Nhớ gì khi đi thi',
      panel: [90, 140, 1100],
      steps: [
        { say: 'Tóm tắt Systems Manager.', do: [] },
        { say: 'Máy được quản lý cần agent, IAM role, và đường mạng 443 ra ngoài.', do: ['li "Managed node: <b>agent + AmazonSSMManagedInstanceCore + 443 ra</b> (NAT hoặc 3 endpoint)"'] },
        { say: 'Chạy một lần là Run Command. Giữ liên tục là State Manager. Khung giờ là Maintenance Window.', do: ['li "Một lần → <b>Run Command</b>. Luôn luôn → <b>State Manager</b>. Khung giờ → <b>Maintenance Window</b>" c=ok'] },
        { say: 'Tự khắc phục nhiều bước dùng Automation, chạy bằng AutomationAssumeRole.', do: ['li "Tự khắc phục nhiều bước → <b>Automation runbook</b> (AutomationAssumeRole)" c=blue'] },
        { say: 'Vá lỗi: baseline, patch group, AWS-RunPatchBaseline.', do: ['li "Vá lỗi → <b>Patch baseline + Patch Group + AWS-RunPatchBaseline</b>"'] },
        { say: 'Vào máy an toàn không cần bastion: Session Manager.', do: ['li "Vào máy không bastion, có log → <b>Session Manager</b>" c=bad'] },
      ],
    },
  ],
};
