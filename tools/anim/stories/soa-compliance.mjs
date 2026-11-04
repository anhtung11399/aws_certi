// Kịch bản video: AWS Config và tuân thủ
export default {
  scenes: [
    {
      title: 'AWS Config: phát hiện và tự sửa',
      nodes: {
        sg: [140, 330, 'sg', 'Security group', 'mở 22 ra 0.0.0.0/0'],
        rec: [420, 330, 'config', 'Recorder', 'configuration item'],
        rule: [700, 330, 'config', 'Rule', 'restricted-ssh'],
        rem: [980, 210, 'ssm', 'Remediation', 'SSM Automation'],
        sns: [980, 460, 'sns', 'Thông báo'],
      },
      steps: [
        { say: 'Ai đó mở cổng 22 ra toàn Internet. Config recorder ghi lại cấu hình mới của security group.', do: ['show sg,rec', 'edge sg rec "thay đổi"', 'flow sg rec'] },
        { say: 'Rule restricted-ssh đánh giá và kết luận NON_COMPLIANT.', do: ['show rule', 'edge rec rule', 'flow rec rule', 'badge rule "NON_COMPLIANT" c=bad @1.0'] },
        { say: 'Gắn remediation là một SSM Automation document. Config tự gỡ quy tắc mở cổng 22.', do: ['show rem', 'edge rule rem c=go', 'flow rule rem', 'edge rem sg "đóng cổng 22" c=ok pts=[[980,172],[980,135],[140,135],[140,290]]', 'flow rem sg c=ok @1.0', 'ok sg @2.2'] },
        { say: 'Song song, sự kiện thay đổi trạng thái compliance đi qua EventBridge để gửi thông báo.', do: ['show sns', 'edge rule sns c=bad', 'flow rule sns'] },
        { say: 'Config là công cụ phát hiện, tức là sau khi đã xảy ra. Muốn chặn từ trước thì dùng SCP, IAM, hoặc CloudFormation Hooks.', do: ['tip "Config = <b>detective</b> (sau khi xảy ra). Chặn trước = <b>preventive</b>: SCP, IAM, CloudFormation Hooks."'] },
      ],
    },
    {
      title: 'CloudTrail hay Config',
      nodes: {
        q1: [200, 210, 'cloudtrail', 'CloudTrail', 'AI đã đổi?'],
        q2: [640, 210, 'config', 'Config timeline', 'TRƯỚC ĐÂY cấu hình ra sao?'],
        q3: [1080, 210, 'ssm', 'Config rule + remediation', 'TỰ ĐỘNG phát hiện và sửa'],
      },
      steps: [
        { say: 'Ba câu hỏi hay bị đánh tráo trong đề.', do: [] },
        { say: 'Ai đã đổi security group: CloudTrail.', do: ['show q1', 'hl q1'] },
        { say: 'Security group này trước đây cấu hình thế nào: Config, xem configuration timeline.', do: ['show q2', 'hl q2'] },
        { say: 'Tự động phát hiện và sửa security group mở cổng 22: Config rule kèm remediation.', do: ['show q3', 'hl q3'] },
        { say: 'Configuration timeline còn liên kết sang sự kiện CloudTrail gây ra thay đổi, nên hai dịch vụ thường đi cùng nhau.', do: ['note n 160 420 960 "Ai → <b>CloudTrail</b> · Trước / sau → <b>Config</b> · Tự sửa → <b>Config rule + SSM Automation</b>" c=go'] },
      ],
    },
    {
      title: 'Config cho nhiều account',
      groups: { org: [80, 150, 1120, 420, 'ou', 'Organization'] },
      nodes: {
        a1: [230, 260, 'config', 'Account A', 'mọi Region'],
        a2: [230, 460, 'config', 'Account B', 'mọi Region'],
        agg: [640, 360, 'config', 'Aggregator', 'account bảo mật'],
        cp: [1030, 260, 'config', 'Conformance pack', 'CIS, PCI DSS'],
        q: [1030, 460, 'athena', 'Advanced query', 'SQL trên cấu hình'],
      },
      steps: [
        { say: 'Config phải bật ở từng Region của từng account.', do: ['show org,a1,a2'] },
        { say: 'Aggregator gom dữ liệu Config của mọi account và Region về một account, để xem tuân thủ tổng hợp.', do: ['show agg', 'edge a1 agg', 'edge a2 agg', 'flow a1 agg', 'flow a2 agg @1.2'] },
        { say: 'Advanced query cho phép hỏi bằng SQL, ví dụ liệt kê mọi ổ EBS chưa mã hoá trên toàn tổ chức.', do: ['show q', 'edge agg q route=hvh'] },
        { say: 'Conformance pack là bộ rule kèm remediation đóng gói sẵn theo chuẩn như CIS, PCI DSS, triển khai cho cả Organization.', do: ['show cp', 'edge cp agg route=hvh dash', 'tip "Bộ rule theo chuẩn cho cả Organization → <b>conformance pack</b>. Xem tổng hợp → <b>aggregator</b>. Giảm chi phí → ghi <b>daily</b> thay vì continuous."'] },
      ],
    },
    {
      title: 'Các dịch vụ bảo mật dưới góc vận hành',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Đề SOA hỏi dịch vụ bảo mật ở góc vận hành: bật thế nào, nối với tự động hoá ra sao.', do: [] },
        { say: 'GuardDuty phát hiện mối đe doạ từ CloudTrail, VPC Flow Logs, DNS log. Bật mọi Region, finding đi qua EventBridge để tự xử lý.', do: ['li "<b>GuardDuty</b>: mối đe doạ, bật mọi Region, finding → EventBridge" c=bad'] },
        { say: 'Inspector quét lỗ hổng của EC2, image ECR, Lambda. EC2 cần SSM agent hoặc dùng chế độ không agent.', do: ['li "<b>Inspector</b>: lỗ hổng EC2 (SSM agent / agentless), ECR, Lambda" c=blue'] },
        { say: 'Security Hub gom finding và kiểm tra theo chuẩn. Nó cần Config được bật.', do: ['li "<b>Security Hub</b>: gom finding + chuẩn CIS, FSBP. <b>Cần Config</b>" c=ok'] },
        { say: 'Trusted Advisor kiểm tra chi phí, bảo mật, giới hạn dịch vụ. Đầy đủ các check cần gói Business support trở lên.', do: ['li "<b>Trusted Advisor</b>: đủ check cần <b>Business / Enterprise</b> support"'] },
        { say: 'Bảo vệ CloudTrail: bật multi-Region, log file integrity validation, và cảnh báo khi ai đó gọi StopLogging.', do: ['tip "CloudTrail: <b>multi-Region</b>, <b>log file validation</b>, S3 Object Lock, cảnh báo <code>StopLogging</code> / <code>DeleteTrail</code>."'] },
      ],
    },
  ],
};
