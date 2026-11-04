// Kịch bản video: Tuân thủ và triển khai nhất quán
export default {
  scenes: [
    {
      title: 'Kiểm tra IaC trước khi triển khai',
      nodes: {
        dev: [140, 330, 'git', 'Pull request', 'template'],
        lint: [420, 330, 'cfn', 'cfn-lint', 'cú pháp'],
        guard: [700, 330, 'cfn', 'CloudFormation Guard', 'policy-as-code'],
        ss: [1000, 330, 'stackset', 'StackSets', 'mọi account trong OU'],
      },
      steps: [
        { say: 'Mọi thay đổi hạ tầng đi qua pipeline, không sửa tay trên console.', do: ['show dev'] },
        { say: 'cfn-lint bắt lỗi cú pháp và giá trị sai.', do: ['show lint', 'edge dev lint', 'flow dev lint', 'ok lint @1.0'] },
        { say: 'CloudFormation Guard kiểm tra luật như mọi bucket phải bật mã hoá và chặn truy cập công khai. Vi phạm thì dừng pipeline.', do: ['show guard', 'edge lint guard', 'flow lint guard', 'badge guard "bucket chưa mã hoá?" c=bad @1.0'] },
        { say: 'Qua được mới triển khai bằng StackSets cho mọi account trong OU.', do: ['show ss', 'edge guard ss c=ok', 'flow guard ss c=ok', 'tip "Policy-as-code cho template → <b>CloudFormation Guard</b>. Kiểm tra lúc tạo tài nguyên → <b>CloudFormation Hooks</b> / proactive control."'] },
      ],
    },
    {
      title: 'Firewall Manager',
      groups: { org: [380, 150, 840, 420, 'ou', 'Organization · scope theo OU, tag'] },
      nodes: {
        fm: [170, 350, 'firewallmanager', 'Firewall Manager', 'delegated admin'],
        a1: [560, 250, 'alb', 'ALB account A', 'web ACL chung'],
        a2: [860, 250, 'cloudfront', 'CloudFront account B', 'web ACL chung'],
        a3: [560, 450, 'sg', 'Security group', 'audit rule quá rộng'],
        a4: [860, 450, 'nfw', 'Network Firewall', 'tự tạo trong VPC'],
        a5: [1110, 350, 'alb', 'ALB mới tạo', 'tự được áp'],
      },
      steps: [
        { say: 'Firewall Manager áp chính sách bảo mật mạng cho cả tổ chức từ một nơi.', do: ['show fm,org'] },
        { say: 'Gắn web ACL chung cho mọi ALB và CloudFront trong phạm vi.', do: ['show a1,a2', 'edge fm a1 route=hvh mid=420', 'edge a1 a2', 'flow fm a1', 'flow a1 a2 @1.2'] },
        { say: 'Kiểm tra security group có rule quá rộng, tự tạo Network Firewall trong VPC, gắn DNS Firewall.', do: ['show a3,a4', 'edge fm a3 route=hvh mid=420', 'edge a3 a4'] },
        { say: 'Tài nguyên mới tạo cũng tự được áp chính sách.', do: ['show a5', 'ok a5 @0.4'] },
        { say: 'Điều kiện: có Organizations, có delegated admin, và AWS Config bật ở các account trong phạm vi.', do: ['tip "Áp WAF / SG / Network Firewall cho mọi account, kể cả tài nguyên mới → <b>Firewall Manager</b>. Cần <b>Organizations + Config</b>."'] },
      ],
    },
    {
      title: 'Tag để kiểm soát',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Tag không chỉ để tính tiền.', do: [] },
        { say: 'Tag policy chuẩn hoá tên và giá trị. SCP bắt buộc có tag khi tạo tài nguyên.', do: ['li "<b>Tag policy</b> chuẩn hoá · SCP ép tag khi tạo (<code>aws:RequestTag</code>)" c=ok'] },
        { say: 'Tag dùng cho ABAC, cho backup plan, patch group, phạm vi Firewall Manager.', do: ['li "Tag cho <b>ABAC</b>, backup, patch group, Firewall Manager scope" c=blue'] },
        { say: 'Chặn người dùng tự đổi tag dùng cho phân quyền.', do: ['li "Deny <code>TagResource / UntagResource</code> với key nhạy cảm" c=bad'] },
      ],
    },
    {
      title: 'Đánh giá tuân thủ: dùng gì',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Bốn dịch vụ hay bị nhầm.', do: [] },
        { say: 'Kiểm toán viên cần báo cáo SOC 2 hay ISO của chính AWS: AWS Artifact.', do: ['li "Báo cáo tuân thủ <b>của AWS</b> (SOC, ISO, PCI AOC), ký BAA → <b>Artifact</b>" c=ok'] },
        { say: 'Thu thập bằng chứng hệ thống của công ty bạn theo PCI DSS hay HIPAA: Audit Manager.', do: ['li "Bằng chứng <b>hệ thống của bạn</b> theo framework → <b>Audit Manager</b>" c=blue'] },
        { say: 'Kiểm tra cấu hình liên tục và tự sửa: Config với conformance pack.', do: ['li "Cấu hình liên tục, tự sửa → <b>Config</b> + conformance pack"'] },
        { say: 'Điểm bảo mật tổng hợp theo chuẩn: Security Hub.', do: ['li "Điểm theo chuẩn CIS / FSBP → <b>Security Hub</b>" c=bad'] },
      ],
    },
  ],
};
