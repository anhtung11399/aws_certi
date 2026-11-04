// Kịch bản video: Hiệu năng và vận hành EC2
export default {
  scenes: [
    {
      title: 'Chọn họ máy đúng việc',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Bài này nói về hiệu năng và sự cố của EC2. Bắt đầu bằng việc chọn đúng họ máy.', do: [] },
        { say: 'Họ M và T là đa dụng, dùng cho web và ứng dụng thông thường. T là loại burstable, chạy bằng tín dụng CPU.', do: ['li "<b>M, T</b> · đa dụng: web, ứng dụng thường. T = burstable"'] },
        { say: 'Họ C tối ưu CPU: xử lý lô, mã hoá video. Họ R và X tối ưu RAM: database trong bộ nhớ, cache.', do: ['li "<b>C</b> · CPU: batch, encode video, game server" c=bad', 'li "<b>R, X</b> · RAM: database trong bộ nhớ, cache" c=blue'] },
        { say: 'Họ I và D tối ưu lưu trữ, có ổ NVMe cực nhanh gắn liền máy. Họ P, G dùng GPU cho máy học.', do: ['li "<b>I, D</b> · lưu trữ: instance store NVMe, IOPS cực cao" c=ok', 'li "<b>P, G, Inf, Trn</b> · GPU, máy học"'] },
        { say: 'Chữ g trong tên máy là Graviton, chip ARM của AWS, rẻ hơn khoảng 20 phần trăm. Muốn chuyển sang thì AMI và phần mềm phải hỗ trợ ARM.', do: ['tip "Hậu tố <b>g</b> = Graviton (ARM, rẻ hơn ~20%) · <b>d</b> = có instance store · <b>n</b> = mạng cao. Đổi loại máy: <b>stop → đổi → start</b>."'] },
      ],
    },
    {
      title: 'Hai loại status check',
      groups: { host: [80, 150, 480, 360, 'onprem', 'Phần cứng AWS (host)'], os: [200, 230, 240, 220, 'plain', 'Trong hệ điều hành'] },
      nodes: {
        vm: [320, 340, 'ec2', 'EC2'],
        sys: [800, 230, 'cloudwatch', 'System check', 'mất nguồn, mạng, phần cứng'],
        ins: [800, 430, 'cloudwatch', 'Instance check', 'kernel panic, hết RAM, fstab sai'],
      },
      steps: [
        { say: 'System status check theo dõi phần cứng của AWS: nguồn, mạng, máy chủ vật lý.', do: ['show host,vm', 'show sys', 'edge sys vm "kiểm phần cứng" route=hvh'] },
        { say: 'Hỏng loại này thì stop rồi start để chuyển sang host khác, hoặc dùng auto recovery. Reboot không chuyển host nên vô ích.', do: ['badge sys "stop / start" c=ok', 'note a 620 520 360 "<b>Reboot</b> không chuyển host!" c=bad'] },
        { say: 'Instance status check là lỗi trong hệ điều hành: kernel panic, cấu hình mạng sai, hết bộ nhớ, file fstab sai.', do: ['show os,ins', 'edge ins vm "kiểm OS" route=hvh'] },
        { say: 'Xử lý bằng reboot. Máy không lên được thì xem system log, chụp màn hình, hoặc vào EC2 Serial Console để sửa.', do: ['badge ins "reboot" c=go', 'tip "Máy không khởi động: <b>Get system log</b>, <b>instance screenshot</b>, <b>EC2 Serial Console</b>."'] },
      ],
    },
    {
      title: 'Lỗi khi tạo máy',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Bốn lỗi launch hay gặp trong đề.', do: [] },
        { say: 'VcpuLimitExceeded: chạm hạn mức vCPU của account. Xin tăng qua Service Quotas.', do: ['li "<b>VcpuLimitExceeded</b> → hết quota vCPU → xin tăng ở <b>Service Quotas</b>" c=bad'] },
        { say: 'InsufficientInstanceCapacity: vùng sẵn sàng đó tạm hết loại máy. Thử AZ khác, loại máy khác. Tải quan trọng thì đặt trước bằng Capacity Reservation.', do: ['li "<b>InsufficientInstanceCapacity</b> → AZ hết máy → đổi AZ / loại, hoặc <b>On-Demand Capacity Reservation</b>" c=blue'] },
        { say: 'Máy vừa tạo đã chuyển ngay sang terminated: thường do ổ EBS mã hoá bằng khoá KMS mà người tạo không có quyền dùng.', do: ['li "Vừa launch đã <b>terminated</b> → thiếu quyền <b>KMS</b> (CreateGrant / Decrypt) cho volume mã hoá" c=go'] },
        { say: 'Đổi từ dòng máy cũ sang dòng Nitro mà không khởi động được: AMI thiếu driver ENA và NVMe.', do: ['li "Đổi sang dòng <b>Nitro</b> mà không boot → AMI thiếu driver <b>ENA / NVMe</b>" c=ok'] },
      ],
    },
    {
      title: 'Placement group',
      groups: {
        cl: [70, 160, 340, 300, 'az', 'Cluster · 1 AZ, sát nhau'],
        sp: [470, 160, 340, 300, 'az', 'Spread · mỗi máy một rack'],
        pa: [870, 160, 340, 300, 'az', 'Partition · nhóm rack'],
      },
      nodes: {
        c1: [150, 280, 'ec2', ''], c2: [240, 280, 'ec2', ''], c3: [330, 280, 'ec2', ''],
        s1: [540, 280, 'ec2', 'rack 1'], s2: [640, 280, 'ec2', 'rack 2'], s3: [740, 280, 'ec2', 'rack 3'],
        p1: [950, 280, 'ec2', 'P1'], p2: [1040, 280, 'ec2', 'P2'], p3: [1130, 280, 'ec2', 'P3'],
      },
      steps: [
        { say: 'Placement group quyết định các máy được đặt gần hay xa nhau.', do: ['show cl,sp,pa'] },
        { say: 'Cluster: mọi máy sát nhau trong một AZ, độ trễ mạng thấp nhất. Hợp với tính toán hiệu năng cao. Rủi ro là cùng hỏng.', do: ['show c1,c2,c3', 'note a 80 400 320 "HPC, độ trễ thấp nhất" c=go'] },
        { say: 'Spread: mỗi máy một rack riêng, tối đa bảy máy mỗi AZ. Cho vài máy cực kỳ quan trọng.', do: ['show s1,s2,s3', 'note b 480 400 320 "Tối đa <b>7 máy / AZ</b>" c=ok'] },
        { say: 'Partition: chia thành tối đa bảy partition, mỗi partition một nhóm rack, chứa được hàng trăm máy. Dùng cho Hadoop, Cassandra, Kafka.', do: ['show p1,p2,p3', 'note c 880 400 320 "Hadoop, Cassandra, Kafka" c=blue'] },
      ],
    },
    {
      title: 'Máy T hết tín dụng CPU',
      nodes: { t3: [1080, 330, 'ec2', 't3.micro', 'baseline 10%'] },
      steps: [
        { say: 'Máy họ T có mức CPU nền, gọi là baseline. Dưới mức này máy tích luỹ tín dụng CPU, trên mức này máy tiêu tín dụng.', do: ['chart c 70 140 900 360 vals=6,8,5,40,60,70,75,72,74 max=100 thr=10 "baseline 10%" dur=3', 'show t3 @0.3'] },
        { say: 'Ở chế độ standard, hết tín dụng là máy bị kìm về mức nền, ứng dụng chậm hẳn.', do: ['badge t3 "CPUCreditBalance = 0" c=bad', 'hl t3'] },
        { say: 'Chế độ unlimited cho vượt mức nền, nhưng tính thêm tiền nếu trung bình vượt.', do: ['note u 70 520 900 "<b>Unlimited</b> (mặc định T3 / T4g): được vượt, trả thêm phí <code>CPUSurplusCreditsCharged</code>" c=go'] },
        { say: 'Nếu CPU cao liên tục, đừng dùng họ T nữa, chuyển sang M hoặc C.', do: ['tip "CPU cao <b>liên tục</b> → bỏ T, chuyển sang <b>M / C</b>."'] },
      ],
    },
    {
      title: 'Mạng của EC2 bị giới hạn',
      nodes: {
        ec2: [250, 330, 'ec2', 'EC2', 'ENA'],
        cw: [650, 330, 'cloudwatch', 'Metric ENA', 'qua agent / ethtool'],
        big: [1040, 330, 'ec2', 'Instance lớn hơn', 'mạng cao hơn'],
      },
      steps: [
        { say: 'Băng thông mạng của EC2 phụ thuộc kích thước máy. Chữ "Up to 10 Gbps" nghĩa là có thể vọt lên, nhưng mức nền thấp hơn nhiều.', do: ['show ec2'] },
        { say: 'Driver ENA có metric cho biết máy đang chạm giới hạn: băng thông vượt mức cho phép, số gói tin vượt mức, bảng kết nối đầy.', do: ['show cw', 'edge ec2 cw', 'flow ec2 cw', 'note m 470 470 420 "<code>bw_in_allowance_exceeded</code><br><code>pps_allowance_exceeded</code><br><code>conntrack_allowance_exceeded</code>" c=bad'] },
        { say: 'Các số này tăng nghĩa là máy đang bị giới hạn mạng. Cách xử lý: nâng lên loại máy lớn hơn.', do: ['show big', 'edge cw big "nâng máy" c=ok', 'ok big @0.8'] },
        { say: 'Còn EFA dùng cho tính toán hiệu năng cao và máy học, giao tiếp bỏ qua nhân hệ điều hành.', do: ['tip "<b>ENA</b> = enhanced networking thường. <b>EFA</b> = HPC / ML, OS-bypass, dùng với MPI."'] },
      ],
    },
    {
      title: 'Mua máy rẻ hơn',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Năm cách mua máy, xếp từ linh hoạt nhất.', do: [] },
        { say: 'On-Demand: trả theo giờ, linh hoạt nhất, đắt nhất.', do: ['li "<b>On-Demand</b>: linh hoạt, đắt nhất"'] },
        { say: 'Savings Plans: cam kết một số tiền mỗi giờ trong một hoặc ba năm, giảm tới bảy mươi hai phần trăm. Compute Savings Plans áp dụng cả cho Fargate và Lambda.', do: ['li "<b>Savings Plans</b>: cam kết $/giờ 1–3 năm, giảm tới 72%. Compute SP áp cả Fargate, Lambda" c=ok'] },
        { say: 'Spot: rẻ tới chín mươi phần trăm, nhưng có thể bị thu hồi với hai phút cảnh báo. Hợp với việc chịu được gián đoạn.', do: ['li "<b>Spot</b>: rẻ tới 90%, bị thu hồi với <b>2 phút</b> cảnh báo" c=bad'] },
        { say: 'Cần chắc chắn có máy ở một AZ vào một thời điểm: On-Demand Capacity Reservation. Cần máy vật lý riêng vì giấy phép phần mềm: Dedicated Host.', do: ['li "Giữ chắc capacity → <b>Capacity Reservation</b>. Giấy phép theo socket / core → <b>Dedicated Host</b>" c=blue'] },
        { say: 'Compute Optimizer phân tích metric và gợi ý loại máy vừa đủ, tránh trả tiền cho máy quá to.', do: ['tip "Máy quá to / quá nhỏ? <b>AWS Compute Optimizer</b> gợi ý right-sizing (cần agent để tính RAM)."'] },
      ],
    },
  ],
};
