// Kịch bản video: Chiến lược deploy và tự động hoá
export default {
  scenes: [
    {
      title: 'Các chiến lược deploy',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Sáu chiến lược deploy, xếp từ đơn giản tới an toàn nhất.', do: [] },
        { say: 'All at once: cập nhật mọi máy cùng lúc. Nhanh nhưng có downtime.', do: ['li "<b>All at once</b>: nhanh, <b>có downtime</b>" c=bad'] },
        { say: 'Rolling: cập nhật từng nhóm. Không downtime, nhưng trong lúc deploy năng lực bị giảm. Rolling with additional batch thêm một nhóm máy trước để giữ đủ năng lực.', do: ['li "<b>Rolling</b>: từng nhóm, giảm năng lực · <b>+ additional batch</b>: giữ đủ năng lực"'] },
        { say: 'Immutable: dựng nhóm máy mới hoàn toàn, khoẻ thì chuyển sang, rồi xoá nhóm cũ. Rollback nhanh.', do: ['li "<b>Immutable</b>: nhóm máy MỚI, rollback = xoá nhóm mới" c=ok'] },
        { say: 'Blue green: môi trường mới song song, chuyển traffic một lần. Rollback nhanh nhất. Canary chuyển dần, mười phần trăm rồi một trăm phần trăm.', do: ['li "<b>Blue/Green</b>: chuyển traffic, rollback nhanh nhất · <b>Canary</b>: 10% → 100%" c=blue'] },
      ],
    },
    {
      title: 'Blue/Green với ALB',
      nodes: {
        u: [130, 330, 'users', 'Người dùng'],
        alb: [430, 330, 'alb', 'ALB listener'],
        blue: [830, 210, 'asg', 'Blue', 'v1 đang chạy'],
        green: [830, 450, 'asg', 'Green', 'v2 mới'],
      },
      steps: [
        { say: 'Bản v1 đang chạy trên môi trường blue.', do: ['show u,alb,blue', 'edge u alb', 'edge alb blue "100%" c=blue', 'flow u alb', 'flow alb blue @1.0'] },
        { say: 'Dựng môi trường green với bản v2, kiểm tra kỹ khi chưa có người dùng thật.', do: ['show green', 'ok green @0.6'] },
        { say: 'Chuyển traffic sang green. Có lỗi thì chuyển về blue ngay lập tức.', do: ['edge alb green "100%" c=ok', 'flow alb green c=ok', 'hide alb>blue @0.4'] },
        { say: 'Chi phí: gấp đôi số máy trong lúc deploy. Chú ý database dùng chung, cả hai phiên bản phải chạy được với cùng lược đồ.', do: ['tip "Rollback nhanh nhất → <b>Blue/Green</b>. Nâng cấp engine RDS ít downtime → <b>RDS Blue/Green Deployments</b>."'] },
      ],
    },
    {
      title: 'CodeDeploy',
      nodes: {
        cd: [170, 330, 'codedeploy', 'CodeDeploy'],
        ec2: [560, 190, 'ec2', 'EC2 / on-prem', 'agent + appspec.yml'],
        fn: [560, 330, 'lambda', 'Lambda alias', 'Canary10Percent5Minutes'],
        ecs: [560, 470, 'ecs', 'ECS', '2 target group'],
        al: [960, 330, 'alarm', 'Alarm', 'lỗi tăng → rollback'],
      },
      steps: [
        { say: 'CodeDeploy triển khai lên ba nền tảng.', do: ['show cd'] },
        { say: 'EC2 và máy on-premises: cần CodeDeploy agent, file appspec mô tả các bước và hook.', do: ['show ec2', 'edge cd ec2 route=hvh', 'flow cd ec2'] },
        { say: 'Lambda: chuyển traffic của alias giữa hai version. Ví dụ canary mười phần trăm trong năm phút rồi mới chuyển hết.', do: ['show fn', 'edge cd fn', 'flow cd fn'] },
        { say: 'ECS: blue green qua hai target group của load balancer.', do: ['show ecs', 'edge cd ecs route=hvh', 'flow cd ecs'] },
        { say: 'Gắn CloudWatch alarm vào deployment. Alarm kêu thì CodeDeploy tự rollback, thực chất là deploy lại bản cũ.', do: ['show al', 'edge fn al', 'badge al "ALARM" c=bad @0.6', 'tip 760 470 440 "Thứ tự hook EC2: ApplicationStop → BeforeInstall → AfterInstall → ApplicationStart → <b>ValidateService</b>"'] },
      ],
    },
    {
      title: 'Elastic Beanstalk',
      nodes: {
        app: [150, 330, 'beanstalk', 'Application'],
        ver: [430, 330, 's3', 'Version', 'gói code trên S3'],
        env: [730, 330, 'beanstalk', 'Environment', 'web / worker'],
        rds: [1060, 330, 'rds', 'RDS', 'tạo RIÊNG bên ngoài'],
      },
      steps: [
        { say: 'Elastic Beanstalk: tải code lên, Beanstalk lo máy chủ, load balancer, Auto Scaling.', do: ['show app,ver,env', 'edge app ver', 'edge ver env "deploy"', 'flow ver env'] },
        { say: 'Cấu hình thêm bằng thư mục ebextensions. Có sẵn các kiểu deploy: all at once, rolling, immutable, traffic splitting.', do: ['note e 380 470 540 "<code>.ebextensions/*.config</code> · <code>.platform/hooks</code>" c=go'] },
        { say: 'Đừng tạo database bên trong environment cho production. Xoá environment là mất luôn database. Tạo RDS riêng, truyền endpoint qua biến môi trường.', do: ['show rds', 'edge env rds "biến môi trường" c=ok', 'hl rds'] },
        { say: 'Blue green trong Beanstalk: clone environment, deploy bản mới vào bản clone, rồi swap URL.', do: ['tip "Beanstalk blue/green → <b>clone environment + Swap environment URLs</b>. DB production → <b>tạo ngoài</b> environment."'] },
      ],
    },
    {
      title: 'Container và Lambda ở góc vận hành',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Vài điểm vận hành của ECS và Lambda.', do: [] },
        { say: 'ECS có hai role: task role là quyền của ứng dụng, execution role để kéo image, đọc secret, ghi log.', do: ['li "ECS: <b>task role</b> = quyền ứng dụng · <b>execution role</b> = kéo image, secret, log"'] },
        { say: 'Deployment circuit breaker tự rollback khi task mới không khoẻ. Vào container gỡ lỗi bằng ECS Exec.', do: ['li "<b>Circuit breaker</b> tự rollback · <b>ECS Exec</b> vào container" c=ok'] },
        { say: 'Lambda bị throttle khi chạm concurrency, mặc định một nghìn mỗi Region. Cold start chống bằng provisioned concurrency.', do: ['li "Lambda <b>Throttles</b>: concurrency 1.000 / Region · cold start → <b>provisioned concurrency</b>" c=bad'] },
        { say: 'Lambda trong VPC mà gọi dịch vụ AWS bị timeout: thiếu NAT hoặc VPC endpoint. Lỗi kinh điển.', do: ['li "Lambda trong VPC timeout khi gọi AWS → thiếu <b>NAT / VPC endpoint</b>" c=blue'] },
      ],
    },
    {
      title: 'Tự động hoá theo sự kiện',
      nodes: {
        sch: [150, 200, 'scheduler', 'EventBridge Scheduler', '19:00 hằng ngày'],
        stop: [560, 200, 'ssm', 'AWS-StopEC2Instance', 'tag Env=dev'],
        s3: [150, 460, 's3', 'S3', 'ảnh mới'],
        fn: [560, 460, 'lambda', 'Lambda', 'tạo thumbnail'],
        out: [960, 460, 's3', 'Bucket thumbnail'],
      },
      steps: [
        { say: 'Hai mẫu tự động hoá hay gặp. Một: tối nào cũng tắt máy dev để tiết kiệm.', do: ['show sch,stop', 'edge sch stop c=go', 'flow sch stop'] },
        { say: 'EventBridge Scheduler gọi runbook AWS-StopEC2Instance cho mọi máy có tag dev. Sáng hôm sau một lịch khác bật lại.', do: ['ok stop @0.6'] },
        { say: 'Hai: ảnh tải lên S3 thì tạo ảnh thu nhỏ. S3 event notification gọi Lambda.', do: ['show s3,fn,out', 'edge s3 fn "ObjectCreated"', 'edge fn out', 'flow s3 fn', 'flow fn out @1.4'] },
        { say: 'Bẫy: Lambda ghi ảnh vào chính bucket nguồn sẽ tạo vòng lặp vô tận. Ghi sang bucket khác, hoặc lọc theo prefix.', do: ['tip "S3 → Lambda ghi lại <b>cùng bucket</b> = vòng lặp vô tận. Dùng bucket khác hoặc lọc <b>prefix / suffix</b>."'] },
      ],
    },
  ],
};
