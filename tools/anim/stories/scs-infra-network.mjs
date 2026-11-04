// Kịch bản video: Bảo mật mạng
export default {
  scenes: [
    {
      title: 'Các lớp kiểm soát mạng',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Sáu lớp kiểm soát mạng, mỗi lớp làm một việc.', do: [] },
        { say: 'Security group ở card mạng, stateful, chỉ Allow. NACL ở subnet, stateless, có Deny, chặn nhanh một dải IP xấu.', do: ['li "<b>SG</b>: ENI, stateful, chỉ Allow · <b>NACL</b>: subnet, stateless, có Deny"'] },
        { say: 'Network Firewall ở cấp VPC: lọc stateful, IPS, lọc theo tên miền, giải mã TLS.', do: ['li "<b>Network Firewall</b>: Suricata IPS, lọc <b>tên miền</b> (SNI / Host), TLS inspection" c=ok'] },
        { say: 'DNS Firewall chặn truy vấn tới tên miền độc hại, và chặn rò dữ liệu qua DNS.', do: ['li "<b>DNS Firewall</b>: chặn tên miền xấu, DNS exfiltration" c=bad'] },
        { say: 'Gateway Load Balancer chèn thiết bị tường lửa của bên thứ ba. VPC Block Public Access chặn mọi đường ra vào Internet ở cấp account.', do: ['li "<b>GWLB</b>: appliance bên thứ ba · <b>VPC Block Public Access</b>: chặn IGW cả account" c=blue'] },
        { say: 'Chỉ cho máy chủ ra một danh sách tên miền được phép, ví dụ amazonaws.com: dùng domain allowlist của Network Firewall.', do: ['tip "Chỉ cho ra <b>một số tên miền</b> → <b>Network Firewall domain list</b> (hoặc DNS Firewall). SG / NACL không lọc theo tên miền."'] },
      ],
    },
    {
      title: 'Inspection VPC tập trung',
      groups: { insp: [450, 150, 380, 420, 'vpc', 'Inspection VPC'] },
      nodes: {
        a: [150, 230, 'vpc', 'VPC A'],
        b: [150, 450, 'vpc', 'VPC B'],
        tgw: [360, 340, 'tgw', 'Transit Gateway', 'appliance mode'],
        nfw: [640, 340, 'nfw', 'Network Firewall'],
        igw: [1060, 340, 'igw', 'Internet'],
      },
      steps: [
        { say: 'Mô hình tập trung: mọi VPC nối Transit Gateway, lưu lượng đi qua một inspection VPC chứa Network Firewall.', do: ['show a,b,tgw', 'edge a tgw', 'edge b tgw', 'show insp,nfw', 'edge tgw nfw', 'flow a tgw', 'flow tgw nfw @1.2'] },
        { say: 'Từ đó mới ra Internet, hoặc sang VPC khác.', do: ['show igw', 'edge nfw igw c=ok', 'flow nfw igw c=ok'] },
        { say: 'Bật appliance mode trên attachment của inspection VPC, để chiều đi và chiều về của một luồng đi qua cùng một firewall.', do: ['badge tgw "appliance mode" c=go', 'hl tgw'] },
        { say: 'Lỗi hay gặp là định tuyến bất đối xứng: chiều đi qua firewall, chiều về không qua, rule stateful sẽ chặn.', do: ['tip "Inspection VPC + TGW: bật <b>appliance mode</b>. Định tuyến <b>bất đối xứng</b> → stateful rule drop."'] },
      ],
    },
    {
      title: 'Phân đoạn mạng',
      groups: {
        web: [80, 160, 320, 360, 'public', 'Tầng web'],
        app: [480, 160, 320, 360, 'private', 'Tầng app'],
        db: [880, 160, 320, 360, 'private', 'Isolated · không NAT, không IGW'],
      },
      nodes: {
        w: [240, 340, 'alb', 'ALB', 'sg-web'],
        ap: [640, 340, 'ec2', 'App', 'sg-app: chỉ từ sg-web'],
        d: [1040, 340, 'rds', 'Database', 'sg-db: chỉ từ sg-app'],
      },
      steps: [
        { say: 'Phân tầng bằng security group tham chiếu lẫn nhau. Tầng app chỉ nhận từ security group của tầng web.', do: ['show web,app,w,ap', 'edge w ap "sg-web"', 'flow w ap'] },
        { say: 'Database chỉ nhận từ security group của tầng app, nằm trong subnet cô lập không có đường ra Internet.', do: ['show db,d', 'edge ap d "sg-app"', 'flow ap d'] },
        { say: 'Subnet cô lập gọi dịch vụ AWS qua VPC endpoint. Môi trường khác nhau thì tách account và VPC riêng, không chỉ tách subnet.', do: ['tip "Phân đoạn: <b>SG tham chiếu SG</b> theo tầng · DB ở <b>isolated subnet</b> + VPC endpoint · tách môi trường bằng <b>account</b>."'] },
      ],
    },
    {
      title: 'Kết nối lai an toàn',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Bảo mật các kết nối với văn phòng và data center.', do: [] },
        { say: 'Site-to-Site VPN: IPsec, IKEv2, AES 256. Có thể dùng chứng chỉ của Private CA thay cho khoá chia sẻ trước.', do: ['li "<b>Site-to-Site VPN</b>: IPsec IKEv2, AES-256, PFS, chứng chỉ Private CA"'] },
        { say: 'Direct Connect không mã hoá mặc định. Dùng MACsec ở tầng hai trên cổng tốc độ cao, hoặc chạy VPN bên trên.', do: ['li "<b>Direct Connect</b>: không mã hoá → <b>MACsec</b> (10 / 100 / 400 Gbps) hoặc VPN trên DX" c=bad'] },
        { say: 'Verified Access cho nhân viên vào ứng dụng nội bộ không cần VPN, mỗi request đánh giá theo danh tính và thiết bị.', do: ['li "<b>Verified Access</b>: zero trust, không VPN, đánh giá từng request" c=ok'] },
        { say: 'PrivateLink chia sẻ đúng một dịch vụ, không mở cả mạng.', do: ['li "<b>PrivateLink</b>: chia sẻ <b>một dịch vụ</b>, không mở cả VPC" c=blue'] },
      ],
    },
  ],
};
