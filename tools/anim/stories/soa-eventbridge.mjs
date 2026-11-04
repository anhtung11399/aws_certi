// Kịch bản video: EventBridge
export default {
  scenes: [
    {
      title: 'EventBridge: chuyển sự kiện tới đúng chỗ',
      nodes: {
        ec2: [140, 190, 'ec2', 'EC2', 'state: stopped'],
        ct: [140, 330, 'cloudtrail', 'CloudTrail', 'API call'],
        app: [140, 470, 'app', 'Ứng dụng', 'PutEvents'],
        bus: [480, 330, 'eventbridge', 'Event bus', 'default / custom'],
        rule: [760, 330, 'eventbridge', 'Rule', 'event pattern'],
        fn: [1080, 190, 'lambda', 'Lambda'],
        sns: [1080, 330, 'sns', 'SNS'],
        ssm: [1080, 470, 'ssm', 'SSM Automation'],
      },
      steps: [
        { say: 'Mọi thứ xảy ra trong AWS đều sinh ra sự kiện: máy EC2 dừng, ai đó gọi API, ứng dụng của bạn tự gửi sự kiện.', do: ['show ec2,ct,app'] },
        { say: 'Sự kiện đổ về event bus. Mỗi account có sẵn default bus nhận sự kiện của dịch vụ AWS.', do: ['show bus', 'edge ec2 bus', 'edge ct bus', 'edge app bus', 'flow ec2 bus', 'flow ct bus @1.4', 'flow app bus @1.7'] },
        { say: 'Rule có event pattern, giống một bộ lọc. Sự kiện nào khớp mới đi tiếp.', do: ['show rule', 'edge bus rule "khớp pattern?"', 'flow bus rule c=ok'] },
        { say: 'Mỗi rule gửi tới tối đa năm target: Lambda, SNS, SQS, Step Functions, SSM Automation và nhiều dịch vụ khác.', do: ['show fn,sns,ssm', 'edge rule fn', 'edge rule sns', 'edge rule ssm', 'flow rule fn', 'flow rule sns @1.5', 'flow rule ssm @1.8'] },
      ],
    },
    {
      title: 'Event pattern: bộ lọc bằng JSON',
      steps: [
        { say: 'Một sự kiện là một khối JSON, có source, detail-type và phần detail.', do: ['note ev 90 160 520 "<b>Event</b><br><code>source: aws.ec2<br>detail-type: EC2 Instance State-change Notification<br>detail: { state: stopped }</code>"'] },
        { say: 'Pattern có cùng cấu trúc, nhưng mỗi giá trị là một mảng các giá trị chấp nhận.', do: ['note pt 670 160 520 "<b>Pattern</b><br><code>source: [aws.ec2]<br>detail: { state: [stopped, terminated] }</code>" c=ok'] },
        { say: 'Có nhiều kiểu lọc: tiền tố, phủ định, so sánh số, kiểm tra tồn tại, wildcard.', do: ['note k 90 380 1100 "<code>prefix</code> · <code>anything-but</code> · <code>numeric &gt;= 7</code> · <code>exists</code> · <code>wildcard Delete*</code> · <code>equals-ignore-case</code>" c=go'] },
        { say: 'Bẫy hay gặp: sự kiện AWS API Call via CloudTrail chỉ có với API ghi, không có với Get, List, Describe, và phải có CloudTrail. Dịch vụ global như IAM sinh sự kiện ở us-east-1.', do: ['tip "<b>AWS API Call via CloudTrail</b>: chỉ API ghi, cần CloudTrail. Dịch vụ global (IAM, CloudFront, Route 53) → rule đặt ở <b>us-east-1</b>."'] },
      ],
    },
    {
      title: 'Quyền gọi target',
      nodes: {
        rule: [200, 330, 'eventbridge', 'Rule'],
        fn: [620, 200, 'lambda', 'Lambda / SNS / SQS', 'resource policy'],
        sf: [620, 460, 'stepfunctions', 'Step Functions / Kinesis / SSM', 'IAM role của rule'],
        dlq: [1000, 330, 'sqs', 'DLQ', 'event gửi không được'],
      },
      steps: [
        { say: 'EventBridge cần quyền để gọi target. Với Lambda, SNS, SQS, quyền nằm ở resource policy của target, cho phép events.amazonaws.com.', do: ['show rule,fn', 'edge rule fn "resource policy" c=ok', 'flow rule fn'] },
        { say: 'Với Step Functions, Kinesis, ECS, SSM, hay bus ở account khác, rule cần một IAM role.', do: ['show sf', 'edge rule sf "IAM role" c=go', 'flow rule sf'] },
        { say: 'Mặc định EventBridge thử lại suốt 24 giờ. Gắn DLQ để giữ lại sự kiện không gửi được.', do: ['show dlq', 'edge sf dlq "lỗi" c=bad route=hvh', 'flow sf dlq c=bad'] },
        { say: 'Input transformer cắt lấy vài trường của sự kiện và ghép thành câu thông báo dễ đọc.', do: ['note it 160 160 420 "<b>Input transformer</b>: “Máy &lt;id&gt; vừa chuyển sang &lt;state&gt;”" c=go'] },
      ],
    },
    {
      title: 'Gom sự kiện từ nhiều account',
      groups: {
        a1: [70, 150, 280, 160, 'account', 'Account A'],
        a2: [70, 360, 280, 160, 'account', 'Account B'],
        ops: [580, 210, 620, 260, 'account', 'Account vận hành'],
      },
      nodes: {
        b1: [210, 240, 'eventbridge', 'Bus A'],
        b2: [210, 450, 'eventbridge', 'Bus B'],
        cen: [740, 340, 'eventbridge', 'Bus trung tâm', 'resource policy'],
        fn: [1060, 340, 'lambda', 'Xử lý chung'],
      },
      steps: [
        { say: 'Nhiều account muốn gửi sự kiện về một chỗ để xử lý chung.', do: ['show a1,a2,ops', 'show b1,b2'] },
        { say: 'Target của rule là ARN của event bus ở account khác.', do: ['show cen', 'edge b1 cen', 'edge b2 cen', 'flow b1 cen', 'flow b2 cen @1.3'] },
        { say: 'Bus đích phải có resource policy cho phép các account đó gửi, hoặc cả Organization bằng điều kiện PrincipalOrgID.', do: ['badge cen "aws:PrincipalOrgID" c=blue', 'show fn', 'edge cen fn', 'flow cen fn'] },
      ],
    },
    {
      title: 'Scheduler, Pipes, Archive',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Ba thành phần khác của EventBridge hay xuất hiện trong đề.', do: [] },
        { say: 'EventBridge Scheduler: hẹn giờ theo cron, theo chu kỳ, hoặc một lần, có múi giờ và retry. Nó thay cho rule schedule kiểu cũ.', do: ['li "<b>Scheduler</b>: cron / rate / một lần, có time zone, retry, DLQ. Thay rule schedule cũ"'] },
        { say: 'EventBridge Pipes: nối một nguồn như SQS hay DynamoDB Streams tới một đích, có lọc và làm giàu dữ liệu, không cần viết code kết nối.', do: ['li "<b>Pipes</b>: nguồn (SQS, Kinesis, DynamoDB Streams) → lọc → làm giàu → đích, không code" c=blue'] },
        { say: 'Archive và replay: lưu sự kiện lại để phát lại sau khi sửa lỗi xử lý.', do: ['li "<b>Archive & replay</b>: lưu event, phát lại sau khi sửa lỗi" c=ok'] },
      ],
    },
    {
      title: 'Các sự kiện vận hành hay thi',
      nodes: {
        al: [150, 190, 'alarm', 'Alarm State Change'],
        hl: [150, 330, 'health', 'AWS Health', 'scheduled retirement'],
        gd: [150, 470, 'guardduty', 'GuardDuty Finding'],
        evb: [520, 330, 'eventbridge', 'EventBridge'],
        ssm: [900, 190, 'ssm', 'SSM Automation', 'khắc phục'],
        stop: [900, 330, 'ec2', 'Stop / start', 'trong maintenance window'],
        iso: [900, 470, 'sg', 'Cô lập máy', 'đổi security group'],
      },
      steps: [
        { say: 'Alarm đổi trạng thái là một sự kiện. Rule gọi SSM Automation để tự khắc phục.', do: ['show al,evb,ssm', 'edge al evb', 'edge evb ssm', 'flow al evb', 'flow evb ssm @1.3'] },
        { say: 'AWS Health báo máy sắp bị retire vì phần cứng cũ. Tự động stop rồi start máy trong maintenance window để chuyển sang phần cứng mới.', do: ['show hl,stop', 'edge hl evb', 'edge evb stop', 'flow hl evb', 'flow evb stop @1.3'] },
        { say: 'GuardDuty phát hiện máy bị xâm nhập: tự động cô lập máy bằng security group không cho ra vào.', do: ['show gd,iso', 'edge gd evb c=bad', 'edge evb iso c=bad', 'flow gd evb', 'flow evb iso @1.3'] },
        { say: 'Còn sự kiện Spot sắp bị thu hồi cho bạn hai phút cảnh báo, và lifecycle hook của Auto Scaling cho bạn dọn dẹp trước khi máy bị xoá.', do: ['tip "Spot Interruption Warning = <b>2 phút</b>. AWS Health qua EventBridge: <b>mọi account</b> đều có. Health API: cần gói <b>Business support</b>."'] },
      ],
    },
    {
      title: 'Rule không chạy: kiểm tra gì',
      nodes: {
        bus: [160, 330, 'eventbridge', 'Event bus'],
        rule: [520, 330, 'eventbridge', 'Rule'],
        tg: [880, 330, 'lambda', 'Target'],
      },
      steps: [
        { say: 'Rule không chạy, nhìn hai metric của nó.', do: ['show bus,rule,tg', 'edge bus rule', 'edge rule tg'] },
        { say: 'TriggeredRules bằng 0: pattern không khớp. Thường do sai hoa thường, thiếu dấu mảng, sai detail-type, sai Region, hoặc sự kiện không tồn tại.', do: ['badge rule "TriggeredRules = 0" c=bad', 'bad rule @0.4', 'note a 90 470 520 "Pattern sai · sai Region · thiếu CloudTrail · API là Describe" c=bad'] },
        { say: 'TriggeredRules có, nhưng FailedInvocations tăng: thiếu quyền gọi target, target bị giới hạn, hoặc khoá KMS của SQS, SNS không cho EventBridge dùng.', do: ['badge tg "FailedInvocations ↑" c=bad', 'note b 660 470 520 "Thiếu resource policy / role · throttle · KMS chặn" c=bad'] },
        { say: 'Thử pattern bằng sandbox trên console, và gắn DLQ để xem lý do lỗi.', do: ['tip "Gỡ lỗi: <b>TriggeredRules</b> (pattern) và <b>FailedInvocations</b> (quyền / target). Thử pattern trong <b>sandbox</b>, gắn <b>DLQ</b>."'] },
      ],
    },
  ],
};
