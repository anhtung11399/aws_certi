// Kịch bản video: CloudFormation
export default {
  scenes: [
    {
      title: 'Template thành stack',
      nodes: {
        tpl: [150, 330, 'file', 'Template', 'YAML / JSON'],
        cfn: [480, 330, 'cfn', 'CloudFormation'],
        vpc: [880, 190, 'vpc', 'VPC'],
        ec2: [880, 330, 'ec2', 'EC2'],
        rds: [880, 470, 'rds', 'RDS', 'DeletionPolicy: Snapshot'],
      },
      steps: [
        { say: 'CloudFormation đọc template viết bằng YAML hoặc JSON, rồi tạo ra một stack gồm mọi tài nguyên trong đó.', do: ['show tpl,cfn', 'edge tpl cfn', 'flow tpl cfn'] },
        { say: 'Nó tự suy ra thứ tự tạo từ các tham chiếu Ref và GetAtt. Phụ thuộc ngầm thì khai báo DependsOn.', do: ['show vpc,ec2,rds', 'edge cfn vpc', 'edge cfn ec2', 'edge cfn rds', 'flow cfn vpc', 'flow cfn ec2 @1.5', 'flow cfn rds @1.8'] },
        { say: 'Xoá stack thì mọi tài nguyên bị xoá theo. Muốn giữ dữ liệu, đặt DeletionPolicy là Retain, hoặc Snapshot cho database và ổ EBS.', do: ['hl rds', 'note d 90 480 560 "<b>DeletionPolicy</b>: Delete (mặc định) · <b>Retain</b> · <b>Snapshot</b> (RDS, EBS, ElastiCache)" c=ok'] },
        { say: 'Mật khẩu không bao giờ viết trong template. Dùng dynamic reference tới Secrets Manager hoặc Parameter Store.', do: ['tip "Secret → <code>{{resolve:secretsmanager:...}}</code> hoặc <code>{{resolve:ssm-secure:...}}</code>, tham số dùng <b>NoEcho</b>."'] },
      ],
    },
    {
      title: 'Cập nhật an toàn với change set',
      nodes: {
        dev: [150, 330, 'admin', 'Kỹ sư', 'sửa template'],
        cs: [500, 330, 'cfn', 'Change set', 'xem trước'],
        db: [880, 210, 'rds', 'RDS', 'Replacement: True'],
        sg: [880, 450, 'sg', 'Security group', 'Modify'],
      },
      steps: [
        { say: 'Trước khi cập nhật stack, tạo change set để xem trước thay đổi.', do: ['show dev,cs', 'edge dev cs', 'flow dev cs'] },
        { say: 'Chú ý cột Replacement. True nghĩa là tài nguyên sẽ bị xoá và tạo mới, ví dụ khi đổi tên database. Dữ liệu sẽ mất.', do: ['show db,sg', 'edge cs db c=bad', 'edge cs sg c=ok', 'badge db "REPLACE" c=bad', 'badge sg "MODIFY" c=ok'] },
        { say: 'Bảo vệ thêm bằng stack policy để cấm thay thế database, và termination protection để chặn xoá cả stack.', do: ['note p 90 480 560 "<b>Stack policy</b>: cấm update / replace tài nguyên quan trọng<br><b>Termination protection</b>: chặn xoá stack" c=ok'] },
        { say: 'Rollback configuration gắn CloudWatch alarm. Alarm kêu trong lúc cập nhật thì stack tự rollback.', do: ['tip "Tránh mất dữ liệu khi xoá stack nhầm → <b>termination protection</b> + <b>DeletionPolicy Retain / Snapshot</b>."'] },
      ],
    },
    {
      title: 'Drift detection',
      nodes: {
        cfn: [200, 330, 'cfn', 'Stack', 'port 443'],
        sg: [600, 330, 'sg', 'Security group', 'thực tế: 443 + 22'],
        u: [1000, 330, 'admin', 'Ai đó sửa tay'],
      },
      steps: [
        { say: 'Template nói security group chỉ mở cổng 443.', do: ['show cfn,sg', 'edge cfn sg "443"'] },
        { say: 'Nhưng ai đó vào console mở thêm cổng 22 bằng tay.', do: ['show u', 'edge u sg "mở 22" c=bad', 'flow u sg c=bad'] },
        { say: 'Drift detection so sánh cấu hình thật với template, báo tài nguyên nào bị lệch.', do: ['badge sg "DRIFTED" c=bad', 'hl sg', 'tip "Phát hiện sửa tay ngoài CloudFormation → <b>drift detection</b>. Theo dõi liên tục → Config rule <code>cloudformation-stack-drift-detection-check</code>."'] },
      ],
    },
    {
      title: 'Cài phần mềm vào máy: cfn-init và cfn-signal',
      nodes: {
        cfn: [180, 330, 'cfn', 'CloudFormation', 'CreationPolicy: chờ 1 tín hiệu'],
        ec2: [620, 330, 'ec2', 'EC2', 'user data'],
        ok: [1040, 210, 'cfn', 'CREATE_COMPLETE'],
        bad: [1040, 450, 'cfn', 'Timeout → rollback'],
      },
      steps: [
        { say: 'Máy EC2 cần cài phần mềm xong mới coi là tạo thành công. User data gọi cfn-init đọc phần metadata để cài gói, tạo file, bật dịch vụ.', do: ['show cfn,ec2', 'edge cfn ec2 "tạo máy"', 'flow cfn ec2'] },
        { say: 'Cài xong, máy gọi cfn-signal báo về. CreationPolicy chờ đủ tín hiệu mới đánh dấu thành công.', do: ['show ok', 'edge ec2 ok "cfn-signal" c=ok', 'flow ec2 ok c=ok', 'ok ok @1.4'] },
        { say: 'Không nhận được tín hiệu trong thời gian chờ thì tạo thất bại và rollback. Thường do máy không ra được Internet để gọi về, hoặc script lỗi.', do: ['show bad', 'edge ec2 bad "không có tín hiệu" c=bad', 'bad bad @1.0'] },
        { say: 'cfn-hup chạy nền, áp lại cấu hình khi metadata thay đổi lúc cập nhật stack.', do: ['tip "<b>cfn-init</b> cài đặt · <b>cfn-signal</b> báo xong · <b>cfn-hup</b> áp lại khi update. Wait condition timeout → máy không gọi ra được / script lỗi."'] },
      ],
    },
    {
      title: 'Stack bị kẹt: xử lý thế nào',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Các trạng thái lỗi hay gặp trong đề.', do: [] },
        { say: 'CREATE_FAILED rồi rollback: xem tab Events, tìm sự kiện thất bại đầu tiên. Muốn giữ tài nguyên để điều tra, tắt rollback khi tạo.', do: ['li "<b>CREATE_FAILED</b>: tab Events, lỗi <b>đầu tiên</b>. Giữ tài nguyên để điều tra → disable rollback"'] },
        { say: 'UPDATE_ROLLBACK_FAILED thường do ai đó đã xoá tay một tài nguyên. Sửa nguyên nhân rồi chạy ContinueUpdateRollback, có thể bỏ qua tài nguyên lỗi.', do: ['li "<b>UPDATE_ROLLBACK_FAILED</b> → sửa nguyên nhân → <b>ContinueUpdateRollback</b> (có thể skip)" c=bad'] },
        { say: 'DELETE_FAILED: bucket S3 còn file, hoặc security group đang được tài nguyên ngoài stack dùng. Dọn trước, hoặc giữ lại tài nguyên đó.', do: ['li "<b>DELETE_FAILED</b>: bucket còn object, SG đang được dùng → dọn hoặc retain" c=blue'] },
        { say: 'Đang được stack khác ImportValue thì không xoá được output đã export.', do: ['li "Export đang bị <b>ImportValue</b> → không sửa / xoá được stack xuất" c=ok'] },
        { say: 'Thiếu quyền: dùng service role cho stack, người deploy không cần quyền rộng.', do: ['tip "Người deploy không có quyền rộng → gán <b>service role</b> cho stack (iam:PassRole)."'] },
      ],
    },
    {
      title: 'StackSets: nhiều account, nhiều Region',
      groups: { org: [380, 150, 840, 410, 'ou', 'Organization · OU Production'] },
      nodes: {
        adm: [170, 350, 'stackset', 'StackSet', 'account quản trị'],
        a1: [540, 250, 'cfn', 'Account A', 'ap-southeast-1'],
        a2: [800, 250, 'cfn', 'Account A', 'us-east-1'],
        a3: [540, 450, 'cfn', 'Account B', 'ap-southeast-1'],
        a4: [800, 450, 'cfn', 'Account B', 'us-east-1'],
        a5: [1080, 350, 'cfn', 'Account mới', 'tự triển khai'],
      },
      steps: [
        { say: 'StackSets triển khai cùng một template tới nhiều account và nhiều Region từ một chỗ.', do: ['show adm,org,a1,a2,a3,a4', 'edge adm a1', 'edge adm a3', 'flow adm a1', 'flow adm a3 @1.2'] },
        { say: 'Dùng với Organizations ở chế độ service-managed: không cần tự tạo role. Bật automatic deployment thì account mới vào OU tự được triển khai.', do: ['show a5', 'badge a5 "auto deploy" c=ok', 'hl a5'] },
        { say: 'Chế độ self-managed cần hai role: AWSCloudFormationStackSetAdministrationRole ở account quản trị, và ExecutionRole ở mỗi account đích.', do: ['note r 90 160 270 "Self-managed: <b>AdministrationRole</b> + <b>ExecutionRole</b>" c=go'] },
        { say: 'Điều chỉnh tốc độ bằng maximum concurrent accounts và failure tolerance.', do: ['tip "Triển khai cùng cấu hình cho mọi account trong OU, kể cả account mới → <b>StackSets service-managed + automatic deployment</b>."'] },
      ],
    },
    {
      title: 'CDK và các công cụ khác',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Ngoài viết YAML, có các cách khác.', do: [] },
        { say: 'AWS CDK: viết hạ tầng bằng TypeScript, Python, Java. Lệnh cdk synth sinh ra template CloudFormation, cdk deploy triển khai.', do: ['li "<b>CDK</b>: code → <code>cdk synth</code> → template CloudFormation. Cần <code>cdk bootstrap</code> mỗi account / Region" c=ok'] },
        { say: 'Lần đầu dùng CDK ở một account và Region phải chạy cdk bootstrap để tạo bucket và role.', do: [] },
        { say: 'SAM rút gọn template cho serverless. Service Catalog cho người dùng tự tạo sản phẩm đã duyệt mà không cần quyền trực tiếp.', do: ['li "<b>SAM</b>: serverless gọn hơn · <b>Service Catalog</b>: sản phẩm đã duyệt, launch constraint role" c=blue'] },
        { say: 'Hạ tầng đã có sẵn muốn đưa vào CloudFormation: dùng resource import, hoặc IaC generator.', do: ['li "Tài nguyên tạo tay → đưa vào stack bằng <b>resource import</b> / <b>IaC generator</b>"'] },
      ],
    },
  ],
};
