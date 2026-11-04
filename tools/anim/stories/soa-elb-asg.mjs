// Kịch bản video: Load balancer và Auto Scaling
export default {
  scenes: [
    {
      title: 'Ba loại load balancer',
      nodes: {
        u: [130, 330, 'users', 'Người dùng'],
        alb: [480, 180, 'alb', 'ALB', 'tầng 7: HTTP, path, host'],
        nlb: [480, 330, 'nlb', 'NLB', 'tầng 4: TCP / UDP, IP tĩnh'],
        gw: [480, 480, 'gwlb', 'GWLB', 'tầng 3: qua tường lửa'],
        a: [880, 180, 'ec2', '/api → nhóm API'],
        n: [880, 330, 'ec2', 'game, IoT', 'giữ IP client'],
        f: [880, 480, 'nfw', 'Thiết bị bảo mật', 'GENEVE 6081'],
      },
      steps: [
        { say: 'AWS có ba loại load balancer, mỗi loại ở một tầng mạng khác nhau.', do: ['show u,alb,nlb,gw'] },
        { say: 'ALB ở tầng bảy, hiểu HTTP. Định tuyến theo đường dẫn, tên miền, header. Gửi được tới Lambda, xác thực được người dùng bằng Cognito.', do: ['show a', 'edge u alb route=hvh', 'edge alb a "path /api"', 'flow u alb', 'flow alb a @1.3'] },
        { say: 'NLB ở tầng bốn, cho TCP và UDP, cực nhanh, có IP tĩnh mỗi AZ và gắn được Elastic IP. Giữ nguyên IP của client.', do: ['show n', 'edge u nlb', 'edge nlb n', 'flow u nlb', 'flow nlb n @1.3'] },
        { say: 'GWLB ở tầng ba, chuyển toàn bộ lưu lượng qua các thiết bị tường lửa của bên thứ ba.', do: ['show f', 'edge u gw route=hvh', 'edge gw f', 'flow u gw', 'flow gw f @1.3'] },
        { say: 'Đề hỏi đối tác cần whitelist IP cố định của load balancer: chọn NLB với Elastic IP.', do: ['tip "IP tĩnh để whitelist → <b>NLB + Elastic IP</b>. Định tuyến theo path / host → <b>ALB</b>. Appliance bảo mật → <b>GWLB</b>."'] },
      ],
    },
    {
      title: 'Health check của target group',
      nodes: {
        alb: [180, 330, 'alb', 'ALB'],
        t1: [620, 190, 'ec2', 'Target 1'],
        t2: [620, 330, 'ec2', 'Target 2'],
        t3: [620, 470, 'ec2', 'Target 3', '/ trả 301'],
      },
      steps: [
        { say: 'ALB định kỳ gọi đường dẫn health check của từng target. Mặc định ba mươi giây một lần.', do: ['show alb,t1,t2,t3', 'edge alb t1', 'edge alb t2', 'edge alb t3', 'flow alb t1', 'flow alb t2 @1.2', 'flow alb t3 @1.4'] },
        { say: 'Cần năm lần liên tiếp thành công để coi là khoẻ, hai lần thất bại để coi là hỏng.', do: ['badge t1 "healthy" c=ok', 'badge t2 "healthy" c=ok', 'note n 820 170 380 "Healthy threshold <b>5</b> · Unhealthy <b>2</b> · Interval 30 s"'] },
        { say: 'Bẫy hay gặp: health check gọi trang chủ, trang chủ chuyển hướng 301, mà success code chỉ nhận 200. Target bị coi là hỏng dù vẫn chạy.', do: ['badge t3 "unhealthy" c=bad', 'bad t3 @0.4', 'note m 820 430 380 "Sửa: success code <b>200-399</b>, hoặc path <code>/health</code>" c=bad'] },
        { say: 'Deregistration delay mặc định 300 giây, chờ request đang chạy xong rồi mới rút target. Request ngắn thì giảm xuống để deploy nhanh hơn.', do: ['tip "<b>Deregistration delay</b> 300 s mặc định → giảm nếu request ngắn. Tất cả target hỏng → ALB vẫn gửi cho tất cả (<b>fail open</b>)."'] },
      ],
    },
    {
      title: 'Lỗi 502, 503, 504',
      nodes: {
        u: [130, 330, 'users', 'Client'],
        alb: [480, 330, 'alb', 'ALB'],
        t: [880, 330, 'ec2', 'Target'],
      },
      steps: [
        { say: 'Ba mã lỗi của ALB xuất hiện trong gần như mọi đề.', do: ['show u,alb,t', 'edge u alb', 'edge alb t'] },
        { say: '502 Bad Gateway: target đóng hoặc reset kết nối, trả response sai định dạng. Hay gặp khi keep-alive của web server ngắn hơn idle timeout của ALB.', do: ['badge alb "502" c=bad', 'note a 90 160 380 "<b>502</b>: target reset kết nối, response hỏng, keep-alive &lt; idle timeout" c=bad'] },
        { say: '503: không có target nào khoẻ, hoặc chưa đăng ký target nào.', do: ['badge alb "503" c=bad', 'note b 450 470 380 "<b>503</b>: không có target khoẻ / không có target" c=bad'] },
        { say: '504 Gateway Timeout: target không trả lời trong idle timeout, mặc định sáu mươi giây. Hoặc ALB không mở được kết nối vì security group chặn.', do: ['badge alb "504" c=bad', 'note c 810 160 380 "<b>504</b>: quá idle timeout 60 s, hoặc SG / NACL chặn" c=bad'] },
        { say: 'Muốn biết lỗi do load balancer hay do ứng dụng: so sánh HTTPCode_ELB_5XX với HTTPCode_Target_5XX.', do: ['tip "Lỗi do ai? <code>HTTPCode_ELB_5XX_Count</code> (do LB) và <code>HTTPCode_Target_5XX_Count</code> (do ứng dụng). Chi tiết: <b>access logs</b> vào S3."'] },
      ],
    },
    {
      title: 'Auto Scaling: scaling policy',
      nodes: { asg: [1080, 330, 'asg', 'Auto Scaling group', 'min 2 · max 10'] },
      steps: [
        { say: 'Target tracking là policy dễ nhất: giữ một metric quanh giá trị đích, ví dụ CPU trung bình năm mươi phần trăm. Auto Scaling tự tạo alarm.', do: ['chart c 70 140 900 360 vals=48,52,75,82,64,55,50,49 thr=50 "đích 50%" dur=3', 'show asg @0.3'] },
        { say: 'CPU vượt đích thì thêm máy, CPU về lại đích thì bớt máy.', do: ['badge asg "+2 máy" c=ok', 'hl asg'] },
        { say: 'Step scaling thêm bớt theo từng khoảng vượt ngưỡng. Scheduled scaling theo lịch. Predictive scaling dự báo từ mười bốn ngày lịch sử.', do: ['note p 70 520 900 "<b>Step</b>: theo khoảng vượt ngưỡng · <b>Scheduled</b>: theo lịch · <b>Predictive</b>: dự báo từ 14 ngày" c=go'] },
        { say: 'Worker đọc hàng đợi SQS: scale theo backlog mỗi máy, bằng số message chờ chia cho số máy.', do: ['tip "Worker SQS → metric tuỳ chỉnh <b>backlog per instance</b> = <code>ApproximateNumberOfMessagesVisible</code> / số máy."'] },
      ],
    },
    {
      title: 'Lifecycle hook',
      nodes: {
        pend: [150, 220, 'ec2', 'Pending'],
        pw: [450, 220, 'lambda', 'Pending:Wait', 'cài phần mềm'],
        ins: [760, 220, 'ec2', 'InService'],
        tw: [760, 450, 'lambda', 'Terminating:Wait', 'đẩy log, rút khỏi cluster'],
        term: [1080, 450, 'ec2', 'Terminated'],
      },
      steps: [
        { say: 'Máy trong Auto Scaling đi qua các trạng thái: pending, đang phục vụ, đang bị xoá.', do: ['show pend,ins', 'edge pend ins'] },
        { say: 'Lifecycle hook chèn một khoảng chờ khi máy mới lên, để cài phần mềm hay tải dữ liệu trước khi nhận traffic.', do: ['show pw', 'edge pend pw "hook" c=go', 'edge pw ins "CompleteLifecycleAction" c=ok', 'flow pend pw', 'flow pw ins @1.6'] },
        { say: 'Và một khoảng chờ trước khi máy bị xoá: đẩy log ra ngoài, rút khỏi cluster.', do: ['show tw,term', 'edge ins tw "scale-in" c=go', 'edge tw term c=ok', 'flow ins tw', 'flow tw term @1.6'] },
        { say: 'Sự kiện hook gửi qua EventBridge, SNS hay SQS. Xong việc thì gọi CompleteLifecycleAction. Mặc định chờ tối đa một giờ.', do: ['tip "\'Chạy script trước khi máy bị terminate\' → <b>lifecycle hook</b> (Terminating:Wait) + EventBridge + <b>CompleteLifecycleAction</b>."'] },
      ],
    },
    {
      title: 'Máy bị thay liên tục: vì sao',
      nodes: {
        asg: [180, 330, 'asg', 'ASG', 'health check: ELB'],
        m: [560, 330, 'ec2', 'EC2 mới', 'ứng dụng chưa kịp lên'],
        alb: [940, 330, 'alb', 'ALB', 'health check thất bại'],
      },
      steps: [
        { say: 'Máy vừa tạo đã bị terminate, rồi máy mới lại bị terminate. Vòng lặp không dừng.', do: ['show asg,m,alb', 'edge asg m "launch"', 'edge m alb both'] },
        { say: 'Thường do ASG dùng ELB health check, mà ứng dụng chưa khởi động xong đã bị kiểm tra và coi là hỏng.', do: ['badge alb "unhealthy" c=bad', 'bad m @0.6'] },
        { say: 'Sửa bằng health check grace period đủ dài, hoặc dùng lifecycle hook để ứng dụng sẵn sàng rồi mới vào phục vụ.', do: ['note g 330 470 620 "Tăng <b>health check grace period</b> · lifecycle hook · kiểm tra user data / AMI" c=ok'] },
        { say: 'Muốn gỡ lỗi một máy mà không bị thay: đặt máy ở trạng thái standby, hoặc tạm dừng tiến trình ReplaceUnhealthy.', do: ['tip "Gỡ lỗi máy không bị thay → <b>Standby</b> hoặc <b>suspend ReplaceUnhealthy</b>. Máy cần lên nhanh → <b>warm pool</b>."'] },
      ],
    },
    {
      title: 'Nhớ gì khi đi thi',
      panel: [90, 140, 1100],
      steps: [
        { say: 'Tóm tắt.', do: [] },
        { say: 'ALB cho HTTP, NLB cho TCP và IP tĩnh, GWLB cho tường lửa.', do: ['li "<b>ALB</b> HTTP · <b>NLB</b> TCP/UDP + IP tĩnh · <b>GWLB</b> appliance"'] },
        { say: '502 là target hỏng kết nối, 503 là không có target khoẻ, 504 là quá thời gian.', do: ['li "<b>502</b> target hỏng kết nối · <b>503</b> không target khoẻ · <b>504</b> timeout / SG" c=bad'] },
        { say: 'Target tracking là policy mặc định nên chọn. Worker hàng đợi scale theo backlog mỗi máy.', do: ['li "<b>Target tracking</b> trước tiên · SQS → <b>backlog per instance</b>" c=ok'] },
        { say: 'Việc cần làm trước khi máy vào hoặc rời nhóm: lifecycle hook.', do: ['li "Trước khi vào / rời nhóm → <b>lifecycle hook</b>" c=blue'] },
        { say: 'Máy bị thay liên tục: kiểm tra grace period và health check.', do: ['li "Bị thay liên tục → <b>grace period</b>, health check path, user data"'] },
      ],
    },
  ],
};
