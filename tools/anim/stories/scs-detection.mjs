// Kịch bản video: Phát hiện mối đe doạ
export default {
  scenes: [
    {
      title: 'Bản đồ các dịch vụ phát hiện',
      nodes: {
        gd: [170, 190, 'guardduty', 'GuardDuty', 'đang bị tấn công?'],
        ins: [170, 330, 'inspector', 'Inspector', 'có lỗ hổng CVE?'],
        mac: [170, 470, 'macie', 'Macie', 'dữ liệu nhạy cảm ở đâu?'],
        sh: [600, 330, 'securityhub', 'Security Hub', 'gom + chấm điểm'],
        det: [1020, 190, 'detective', 'Detective', 'vì sao xảy ra?'],
        sl: [1020, 470, 'securitylake', 'Security Lake', 'kho log OCSF'],
      },
      steps: [
        { say: 'Mỗi dịch vụ phát hiện trả lời một câu hỏi khác nhau.', do: [] },
        { say: 'GuardDuty: có kẻ xấu hay hành vi bất thường đang diễn ra không. Inspector: phần mềm có lỗ hổng không. Macie: dữ liệu nhạy cảm nằm ở bucket S3 nào.', do: ['show gd', 'show ins @0.5', 'show mac @1.0'] },
        { say: 'Security Hub gom finding của tất cả, chấm điểm theo các chuẩn như CIS. Nó cần AWS Config.', do: ['show sh', 'edge gd sh route=hvh', 'edge ins sh', 'edge mac sh route=hvh', 'flow gd sh', 'flow ins sh @1.2', 'flow mac sh @1.4'] },
        { say: 'Detective trả lời vì sao finding xảy ra, liên quan tới ai. Security Lake gom log bảo mật thành kho dữ liệu chuẩn OCSF cho SIEM.', do: ['show det,sl', 'edge sh det route=hvh', 'edge sh sl route=hvh'] },
        { say: 'Học thuộc cặp câu hỏi và dịch vụ, vì đề thường mô tả nhu cầu chứ không nêu tên dịch vụ.', do: ['tip "Đang bị tấn công → <b>GuardDuty</b> · CVE → <b>Inspector</b> · PII trong S3 → <b>Macie</b> · gom + chuẩn → <b>Security Hub</b> · điều tra → <b>Detective</b>"'] },
      ],
    },
    {
      title: 'GuardDuty: bật đúng cách',
      groups: { org: [80, 150, 1120, 420, 'ou', 'Organization'] },
      nodes: {
        mg: [220, 280, 'organizations', 'Management account'],
        sec: [580, 280, 'guardduty', 'Security Tooling', 'delegated admin'],
        a1: [960, 220, 'guardduty', 'Account A', 'mọi Region'],
        a2: [960, 420, 'guardduty', 'Account mới', 'auto-enable'],
      },
      steps: [
        { say: 'GuardDuty tự đọc CloudTrail, VPC Flow Logs và DNS log qua luồng nội bộ. Bạn không cần bật trail hay flow log cho nó.', do: ['show org,mg'] },
        { say: 'Management account chỉ định một account bảo mật làm delegated administrator.', do: ['show sec', 'edge mg sec "delegate" c=go', 'flow mg sec'] },
        { say: 'Bật auto-enable để mọi account mới tự có GuardDuty.', do: ['show a1,a2', 'edge sec a1', 'edge sec a2', 'flow sec a2', 'ok a2 @1.4'] },
        { say: 'Bật ở mọi Region, kể cả Region không dùng. Kẻ tấn công rất hay chạy máy đào coin ở Region ít ai để ý.', do: ['tip "GuardDuty là <b>Regional</b>: bật <b>mọi Region</b> (hoặc chặn Region bằng SCP). Chặn tắt GuardDuty bằng <b>SCP</b>."'] },
      ],
    },
    {
      title: 'Đọc tên finding của GuardDuty',
      steps: [
        { say: 'Tên finding có cấu trúc cố định: mục đích, loại tài nguyên, họ mối đe doạ.', do: ['big "ThreatPurpose : ResourceType / ThreatFamily"'] },
        { say: 'Finding quan trọng nhất: credential tạm thời của role trên EC2 bị dùng từ ngoài AWS. Nghĩa là credential đã bị đánh cắp, thường qua lỗ hổng SSRF.', do: ['note a 90 160 1100 "<code>UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration.OutsideAWS</code> → credential role của EC2 bị <b>đánh cắp</b> (SSRF)" c=bad'] },
        { say: 'Máy EC2 phân giải tên miền đào tiền ảo. Cổng mở đang bị dò quét. Bị dò mật khẩu SSH.', do: ['note b 90 280 1100 "<code>CryptoCurrency:EC2/BitcoinTool</code> · <code>Recon:EC2/PortProbeUnprotectedPort</code> · <code>SSHBruteForce</code>" c=go'] },
        { say: 'Có người dùng tài khoản root. Có người tắt CloudTrail.', do: ['note c 90 400 1100 "<code>Policy:IAMUser/RootCredentialUsage</code> · <code>Stealth:IAMUser/CloudTrailLoggingDisabled</code>" c=bad'] },
        { say: 'Giảm nhiễu bằng suppression rule. Đưa IP tin cậy vào trusted IP list, IP độc hại vào threat list.', do: ['tip "Giảm nhiễu → <b>suppression rule</b> (vẫn ghi, không báo). IP nội bộ tin cậy → <b>trusted IP list</b>. IP xấu riêng → <b>threat list</b>."'] },
      ],
    },
    {
      title: 'Protection plans',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Ngoài phần nền tảng, GuardDuty có các protection plan bật thêm.', do: [] },
        { say: 'S3 Protection theo dõi truy cập bucket bất thường. Malware Protection for S3 quét file mới tải lên.', do: ['li "<b>S3 Protection</b>: truy cập bucket bất thường · <b>Malware for S3</b>: quét object mới, gắn tag" c=ok'] },
        { say: 'Runtime Monitoring cài agent trên EC2, ECS, EKS để phát hiện tiến trình độc hại, reverse shell.', do: ['li "<b>Runtime Monitoring</b>: agent eBPF, reverse shell, leo thang đặc quyền" c=bad'] },
        { say: 'Malware Protection for EC2 quét snapshot ổ đĩa khi có finding nghi ngờ, không cần agent.', do: ['li "<b>Malware for EC2</b>: quét snapshot EBS, agentless" c=blue'] },
        { say: 'RDS Protection phát hiện đăng nhập database bất thường. EKS Protection đọc audit log của Kubernetes.', do: ['li "<b>RDS Protection</b>: đăng nhập bất thường · <b>EKS Protection</b>: audit log"'] },
      ],
    },
    {
      title: 'Từ finding tới hành động',
      nodes: {
        gd: [150, 330, 'guardduty', 'GuardDuty finding', 'severity ≥ 7'],
        evb: [470, 330, 'eventbridge', 'EventBridge'],
        fn: [820, 200, 'lambda', 'Lambda', 'cô lập EC2'],
        sns: [820, 460, 'sns', 'SNS', 'báo đội bảo mật'],
        sh: [1100, 330, 'securityhub', 'Security Hub', 'automation rule'],
      },
      steps: [
        { say: 'Mọi finding đi qua EventBridge. Rule lọc theo mức độ nghiêm trọng, ví dụ từ bảy trở lên.', do: ['show gd,evb', 'edge gd evb', 'flow gd evb'] },
        { say: 'Rule gọi Lambda để tự động cô lập máy, và báo đội bảo mật qua SNS.', do: ['show fn,sns', 'edge evb fn c=bad', 'edge evb sns', 'flow evb fn', 'flow evb sns @1.3'] },
        { say: 'Security Hub có automation rule để tự đổi mức độ, gắn ghi chú, hoặc chặn finding theo điều kiện.', do: ['show sh', 'edge fn sh route=hvh', 'tip "Phản ứng tự động: finding → <b>EventBridge</b> (lọc severity) → <b>Lambda / SSM Automation</b>. Security Hub cần <b>Config</b> bật."'] },
      ],
    },
    {
      title: 'Inspector, Macie, Detective',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Ba dịch vụ hay bị nhầm.', do: [] },
        { say: 'Inspector quét lỗ hổng phần mềm của EC2, image ECR, hàm Lambda. Với EC2, dùng SSM agent hoặc quét không agent qua snapshot.', do: ['li "<b>Inspector</b>: CVE trên EC2 (SSM / agentless), ECR, Lambda · có <b>network reachability</b>" c=bad'] },
        { say: 'Macie dùng máy học tìm dữ liệu nhạy cảm như số thẻ, số căn cước trong S3. Có automated discovery cho cả tổ chức.', do: ['li "<b>Macie</b>: PII trong S3, automated discovery, custom data identifier" c=ok'] },
        { say: 'Detective tự thu thập dữ liệu và giữ một năm, vẽ đồ thị quan hệ để điều tra nguyên nhân của finding.', do: ['li "<b>Detective</b>: đồ thị quan hệ, giữ 1 năm, điều tra nguyên nhân" c=blue'] },
      ],
    },
  ],
};
