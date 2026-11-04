// Kịch bản video: CloudWatch metrics và alarms
// Toạ độ trên khung 1280×720. Vùng vẽ: y 130–600 (trên là tiêu đề cảnh, dưới là phụ đề).
export default {
  scenes: [
    {
      title: 'CloudWatch làm gì',
      nodes: {
        ec2: [150, 200, 'ec2', 'EC2'],
        rds: [150, 340, 'rds', 'RDS'],
        fn: [150, 480, 'lambda', 'Lambda'],
        cw: [450, 340, 'cloudwatch', 'CloudWatch', 'Metrics'],
        al: [720, 340, 'alarm', 'Alarm'],
        sns: [1020, 200, 'sns', 'SNS', 'email, chat'],
        asg: [1020, 340, 'asg', 'Auto Scaling', 'thêm máy'],
        ssm: [1020, 480, 'ssm', 'SSM Automation', 'tự sửa lỗi'],
      },
      steps: [
        { say: 'Làm sao biết hệ thống đang khoẻ hay đang ốm, và tự động làm gì khi nó ốm? Đó là việc của CloudWatch.', do: ['show ec2,rds,fn'] },
        { say: 'Mọi dịch vụ AWS tự gửi số đo, gọi là metric, về CloudWatch. Không cần cài gì.', do: ['show cw', 'edge ec2 cw "CPUUtilization"', 'edge rds cw', 'edge fn cw', 'flow ec2 cw', 'flow rds cw @1.6', 'flow fn cw @1.9'] },
        { say: 'Alarm theo dõi một metric. Bình thường nó ở trạng thái OK.', do: ['show al', 'edge cw al', 'badge al "OK" c=ok'] },
        { say: 'Khi metric vượt ngưỡng, alarm chuyển sang ALARM.', do: ['flow cw al c=bad', 'badge al "ALARM" c=bad @1.0', 'hl al @1.0'] },
        { say: 'Và kích hoạt hành động: gửi thông báo, thêm máy, hoặc chạy kịch bản tự khắc phục.', do: ['show sns,asg,ssm', 'edge al sns c=bad', 'edge al asg c=bad', 'edge al ssm c=bad', 'flow al sns', 'flow al asg @1.9', 'flow al ssm @2.2'] },
        { say: 'Nhớ chuỗi này: metric, alarm, hành động. Gần như mọi câu về giám sát trong đề đều xoay quanh nó.', do: ['big "Metric → Alarm → Action" "chuỗi giám sát cốt lõi của đề SOA"'] },
      ],
    },
    {
      title: 'Một metric gồm những gì',
      steps: [
        { say: 'Mỗi metric được xác định bởi ba thứ: namespace, tên metric, và dimensions.', do: [
          'note n1 120 190 300 "<b>Namespace</b><br><code>AWS/EC2</code><br>nhóm chứa metric"',
          'note n2 490 190 300 "<b>Tên metric</b><br><code>CPUUtilization</code><br>con số được đo"',
          'note n3 860 190 300 "<b>Dimensions</b><br><code>InstanceId=i-0abc</code><br>phân biệt từng máy"'] },
        { say: 'Dịch vụ AWS dùng namespace bắt đầu bằng chữ AWS. Metric của CloudWatch agent nằm trong namespace CWAgent.', do: ['note n4 120 370 1040 "Dịch vụ AWS: <code>AWS/EC2</code>, <code>AWS/ApplicationELB</code>, <code>AWS/RDS</code>. Agent: <code>CWAgent</code>. Của bạn: <code>MyApp</code>" c=go'] },
        { say: 'Bẫy số một của đề: chỉ cần khác một dimension là thành một metric khác hẳn.', do: ['note n5 120 470 1040 "Gửi metric với <code>InstanceId</code>, nhưng alarm tạo với <code>InstanceId + InstanceType</code> → hai metric khác nhau → alarm nằm ở <b>INSUFFICIENT_DATA</b> mãi" c=bad'] },
      ],
    },
    {
      title: 'Bẫy dimension: alarm không bao giờ kêu',
      nodes: {
        app: [170, 330, 'ec2', 'EC2 + agent'],
        m1: [520, 230, 'cloudwatch', 'mem_used_percent', 'InstanceId'],
        m2: [520, 440, 'cloudwatch', 'mem_used_percent', 'InstanceId, InstanceType'],
        al: [920, 440, 'alarm', 'Alarm RAM'],
      },
      steps: [
        { say: 'Agent gửi metric RAM chỉ kèm dimension InstanceId.', do: ['show app,m1', 'edge app m1 "có dữ liệu" c=ok route=vh', 'flow app m1'] },
        { say: 'Nhưng alarm lại được tạo cho metric có thêm InstanceType. Metric đó không hề nhận dữ liệu.', do: ['show m2,al', 'edge m2 al', 'bad m2 @0.8'] },
        { say: 'Kết quả: alarm kẹt ở INSUFFICIENT_DATA. Sửa bằng cách tạo alarm đúng bộ dimension mà agent đang gửi.', do: ['badge al "INSUFFICIENT_DATA"', 'hl al', 'tip 760 150 440 "Alarm kẹt ở <b>INSUFFICIENT_DATA</b>? Kiểm tra: namespace, dimension, Region, và period có nhỏ hơn tần suất gửi metric không."'] },
      ],
    },
    {
      title: 'Độ phân giải và thời gian lưu',
      panel: [90, 150, 600],
      steps: [
        { say: 'EC2 mặc định gửi metric 5 phút một lần, gọi là basic monitoring. Bật detailed monitoring thì 1 phút một lần, có tính phí.', do: ['li "<b>Basic</b>: 5 phút, miễn phí"', 'li "<b>Detailed</b>: 1 phút, trả phí" c=blue'] },
        { say: 'Metric tuỳ chỉnh có thể là high resolution, tới 1 giây một điểm.', do: ['li "<b>High-resolution</b>: 1 giây (custom metric, StorageResolution=1)" c=ok'] },
        { say: 'Dữ liệu càng chi tiết thì giữ càng ngắn: dưới 1 phút giữ 3 giờ, 1 phút giữ 15 ngày, 5 phút giữ 63 ngày, 1 giờ giữ 15 tháng.', do: [
          'note r1 760 150 420 "<b>&lt; 60 giây</b> → giữ 3 giờ"',
          'note r2 760 230 420 "<b>1 phút</b> → giữ 15 ngày"',
          'note r3 760 310 420 "<b>5 phút</b> → giữ 63 ngày"',
          'note r4 760 390 420 "<b>1 giờ</b> → giữ 455 ngày (15 tháng)"'] },
        { say: 'Muốn giữ lâu hơn 15 tháng, dùng Metric Streams đẩy sang Firehose rồi về S3.', do: ['note r5 760 480 420 "Giữ lâu hơn: <b>Metric Streams</b> → Firehose → S3" c=go'] },
      ],
    },
    {
      title: 'Thiếu RAM và dung lượng đĩa? Cài CloudWatch agent',
      groups: { vpc: [330, 150, 340, 420, 'vpc', 'VPC'] },
      nodes: {
        hv: [150, 470, 'server', 'Hypervisor', 'chỉ thấy CPU, mạng'],
        ec2: [500, 250, 'ec2', 'EC2 + agent', 'role CWAgentServerPolicy'],
        ps: [150, 250, 'ssm', 'Parameter Store', 'cấu hình agent'],
        cwm: [900, 250, 'cloudwatch', 'Metrics', 'namespace CWAgent'],
        cwl: [900, 460, 'logs', 'Logs', '/app/web'],
      },
      steps: [
        { say: 'AWS chỉ nhìn được máy ảo từ bên ngoài, qua hypervisor. Nó thấy CPU, mạng, đĩa, nhưng không thấy RAM hay dung lượng ổ đĩa đã dùng.', do: ['show hv', 'note x1 30 330 290 "Không có: <b>RAM</b>, <b>% ổ đĩa</b>, process" c=bad'] },
        { say: 'Muốn có, phải cài CloudWatch agent vào trong máy, kèm IAM role có quyền gửi metric.', do: ['show vpc,ec2', 'hl ec2'] },
        { say: 'Cấu hình agent lưu trên Parameter Store, cài và cập nhật hàng loạt bằng Systems Manager.', do: ['hide x1', 'show ps', 'edge ps ec2 "Run Command"', 'flow ps ec2'] },
        { say: 'Agent gửi metric RAM, ổ đĩa về namespace CWAgent, và đẩy file log lên CloudWatch Logs.', do: ['show cwm,cwl', 'edge ec2 cwm "mem, disk" c=ok', 'edge ec2 cwl "file log" c=ok route=vh', 'flow ec2 cwm', 'flow ec2 cwl @1.8'] },
        { say: 'Muốn alarm RAM cho cả Auto Scaling group, thêm aggregation dimensions theo AutoScalingGroupName trong cấu hình agent.', do: ['tip "RAM theo cả nhóm máy: <code>aggregation_dimensions</code> = <code>AutoScalingGroupName</code>"'] },
      ],
    },
    {
      title: 'Alarm: M trong N period',
      nodes: { al: [1080, 340, 'alarm', 'Alarm CPU'] },
      steps: [
        { say: 'Alarm đánh giá metric theo từng period. Ví dụ: trung bình CPU mỗi 1 phút, ngưỡng 80 phần trăm.', do: ['chart c 70 140 860 340 vals=45,52,48,86,61,90,84,70 thr=80 "ngưỡng 80%" dur=3', 'show al @0.3', 'badge al "OK" c=ok @0.4'] },
        { say: 'Evaluation periods là N: xét bao nhiêu period gần nhất. Datapoints to alarm là M: cần bao nhiêu điểm vượt ngưỡng.', do: ['window c 410 930 y=155 h=310', 'note m 70 500 460 "N = 5 period gần nhất, M = 3 điểm vượt"'] },
        { say: 'Trong 5 điểm gần nhất có 3 điểm vượt 80, nên alarm chuyển sang ALARM. Một đỉnh đơn lẻ thì không đủ, nhờ vậy bớt báo động giả.', do: ['badge al "ALARM" c=bad', 'hl al'] },
        { say: 'Period phải lớn hơn hoặc bằng tần suất gửi metric. Đặt period 1 phút cho metric 5 phút thì alarm thiếu dữ liệu.', do: ['tip "Period alarm ≥ tần suất metric. Basic EC2 = 5 phút."'] },
      ],
    },
    {
      title: 'Không có dữ liệu thì tính sao',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Khi period không có điểm dữ liệu, alarm xử lý theo tuỳ chọn missing data treatment. Đề rất hay hỏi phần này.', do: [] },
        { say: 'Metric chỉ xuất hiện khi có lỗi, như số lỗi đếm từ log: chọn notBreaching. Không có dữ liệu nghĩa là không có lỗi.', do: ['li "<b>notBreaching</b>: metric chỉ có khi có lỗi (đếm lỗi, metric filter) → không có dữ liệu = tốt" c=ok'] },
        { say: 'Heartbeat, tức ứng dụng phải gửi đều đặn: chọn breaching. Im lặng nghĩa là đã chết.', do: ['li "<b>breaching</b>: heartbeat phải gửi đều → im lặng = chết" c=bad'] },
        { say: 'Tài nguyên tắt bật theo lịch: chọn ignore để giữ nguyên trạng thái cũ.', do: ['li "<b>ignore</b>: tài nguyên tắt / bật theo lịch → giữ trạng thái cũ" c=blue'] },
        { say: 'Còn missing là mặc định: bỏ qua, có thể chuyển sang INSUFFICIENT_DATA.', do: ['li "<b>missing</b> (mặc định): bỏ qua, có thể thành INSUFFICIENT_DATA"'] },
      ],
    },
    {
      title: 'Alarm làm được những gì',
      nodes: {
        al: [520, 340, 'alarm', 'Alarm'],
        sns: [180, 200, 'sns', 'SNS', 'email, SMS, Lambda'],
        ec2: [180, 480, 'ec2', 'EC2 action', 'stop · reboot · recover'],
        asg: [860, 200, 'asg', 'Auto Scaling', 'step / simple policy'],
        ssm: [860, 340, 'ssm', 'Systems Manager', 'OpsItem, Incident'],
        evb: [860, 480, 'eventbridge', 'EventBridge', 'mọi target khác'],
      },
      steps: [
        { say: 'Một alarm gắn được năm loại hành động.', do: ['show al', 'badge al "ALARM" c=bad'] },
        { say: 'Gửi thông báo qua SNS: email, tin nhắn, gọi Lambda.', do: ['show sns', 'edge al sns c=bad route=hvh', 'flow al sns'] },
        { say: 'EC2 action: dừng, xoá, khởi động lại, hoặc recover máy.', do: ['show ec2', 'edge al ec2 c=bad route=hvh', 'flow al ec2'] },
        { say: 'Kích hoạt scaling policy của Auto Scaling, hoặc tạo OpsItem trong Systems Manager.', do: ['show asg,ssm', 'edge al asg c=bad', 'edge al ssm c=bad', 'flow al asg', 'flow al ssm @1.6'] },
        { say: 'Và mọi lần đổi trạng thái đều là một sự kiện trong EventBridge, nên nối được tới bất kỳ dịch vụ nào.', do: ['show evb', 'edge al evb c=bad', 'flow al evb'] },
        { say: 'Bẫy hay gặp: alarm đã ALARM mà không có email. Thường do subscription SNS chưa xác nhận, hoặc topic mã hoá KMS mà key policy chưa cho CloudWatch dùng.', do: ['tip "Có ALARM mà không có email: subscription chưa <b>confirm</b>, hoặc SNS mã hoá KMS chưa cho <code>cloudwatch.amazonaws.com</code>"'] },
      ],
    },
    {
      title: 'Status check và tự phục hồi EC2',
      groups: { h1: [120, 170, 330, 300, 'onprem', 'Máy chủ vật lý A'], h2: [760, 170, 330, 300, 'ok', 'Máy chủ vật lý B'] },
      nodes: {
        vm: [285, 320, 'ec2', 'EC2', 'IP, EBS giữ nguyên'],
        vm2: [925, 320, 'ec2', 'EC2', 'cùng ID, cùng IP'],
      },
      steps: [
        { say: 'EC2 có hai loại status check. System check kiểm tra phần cứng và máy chủ vật lý của AWS.', do: ['show h1,vm', 'note s1 120 500 520 "<b>System</b> status check: phần cứng, mạng, nguồn của AWS"'] },
        { say: 'Khi máy chủ vật lý hỏng, system check thất bại.', do: ['bad vm', 'badge vm "StatusCheckFailed_System" c=bad'] },
        { say: 'Alarm với hành động recover chuyển máy ảo sang máy chủ khác, giữ nguyên ID, IP riêng, IP đàn hồi và ổ EBS.', do: ['show h2', 'show vm2 @0.4', 'edge vm vm2 "recover" c=ok', 'flow vm vm2 c=ok', 'ok vm2 @1.6'] },
        { say: 'Còn instance check thất bại là lỗi bên trong hệ điều hành của bạn: hành động hợp lý là reboot.', do: ['note s2 680 500 520 "<b>Instance</b> status check: lỗi trong OS (hết RAM, kernel) → <b>reboot</b>" c=go'] },
        { say: 'Recover chỉ dùng với StatusCheckFailed_System, và không dùng được cho máy có instance store.', do: ['tip "<b>Recover</b> = StatusCheckFailed_System. Không hỗ trợ instance store."'] },
      ],
    },
    {
      title: 'Composite alarm: bớt bão cảnh báo',
      nodes: {
        a1: [170, 200, 'alarm', 'cpu-cao'],
        a2: [170, 340, 'alarm', 'loi-5xx-cao'],
        a3: [170, 480, 'alarm', 'dang-bao-tri'],
        ca: [600, 340, 'alarm', 'Composite alarm'],
        sns: [1000, 340, 'sns', 'SNS', 'một thông báo'],
      },
      steps: [
        { say: 'Mười alarm cùng kêu một lúc thì người trực không biết xem cái nào trước.', do: ['show a1,a2,a3', 'badge a1 "ALARM" c=bad', 'badge a2 "ALARM" c=bad @0.3'] },
        { say: 'Composite alarm gộp chúng bằng biểu thức: CPU cao và lỗi 5xx cao, nhưng không phải đang bảo trì.', do: ['show ca', 'edge a1 ca', 'edge a2 ca', 'edge a3 ca', 'note ex 470 480 600 "<code>ALARM(cpu-cao) AND ALARM(loi-5xx-cao) AND NOT ALARM(dang-bao-tri)</code>"'] },
        { say: 'Chỉ composite alarm gửi thông báo. Các alarm con im lặng.', do: ['badge ca "ALARM" c=bad', 'show sns', 'edge ca sns c=bad', 'flow ca sns'] },
        { say: 'Lưu ý: composite alarm không gắn được EC2 action hay Auto Scaling action.', do: ['tip 760 140 460 "Composite alarm: chỉ SNS, SSM, Lambda. <b>Không</b> EC2 action, <b>không</b> Auto Scaling."'] },
      ],
    },
    {
      title: 'Nhớ gì khi đi thi',
      panel: [90, 140, 1100],
      steps: [
        { say: 'Tóm lại năm điều.', do: [] },
        { say: 'Một, metric xác định bằng namespace, tên và đủ bộ dimensions.', do: ['li "Metric = <b>namespace + tên + dimensions</b>. Sai một dimension là metric khác"'] },
        { say: 'Hai, RAM và ổ đĩa cần CloudWatch agent.', do: ['li "RAM, % ổ đĩa, process → <b>CloudWatch agent</b> (namespace CWAgent)"'] },
        { say: 'Ba, alarm dùng M trong N period để bớt báo động giả.', do: ['li "Alarm: <b>M trong N</b> period, period ≥ tần suất metric"'] },
        { say: 'Bốn, chọn đúng cách xử lý thiếu dữ liệu: đếm lỗi là notBreaching, heartbeat là breaching.', do: ['li "Thiếu dữ liệu: đếm lỗi → <b>notBreaching</b>, heartbeat → <b>breaching</b>"'] },
        { say: 'Năm, recover dành cho lỗi system check, reboot dành cho lỗi instance check.', do: ['li "<b>System</b> check hỏng → recover. <b>Instance</b> check hỏng → reboot"'] },
      ],
    },
  ],
};
