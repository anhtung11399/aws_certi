// Kịch bản video: Kế hoạch ứng phó sự cố
export default {
  scenes: [
    {
      title: 'Vòng đời ứng phó sự cố',
      nodes: {
        p: [140, 330, 'file', 'Chuẩn bị'],
        d: [370, 330, 'guardduty', 'Phát hiện & phân tích'],
        c: [620, 330, 'sg', 'Cô lập'],
        e: [870, 330, 'lambda', 'Loại bỏ & khôi phục'],
        l: [1110, 330, 'file', 'Rút kinh nghiệm'],
      },
      steps: [
        { say: 'Ứng phó sự cố theo vòng đời năm bước của NIST.', do: ['show p'] },
        { say: 'Chuẩn bị trước. Phát hiện và phân tích. Cô lập để chặn lan rộng.', do: ['show d,c', 'edge p d', 'edge d c', 'flow p d', 'flow d c @1.2'] },
        { say: 'Loại bỏ nguyên nhân và khôi phục. Cuối cùng rút kinh nghiệm, cập nhật kế hoạch.', do: ['show e,l', 'edge c e', 'edge e l', 'flow c e', 'flow e l @1.2'] },
        { say: 'Đề SCS có câu sắp xếp thứ tự. Nhớ nguyên tắc: giữ bằng chứng và cô lập trước, loại bỏ sau.', do: ['tip "Thứ tự: <b>chuẩn bị → phát hiện → cô lập → loại bỏ / khôi phục → rút kinh nghiệm</b>. Giữ bằng chứng TRƯỚC khi xoá."'] },
      ],
    },
    {
      title: 'Chuẩn bị trước khi có sự cố',
      groups: { org: [60, 150, 1160, 420, 'ou', 'Organization'] },
      nodes: {
        sec: [240, 260, 'guardduty', 'Security account', 'GuardDuty, Security Hub'],
        wl: [240, 460, 'ec2', 'Workload accounts', 'role điều tra sẵn'],
        fx: [640, 360, 'ec2', 'Forensics account', 'mạng cô lập'],
        ev: [1020, 260, 's3', 'Bucket bằng chứng', 'Object Lock, KMS'],
        ami: [1020, 460, 'ami', 'AMI công cụ', 'dựng sẵn'],
      },
      steps: [
        { say: 'Chuẩn bị trước là phần quyết định. Bật GuardDuty, Security Hub, Detective ở mọi account qua delegated admin.', do: ['show org,sec'] },
        { say: 'Mỗi account workload có sẵn role điều tra, chỉ được assume từ account Security.', do: ['show wl', 'edge sec wl "assume role" c=go route=v', 'flow sec wl'] },
        { say: 'Một account forensics riêng, mạng cô lập, có AMI công cụ điều tra dựng sẵn và bucket bằng chứng khoá bằng Object Lock.', do: ['show fx,ev,ami', 'edge fx ev', 'edge fx ami', 'flow fx ev'] },
        { say: 'Thêm tài khoản break-glass có MFA phần cứng cho tình huống khẩn cấp.', do: ['tip "Chuẩn bị: <b>role điều tra</b> mọi account · <b>forensics account</b> cô lập · bucket bằng chứng <b>Object Lock</b> · <b>break-glass</b> + MFA phần cứng."'] },
      ],
    },
    {
      title: 'Kiểm thử kế hoạch',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Kế hoạch chưa từng diễn tập thì chưa chắc chạy được.', do: [] },
        { say: 'Tabletop exercise: diễn tập trên giấy theo kịch bản.', do: ['li "<b>Tabletop</b>: diễn tập trên giấy"'] },
        { say: 'Game day: tạo finding mẫu bằng CreateSampleFindings của GuardDuty để thử chuỗi tự động hoá.', do: ['li "<b>Game day</b>: <code>CreateSampleFindings</code> của GuardDuty" c=ok'] },
        { say: 'AWS Fault Injection Service gây lỗi có kiểm soát, như dừng máy hay ngắt mạng, để kiểm tra runbook khôi phục.', do: ['li "<b>Fault Injection Service</b>: gây lỗi có kiểm soát" c=blue'] },
        { say: 'Đo hai chỉ số: thời gian phát hiện, và thời gian khôi phục.', do: ['li "Đo <b>MTTD</b> (phát hiện) và <b>MTTR</b> (khôi phục)" c=bad'] },
      ],
    },
    {
      title: 'Tự động khắc phục: dùng gì',
      nodes: {
        gd: [150, 330, 'guardduty', 'Finding'],
        evb: [430, 330, 'eventbridge', 'EventBridge'],
        fn: [780, 180, 'lambda', 'Lambda', 'việc nhanh, đơn giản'],
        sf: [780, 330, 'stepfunctions', 'Step Functions', 'nhiều bước, chờ duyệt'],
        ssm: [780, 480, 'ssm', 'SSM Automation', 'runbook có sẵn'],
      },
      steps: [
        { say: 'Finding đi qua EventBridge tới công cụ khắc phục. Chọn công cụ theo độ phức tạp.', do: ['show gd,evb', 'edge gd evb', 'flow gd evb'] },
        { say: 'Lambda cho hành động nhanh, đơn giản: vô hiệu hoá access key, gắn policy chặn.', do: ['show fn', 'edge evb fn route=hvh', 'flow evb fn'] },
        { say: 'Step Functions cho quy trình nhiều bước, rẽ nhánh, chờ người phê duyệt.', do: ['show sf', 'edge evb sf', 'flow evb sf'] },
        { say: 'SSM Automation có sẵn runbook như AWSSupport-ContainEC2Instance để cô lập máy.', do: ['show ssm', 'edge evb ssm route=hvh', 'flow evb ssm'] },
        { say: 'Nên tự động những hành động đảo ngược được và ít rủi ro: cô lập mạng, chụp snapshot, vô hiệu hoá key. Hành động phá huỷ thì để người duyệt.', do: ['tip "Tự động: hành động <b>đảo ngược được</b> (cô lập, snapshot, deactivate key). Phá huỷ (terminate, xoá) → cần <b>người duyệt</b>."'] },
      ],
    },
  ],
};
