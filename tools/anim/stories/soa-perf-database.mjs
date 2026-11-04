// Kịch bản video: Hiệu năng và vận hành database
export default {
  scenes: [
    {
      title: 'Giám sát RDS: bốn tầng',
      nodes: {
        rds: [640, 330, 'rds', 'RDS'],
        cw: [300, 190, 'cloudwatch', 'CloudWatch metrics', 'CPU, kết nối, IOPS, latency'],
        em: [980, 190, 'logs', 'Enhanced Monitoring', 'OS, từng process, tới 1 giây'],
        pi: [300, 470, 'rds', 'Performance Insights', 'DB load theo câu SQL, wait'],
        lg: [980, 470, 'logs', 'Log exports', 'error, slow query'],
      },
      steps: [
        { say: 'Có bốn tầng để nhìn vào một database RDS.', do: ['show rds'] },
        { say: 'Tầng một, CloudWatch metrics: CPU, số kết nối, bộ nhớ trống, IOPS, độ trễ. Một phút một lần, miễn phí.', do: ['show cw', 'edge rds cw route=hv', 'flow rds cw'] },
        { say: 'Tầng hai, Enhanced Monitoring: số liệu của hệ điều hành bên dưới, tới từng process, mỗi giây một lần.', do: ['show em', 'edge rds em route=hv', 'flow rds em'] },
        { say: 'Tầng ba, Performance Insights: tải database chia theo câu SQL và theo loại chờ. Đây là công cụ để tìm câu truy vấn gây chậm.', do: ['show pi', 'edge rds pi route=hv', 'flow rds pi', 'hl pi @1.2'] },
        { say: 'Tầng bốn, log exports: đẩy error log và slow query log sang CloudWatch Logs. Slow query log phải bật trong parameter group.', do: ['show lg', 'edge rds lg route=hv', 'tip "Câu SQL nào làm chậm? → <b>Performance Insights</b>. RAM của từng process → <b>Enhanced Monitoring</b>."'] },
      ],
    },
    {
      title: 'Đọc Performance Insights',
      nodes: { pi: [1080, 330, 'rds', 'DB load', 'Average Active Sessions'] },
      steps: [
        { say: 'Performance Insights vẽ DB load, tức số phiên đang hoạt động trung bình. Đường đỏ là số vCPU của máy.', do: ['chart c 70 140 900 360 vals=1.2,1.5,1.8,3.5,5.2,6.1,5.8,6.4 max=8 thr=4 "Max vCPU = 4" dur=3', 'show pi @0.3'] },
        { say: 'DB load vượt đường vCPU nghĩa là database quá tải, các phiên phải xếp hàng chờ.', do: ['badge pi "QUÁ TẢI" c=bad', 'hl pi'] },
        { say: 'Xem phần lớn đang chờ cái gì. Chờ CPU: câu SQL tốn CPU, thiếu index. Chờ IO: thiếu IOPS hay bộ nhớ đệm. Chờ Lock: tranh chấp khoá.', do: ['note w 70 520 900 "Wait <b>CPU</b> → SQL nặng, thiếu index · <b>IO</b> → thiếu IOPS / RAM · <b>Lock</b> → tranh chấp khoá" c=go'] },
      ],
    },
    {
      title: 'Parameter group và các bẫy cấu hình',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Cấu hình engine nằm trong parameter group. Parameter group mặc định không sửa được, phải tạo bản riêng.', do: ['li "Default parameter group <b>không sửa được</b> → tạo parameter group riêng"'] },
        { say: 'Tham số dynamic áp dụng ngay. Tham số static cần khởi động lại, trạng thái hiện là pending-reboot.', do: ['li "<b>Dynamic</b>: áp ngay · <b>Static</b>: cần reboot → trạng thái <b>pending-reboot</b>" c=bad'] },
        { say: 'Kết nối không được thường do security group của RDS chưa cho security group của ứng dụng ở đúng cổng.', do: ['li "Không kết nối được → SG của RDS chưa mở cổng 3306 / 5432 cho <b>SG của app</b>" c=blue'] },
        { say: 'Lỗi quá nhiều kết nối: max_connections phụ thuộc RAM của loại máy. Nâng máy hoặc dùng RDS Proxy.', do: ['li "Too many connections → <b>max_connections</b> theo RAM → nâng máy hoặc <b>RDS Proxy</b>" c=ok'] },
        { say: 'Storage autoscaling tự tăng dung lượng khi gần đầy. Đặt mức tối đa để không tăng mãi.', do: ['li "<b>Storage autoscaling</b>: tự tăng khi còn &lt; 10% trống, đặt maximum threshold"'] },
      ],
    },
    {
      title: 'RDS Proxy: gom kết nối',
      nodes: {
        f1: [140, 190, 'lambda', 'Lambda'], f2: [140, 330, 'lambda', 'Lambda'], f3: [140, 470, 'lambda', 'Lambda'],
        px: [520, 330, 'proxy', 'RDS Proxy', 'giữ pool kết nối'],
        sm: [520, 520, 'secrets', 'Secrets Manager'],
        db: [900, 250, 'rds', 'Primary'],
        sb: [900, 430, 'rds', 'Standby'],
      },
      steps: [
        { say: 'Hàng nghìn hàm Lambda chạy cùng lúc, mỗi hàm mở một kết nối. Database hết kết nối.', do: ['show f1,f2,f3,db'] },
        { say: 'RDS Proxy đứng giữa, gom hàng nghìn kết nối của ứng dụng thành ít kết nối tới database.', do: ['show px', 'edge f1 px', 'edge f2 px', 'edge f3 px', 'edge px db c=ok', 'flow f1 px', 'flow f2 px @1.2', 'flow f3 px @1.4', 'flow px db @2.0'] },
        { say: 'Proxy lấy mật khẩu từ Secrets Manager. Ứng dụng có thể đăng nhập proxy bằng IAM.', do: ['show sm', 'edge sm px route=v'] },
        { say: 'Khi database failover, proxy giữ kết nối của ứng dụng và chuyển sang máy mới, giảm thời gian gián đoạn tới sáu mươi sáu phần trăm.', do: ['show sb', 'bad db', 'edge px sb "failover" c=ok', 'flow px sb'] },
        { say: 'Proxy chỉ truy cập được từ trong VPC.', do: ['tip "Lambda + RDS hết kết nối → <b>RDS Proxy</b>. Failover nhanh hơn tới 66%. Chỉ dùng trong VPC."'] },
      ],
    },
    {
      title: 'Multi-AZ hay Read replica',
      groups: { az1: [90, 160, 300, 300, 'az', 'AZ a'], az2: [460, 160, 300, 300, 'az', 'AZ b'] },
      nodes: {
        p: [240, 300, 'rds', 'Primary'],
        s: [610, 300, 'rds', 'Standby', 'không đọc được'],
        r: [1020, 300, 'rds', 'Read replica', 'đọc được, có thể khác Region'],
      },
      steps: [
        { say: 'Multi-AZ instance là để chịu lỗi. Dữ liệu chép đồng bộ sang standby ở AZ khác. Standby không phục vụ đọc.', do: ['show az1,az2,p,s', 'edge p s "đồng bộ" c=ok', 'flow p s'] },
        { say: 'Primary hỏng, RDS tự failover sang standby trong một đến hai phút. Endpoint DNS giữ nguyên.', do: ['bad p @0.3', 'badge s "PRIMARY mới" c=ok @0.8'] },
        { say: 'Read replica là để mở rộng đọc. Chép bất đồng bộ nên có độ trễ, đo bằng metric ReplicaLag. Có thể đặt ở Region khác.', do: ['show r', 'edge s r "bất đồng bộ" c=go', 'flow s r', 'badge r "ReplicaLag"'] },
        { say: 'Replica không tự failover. Phải promote bằng tay thành database độc lập.', do: ['tip "<b>Multi-AZ</b> = chịu lỗi, tự failover, standby không đọc. <b>Read replica</b> = đọc, bất đồng bộ, promote tay. Multi-AZ DB cluster: 2 reader đọc được, failover &lt; 35 giây."'] },
      ],
    },
    {
      title: 'Aurora',
      groups: { st: [130, 420, 1020, 110, 'plain', 'Storage chung · 6 bản sao trên 3 AZ · tự mở rộng tới 128 TiB'] },
      nodes: {
        w: [300, 260, 'aurora', 'Writer', 'cluster endpoint'],
        r1: [640, 260, 'aurora', 'Replica 1', 'tier 0'],
        r2: [940, 260, 'aurora', 'Replica 2', 'tier 1'],
      },
      steps: [
        { say: 'Aurora tách phần tính toán khỏi phần lưu trữ. Mọi máy dùng chung một storage, sáu bản sao trên ba AZ.', do: ['show st,w', 'note a 140 160 220 "Tối đa <b>15 replica</b>"'] },
        { say: 'Thêm tới mười lăm replica để đọc. Reader endpoint cân tải giữa các replica.', do: ['show r1,r2', 'badge r1 "reader endpoint" c=blue', 'badge r2 "reader endpoint" c=blue'] },
        { say: 'Writer hỏng, Aurora failover sang replica có tier ưu tiên cao nhất, thường dưới ba mươi giây.', do: ['bad w', 'edge w r1 "failover" c=ok', 'flow w r1 c=ok', 'badge r1 "WRITER mới" c=ok @1.2'] },
        { say: 'Một số tính năng chỉ Aurora có: Global Database sao chép sang Region khác dưới một giây, Backtrack quay ngược thời gian tại chỗ, Cloning tạo bản sao nhanh để thử nghiệm.', do: ['tip "<b>Global Database</b>: Region phụ trễ &lt; 1 giây. <b>Backtrack</b>: quay ngược tại chỗ (MySQL, 72 giờ). <b>Cloning</b>: copy-on-write cho test. <b>Serverless v2</b>: tự co giãn ACU."'] },
      ],
    },
    {
      title: 'DynamoDB và ElastiCache',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Cuối cùng là DynamoDB và ElastiCache.', do: [] },
        { say: 'DynamoDB on-demand trả theo request, tự co giãn. Provisioned thì đặt trước dung lượng, có auto scaling.', do: ['li "<b>DynamoDB</b>: on-demand (theo request) hoặc provisioned + auto scaling. Đổi mode 24 giờ một lần"'] },
        { say: 'Bị throttle dù tổng dung lượng còn dư thường do hot partition: khoá phân vùng được truy cập dồn vào một giá trị.', do: ['li "Throttle mà còn dư capacity → <b>hot partition</b> → chọn partition key phân tán hơn" c=bad'] },
        { say: 'Cần đọc với độ trễ micro giây: DAX. Cần cache cho database quan hệ: ElastiCache.', do: ['li "Đọc micro giây cho DynamoDB → <b>DAX</b>. Cache cho RDS → <b>ElastiCache</b>" c=blue'] },
        { say: 'ElastiCache có Redis, Valkey, Memcached. Cần nhân bản, chịu lỗi, sao lưu thì chọn Redis hoặc Valkey, không chọn Memcached.', do: ['li "Cần replication, failover, backup → <b>Redis / Valkey</b>, không phải Memcached" c=ok'] },
        { say: 'Metric quan trọng của cache: Evictions tăng nghĩa là thiếu bộ nhớ, CacheHitRate thấp nghĩa là cache ít hiệu quả.', do: ['tip "ElastiCache: <b>Evictions</b> tăng → thiếu RAM (scale up / thêm shard). <b>CPUUtilization</b> cao trên Redis → xem <b>EngineCPUUtilization</b>."'] },
      ],
    },
  ],
};
