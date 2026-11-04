// Kịch bản video: Bảo mật compute và container
export default {
  scenes: [
    {
      title: 'Image cứng hoá',
      nodes: {
        src: [140, 330, 'ami', 'Image gốc'],
        ib: [430, 330, 'imagebuilder', 'Image Builder', 'CIS, STIG hardening'],
        ins: [720, 330, 'inspector', 'Inspector', 'quét trước khi phát hành'],
        ami: [1010, 330, 'ami', 'Golden AMI', 'mã hoá, Allowed AMIs'],
      },
      steps: [
        { say: 'Máy chủ an toàn bắt đầu từ image an toàn. Image Builder áp component cứng hoá theo chuẩn CIS hay STIG.', do: ['show src,ib', 'edge src ib', 'flow src ib'] },
        { say: 'Inspector quét lỗ hổng trước khi phát hành AMI.', do: ['show ins', 'edge ib ins', 'flow ib ins', 'ok ins @1.0'] },
        { say: 'AMI phát hành được mã hoá. Allowed AMIs chỉ cho tạo máy từ nguồn tin cậy.', do: ['show ami', 'edge ins ami c=ok', 'flow ins ami'] },
        { say: 'Không nhúng secret vào image. Container image dùng base tối giản, chạy user không phải root, bật tag immutability.', do: ['tip "Image: không secret, <b>non-root</b>, base tối giản, ECR <b>enhanced scanning</b> + <b>tag immutability</b>, chỉ <b>Allowed AMIs</b>."'] },
      ],
    },
    {
      title: 'Cấp quyền cho workload',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Mỗi loại compute nhận quyền theo một cách. Không bao giờ dùng access key dài hạn.', do: [] },
        { say: 'EC2 dùng instance profile, credential qua metadata, bắt buộc IMDSv2 với hop limit một.', do: ['li "<b>EC2</b>: instance profile, <b>IMDSv2</b>, hop limit 1 (2 nếu có container)" c=ok'] },
        { say: 'Lambda có execution role là quyền của hàm, và resource policy quyết định ai được gọi hàm.', do: ['li "<b>Lambda</b>: execution role + resource policy (ai được gọi)"'] },
        { say: 'ECS có task role cho ứng dụng và execution role để kéo image, đọc secret. Đề hay đánh tráo hai cái này.', do: ['li "<b>ECS</b>: <b>task role</b> (app) ≠ <b>execution role</b> (image, secret, log)" c=bad'] },
        { say: 'EKS dùng Pod Identity hoặc IRSA, để mỗi pod có role riêng thay vì dùng role của node.', do: ['li "<b>EKS</b>: <b>Pod Identity</b> / IRSA, chặn pod lấy credential node" c=blue'] },
        { say: 'Workload chạy ngoài AWS dùng IAM Roles Anywhere với chứng chỉ X.509.', do: ['tip "Server ngoài AWS cần credential tạm thời → <b>IAM Roles Anywhere</b>. Giới hạn credential EC2 dùng nơi khác → <code>aws:EC2InstanceSourceVPC</code>."'] },
      ],
    },
    {
      title: 'Có lỗ hổng hay đang bị khai thác',
      nodes: {
        ec2: [180, 330, 'ec2', 'EC2 / ECS / EKS'],
        ins: [560, 200, 'inspector', 'Inspector', 'CÓ lỗ hổng'],
        gd: [560, 460, 'guardduty', 'GuardDuty Runtime', 'ĐANG bị khai thác'],
        evb: [880, 200, 'eventbridge', 'EventBridge'],
        ssm: [1120, 200, 'ssm', 'Vá / thay AMI'],
      },
      steps: [
        { say: 'Inspector cho biết máy có lỗ hổng. GuardDuty Runtime Monitoring cho biết lỗ hổng đang bị khai thác.', do: ['show ec2,ins,gd', 'edge ec2 ins route=hvh', 'edge ec2 gd route=hvh', 'flow ec2 ins', 'flow ec2 gd @1.2 c=bad'] },
        { say: 'Vòng khép kín: Inspector phát hiện CVE, EventBridge gọi SSM Automation vá lỗi, Inspector quét lại và tự đóng finding.', do: ['show evb,ssm', 'edge ins evb', 'edge evb ssm', 'flow ins evb', 'flow evb ssm @1.2', 'edge ssm ec2 "quét lại" c=ok pts=[[1120,164],[1120,120],[180,120],[180,294]]', 'flow ssm ec2 c=ok @2.2'] },
        { say: 'Hoặc theo hướng bất biến: dựng AMI mới rồi thay máy bằng instance refresh, không vá tại chỗ.', do: ['tip "<b>Inspector</b> = có lỗ hổng. <b>GuardDuty Runtime</b> = đang bị khai thác. Vá tự động: Inspector → EventBridge → <b>SSM</b> / <b>instance refresh</b>."'] },
      ],
    },
    {
      title: 'Vào máy quản trị an toàn',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Bốn cách vào máy, xếp từ tốt nhất.', do: [] },
        { say: 'Session Manager: không mở cổng, không key, IAM quyết định ai vào máy nào, ghi log toàn bộ phiên.', do: ['li "<b>Session Manager</b>: không cổng, không key, log phiên — tốt nhất" c=ok'] },
        { say: 'EC2 Instance Connect Endpoint: SSH hoặc RDP vào máy private mà không cần IP public hay bastion.', do: ['li "<b>Instance Connect Endpoint</b>: SSH / RDP máy private, không bastion" c=blue'] },
        { say: 'EC2 Instance Connect đẩy public key tạm sáu mươi giây, vẫn cần cổng 22.', do: ['li "<b>Instance Connect</b>: key tạm 60 giây, vẫn cần cổng 22"'] },
        { say: 'Bastion host là cách cũ, phải vá, quản lý key, mở cổng. Tránh dùng.', do: ['li "<b>Bastion</b>: cách cũ, tránh" c=bad'] },
      ],
    },
  ],
};
