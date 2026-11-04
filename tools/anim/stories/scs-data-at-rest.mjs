// Kịch bản video: Bảo vệ dữ liệu at rest
export default {
  scenes: [
    {
      title: 'Chọn kiểu mã hoá',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Chọn kiểu mã hoá theo câu hỏi: ai cần kiểm soát khoá.', do: [] },
        { say: 'SSE-S3: AWS giữ khoá, mặc định cho mọi object mới.', do: ['li "<b>SSE-S3</b>: AWS giữ key, mặc định"'] },
        { say: 'SSE-KMS với customer managed key: bạn kiểm soát quyền dùng khoá, có log CloudTrail mỗi lần dùng. Tách được quyền dữ liệu và quyền khoá.', do: ['li "<b>SSE-KMS</b> (customer managed): key policy, <b>audit CloudTrail</b>, tách quyền" c=ok'] },
        { say: 'DSSE-KMS mã hoá hai lớp. SSE-C: bạn gửi khoá theo mỗi request, AWS không lưu, mất khoá là mất dữ liệu.', do: ['li "<b>DSSE-KMS</b>: hai lớp · <b>SSE-C</b>: bạn gửi key mỗi request, phải HTTPS" c=blue'] },
        { say: 'Client-side: mã hoá trước khi gửi lên, AWS không bao giờ thấy dữ liệu gốc.', do: ['li "<b>Client-side</b>: AWS không bao giờ thấy plaintext" c=bad'] },
      ],
    },
    {
      title: 'Ép dùng đúng khoá',
      nodes: {
        u1: [170, 220, 'user', 'PUT có SSE-KMS', 'đúng key'],
        u2: [170, 440, 'user', 'PUT không mã hoá'],
        s3: [700, 330, 's3', 'Bucket', 'default encryption + Bucket Key'],
      },
      steps: [
        { say: 'Bucket đặt default encryption là SSE-KMS với khoá của bạn, bật Bucket Key để giảm chi phí.', do: ['show s3'] },
        { say: 'Bucket policy từ chối PutObject nếu header mã hoá không đúng khoá chỉ định.', do: ['show u1,u2', 'edge u1 s3 c=ok', 'edge u2 s3 c=bad', 'flow u1 s3 c=ok', 'flow u2 s3 c=bad @1.0', 'bad u2 @2.0'] },
        { say: 'EBS bật encryption by default theo Region. RDS chỉ chọn mã hoá lúc tạo. Muốn mã hoá database cũ: snapshot, copy có mã hoá, rồi khôi phục.', do: ['tip "Ép key: <code>s3:x-amz-server-side-encryption-aws-kms-key-id</code>. RDS chưa mã hoá → <b>snapshot → copy mã hoá → restore</b>. EFS: chỉ bật <b>lúc tạo</b>."'] },
      ],
    },
    {
      title: 'Chống xoá và chống ransomware',
      nodes: {
        att: [150, 330, 'hacker', 'Ransomware', 'có quyền admin'],
        ol: [560, 210, 's3', 'S3 Object Lock', 'compliance mode'],
        vl: [560, 460, 'backup', 'Backup Vault Lock', 'compliance mode'],
        ag: [960, 330, 'backup', 'Logically air-gapped vault', 'account khác'],
      },
      steps: [
        { say: 'Kẻ tấn công có quyền quản trị muốn xoá dữ liệu và bản backup để tống tiền.', do: ['show att'] },
        { say: 'S3 Object Lock ở chế độ compliance: không ai xoá hay rút ngắn thời hạn được, kể cả root.', do: ['show ol', 'edge att ol "xoá?" c=bad', 'flow att ol c=bad', 'ok ol @1.4'] },
        { say: 'Backup Vault Lock chế độ compliance khoá các bản backup tương tự.', do: ['show vl', 'edge att vl "xoá?" c=bad', 'flow att vl c=bad', 'ok vl @1.4'] },
        { say: 'Thêm logically air-gapped vault chia sẻ sang account khác, để khôi phục cả khi account gốc bị chiếm.', do: ['show ag', 'edge vl ag "copy" c=ok', 'tip "<b>Compliance mode</b>: không ai xoá được, kể cả root. <b>Governance mode</b>: người có quyền đặc biệt gỡ được. Chống ransomware → backup ở <b>account khác</b> + Vault Lock."'] },
      ],
    },
    {
      title: 'Toàn vẹn và vòng đời',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Chứng minh dữ liệu không bị sửa.', do: [] },
        { say: 'S3 tính checksum khi tải lên và tải xuống. AWS Signer ký code Lambda, chỉ chạy code đã ký.', do: ['li "S3 <b>checksum</b> · <b>AWS Signer</b> cho Lambda code signing" c=ok'] },
        { say: 'Khoá bất đối xứng của KMS dùng để ký số. Khoá HMAC chứng minh dữ liệu không bị sửa.', do: ['li "KMS <b>Sign / Verify</b> (asymmetric) · <b>GenerateMac</b> (HMAC)" c=blue'] },
        { say: 'Xoá đúng hạn để tuân thủ luật bảo vệ dữ liệu: S3 lifecycle, DynamoDB TTL, retention của CloudWatch Logs.', do: ['li "Xoá đúng hạn: <b>S3 Lifecycle</b>, <b>DynamoDB TTL</b>, Logs retention"'] },
        { say: 'MFA Delete bắt buộc MFA của root khi xoá version hay tắt versioning.', do: ['li "<b>MFA Delete</b>: xoá version / tắt versioning cần MFA root" c=bad'] },
      ],
    },
  ],
};
