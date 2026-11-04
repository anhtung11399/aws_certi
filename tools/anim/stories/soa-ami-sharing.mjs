// Kịch bản video: AMI, Image Builder, chia sẻ tài nguyên
export default {
  scenes: [
    {
      title: 'AMI thuộc về một Region',
      groups: { r1: [80, 160, 420, 360, 'region', 'ap-southeast-1'], r2: [780, 160, 420, 360, 'region', 'us-east-1'] },
      nodes: {
        ec2: [180, 330, 'ec2', 'EC2 mẫu'],
        ami: [390, 330, 'ami', 'AMI', 'snapshot + launch permission'],
        ami2: [990, 330, 'ami', 'AMI bản copy', 'ID khác'],
      },
      steps: [
        { say: 'AMI là khuôn để tạo máy, gồm snapshot các ổ đĩa và quyền ai được dùng.', do: ['show r1,ec2', 'show ami @0.5', 'edge ec2 ami "create image"', 'flow ec2 ami'] },
        { say: 'Khi tạo AMI, máy mặc định bị khởi động lại để dữ liệu trên đĩa nhất quán.', do: ['badge ec2 "reboot" c=go'] },
        { say: 'AMI chỉ dùng được trong Region của nó. Muốn dùng ở Region khác phải copy, và bản copy có ID khác.', do: ['show r2,ami2', 'edge ami ami2 "copy" c=go', 'flow ami ami2'] },
        { say: 'Vì ID khác nhau theo Region, đừng ghi cứng ID. Lấy AMI mới nhất của AWS qua public parameter của Parameter Store.', do: ['tip "AMI theo <b>Region</b> → phải copy. ID AMI mới nhất → <code>/aws/service/ami-amazon-linux-latest/...</code> trong Parameter Store."'] },
      ],
    },
    {
      title: 'Chia sẻ AMI có mã hoá',
      groups: { a: [80, 160, 460, 360, 'account', 'Account A (chủ AMI)'], b: [740, 160, 460, 360, 'account', 'Account B'] },
      nodes: {
        ami: [220, 280, 'ami', 'AMI', 'snapshot mã hoá'],
        key: [220, 440, 'kms', 'Customer managed key'],
        u: [970, 330, 'ec2', 'Launch từ AMI'],
      },
      steps: [
        { say: 'Chia sẻ AMI bằng cách thêm account, OU hay Organization vào launch permission.', do: ['show a,b,ami', 'show u @0.4', 'edge ami u "launch permission" c=ok', 'flow ami u'] },
        { say: 'Nhưng nếu snapshot mã hoá bằng khoá mặc định của AWS, account khác không dùng được. Phải dùng customer managed key.', do: ['show key', 'bad u @0.4', 'badge u "lỗi KMS" c=bad'] },
        { say: 'Và cấp quyền khoá đó cho account nhận. Thiếu quyền khoá thì máy vừa tạo đã bị terminated.', do: ['edge key u "kms:CreateGrant, Decrypt" c=go', 'flow key u'] },
        { say: 'Chặn chia sẻ AMI công khai bằng Block public access for AMIs, mặc định đã bật cho account mới.', do: ['tip "AMI mã hoá chia sẻ cho account khác → <b>customer managed key</b> + cấp quyền key. Thiếu quyền → instance chuyển ngay sang <b>terminated</b>."'] },
      ],
    },
    {
      title: 'EC2 Image Builder: golden AMI tự động',
      nodes: {
        src: [130, 330, 'ami', 'Image gốc', 'Amazon Linux'],
        bld: [400, 330, 'imagebuilder', 'Build', 'vá lỗi, cài agent, CIS'],
        tst: [660, 330, 'imagebuilder', 'Test', 'kiểm thử'],
        r1: [960, 190, 'ami', 'AMI Region 1'],
        r2: [960, 330, 'ami', 'AMI Region 2'],
        lt: [960, 470, 'asg', 'Launch template', 'ASG dùng AMI mới'],
      },
      steps: [
        { say: 'Golden AMI là AMI chuẩn của công ty: đã vá lỗi, cài agent, cứng hoá bảo mật. Image Builder dựng nó tự động theo pipeline.', do: ['show src,bld', 'edge src bld', 'flow src bld'] },
        { say: 'Bước build chạy các component như cập nhật hệ điều hành, cài CloudWatch agent. Bước test kiểm tra ảnh trước khi phát hành.', do: ['show tst', 'edge bld tst', 'flow bld tst', 'ok tst @1.0'] },
        { say: 'Bước phân phối copy AMI sang nhiều Region, nhiều account, và tự cập nhật launch template để Auto Scaling dùng ngay AMI mới.', do: ['show r1,r2,lt', 'edge tst r1 c=ok', 'edge tst r2 c=ok', 'edge tst lt c=ok', 'flow tst r1', 'flow tst r2 @1.4', 'flow tst lt @1.7'] },
        { say: 'Pipeline chạy theo lịch hoặc khi image gốc có bản mới. Lifecycle policy tự dọn AMI cũ.', do: ['tip "Golden AMI vá lỗi, kiểm thử, phân phối nhiều Region / account, ít công sức → <b>EC2 Image Builder</b>."'] },
      ],
    },
    {
      title: 'Container image trên ECR',
      groups: { vpc: [380, 150, 440, 400, 'private', 'Private subnet'] },
      nodes: {
        ecs: [520, 330, 'ecs', 'ECS task', 'execution role'],
        ecr: [1080, 190, 'ecr', 'ECR', 'ecr.api, ecr.dkr'],
        s3: [1080, 470, 's3', 'S3', 'chứa các layer'],
        ep1: [700, 250, 'endpoint', 'Interface endpoint'],
        ep2: [700, 430, 'endpoint', 'Gateway endpoint S3'],
      },
      steps: [
        { say: 'ECR lưu container image. Task ECS trong private subnet không kéo được image là lỗi rất hay gặp.', do: ['show vpc,ecs,ecr', 'badge ecs "CannotPullContainerError" c=bad'] },
        { say: 'Không có NAT thì cần interface endpoint cho ecr.api và ecr.dkr.', do: ['show ep1', 'edge ecs ep1', 'edge ep1 ecr c=ok', 'flow ecs ep1', 'flow ep1 ecr @1.2'] },
        { say: 'Và gateway endpoint cho S3, vì các lớp của image thực ra nằm trên S3. Đây là chỗ hay quên nhất.', do: ['show ep2,s3', 'edge ecs ep2', 'edge ep2 s3 c=ok', 'flow ep2 s3', 'hl ep2 @1.0'] },
        { say: 'Execution role của task cũng phải có quyền lấy token và kéo image.', do: ['tip "ECS private subnet kéo image: endpoint <b>ecr.api + ecr.dkr + S3 gateway</b>, execution role có <code>ecr:GetAuthorizationToken</code>, <code>BatchGetImage</code>."'] },
      ],
    },
    {
      title: 'AWS RAM: dùng chung tài nguyên',
      groups: { net: [80, 160, 460, 380, 'account', 'Account mạng'], app: [740, 160, 460, 380, 'account', 'Account ứng dụng'] },
      nodes: {
        vpc: [310, 270, 'vpc', 'VPC + subnet', 'chủ sở hữu'],
        tgw: [310, 450, 'tgw', 'Transit Gateway'],
        ram: [640, 360, 'ram', 'AWS RAM'],
        ec2: [970, 270, 'ec2', 'EC2 trong subnet', 'được chia sẻ'],
        att: [970, 450, 'vpc', 'VPC attachment'],
      },
      steps: [
        { say: 'AWS RAM chia sẻ tài nguyên giữa các account, không cần sao chép.', do: ['show net,app,vpc,tgw,ram'] },
        { say: 'VPC sharing: account mạng sở hữu VPC, account ứng dụng tạo máy ngay trong subnet được chia sẻ. Nhưng không sửa được route table hay NACL.', do: ['show ec2', 'edge vpc ram', 'edge ram ec2 c=ok', 'flow ram ec2'] },
        { say: 'Transit Gateway, Resolver rules, prefix list, Capacity Reservation cũng chia sẻ được.', do: ['show att', 'edge tgw ram', 'edge ram att c=ok', 'flow ram att'] },
        { say: 'Trong cùng Organization, bật chia sẻ với Organizations để không cần chấp nhận lời mời.', do: ['tip "Một VPC dùng chung cho nhiều account → <b>VPC sharing qua RAM</b>. Trong Organization: bật <b>sharing with AWS Organizations</b>."'] },
      ],
    },
    {
      title: 'Service Quotas và Service Catalog',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Hai dịch vụ nhỏ nhưng hay thi.', do: [] },
        { say: 'Service Quotas: xem và xin tăng giới hạn như số vCPU, số Elastic IP. Đặt CloudWatch alarm khi mức dùng gần chạm giới hạn.', do: ['li "<b>Service Quotas</b>: xin tăng giới hạn, <b>alarm trên usage</b>, quota request template cho account mới" c=ok'] },
        { say: 'Trusted Advisor cũng có kiểm tra service limits và gửi sự kiện khi gần chạm.', do: ['li "<b>Trusted Advisor</b> Service Limits check → event EventBridge"'] },
        { say: 'Service Catalog: danh mục sản phẩm đã duyệt. Người dùng tự tạo tài nguyên mà không cần quyền trực tiếp, nhờ launch constraint dùng role riêng.', do: ['li "<b>Service Catalog</b>: sản phẩm đã duyệt, người dùng launch qua <b>launch constraint role</b>" c=blue'] },
      ],
    },
  ],
};
