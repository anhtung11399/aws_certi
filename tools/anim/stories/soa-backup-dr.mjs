// Kịch bản video: Backup và phục hồi thảm hoạ
export default {
  scenes: [
    {
      title: 'RPO và RTO',
      nodes: {
        b: [220, 330, 'snapshot', 'Backup cuối', '01:00'],
        x: [640, 330, 'hacker', 'Sự cố', '01:45'],
        ok: [1060, 330, 'ec2', 'Chạy lại', '02:15'],
      },
      steps: [
        { say: 'Mọi câu về phục hồi thảm hoạ đều bắt đầu từ hai con số: RPO và RTO.', do: ['big "RPO = mất bao nhiêu dữ liệu · RTO = ngừng bao lâu"'] },
        { say: 'Trên trục thời gian: lần backup cuối lúc một giờ, sự cố lúc một giờ bốn lăm, và hệ thống chạy lại lúc hai giờ mười lăm.', do: ['show b', 'show x @0.6', 'show ok @1.2'] },
        { say: 'Khoảng từ lần backup cuối tới lúc sự cố là dữ liệu bị mất. Đó là RPO. RPO một giờ nghĩa là phải backup ít nhất mỗi giờ.', do: ['edge b x "RPO: mất 45 phút dữ liệu" c=bad', 'note r 120 470 460 "<b>RPO</b> → quyết định backup / sao chép <b>bao lâu một lần</b>" c=bad'] },
        { say: 'Khoảng từ lúc sự cố tới lúc chạy lại là thời gian ngừng dịch vụ. Đó là RTO.', do: ['edge x ok "RTO: ngừng 30 phút" c=go', 'note o 700 470 460 "<b>RTO</b> → quyết định khôi phục <b>nhanh cỡ nào</b>" c=go'] },
      ],
    },
    {
      title: 'Bốn chiến lược phục hồi',
      nodes: {
        b: [170, 320, 'backup', 'Backup & Restore', 'chỉ có bản backup'],
        p: [470, 320, 'rds', 'Pilot Light', 'DB sao chép, máy tắt'],
        w: [770, 320, 'asg', 'Warm Standby', 'chạy đủ, quy mô nhỏ'],
        a: [1070, 320, 'ec2', 'Active-Active', 'chạy đủ, nhận traffic'],
      },
      steps: [
        { say: 'Bốn chiến lược, xếp từ rẻ nhất tới đắt nhất.', do: ['show b'] },
        { say: 'Backup và Restore: Region dự phòng chỉ có bản backup. Có sự cố thì dựng lại toàn bộ. Rẻ nhất, nhưng RTO tính bằng giờ.', do: ['badge b "RTO: giờ" c=bad'] },
        { say: 'Pilot Light: database được sao chép liên tục, còn máy chủ đã định nghĩa sẵn nhưng tắt. Có sự cố thì bật máy lên.', do: ['show p', 'edge b p c=go', 'badge p "RTO: chục phút" c=go'] },
        { say: 'Warm Standby: toàn bộ hệ thống chạy sẵn ở quy mô nhỏ. Có sự cố thì scale lên.', do: ['show w', 'edge p w c=go', 'badge w "RTO: phút" c=blue'] },
        { say: 'Active-Active: hai Region cùng phục vụ. Gần như không gián đoạn, nhưng đắt nhất.', do: ['show a', 'edge w a c=go', 'badge a "RTO ≈ 0" c=ok'] },
        { say: 'Mẹo nhận biết: đề nói database sao chép sẵn nhưng máy chủ tắt là Pilot Light. Chạy sẵn với quy mô nhỏ là Warm Standby.', do: ['tip "DB sao chép + compute <b>tắt</b> → <b>Pilot Light</b>. Mọi thứ <b>chạy nhỏ</b> → <b>Warm Standby</b>."'] },
      ],
    },
    {
      title: 'AWS Backup',
      groups: { acc: [60, 150, 520, 400, 'account', 'Account workload'], bk: [680, 150, 540, 400, 'account', 'Account backup'] },
      nodes: {
        ec2: [170, 260, 'ec2', 'EC2', 'tag Backup=daily'],
        rds: [170, 440, 'rds', 'RDS', 'tag Backup=daily'],
        plan: [430, 350, 'backup', 'Backup plan', 'hằng ngày, giữ 35 ngày'],
        v1: [800, 260, 'backup', 'Vault', 'KMS'],
        v2: [1080, 260, 'backup', 'Vault Region khác'],
        lock: [940, 460, 'kms', 'Vault Lock', 'compliance mode'],
      },
      steps: [
        { say: 'AWS Backup quản lý backup tập trung cho EC2, EBS, RDS, DynamoDB, EFS, S3 và nhiều dịch vụ khác.', do: ['show acc,ec2,rds,plan'] },
        { say: 'Backup plan có lịch và thời gian giữ. Chọn tài nguyên bằng tag, nên tài nguyên mới gắn tag tự được backup.', do: ['edge ec2 plan "tag"', 'edge rds plan "tag"', 'flow ec2 plan', 'flow rds plan @1.2'] },
        { say: 'Bản backup lưu trong vault, mã hoá bằng KMS. Có thể copy sang account khác và Region khác.', do: ['show bk,v1,v2', 'edge plan v1 "copy cross-account" c=go', 'edge v1 v2 "cross-Region" c=go', 'flow plan v1', 'flow v1 v2 @1.4'] },
        { say: 'Vault Lock ở chế độ compliance: không ai xoá được backup trước hạn, kể cả root. Đây là cách chống ransomware.', do: ['show lock', 'edge lock v1 route=v dash', 'hl lock'] },
        { say: 'Đề hỏi backup tập trung, nhiều dịch vụ, nhiều account, ít công sức: đáp án là AWS Backup, không phải script Lambda tự chụp snapshot.', do: ['tip "Backup tập trung, nhiều account → <b>AWS Backup</b> + backup policy của Organizations. Chống xoá backup → <b>Vault Lock compliance</b>."'] },
      ],
    },
    {
      title: 'Khôi phục từng dịch vụ',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Mỗi dịch vụ khôi phục theo cách riêng. Đây là các điểm hay thi.', do: [] },
        { say: 'RDS: point-in-time recovery tới khoảng năm phút gần nhất. Nhưng luôn tạo instance mới với endpoint mới, phải đổi chuỗi kết nối.', do: ['li "<b>RDS</b> PITR → instance <b>MỚI</b>, endpoint mới, phải đổi connection string" c=bad'] },
        { say: 'Aurora MySQL có Backtrack: quay ngược ngay tại chỗ, không tạo cluster mới.', do: ['li "<b>Aurora Backtrack</b>: quay ngược tại chỗ, không tạo cluster mới" c=ok'] },
        { say: 'DynamoDB có point-in-time recovery trong ba mươi lăm ngày, khôi phục vào bảng mới.', do: ['li "<b>DynamoDB PITR</b>: 35 ngày, theo từng giây, khôi phục vào bảng mới" c=blue'] },
        { say: 'S3: bật versioning để chống xoá nhầm. Xoá chỉ thêm một delete marker, xoá marker đó là lấy lại file.', do: ['li "<b>S3 versioning</b>: xoá = thêm delete marker → xoá marker để khôi phục"'] },
        { say: 'Sao chép S3 sang Region khác cần versioning ở cả hai bucket, và chỉ object mới được chép. Object cũ dùng S3 Batch Replication.', do: ['tip "S3 CRR: versioning <b>cả hai</b> bucket, chỉ object <b>mới</b>. Object cũ → <b>Batch Replication</b>. Không bắc cầu A→B→C."'] },
      ],
    },
    {
      title: 'Elastic Disaster Recovery',
      groups: { src: [70, 170, 340, 330, 'onprem', 'Máy chủ nguồn'], stg: [500, 170, 320, 330, 'region', 'Staging (rẻ)'], rec: [900, 170, 320, 330, 'region', 'Khi có sự cố'] },
      nodes: {
        s: [240, 330, 'server', 'Máy chủ', 'agent DRS'],
        st: [660, 330, 'ebs', 'Bản sao block', 'liên tục'],
        r: [1060, 330, 'ec2', 'EC2 thật', 'launch trong phút'],
      },
      steps: [
        { say: 'AWS Elastic Disaster Recovery sao chép liên tục từng khối dữ liệu của máy chủ, on-premises hay EC2, sang một vùng staging rẻ tiền ở AWS.', do: ['show src,s,stg,st', 'edge s st "sao chép block" c=go', 'flow s st', 'flow s st @1.8'] },
        { say: 'Có sự cố, launch máy thật từ bản sao trong vài phút.', do: ['show rec', 'bad s', 'show r @0.4', 'edge st r "launch" c=ok', 'flow st r', 'ok r @1.6'] },
        { say: 'RPO tính bằng giây, RTO tính bằng phút. Đây là đáp án cho câu chuyển máy chủ on-premises lên AWS làm dự phòng.', do: ['tip "DR cho máy chủ (on-prem / EC2), RPO giây, RTO phút → <b>Elastic Disaster Recovery (DRS)</b>."'] },
      ],
    },
  ],
};
