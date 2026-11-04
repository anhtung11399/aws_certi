// Kịch bản video: VPC và xử lý sự cố mạng
export default {
  scenes: [
    {
      title: 'Đường ra Internet của một VPC',
      groups: {
        vpc: [200, 140, 760, 440, 'vpc', 'VPC 10.0.0.0/16'],
        pub: [240, 190, 300, 360, 'public', 'Public subnet'],
        prv: [610, 190, 310, 360, 'private', 'Private subnet'],
      },
      nodes: {
        igw: [1100, 265, 'igw', 'Internet Gateway'],
        web: [390, 265, 'ec2', 'Web', 'có IP public'],
        nat: [390, 470, 'nat', 'NAT Gateway', 'đặt ở public subnet'],
        app: [765, 330, 'ec2', 'App', 'chỉ IP private'],
      },
      steps: [
        { say: 'Subnet public là subnet có route 0.0.0.0/0 trỏ tới Internet Gateway. Máy trong đó cần thêm IP public.', do: ['show vpc,pub,igw,web', 'edge web igw "0.0.0.0/0 → IGW" c=ok', 'flow web igw'] },
        { say: 'Subnet private không có đường thẳng ra Internet. Muốn tải bản vá thì đi qua NAT Gateway.', do: ['show prv,app', 'show nat @0.4', 'edge app nat "0.0.0.0/0 → NAT" c=go route=hv', 'flow app nat'] },
        { say: 'NAT Gateway phải đặt trong subnet public, và subnet đó có route ra Internet Gateway.', do: ['edge nat igw c=go route=hv', 'flow nat igw @0.4'] },
        { say: 'Lỗi kinh điển: đặt NAT Gateway trong subnet private. Lưu lượng không bao giờ ra được Internet.', do: ['tip "NAT Gateway phải ở <b>public subnet</b>. Cao sẵn sàng → <b>mỗi AZ một NAT</b>, route table của từng AZ trỏ NAT cùng AZ."'] },
      ],
    },
    {
      title: 'Security group và NACL',
      groups: { sub: [380, 150, 520, 400, 'public', 'Subnet · NACL (stateless)'] },
      nodes: {
        u: [150, 350, 'users', 'Client', 'cổng nguồn 50000'],
        sg: [640, 350, 'sg', 'Security group', 'stateful'],
        ec2: [1080, 350, 'ec2', 'EC2 :443'],
      },
      steps: [
        { say: 'Security group gắn vào card mạng. Nó stateful: cho phép chiều vào thì chiều trả lời tự được ra.', do: ['show u,sg,ec2', 'edge u sg "443 vào"', 'edge sg ec2', 'flow u sg', 'flow sg ec2 @1.2'] },
        { say: 'NACL gắn vào subnet. Nó stateless: chiều trả lời cũng phải có rule cho phép.', do: ['show sub'] },
        { say: 'Chiều trả lời dùng cổng tạm của client, từ 1024 tới 65535. Quên mở dải này ở NACL chiều ra là kết nối treo.', do: ['flow sg u c=bad', 'note n 380 470 520 "NACL outbound phải mở <b>1024–65535</b> (ephemeral ports)" c=bad'] },
        { say: 'Security group chỉ có Allow. NACL có cả Allow và Deny, xét theo số thứ tự từ nhỏ tới lớn. Muốn chặn một IP cụ thể thì dùng NACL.', do: ['tip "<b>SG</b>: stateful, chỉ Allow, theo ENI. <b>NACL</b>: stateless, Allow + Deny, theo số thứ tự. Chặn một IP → <b>NACL Deny</b>."'] },
      ],
    },
    {
      title: 'VPC endpoint',
      groups: { prv: [80, 150, 560, 400, 'private', 'Private subnet · không NAT'] },
      nodes: {
        ec2: [220, 350, 'ec2', 'EC2'],
        gw: [500, 240, 'endpoint', 'Gateway endpoint', 'S3, DynamoDB · miễn phí'],
        ifc: [500, 460, 'endpoint', 'Interface endpoint', 'ENI + DNS private · tính phí'],
        s3: [960, 240, 's3', 'S3'],
        ssm: [960, 460, 'ssm', 'SSM, KMS, ECR...'],
      },
      steps: [
        { say: 'Máy trong private subnet gọi dịch vụ AWS mà không qua Internet, dùng VPC endpoint.', do: ['show prv,ec2'] },
        { say: 'Gateway endpoint chỉ cho S3 và DynamoDB, là một route trong route table, và miễn phí.', do: ['show gw,s3', 'edge ec2 gw route=hvh', 'edge gw s3 c=ok', 'flow ec2 gw', 'flow gw s3 @1.2'] },
        { say: 'Interface endpoint cho hầu hết dịch vụ khác: tạo một card mạng có IP private trong subnet, tính phí theo giờ.', do: ['show ifc,ssm', 'edge ec2 ifc route=hvh', 'edge ifc ssm c=ok', 'flow ec2 ifc', 'flow ifc ssm @1.2'] },
        { say: 'Interface endpoint cần bật private DNS, và security group của endpoint phải cho cổng 443 từ máy gọi.', do: ['tip "Interface endpoint lỗi: chưa bật <b>private DNS</b>, hoặc <b>SG của endpoint</b> chưa mở 443. Gateway endpoint lỗi: thiếu route / endpoint policy chặn."'] },
      ],
    },
    {
      title: 'Công cụ chẩn đoán',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Bốn công cụ để tìm lỗi mạng.', do: [] },
        { say: 'VPC Flow Logs ghi thông tin từng luồng: IP, cổng, ACCEPT hay REJECT. Không ghi nội dung gói tin.', do: ['li "<b>VPC Flow Logs</b>: IP, cổng, <b>ACCEPT / REJECT</b>, không có nội dung gói tin" c=ok'] },
        { say: 'Mẹo đọc flow log: chiều vào ACCEPT mà chiều ra REJECT là NACL chặn, vì security group stateful không bao giờ chặn chiều trả lời.', do: ['li "Vào ACCEPT + ra REJECT → <b>NACL</b> chặn chiều trả lời" c=bad'] },
        { say: 'Reachability Analyzer phân tích cấu hình, không gửi gói tin, và chỉ ra chính xác thành phần đang chặn đường đi giữa hai điểm.', do: ['li "<b>Reachability Analyzer</b>: chỉ ra thành phần chặn giữa A và B, không gửi gói tin" c=blue'] },
        { say: 'Network Access Analyzer tìm đường truy cập không mong muốn. Traffic Mirroring sao chép gói tin thật để phân tích sâu.', do: ['li "<b>Network Access Analyzer</b>: đường truy cập ngoài ý muốn · <b>Traffic Mirroring</b>: copy gói tin"'] },
      ],
    },
    {
      title: 'Sự cố kinh điển: không ra được Internet',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Máy trong private subnet không tải được bản vá. Kiểm tra theo thứ tự này.', do: [] },
        { say: 'Một: route table của subnet có 0.0.0.0/0 trỏ tới NAT Gateway chưa.', do: ['li "1. Route table subnet private: <b>0.0.0.0/0 → NAT</b>"'] },
        { say: 'Hai: NAT Gateway có nằm trong subnet public có route ra Internet Gateway không.', do: ['li "2. NAT ở <b>public subnet</b>, subnet đó <b>0.0.0.0/0 → IGW</b>" c=ok'] },
        { say: 'Ba: security group chiều ra và NACL cả hai chiều, nhớ dải cổng tạm.', do: ['li "3. SG outbound · NACL <b>hai chiều</b> + ephemeral ports" c=blue'] },
        { say: 'Bốn: DNS của VPC đã bật chưa: enableDnsSupport và enableDnsHostnames.', do: ['li "4. <b>enableDnsSupport</b> + <b>enableDnsHostnames</b>" c=bad'] },
        { say: 'Và metric của NAT Gateway: ErrorPortAllocation tăng là hết cổng nguồn tới một đích.', do: ['tip "NAT: <b>ErrorPortAllocation</b> → quá nhiều kết nối tới cùng đích. <b>PacketsDropCount</b> → NAT quá tải."'] },
      ],
    },
  ],
};
