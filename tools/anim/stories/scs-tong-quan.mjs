// Kịch bản video: Tổng quan đề SCS-C03
export default {
  scenes: [
    {
      title: 'Đề thi Security Specialty',
      steps: [
        { say: 'Đây là lộ trình ôn chứng chỉ AWS Certified Security Specialty, mã đề SCS-C03, thay cho SCS-C02 từ cuối năm 2025.', do: ['big "SCS-C03" "AWS Certified Security – Specialty"'] },
        { say: 'Đề có 65 câu, thời gian 170 phút, điểm đậu 750 trên 1000.', do: [
          'note a 110 170 320 "<b>65 câu</b><br>50 tính điểm + 15 thử nghiệm"',
          'note b 480 170 320 "<b>170 phút</b><br>dài hơn SOA 40 phút"',
          'note c 850 170 320 "<b>Đậu từ 750</b><br>cao hơn SOA (720)"'] },
        { say: 'Điểm mới: ngoài trắc nghiệm, có câu sắp xếp các bước theo đúng thứ tự, và câu ghép cặp. Phải đúng hết mới được điểm.', do: ['note d 110 330 1060 "Dạng mới: <b>ordering</b> (sắp 3–5 bước đúng thứ tự) và <b>matching</b> (ghép 3–7 cặp). Phải đúng <b>toàn bộ</b> mới có điểm." c=go'] },
      ],
    },
    {
      title: 'Sáu domain',
      panel: [90, 140, 1100],
      steps: [
        { say: 'Đề chia sáu domain. Nặng nhất là quản lý danh tính và truy cập, hai mươi phần trăm.', do: ['li "<b>D4 · 20%</b> Identity & Access Management: Identity Center, STS, policy evaluation" c=blue'] },
        { say: 'Bảo mật hạ tầng và bảo vệ dữ liệu, mỗi domain mười tám phần trăm.', do: ['li "<b>D3 · 18%</b> Infrastructure Security: VPC, WAF, Shield, Network Firewall"', 'li "<b>D5 · 18%</b> Data Protection: KMS, CloudHSM, mã hoá, Secrets Manager" c=ok'] },
        { say: 'Phát hiện mười sáu phần trăm. Ứng phó sự cố mười bốn phần trăm.', do: ['li "<b>D1 · 16%</b> Detection: GuardDuty, Security Hub, Macie, logging"', 'li "<b>D2 · 14%</b> Incident Response: cô lập, điều tra, tự động phản ứng" c=bad'] },
        { say: 'Domain sáu là mới: nền tảng và quản trị, quản lý bảo mật cho nhiều account bằng Organizations, Control Tower, SCP và RCP.', do: ['li "<b>D6 · 14% (MỚI)</b> Foundations & Governance: Organizations, Control Tower, SCP / RCP" c=ok'] },
      ],
    },
    {
      title: 'Khung tư duy chọn đáp án',
      panel: [90, 140, 1100],
      steps: [
        { say: 'Bảy nguyên tắc giúp loại đáp án sai.', do: [] },
        { say: 'Một, quyền tối thiểu: đáp án cấp quyền hẹp, có điều kiện thắng đáp án dùng dấu sao.', do: ['li "<b>Least privilege</b>: hẹp + có điều kiện thắng <code>*</code>"'] },
        { say: 'Hai, ngăn chặn trước phát hiện: SCP, policy, Block Public Access tốt hơn chỉ phát hiện bằng Config hay GuardDuty.', do: ['li "<b>Preventive</b> (SCP, Block Public Access) trước <b>detective</b> (Config, GuardDuty)" c=ok'] },
        { say: 'Ba, tập trung hoá: delegated administrator, organization trail thắng cấu hình từng account.', do: ['li "<b>Tập trung</b>: delegated admin, organization trail, Firewall Manager" c=blue'] },
        { say: 'Bốn, tự động phản ứng bằng EventBridge và Lambda hay SSM, thắng xử lý tay.', do: ['li "<b>Tự động phản ứng</b>: EventBridge + Lambda / SSM"'] },
        { say: 'Năm, thông tin xác thực tạm thời: role và Identity Center thắng IAM user có access key dài hạn. Và mã hoá ở mọi nơi.', do: ['li "<b>Credential tạm thời</b> (role, STS) · <b>mã hoá</b> at rest + in transit" c=bad'] },
      ],
    },
    {
      title: 'Trách nhiệm chia sẻ',
      groups: { aws: [80, 360, 1120, 160, 'cloud', 'AWS lo: bảo mật CỦA cloud'], you: [80, 160, 1120, 170, 'account', 'Bạn lo: bảo mật TRONG cloud'] },
      nodes: {
        hw: [250, 440, 'server', 'Phần cứng, data center'],
        hv: [600, 440, 'server', 'Hypervisor, mạng toàn cầu'],
        mg: [950, 440, 'rds', 'Hạ tầng dịch vụ managed'],
        iam: [250, 245, 'iam', 'IAM, quyền'],
        enc: [600, 245, 'kms', 'Mã hoá, cấu hình'],
        os: [950, 245, 'ec2', 'OS của EC2, vá lỗi'],
      },
      steps: [
        { say: 'Mô hình trách nhiệm chia sẻ: AWS lo bảo mật của cloud, gồm phần cứng, hypervisor, hạ tầng dịch vụ.', do: ['show aws,hw,hv,mg'] },
        { say: 'Bạn lo bảo mật trong cloud: phân quyền, mã hoá, cấu hình, và hệ điều hành của máy EC2.', do: ['show you,iam,enc,os'] },
        { say: 'Dịch vụ càng managed, phần bạn phải lo càng ít. Với RDS, AWS vá hệ điều hành. Với EC2, bạn tự vá.', do: ['tip "EC2: <b>bạn</b> vá OS. RDS / Lambda: <b>AWS</b> vá nền tảng. Dữ liệu và quyền truy cập luôn là của <b>bạn</b>."'] },
      ],
    },
  ],
};
