// Kịch bản video: Hiệu năng lưu trữ EBS, S3, EFS
export default {
  scenes: [
    {
      title: 'Chọn loại EBS',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Bắt đầu với ổ EBS. Có hai nhóm: ổ SSD cho IOPS, ổ HDD cho throughput.', do: [] },
        { say: 'gp3 là lựa chọn mặc định. 3.000 IOPS và 125 MB mỗi giây có sẵn, chỉnh IOPS và throughput độc lập với dung lượng.', do: ['li "<b>gp3</b> · mặc định: 3.000 IOPS, 125 MB/s có sẵn, chỉnh <b>độc lập</b> dung lượng" c=ok'] },
        { say: 'gp2 cũ hơn: IOPS tính theo dung lượng, ba IOPS mỗi GiB, ổ nhỏ dùng tín dụng burst. Hết BurstBalance thì chậm hẳn.', do: ['li "<b>gp2</b> · 3 IOPS / GiB, ổ nhỏ chạy bằng burst. <b>BurstBalance = 0</b> → chậm"'] },
        { say: 'io2 Block Express cho database cần IOPS rất cao và ổn định, tới 256 nghìn IOPS, hỗ trợ Multi-Attach.', do: ['li "<b>io2 Block Express</b> · tới 256.000 IOPS, độ bền 99,999%, Multi-Attach" c=blue'] },
        { say: 'st1 và sc1 là ổ cứng HDD, cho đọc ghi tuần tự lớn, không làm ổ khởi động được.', do: ['li "<b>st1 / sc1</b> · HDD, throughput tuần tự, rẻ, <b>không</b> làm ổ boot" c=bad'] },
        { say: 'Câu hay gặp: chuyển gp2 sang gp3 để rẻ hơn khoảng hai mươi phần trăm mà không mất hiệu năng.', do: ['tip "gp2 → <b>gp3</b>: rẻ hơn ~20%, IOPS không phụ thuộc dung lượng. Đổi bằng <b>Elastic Volumes</b>, không downtime."'] },
      ],
    },
    {
      title: 'Ổ nhanh mà máy vẫn chậm',
      nodes: {
        ec2: [250, 330, 'ec2', 't3.medium', 'EBS bandwidth thấp'],
        vol: [800, 330, 'ebs', 'io2', '50.000 IOPS'],
      },
      steps: [
        { say: 'Bạn mua ổ io2 năm mươi nghìn IOPS, gắn vào một máy nhỏ. Nhưng ứng dụng vẫn chậm. Vì sao?', do: ['show ec2,vol', 'edge ec2 vol "đường ống hẹp" both'] },
        { say: 'Vì hiệu năng thực tế là mức nhỏ hơn giữa giới hạn của ổ và giới hạn EBS của máy. Máy nhỏ có đường ống hẹp.', do: ['flow ec2 vol c=bad n=2', 'big "Hiệu năng = min(ổ đĩa, giới hạn EBS của instance)"'] },
        { say: 'Xem metric VolumeQueueLength. Hàng đợi cao kéo dài nghĩa là ổ đang thiếu IOPS hoặc máy đang nghẽn.', do: ['note q 140 470 1000 "<b>VolumeQueueLength</b> cao kéo dài → thiếu IOPS · <b>BurstBalance</b> về 0 → hết burst (gp2, st1, sc1)" c=bad'] },
        { say: 'Elastic Volumes cho phép tăng dung lượng, đổi loại ổ, đổi IOPS ngay khi đang chạy. Nhưng không giảm dung lượng được, và phải chờ sáu giờ mới sửa tiếp.', do: ['tip "<b>Elastic Volumes</b>: sửa khi đang chạy, <b>không giảm</b> dung lượng, lần sửa sau phải chờ <b>6 giờ</b>."'] },
      ],
    },
    {
      title: 'Snapshot và các tính năng đi kèm',
      nodes: {
        vol: [150, 330, 'ebs', 'EBS', 'AZ a'],
        snap: [440, 330, 'snapshot', 'Snapshot', 'incremental, lưu trong S3'],
        v2: [760, 190, 'ebs', 'Volume mới', 'AZ khác'],
        r2: [760, 470, 'snapshot', 'Bản copy', 'Region khác, có thể mã hoá'],
        dlm: [440, 160, 'scheduler', 'Data Lifecycle Manager', 'chụp theo lịch, theo tag'],
      },
      steps: [
        { say: 'Ổ EBS nằm trong một AZ. Muốn chuyển sang AZ hay Region khác, chụp snapshot.', do: ['show vol,snap', 'edge vol snap', 'flow vol snap'] },
        { say: 'Từ snapshot tạo ổ mới ở AZ khác, hoặc copy sang Region khác. Khi copy có thể thêm mã hoá.', do: ['show v2,r2', 'edge snap v2', 'edge snap r2', 'flow snap v2', 'flow snap r2 @1.3'] },
        { say: 'Data Lifecycle Manager tự chụp và giữ snapshot theo lịch, theo tag.', do: ['show dlm', 'edge dlm snap route=v'] },
        { say: 'Ổ tạo từ snapshot ban đầu chậm vì dữ liệu được tải dần. Fast Snapshot Restore cho hiệu năng đầy đủ ngay lập tức.', do: ['badge v2 "Fast Snapshot Restore" c=ok', 'note f 930 300 300 "Không FSR: phải đọc toàn bộ block để <b>làm nóng</b>"'] },
        { say: 'Recycle Bin giữ snapshot bị xoá nhầm trong một số ngày. Snapshot Archive rẻ hơn bảy mươi lăm phần trăm cho bản lưu lâu.', do: ['tip "Xoá nhầm snapshot → <b>Recycle Bin</b>. Lưu lâu, ít dùng → <b>Snapshot Archive</b> (rẻ hơn 75%, tối thiểu 90 ngày)."'] },
      ],
    },
    {
      title: 'Mã hoá một ổ đang không mã hoá',
      nodes: {
        a: [140, 330, 'ebs', 'Volume', 'chưa mã hoá'],
        b: [420, 330, 'snapshot', 'Snapshot', 'chưa mã hoá'],
        c: [700, 330, 'snapshot', 'Copy snapshot', 'bật mã hoá KMS'],
        d: [980, 330, 'ebs', 'Volume mới', 'đã mã hoá'],
      },
      steps: [
        { say: 'Không thể bật mã hoá trực tiếp trên một ổ đang có. Phải đi bốn bước.', do: ['show a', 'bad a @0.6'] },
        { say: 'Chụp snapshot, copy snapshot có bật mã hoá, rồi tạo ổ mới từ bản copy và thay vào máy.', do: ['show b,c,d', 'edge a b "1"', 'edge b c "2 copy + KMS" c=go', 'edge c d "3" c=ok', 'flow a b', 'flow b c @1.5', 'flow c d @2.4', 'ok d @3.2'] },
        { say: 'Để mọi ổ mới đều tự mã hoá, bật EBS encryption by default cho từng Region.', do: ['tip "<b>EBS encryption by default</b>: bật theo <b>từng Region</b>, mọi volume mới tự mã hoá."'] },
      ],
    },
    {
      title: 'S3 nhanh hơn',
      nodes: {
        u: [140, 330, 'users', 'Client'],
        s3: [560, 330, 's3', 'S3', '3.500 ghi + 5.500 đọc / giây / prefix'],
        ed: [140, 160, 'cloudfront', 'Edge location', 'Transfer Acceleration'],
        kms: [940, 330, 'kms', 'KMS', 'Bucket Key giảm 99% request'],
      },
      steps: [
        { say: 'S3 chịu được 3.500 request ghi và 5.500 request đọc mỗi giây, cho mỗi prefix. Chia dữ liệu ra nhiều prefix để nhân lên.', do: ['show u,s3', 'edge u s3', 'flow u s3'] },
        { say: 'Vượt giới hạn thì nhận lỗi 503 Slow Down. Thêm retry với exponential backoff.', do: ['badge s3 "503 Slow Down" c=bad', 'note p 380 470 500 "Nhiều prefix · retry + <b>exponential backoff</b>" c=go'] },
        { say: 'File lớn thì dùng multipart upload, bắt buộc với file trên năm GB. Tải lên từ xa thì bật Transfer Acceleration, đi qua edge location gần nhất.', do: ['show ed', 'edge u ed route=v', 'edge ed s3 "mạng AWS" c=ok', 'flow ed s3'] },
        { say: 'Bẫy: mã hoá SSE-KMS gọi KMS cho mỗi object, dễ bị giới hạn. Bật S3 Bucket Key để giảm chín mươi chín phần trăm request tới KMS.', do: ['show kms', 'edge s3 kms', 'tip "SSE-KMS bị <b>ThrottlingException</b> → bật <b>S3 Bucket Key</b>. Upload &gt; 100 MB → <b>multipart</b>."'] },
      ],
    },
    {
      title: 'Lớp lưu trữ S3 và lifecycle',
      nodes: {
        st: [140, 330, 's3', 'Standard', 'dùng thường xuyên'],
        ia: [400, 330, 's3', 'Standard-IA', '≥ 30 ngày'],
        gi: [660, 330, 'glacier', 'Glacier Instant', 'lấy ngay, ≥ 90 ngày'],
        gf: [920, 330, 'glacier', 'Glacier Flexible', 'phút – giờ'],
        da: [1160, 330, 'glacier', 'Deep Archive', '12–48 giờ, rẻ nhất'],
      },
      steps: [
        { say: 'Dữ liệu càng ít dùng, lớp lưu trữ càng rẻ, nhưng lấy ra càng lâu và có thời gian lưu tối thiểu.', do: ['show st,ia,gi,gf,da'] },
        { say: 'Lifecycle rule tự chuyển object xuống lớp rẻ hơn theo tuổi, và xoá khi hết hạn.', do: ['edge st ia "30 ngày" c=go', 'edge ia gi c=go', 'edge gi gf c=go', 'edge gf da c=go', 'flow st ia', 'flow ia gi @1.3', 'flow gi gf @1.6', 'flow gf da @1.9'] },
        { say: 'Không biết trước mẫu truy cập thì dùng Intelligent-Tiering: tự chuyển tầng, không mất phí lấy dữ liệu.', do: ['note it 140 470 1000 "Mẫu truy cập không biết trước → <b>Intelligent-Tiering</b>" c=ok'] },
        { say: 'Nhớ thêm rule huỷ multipart upload dở dang, nếu không chúng âm thầm tốn tiền.', do: ['tip "Lifecycle: luôn có <b>AbortIncompleteMultipartUpload</b>. Giữ 7–10 năm rẻ nhất → <b>Deep Archive</b>."'] },
      ],
    },
    {
      title: 'EFS và FSx',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Cần ổ dùng chung cho nhiều máy, chọn hệ thống file.', do: [] },
        { say: 'EFS là NFS cho Linux, nhiều AZ, tự co giãn. Chế độ Elastic throughput tự theo tải. Hết BurstCreditBalance ở chế độ bursting thì chậm.', do: ['li "<b>EFS</b>: NFS cho Linux, nhiều AZ. Chậm → xem <b>BurstCreditBalance</b>, chuyển <b>Elastic throughput</b>" c=ok'] },
        { say: 'Lifecycle của EFS chuyển file ít dùng sang lớp Infrequent Access để giảm chi phí.', do: ['li "EFS lifecycle → <b>Infrequent Access / Archive</b> cho file ít dùng"'] },
        { say: 'FSx for Windows cho máy Windows cần SMB và Active Directory. FSx for Lustre cho tính toán hiệu năng cao, nối với S3.', do: ['li "<b>FSx for Windows</b>: SMB + Active Directory" c=blue', 'li "<b>FSx for Lustre</b>: HPC, ML, liên kết với S3" c=bad'] },
      ],
    },
  ],
};
