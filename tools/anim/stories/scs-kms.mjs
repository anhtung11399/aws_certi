// Kịch bản video: KMS và CloudHSM
export default {
  scenes: [
    {
      title: 'Ba loại key',
      panel: [90, 150, 1100],
      steps: [
        { say: 'KMS có ba loại key theo người quản lý.', do: [] },
        { say: 'AWS owned key: AWS dùng chung cho nhiều khách hàng. Bạn không thấy, không kiểm soát.', do: ['li "<b>AWS owned</b>: không thấy, không kiểm soát, miễn phí"'] },
        { say: 'AWS managed key, như aws/s3, aws/ebs: nằm trong account của bạn nhưng không sửa được key policy, không chia sẻ sang account khác được.', do: ['li "<b>AWS managed</b> (aws/s3...): không sửa policy, <b>không chia sẻ cross-account</b>" c=bad'] },
        { say: 'Customer managed key: bạn viết key policy, bật tắt, xoay vòng, chia sẻ cross-account, xoá sau bảy tới ba mươi ngày chờ.', do: ['li "<b>Customer managed</b>: tự viết key policy, rotate, chia sẻ, xoá sau 7–30 ngày" c=ok'] },
        { say: 'Chia sẻ snapshot hay AMI mã hoá cho account khác: bắt buộc customer managed key.', do: ['tip "Cần chia sẻ dữ liệu mã hoá cross-account → <b>customer managed key</b>. AWS managed key <b>không</b> làm được."'] },
      ],
    },
    {
      title: 'Envelope encryption',
      nodes: {
        app: [150, 330, 'app', 'Ứng dụng', '1 GB dữ liệu'],
        kms: [520, 200, 'kms', 'KMS key', 'không rời KMS'],
        dk: [520, 460, 'file', 'Data key', 'plaintext + bản mã'],
        out: [950, 330, 's3', 'Dữ liệu đã mã hoá', '+ data key đã mã hoá'],
      },
      steps: [
        { say: 'KMS chỉ mã hoá trực tiếp tối đa bốn KB. Dữ liệu lớn dùng envelope encryption.', do: ['show app,kms'] },
        { say: 'Ứng dụng gọi GenerateDataKey. KMS trả về data key ở hai dạng: bản rõ và bản đã mã hoá bằng KMS key.', do: ['show dk', 'edge app kms "GenerateDataKey" route=hvh', 'edge kms dk route=v', 'flow app kms', 'flow kms dk @1.2'] },
        { say: 'Dùng data key bản rõ mã hoá dữ liệu ngay tại chỗ, rồi xoá nó khỏi bộ nhớ. Lưu dữ liệu đã mã hoá cùng data key đã mã hoá.', do: ['show out', 'edge dk out c=ok route=hvh', 'flow dk out c=ok'] },
        { say: 'Khi đọc, gửi data key đã mã hoá cho KMS giải mã, rồi giải mã dữ liệu. S3, EBS, RDS làm việc này tự động.', do: ['tip "KMS mã hoá trực tiếp tối đa <b>4 KB</b>. Lớn hơn → <b>GenerateDataKey</b> (envelope). Tự làm phía client → <b>AWS Encryption SDK</b>."'] },
      ],
    },
    {
      title: 'Key policy: phần quan trọng nhất',
      nodes: {
        u: [150, 330, 'user', 'User', 'IAM policy: kms:Decrypt'],
        kp: [560, 330, 'iam', 'Key policy', 'cho account root?'],
        key: [960, 330, 'kms', 'KMS key'],
      },
      steps: [
        { say: 'Mỗi KMS key bắt buộc có key policy. Đây là điểm khác mọi dịch vụ khác.', do: ['show u,kp,key', 'edge u kp', 'edge kp key'] },
        { say: 'IAM policy chỉ có tác dụng khi key policy có câu cho phép account root. Thiếu câu đó thì IAM policy cho phép cũng vô ích.', do: ['flow u kp', 'badge kp "thiếu root → DENY" c=bad @0.8'] },
        { say: 'Tách vai trò: key administrator quản lý key nhưng không mã hoá được, key user dùng key nhưng không sửa policy.', do: ['note r 360 470 560 "<b>Key admin</b>: quản lý, không encrypt · <b>Key user</b>: dùng, không sửa policy" c=go'] },
        { say: 'Điều kiện kms:ViaService giới hạn key chỉ dùng qua một dịch vụ, ví dụ chỉ qua S3.', do: ['tip "Key policy <b>bắt buộc</b>, IAM chỉ hiệu lực khi key policy cho account root. Chỉ dùng qua S3 → <code>kms:ViaService</code>. Cross-account: key policy <b>và</b> IAM bên kia."'] },
      ],
    },
    {
      title: 'Rotation và key material',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Xoay vòng tự động giữ nguyên key ID, giữ material cũ để giải mã dữ liệu cũ. Dữ liệu cũ không bị mã hoá lại.', do: ['li "Rotation tự động (90–2560 ngày): <b>giữ key ID</b>, giữ material cũ, không mã hoá lại" c=ok'] },
        { say: 'Imported key material, hay BYOK: bạn tự sinh khoá và nhập vào. Đặt được thời hạn, xoá được ngay lập tức. Nhưng bạn chịu trách nhiệm giữ bản gốc.', do: ['li "<b>BYOK</b>: tự sinh, đặt <b>expiration</b>, xoá <b>ngay</b>, bạn giữ bản gốc" c=bad'] },
        { say: 'Multi-Region key: cùng material ở nhiều Region, giải mã ở Region khác không cần gọi về Region gốc.', do: ['li "<b>Multi-Region key</b>: DynamoDB Global Tables, dữ liệu đa Region" c=blue'] },
        { say: 'External key store: khoá nằm ngoài AWS. Ngắt kết nối là AWS không giải mã được gì.', do: ['li "<b>XKS</b>: key ngoài AWS, \'hold your own key\'"'] },
        { say: 'Xoá nhầm key: trong thời gian chờ có thể huỷ lịch xoá. Đặt alarm khi có ai dùng key đang chờ xoá.', do: ['tip "Key <b>pending deletion</b> → <code>CancelKeyDeletion</code>. Đặt CloudWatch alarm khi có request tới key đang chờ xoá."'] },
      ],
    },
    {
      title: 'CloudHSM',
      nodes: {
        app: [170, 330, 'app', 'Ứng dụng', 'PKCS#11, JCE'],
        hsm: [560, 330, 'cloudhsm', 'CloudHSM cluster', 'single-tenant, FIPS 140-3 L3'],
        kms: [960, 330, 'kms', 'KMS custom key store', 'key trong HSM của bạn'],
      },
      steps: [
        { say: 'CloudHSM là thiết bị HSM riêng của bạn, chỉ một khách hàng dùng. Bạn quản lý người dùng và khoá, AWS không truy cập được.', do: ['show app,hsm', 'edge app hsm', 'flow app hsm'] },
        { say: 'Dùng khi quy định bắt buộc HSM riêng, hoặc cần SSL offload, ký số, Oracle TDE.', do: ['badge hsm "bạn quản lý key" c=go'] },
        { say: 'Nối CloudHSM làm custom key store của KMS: dịch vụ AWS dùng KMS như thường, nhưng khoá nằm trong HSM của bạn.', do: ['show kms', 'edge hsm kms c=ok', 'tip "HSM riêng, single-tenant, bạn toàn quyền → <b>CloudHSM</b>. Muốn dịch vụ AWS dùng key đó → <b>KMS custom key store</b>. Cluster nhiều AZ để chịu lỗi."'] },
      ],
    },
  ],
};
