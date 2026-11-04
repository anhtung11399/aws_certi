// Kịch bản video: Secrets, che dữ liệu, chứng chỉ
export default {
  scenes: [
    {
      title: 'Secrets Manager tự xoay vòng mật khẩu',
      nodes: {
        sm: [200, 330, 'secrets', 'Secrets Manager', 'mỗi 30 ngày'],
        fn: [560, 200, 'lambda', 'Rotation Lambda', '4 bước'],
        db: [920, 200, 'rds', 'RDS', 'đổi mật khẩu'],
        app: [920, 460, 'app', 'Ứng dụng', 'luôn đọc bản mới'],
      },
      steps: [
        { say: 'Secrets Manager lưu mật khẩu và tự xoay vòng theo lịch.', do: ['show sm'] },
        { say: 'Một hàm Lambda làm bốn bước: tạo mật khẩu mới, đặt vào database, kiểm tra, rồi đánh dấu là bản hiện hành.', do: ['show fn,db', 'edge sm fn', 'edge fn db c=go', 'flow sm fn', 'flow fn db @1.2'] },
        { say: 'Ứng dụng luôn đọc secret khi cần, không ghi cứng. Mật khẩu đổi mà ứng dụng không phải sửa gì.', do: ['show app', 'edge app sm "GetSecretValue" c=ok route=hvh', 'flow app sm'] },
        { say: 'Lambda xoay vòng trong VPC cần đường tới Secrets Manager, qua NAT hoặc VPC endpoint. Thiếu là xoay vòng thất bại.', do: ['tip "Rotation lỗi: Lambda trong VPC thiếu <b>endpoint / NAT</b> tới Secrets Manager, hoặc SG không vào được DB. RDS có <b>managed rotation</b> sẵn."'] },
      ],
    },
    {
      title: 'Secrets Manager hay Parameter Store',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Hai nơi lưu bí mật.', do: [] },
        { say: 'Secrets Manager: tự xoay vòng, nhân bản sang Region khác, resource policy cho cross-account. Tính phí theo secret.', do: ['li "<b>Secrets Manager</b>: rotation, replica Region, cross-account policy, có phí" c=ok'] },
        { say: 'Parameter Store SecureString: rẻ, nhưng không tự xoay vòng.', do: ['li "<b>Parameter Store SecureString</b>: rẻ, <b>không</b> tự rotate"'] },
        { say: 'Chia sẻ secret cho account khác: resource policy trên secret, và khoá KMS phải là customer managed key cho phép account đó giải mã.', do: ['tip "Secret cross-account: <b>resource policy</b> + <b>customer managed KMS key</b> (không dùng aws/secretsmanager)."'] },
      ],
    },
    {
      title: 'Che dữ liệu nhạy cảm',
      nodes: {
        app: [150, 330, 'lambda', 'Ứng dụng', 'log có email, số thẻ'],
        cw: [560, 330, 'logs', 'CloudWatch Logs', 'data protection policy'],
        u1: [960, 210, 'user', 'Dev', 'thấy ****'],
        u2: [960, 450, 'admin', 'Bảo mật', 'logs:Unmask'],
      },
      steps: [
        { say: 'Ứng dụng lỡ ghi email và số thẻ vào log.', do: ['show app,cw', 'edge app cw', 'flow app cw c=bad'] },
        { say: 'Data protection policy của CloudWatch Logs tự phát hiện và che các trường nhạy cảm.', do: ['badge cw "masked" c=ok'] },
        { say: 'Người đọc thường thấy dấu sao. Chỉ người có quyền logs:Unmask mới xem được bản gốc.', do: ['show u1,u2', 'edge cw u1', 'edge cw u2 c=go', 'flow cw u1', 'flow cw u2 @1.2'] },
        { say: 'Dữ liệu nhạy cảm trong S3 thì Macie tìm. Dữ liệu trong pipeline thì dùng che dữ liệu của Glue hoặc Comprehend.', do: ['tip "Che PII trong log → <b>CloudWatch Logs data protection</b>. Tìm PII trong S3 → <b>Macie</b>. Ảnh / văn bản → <b>Comprehend</b> PII detection."'] },
      ],
    },
    {
      title: 'Chứng chỉ và secret viết cứng',
      panel: [90, 150, 1100],
      steps: [
        { say: 'ACM cấp chứng chỉ public miễn phí, tự gia hạn khi xác thực bằng DNS.', do: ['li "<b>ACM public</b>: miễn phí, DNS validation → tự gia hạn" c=ok'] },
        { say: 'AWS Private CA cấp chứng chỉ nội bộ cho mTLS, máy chủ nội bộ, thiết bị IoT.', do: ['li "<b>AWS Private CA</b>: chứng chỉ nội bộ, mTLS, IoT" c=blue'] },
        { say: 'Theo dõi chứng chỉ sắp hết hạn bằng metric DaysToExpiry và sự kiện của ACM.', do: ['li "Sắp hết hạn → <code>DaysToExpiry</code>, EventBridge event của ACM"'] },
        { say: 'Tìm secret bị viết cứng trong code: CodeGuru Security, Amazon Q, hoặc công cụ quét trong pipeline. Tìm thấy thì xoay vòng ngay, chuyển vào Secrets Manager.', do: ['li "Secret viết cứng → quét bằng <b>CodeGuru Security / Q</b> → <b>xoay vòng ngay</b> → Secrets Manager" c=bad'] },
      ],
    },
  ],
};
