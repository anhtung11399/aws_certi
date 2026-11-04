// Kịch bản video: CloudWatch Logs, tracing, CloudTrail
export default {
  scenes: [
    {
      title: 'Ba tầng của CloudWatch Logs',
      groups: { lg: [360, 150, 560, 400, 'plain', 'Log group /app/web · retention, KMS, filter'] },
      nodes: {
        s1: [500, 280, 'ec2', 'Log stream', 'i-0abc'],
        s2: [780, 280, 'ec2', 'Log stream', 'i-0def'],
        e1: [500, 440, 'file', 'Log event', 'timestamp + nội dung'],
        e2: [780, 440, 'file', 'Log event'],
      },
      steps: [
        { say: 'CloudWatch Logs có ba tầng. Nhỏ nhất là log event: một dòng log gồm thời điểm và nội dung.', do: ['show e1,e2'] },
        { say: 'Các event từ cùng một nguồn, như một máy EC2 hay một lần chạy Lambda, tạo thành log stream.', do: ['show s1,s2', 'edge e1 s1', 'edge e2 s2'] },
        { say: 'Các stream cùng loại gom vào log group. Mọi cấu hình quan trọng đặt ở đây: thời gian giữ, khoá mã hoá, metric filter, subscription filter.', do: ['show lg', 'hl s1,s2'] },
        { say: 'Bẫy chi phí: log group mặc định giữ mãi mãi. Hãy đặt retention cho mọi log group.', do: ['tip "Retention mặc định là <b>Never expire</b>. Đặt retention cho mọi log group, kiểm tra bằng Config rule <code>cw-loggroup-retention-period-check</code>."'] },
      ],
    },
    {
      title: 'Log đến từ đâu',
      nodes: {
        ec2: [150, 180, 'ec2', 'EC2 / on-prem', 'CloudWatch agent'],
        fn: [150, 320, 'lambda', 'Lambda', 'tự động'],
        ecs: [150, 460, 'ecs', 'ECS / Fargate', 'awslogs, FireLens'],
        cwl: [620, 320, 'logs', 'CloudWatch Logs'],
        vpc: [1080, 180, 'vpc', 'VPC Flow Logs'],
        ct: [1080, 320, 'cloudtrail', 'CloudTrail'],
        rds: [1080, 460, 'rds', 'RDS', 'log exports'],
      },
      steps: [
        { say: 'File log trên máy EC2 hay máy on-premises: dùng CloudWatch agent.', do: ['show cwl,ec2', 'edge ec2 cwl', 'flow ec2 cwl'] },
        { say: 'Lambda tự gửi log, chỉ cần execution role có quyền ghi log. Container ECS dùng log driver awslogs hoặc FireLens.', do: ['show fn,ecs', 'edge fn cwl', 'edge ecs cwl', 'flow fn cwl', 'flow ecs cwl @1.6'] },
        { say: 'Nhiều dịch vụ khác chọn đích là CloudWatch Logs: VPC Flow Logs, CloudTrail, và RDS khi bật log exports.', do: ['show vpc,ct,rds', 'edge vpc cwl', 'edge ct cwl', 'edge rds cwl', 'flow vpc cwl', 'flow rds cwl @1.4'] },
      ],
    },
    {
      title: 'Metric filter: biến log thành metric',
      nodes: {
        cwl: [150, 320, 'logs', 'Log group', '{ "status": "FAILED" }'],
        mf: [450, 320, 'cloudwatch', 'Metric filter', '{ $.status = \"FAILED\" }'],
        al: [750, 320, 'alarm', 'Alarm', 'FailedCount > 5'],
        sns: [1050, 320, 'sns', 'SNS'],
      },
      steps: [
        { say: 'Muốn alarm khi log có lỗi, dùng metric filter. Nó đếm số dòng khớp mẫu và tạo thành metric.', do: ['show cwl,mf', 'edge cwl mf "dòng khớp"', 'flow cwl mf'] },
        { say: 'Mẫu có thể là chuỗi đơn giản như ERROR, hoặc điều kiện trên log JSON như status bằng FAILED.', do: ['note p 300 450 680 "<code>“ERROR”</code> · <code>?ERROR ?WARN</code> (hoặc) · <code>{ $.status = 500 }</code> (JSON)"'] },
        { say: 'Từ metric đó tạo alarm và gửi thông báo như mọi metric khác.', do: ['show al,sns', 'edge mf al', 'edge al sns c=bad', 'flow mf al', 'badge al "ALARM" c=bad @1.4', 'flow al sns @1.6'] },
        { say: 'Nhớ đặt default value bằng 0. Không có dòng lỗi thì metric vẫn có điểm 0, alarm không kẹt ở INSUFFICIENT_DATA.', do: ['tip "Metric filter: đặt <b>default value = 0</b>. Filter chỉ xử lý log <b>mới</b> sau khi tạo, log cũ thì dùng Logs Insights."'] },
        { say: 'Mẫu kinh điển trong đề: CloudTrail gửi về CloudWatch Logs, metric filter bắt đăng nhập console thất bại hay việc dùng tài khoản root, rồi alarm báo qua SNS.', do: ['note c 160 160 960 "Mẫu CIS: <b>CloudTrail → CloudWatch Logs → metric filter</b> (ConsoleLogin thất bại, dùng root, đổi security group) <b>→ alarm → SNS</b>" c=go'] },
      ],
    },
    {
      title: 'Logs Insights: hỏi log bằng truy vấn',
      steps: [
        { say: 'Muốn tìm trong log, kể cả log cũ, dùng Logs Insights. Nó có ngôn ngữ truy vấn riêng.', do: ['note q 120 160 620 "<code>fields @timestamp, path, duration<br>| filter duration &gt; 1000<br>| sort duration desc<br>| limit 20</code>"'] },
        { say: 'Ví dụ này lấy 20 request chậm nhất có thời gian xử lý trên một giây.', do: ['note r 790 160 380 "Top 20 request chậm nhất" c=ok'] },
        { say: 'Đếm số lỗi theo từng phút dùng stats count, nhóm theo bin một phút.', do: ['note q2 120 340 620 "<code>filter @message like /ERROR/<br>| stats count(*) by bin(1m)</code>"', 'note r2 790 340 380 "Số lỗi mỗi phút" c=ok'] },
        { say: 'Logs Insights truy vấn được nhiều log group cùng lúc, tính tiền theo lượng dữ liệu quét. Thu hẹp khoảng thời gian để rẻ hơn.', do: ['note c 120 480 1050 "Nhiều log group một lần · tính tiền theo <b>dữ liệu quét</b> · <b>Contributor Insights</b>: top IP, top URL lỗi liên tục · <b>Live Tail</b>: xem log trực tiếp" c=go'] },
      ],
    },
    {
      title: 'Đưa log đi nơi khác',
      nodes: {
        cwl: [170, 330, 'logs', 'Log group'],
        kds: [560, 190, 'kinesis', 'Kinesis / Firehose', 'gần thời gian thực'],
        fn: [560, 330, 'lambda', 'Lambda'],
        s3: [560, 470, 's3', 'S3', 'export task, tới 12 giờ'],
        cen: [960, 190, 'logs', 'Account log trung tâm', 'destination'],
        gl: [960, 470, 'glacier', 'Glacier', 'lưu 7 năm rẻ'],
      },
      steps: [
        { say: 'Có hai đường đưa log ra ngoài. Đường thứ nhất là subscription filter, gần thời gian thực, tới Kinesis, Firehose, Lambda hay OpenSearch.', do: ['show cwl,kds,fn', 'edge cwl kds "subscription filter" c=go', 'edge cwl fn c=go', 'flow cwl kds', 'flow cwl fn @1.4'] },
        { say: 'Gom log của nhiều account về một account trung tâm gần thời gian thực: subscription filter tới một destination cross-account.', do: ['show cen', 'edge kds cen "cross-account" c=go', 'flow kds cen', 'hl cen'] },
        { say: 'Đường thứ hai là export sang S3, chậm tới 12 giờ, dùng để lưu trữ theo lô.', do: ['show s3', 'edge cwl s3 "export" route=vh'] },
        { say: 'Cần lưu log bảy năm với chi phí thấp: đưa sang S3, dùng lifecycle chuyển xuống Glacier, và đặt retention ngắn cho log group.', do: ['show gl', 'edge s3 gl "lifecycle" c=ok', 'tip "Gần thời gian thực, nhiều account → <b>subscription filter + destination</b>. Lưu lâu, rẻ → <b>S3 + lifecycle Glacier</b>."'] },
      ],
    },
    {
      title: 'Request chậm ở đâu: X-Ray và các công cụ',
      nodes: {
        u: [120, 330, 'users', 'Người dùng'],
        api: [360, 330, 'apigw', 'API Gateway', '30 ms'],
        fn: [620, 330, 'lambda', 'Lambda', '80 ms'],
        ddb: [880, 220, 'dynamodb', 'DynamoDB', '12 ms'],
        ext: [880, 440, 'internet', 'API ngoài', '2.100 ms'],
      },
      steps: [
        { say: 'Một request đi qua API Gateway, Lambda, DynamoDB và một dịch vụ bên ngoài. Nó chậm ở đâu?', do: ['show u,api,fn,ddb,ext', 'edge u api', 'edge api fn', 'edge fn ddb', 'edge fn ext'] },
        { say: 'AWS X-Ray ghi lại hành trình của request thành trace, vẽ service map, cho thấy từng đoạn mất bao lâu.', do: ['flow u api', 'flow api fn @1.0', 'flow fn ext @2.0 c=bad', 'hl ext @2.8', 'badge ext "CHẬM" c=bad @2.8'] },
        { say: 'Cần SDK hoặc OpenTelemetry trong code, X-Ray daemon trên EC2 hay ECS, và bật active tracing cho Lambda.', do: ['note x 120 470 520 "<b>X-Ray</b>: SDK / OpenTelemetry + daemon, Lambda bật <b>active tracing</b>"'] },
        { say: 'Phân biệt ba công cụ hay bị nhầm. Synthetics là người dùng giả chạy theo lịch. RUM đo người dùng thật trên trình duyệt. X-Ray nhìn vào bên trong hệ thống.', do: ['tip "<b>Synthetics</b> = người dùng giả theo lịch (biết lỗi trước khách). <b>RUM</b> = người dùng thật. <b>X-Ray</b> = bên trong chậm ở đâu."'] },
      ],
    },
    {
      title: 'CloudTrail: ai đã làm gì',
      nodes: {
        u: [150, 320, 'admin', 'bob', 'TerminateInstances'],
        ct: [470, 320, 'cloudtrail', 'CloudTrail'],
        eh: [820, 190, 'cloudtrail', 'Event history', '90 ngày, miễn phí'],
        s3: [820, 330, 's3', 'Trail → S3', 'lưu lâu dài'],
        lake: [820, 470, 'athena', 'CloudTrail Lake / Athena', 'truy vấn SQL'],
      },
      steps: [
        { say: 'Mọi lời gọi API trong tài khoản đều được CloudTrail ghi lại: ai gọi, gọi gì, lúc nào, từ IP nào.', do: ['show u,ct', 'edge u ct "API call"', 'flow u ct'] },
        { say: 'Event history giữ 90 ngày management events, miễn phí, tra cứu ngay trên console.', do: ['show eh', 'edge ct eh route=hvh', 'flow ct eh'] },
        { say: 'Muốn giữ lâu hơn, tạo trail lưu về S3. Truy vấn bằng Athena hoặc CloudTrail Lake.', do: ['show s3,lake', 'edge ct s3', 'edge ct lake route=hvh'] },
        { say: 'Data events như đọc ghi object S3 hay gọi Lambda không bật mặc định và có tính phí. Insights events phát hiện lượng API bất thường.', do: ['note d 90 470 560 "<b>Management</b>: mặc định · <b>Data events</b>: phải bật, tính phí · <b>Insights</b>: API bất thường" c=go'] },
        { say: 'Nhớ cặp này: CloudTrail cho biết ai đã đổi. AWS Config cho biết cấu hình trước và sau khi đổi.', do: ['tip "<b>CloudTrail</b> = AI đã làm gì. <b>Config</b> = cấu hình TRƯỚC và SAU ra sao."'] },
      ],
    },
    {
      title: 'Nhớ gì khi đi thi',
      panel: [90, 140, 1100],
      steps: [
        { say: 'Tóm tắt bài này.', do: [] },
        { say: 'Log group là nơi đặt retention, mã hoá và filter. Mặc định giữ mãi mãi.', do: ['li "Log group: retention, KMS, filter. Mặc định <b>Never expire</b>"'] },
        { say: 'Alarm từ log thì dùng metric filter với default value bằng 0.', do: ['li "Alarm từ log → <b>metric filter</b>, default value = 0" c=ok'] },
        { say: 'Tìm kiếm và thống kê trên log, kể cả log cũ, dùng Logs Insights.', do: ['li "Tìm, thống kê log (cả log cũ) → <b>Logs Insights</b>" c=blue'] },
        { say: 'Gần thời gian thực thì subscription filter, lưu trữ lâu thì S3 và Glacier.', do: ['li "Thời gian thực → <b>subscription filter</b>. Lưu lâu → <b>S3 + Glacier</b>"'] },
        { say: 'Và ai đã làm gì thì hỏi CloudTrail.', do: ['li "Ai đã làm gì → <b>CloudTrail</b>. Cấu hình trước / sau → <b>Config</b>" c=bad'] },
      ],
    },
  ],
};
