// Kịch bản video: Kết nối nhiều VPC, on-premises, Route 53 Resolver
export default {
  scenes: [
    {
      title: 'Peering hay Transit Gateway',
      nodes: {
        a: [170, 200, 'vpc', 'VPC A'], b: [500, 200, 'vpc', 'VPC B'], c: [170, 460, 'vpc', 'VPC C'],
        tgw: [880, 330, 'tgw', 'Transit Gateway', 'hub trung tâm'],
        v1: [1100, 190, 'vpc', 'VPC 1'], v2: [1100, 330, 'vpc', 'VPC 2'], v3: [1100, 470, 'vpc', 'VPC 3'],
      },
      steps: [
        { say: 'VPC peering nối hai VPC trực tiếp. Nhưng peering không bắc cầu: A nối B, B nối C, thì A vẫn không tới được C.', do: ['show a,b,c', 'edge a b "peering" both c=ok', 'edge a c "peering" both c=ok route=v', 'note n 340 330 340 "B ↛ C qua A: <b>không bắc cầu</b>" c=bad'] },
        { say: 'Nhiều VPC thì dùng Transit Gateway làm trung tâm. Mỗi VPC chỉ cần một attachment.', do: ['show tgw,v1,v2,v3', 'edge tgw v1 both', 'edge tgw v2 both', 'edge tgw v3 both', 'flow v1 tgw', 'flow tgw v3 @1.0'] },
        { say: 'Transit Gateway có route table riêng. Muốn tách môi trường, ví dụ dev không nói chuyện với prod, dùng nhiều route table và association khác nhau.', do: ['tip "Nhiều VPC + on-prem → <b>Transit Gateway</b>. Cách ly dev / prod → nhiều <b>TGW route table</b>. Peering: <b>không bắc cầu</b>, CIDR không trùng."'] },
      ],
    },
    {
      title: 'VPN và Direct Connect',
      groups: { op: [70, 170, 280, 330, 'onprem', 'Văn phòng / data center'] },
      nodes: {
        cgw: [210, 330, 'cgw', 'Customer gateway'],
        vpn: [620, 210, 'vpn', 'Site-to-Site VPN', 'qua Internet, 2 tunnel'],
        dx: [620, 460, 'dx', 'Direct Connect', 'đường riêng, ổn định'],
        tgw: [1040, 330, 'tgw', 'TGW / VGW'],
      },
      steps: [
        { say: 'Site-to-Site VPN đi qua Internet, mã hoá IPsec, dựng trong vài phút. Mỗi kết nối có hai tunnel ở hai thiết bị khác nhau để dự phòng.', do: ['show op,cgw,vpn,tgw', 'edge cgw vpn route=hvh', 'edge vpn tgw route=hvh', 'flow cgw vpn', 'flow vpn tgw @1.2'] },
        { say: 'Direct Connect là đường truyền riêng, băng thông ổn định, nhưng mất nhiều tuần để có. Mặc định không mã hoá.', do: ['show dx', 'edge cgw dx route=hvh c=go', 'edge dx tgw route=hvh c=go', 'flow cgw dx', 'flow dx tgw @1.2'] },
        { say: 'Mẫu hay thi: Direct Connect làm đường chính, VPN làm đường dự phòng rẻ tiền.', do: ['badge dx "chính" c=ok', 'badge vpn "dự phòng" c=blue'] },
        { say: 'Cần mã hoá trên Direct Connect: chạy VPN bên trên, hoặc dùng MACsec ở cổng tốc độ cao.', do: ['tip "DX không mã hoá → <b>VPN over DX</b> hoặc <b>MACsec</b>. Tunnel VPN down → kiểm tra <b>TunnelState</b>, IKE / DPD, BGP."'] },
      ],
    },
    {
      title: 'Route 53 Resolver: DNS hai chiều',
      groups: { vpc: [80, 150, 520, 410, 'vpc', 'VPC'], op: [820, 150, 380, 410, 'onprem', 'On-premises'] },
      nodes: {
        ec2: [220, 260, 'ec2', 'EC2', 'hỏi db.corp.local'],
        out: [470, 260, 'resolver', 'Outbound endpoint', 'forwarding rule'],
        inb: [470, 460, 'resolver', 'Inbound endpoint', 'IP trong VPC'],
        dns: [1010, 260, 'dns', 'DNS on-prem', 'corp.local'],
        pc: [1010, 460, 'laptop', 'Máy văn phòng', 'hỏi tên private zone'],
      },
      steps: [
        { say: 'Máy trong VPC muốn phân giải tên miền nội bộ on-premises. Dùng outbound endpoint kèm forwarding rule cho tên miền corp.local.', do: ['show vpc,op,ec2,out,dns', 'edge ec2 out', 'edge out dns "forward corp.local" c=go', 'flow ec2 out', 'flow out dns @1.2'] },
        { say: 'Chiều ngược lại: máy văn phòng muốn phân giải tên trong private hosted zone. Dùng inbound endpoint, DNS on-premises chuyển tiếp tới IP của nó.', do: ['show inb,pc', 'edge pc inb "forward" c=go', 'flow pc inb'] },
        { say: 'Forwarding rule chia sẻ được cho account khác bằng AWS RAM.', do: ['tip "VPC → on-prem: <b>outbound endpoint + forwarding rule</b>. On-prem → VPC: <b>inbound endpoint</b>. Chia sẻ rule: <b>RAM</b>."'] },
      ],
    },
  ],
};
