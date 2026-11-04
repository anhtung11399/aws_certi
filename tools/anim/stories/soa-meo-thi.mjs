// Kịch bản video: Mẹo thi SOA-C03
export default {
  scenes: [
    {
      title: 'Từ khoá trong đề → đáp án',
      steps: [
        { say: 'Bài cuối: các cụm từ trong đề và đáp án đi kèm. Nghe cụm từ, nghĩ ngay tới dịch vụ.', do: ['big "Đề nói… → nghĩ ngay tới…"'] },
      ],
    },
    {
      title: 'Giám sát',
      panel: [90, 150, 1100],
      steps: [
        { say: 'RAM, dung lượng đĩa của EC2: CloudWatch agent.', do: ['li "RAM, disk của EC2 → <b>CloudWatch agent</b>"'] },
        { say: 'Dịch vụ trong máy chết: procstat của agent.', do: ['li "Process trong máy chết → <b>agent procstat</b>"'] },
        { say: 'Metric chỉ có khi lỗi, alarm kẹt INSUFFICIENT_DATA: notBreaching. Heartbeat: breaching.', do: ['li "Metric chỉ khi lỗi → <b>notBreaching</b> · heartbeat → <b>breaching</b>" c=ok'] },
        { say: 'Giảm báo động giả, kết hợp nhiều điều kiện: composite alarm.', do: ['li "Kết hợp điều kiện, giảm báo động → <b>composite alarm</b>" c=blue'] },
        { say: 'Mô phỏng người dùng theo lịch: Synthetics canary. Request chậm ở đâu: X-Ray.', do: ['li "Người dùng giả theo lịch → <b>Synthetics</b> · chậm ở đâu → <b>X-Ray</b>"'] },
        { say: 'Câu SQL nào làm chậm: Performance Insights. Quá nhiều kết nối từ Lambda: RDS Proxy.', do: ['li "SQL chậm → <b>Performance Insights</b> · quá nhiều kết nối → <b>RDS Proxy</b>" c=bad'] },
      ],
    },
    {
      title: 'Tự động hoá',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Chạy lệnh trên nhiều máy không SSH: Run Command. Vào máy không mở cổng 22: Session Manager.', do: ['li "Lệnh trên nhiều máy → <b>Run Command</b> · vào máy không cổng 22 → <b>Session Manager</b>"'] },
        { say: 'Vá hệ điều hành định kỳ: Patch Manager với Maintenance Window.', do: ['li "Vá OS định kỳ → <b>Patch Manager + Maintenance Window</b>" c=ok'] },
        { say: 'Tự sửa tài nguyên sai cấu hình: Config rule kèm remediation.', do: ['li "Tự sửa cấu hình sai → <b>Config rule + SSM Automation</b>" c=blue'] },
        { say: 'Phản ứng khi có sự kiện hay API call: EventBridge rule. Hẹn giờ có múi giờ: EventBridge Scheduler.', do: ['li "Phản ứng sự kiện → <b>EventBridge rule</b> · lịch có time zone → <b>Scheduler</b>"'] },
        { say: 'Backup tập trung nhiều account: AWS Backup. Chống xoá backup: Vault Lock.', do: ['li "Backup tập trung → <b>AWS Backup</b> · chống xoá → <b>Vault Lock</b>" c=bad'] },
      ],
    },
    {
      title: 'Triển khai và mạng',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Triển khai cho mọi account trong OU: StackSets service-managed. Giữ dữ liệu khi xoá stack: DeletionPolicy.', do: ['li "Mọi account trong OU → <b>StackSets</b> · giữ dữ liệu → <b>DeletionPolicy Retain / Snapshot</b>"'] },
        { say: 'Golden AMI tự động: Image Builder. Chia sẻ subnet, Transit Gateway: AWS RAM.', do: ['li "Golden AMI → <b>Image Builder</b> · chia sẻ subnet / TGW → <b>RAM</b>" c=ok'] },
        { say: 'Vì sao kết nối bị chặn: Flow Logs và Reachability Analyzer.', do: ['li "Kết nối bị chặn → <b>Flow Logs</b>, <b>Reachability Analyzer</b>" c=blue'] },
        { say: 'Máy on-premises phân giải tên trong AWS: Resolver inbound endpoint.', do: ['li "On-prem phân giải tên AWS → <b>Resolver inbound endpoint</b>"'] },
        { say: 'IP tĩnh toàn cầu, TCP UDP: Global Accelerator. Chặn IP gửi quá nhiều: WAF rate-based rule.', do: ['li "IP tĩnh toàn cầu → <b>Global Accelerator</b> · chặn IP spam → <b>WAF rate-based</b>" c=bad'] },
      ],
    },
    {
      title: 'Bẫy và chiến thuật',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Những bẫy hay gặp nhất.', do: [] },
        { say: 'Đáp án mở cổng 22 hay gắn Elastic IP để dùng SSM: luôn sai.', do: ['li "SSM <b>không cần</b> cổng 22 hay Elastic IP" c=bad'] },
        { say: 'Reboot không chuyển máy sang host khác. Muốn chuyển host phải stop rồi start.', do: ['li "Reboot <b>không</b> chuyển host → <b>stop / start</b>" c=bad'] },
        { say: 'Khôi phục RDS luôn tạo instance mới với endpoint mới.', do: ['li "Restore RDS → <b>instance mới, endpoint mới</b>" c=bad'] },
        { say: 'Chiến thuật: đọc câu hỏi ở cuối trước, gạch chân ràng buộc, loại đáp án thủ công, và đánh dấu câu khó để quay lại. Không bỏ trống câu nào.', do: ['tip "Đọc <b>câu hỏi cuối</b> trước → gạch chân ràng buộc → loại đáp án thủ công → <b>flag</b> câu khó → <b>không bỏ trống</b>."'] },
      ],
    },
  ],
};
