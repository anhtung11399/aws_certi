// Kịch bản video: Tổng quan đề SOA-C03
export default {
  scenes: [
    {
      title: 'Đề thi CloudOps trông thế nào',
      steps: [
        { say: 'Chào bạn. Đây là lộ trình ôn chứng chỉ AWS Certified CloudOps Engineer Associate, mã đề SOA-C03.', do: ['big "SOA-C03" "AWS Certified CloudOps Engineer – Associate"'] },
        { say: 'Đề có 65 câu. 50 câu tính điểm, 15 câu thử nghiệm không tính điểm, nhưng bạn không biết câu nào là câu thử.', do: [
          'note a 110 170 320 "<b>65 câu</b><br>50 tính điểm + 15 thử nghiệm"',
          'note b 480 170 320 "<b>130 phút</b><br>khoảng 2 phút mỗi câu"',
          'note c 850 170 320 "<b>Đậu từ 720</b><br>trên thang 100 – 1000"'] },
        { say: 'Bạn có 130 phút, điểm đậu là 720 trên 1000.', do: ['hl a'] },
        { say: 'Có hai dạng câu: chọn một đáp án đúng trong bốn, và chọn nhiều đáp án đúng.', do: ['note d 110 330 500 "<b>Multiple choice</b>: 1 đúng trong 4"', 'note e 670 330 500 "<b>Multiple response</b>: 2 đúng trở lên trong 5+" c=go'] },
        { say: 'Sai không bị trừ điểm. Vì vậy đừng bao giờ bỏ trống câu nào.', do: ['note f 110 450 1060 "Không trừ điểm khi sai → <b>không bỏ trống</b> câu nào. SOA-C03 không còn bài lab thực hành như SOA-C02." c=ok'] },
      ],
    },
    {
      title: 'Năm domain và tỉ trọng',
      panel: [90, 140, 1100],
      steps: [
        { say: 'Đề chia thành năm domain. Ba domain đầu, mỗi domain chiếm 22 phần trăm.', do: [] },
        { say: 'Domain 1: giám sát, log, phân tích, tự động khắc phục, và tối ưu hiệu năng. Trung tâm là CloudWatch, EventBridge và Systems Manager.', do: ['li "<b>D1 · 22%</b> Monitoring, Logging, Remediation, Performance: CloudWatch, EventBridge, SSM"'] },
        { say: 'Domain 2: độ tin cậy và tính liên tục. Load balancer, Auto Scaling, Route 53, Backup, phục hồi thảm hoạ.', do: ['li "<b>D2 · 22%</b> Reliability & Business Continuity: ELB, ASG, Route 53, Backup, DR" c=ok'] },
        { say: 'Domain 3: triển khai và tự động hoá. CloudFormation, CDK, StackSets, Image Builder.', do: ['li "<b>D3 · 22%</b> Deployment, Provisioning, Automation: CloudFormation, CDK, StackSets" c=blue'] },
        { say: 'Domain 4, 16 phần trăm: bảo mật và tuân thủ. Domain 5, 18 phần trăm: mạng và phân phối nội dung.', do: ['li "<b>D4 · 16%</b> Security & Compliance: IAM, KMS, Config, GuardDuty" c=bad', 'li "<b>D5 · 18%</b> Networking & Content Delivery: VPC, TGW, DX, Resolver, CloudFront"'] },
      ],
    },
    {
      title: 'Khác SAA ở đâu',
      nodes: {
        saa: [260, 280, 'user', 'SAA hỏi', 'nên thiết kế thế nào?'],
        soa: [900, 280, 'admin', 'SOA hỏi', 'đang lỗi, sửa thế nào?'],
      },
      steps: [
        { say: 'Bạn đã có SAA. SAA hỏi: nên thiết kế hệ thống thế nào.', do: ['show saa'] },
        { say: 'SOA hỏi khác: hệ thống đang chạy bị lỗi, bị chậm, cần tự động hoá, thì xử lý thế nào.', do: ['show soa', 'edge saa soa "từ thiết kế → vận hành" c=go'] },
        { say: 'Ví dụ, SAA hỏi dùng CloudWatch để giám sát. SOA hỏi: vì sao không có metric bộ nhớ, và alarm INSUFFICIENT_DATA nghĩa là gì.', do: ['note a 90 420 520 "<b>SAA</b>: dùng CloudWatch giám sát"', 'note b 670 420 520 "<b>SOA</b>: vì sao thiếu metric RAM? INSUFFICIENT_DATA là gì?" c=go'] },
        { say: 'SAA hỏi dùng CloudFormation. SOA hỏi: stack kẹt ở UPDATE_ROLLBACK_FAILED thì làm gì.', do: ['note c 90 510 520 "<b>SAA</b>: dùng CloudFormation cho IaC"', 'note d 670 510 520 "<b>SOA</b>: stack kẹt UPDATE_ROLLBACK_FAILED?" c=go'] },
      ],
    },
    {
      title: 'Tư duy chọn đáp án',
      nodes: {
        man: [220, 270, 'admin', 'Thủ công', 'vào console sửa tay'],
        auto: [700, 270, 'eventbridge', 'Tự động', 'EventBridge, SSM, Config'],
      },
      steps: [
        { say: 'Quy tắc thứ nhất: tự động thắng thủ công.', do: ['show man,auto', 'bad man @0.6', 'ok auto @0.9'] },
        { say: 'Đáp án có EventBridge, Systems Manager Automation hay Config remediation thường thắng đáp án quản trị viên vào kiểm tra rồi sửa tay.', do: ['edge man auto "thay bằng" c=ok'] },
        { say: 'Quy tắc thứ hai: ít công sức vận hành nhất. Dịch vụ được AWS quản lý thắng giải pháp tự dựng.', do: ['note a 90 420 520 "AWS Backup <b>thắng</b> script cron chụp snapshot" c=ok', 'note b 670 420 520 "Session Manager <b>thắng</b> bastion host" c=ok'] },
        { say: 'Quy tắc thứ ba: dùng đúng công cụ có sẵn. Cần RAM thì CloudWatch agent, cần vá lỗi thì Patch Manager, chạy lệnh trên năm trăm máy thì Run Command.', do: ['note c 90 510 1100 "RAM → <b>CloudWatch agent</b> · vá lỗi → <b>Patch Manager</b> · lệnh trên 500 máy → <b>Run Command</b>" c=go'] },
        { say: 'Và đọc kỹ ràng buộc trong câu hỏi. Mỗi cụm như không downtime, chi phí thấp nhất, nhiều account, sẽ loại bớt vài đáp án.', do: ['tip "Gạch chân ràng buộc: <b>least operational overhead</b>, <b>no downtime</b>, <b>most cost-effective</b>, <b>multiple accounts</b>."'] },
      ],
    },
    {
      title: 'Lộ trình 5 tuần',
      panel: [90, 140, 1100],
      steps: [
        { say: 'Lộ trình gợi ý năm tuần.', do: [] },
        { say: 'Tuần một: CloudWatch, Logs, EventBridge, Systems Manager.', do: ['li "<b>Tuần 1</b>: CloudWatch metrics, Logs, EventBridge, Systems Manager"'] },
        { say: 'Tuần hai: hiệu năng EC2, storage, database, load balancer và Auto Scaling.', do: ['li "<b>Tuần 2</b>: EC2, storage, database, ELB và Auto Scaling" c=ok'] },
        { say: 'Tuần ba: Route 53, backup, CloudFormation, AMI, các kiểu deploy.', do: ['li "<b>Tuần 3</b>: Route 53, Backup và DR, CloudFormation, AMI, deploy" c=blue'] },
        { say: 'Tuần bốn: bảo mật, tuân thủ, VPC, kết nối lai, CloudFront. Tuần năm: mẹo thi và làm đề.', do: ['li "<b>Tuần 4</b>: IAM, Config, VPC, kết nối lai và DNS, CloudFront" c=bad', 'li "<b>Tuần 5</b>: mẹo thi, đọc lại bài yếu, làm Official Practice Question Set"'] },
        { say: 'Lời khuyên cuối: mở một tài khoản AWS, bật billing alarm trước, rồi tự bấm làm. Ba mươi phút thực hành nhớ lâu hơn ba giờ đọc.', do: ['tip "Tự làm trên tài khoản thật (bật <b>billing alarm</b> trước): cài agent, tạo alarm, chạy runbook, deploy stack lỗi rồi đọc lỗi."'] },
      ],
    },
  ],
};
