// Kịch bản video: Mẹo thi SCS-C03
export default {
  scenes: [
    {
      title: 'Từ khoá trong đề → đáp án',
      steps: [
        { say: 'Bài cuối: nghe cụm từ trong đề, nghĩ ngay tới dịch vụ.', do: ['big "Đề nói… → nghĩ ngay tới…"'] },
      ],
    },
    {
      title: 'Phát hiện và ứng phó',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Hành vi độc hại, đào coin, credential dùng từ nơi lạ: GuardDuty. Lỗ hổng phần mềm: Inspector. Dữ liệu cá nhân trong S3: Macie.', do: ['li "Độc hại → <b>GuardDuty</b> · CVE → <b>Inspector</b> · PII S3 → <b>Macie</b>"'] },
        { say: 'Điều tra nguyên nhân: Detective. Kho log OCSF: Security Lake.', do: ['li "Điều tra → <b>Detective</b> · OCSF, SIEM → <b>Security Lake</b>" c=blue'] },
        { say: 'Chứng minh log không bị sửa: log file integrity validation. Ai đọc object S3: data events.', do: ['li "Log không bị sửa → <b>integrity validation</b> · ai đọc S3 → <b>data events</b>" c=ok'] },
        { say: 'EC2 bị chiếm: cô lập, giữ bằng chứng, không terminate. Credential role lộ: revoke active sessions.', do: ['li "EC2 bị chiếm → <b>cô lập + snapshot + memory</b> · role lộ → <b>revoke sessions</b>" c=bad'] },
      ],
    },
    {
      title: 'Hạ tầng, danh tính, dữ liệu',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Chặn tên miền khi đi ra: Network Firewall hoặc DNS Firewall. SQL injection, bot: WAF. SSRF lấy credential: IMDSv2.', do: ['li "Lọc tên miền → <b>Network / DNS Firewall</b> · SQLi, bot → <b>WAF</b> · SSRF → <b>IMDSv2</b>"'] },
        { say: 'Nhân viên nhiều account: Identity Center. Bên thứ ba assume role: external ID. Uỷ quyền tạo role: permission boundary.', do: ['li "Nhân viên → <b>Identity Center</b> · bên thứ ba → <b>ExternalId</b> · tạo role an toàn → <b>boundary</b>" c=blue'] },
        { say: 'Chỉ truy cập từ trong tổ chức: RCP và PrincipalOrgID.', do: ['li "Chỉ trong tổ chức → <b>RCP</b>, <code>aws:PrincipalOrgID</code>" c=ok'] },
        { say: 'HSM riêng: CloudHSM. Giải mã ở Region khác: multi-Region key. Không ai xoá được: Object Lock compliance.', do: ['li "HSM riêng → <b>CloudHSM</b> · đa Region → <b>multi-Region key</b> · không xoá được → <b>compliance mode</b>" c=bad'] },
      ],
    },
    {
      title: 'Câu ordering và matching',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Dạng câu mới: sắp xếp thứ tự và ghép cặp. Phải đúng toàn bộ mới có điểm.', do: [] },
        { say: 'Thứ tự xử lý sự cố: giữ bằng chứng và cô lập trước, loại bỏ sau, khôi phục cuối cùng.', do: ['li "IR: <b>protect → cô lập → thu bằng chứng → điều tra → loại bỏ → khôi phục</b>"'] },
        { say: 'Thứ tự import key material: tạo key origin EXTERNAL, lấy wrapping key và import token, bọc material, rồi import.', do: ['li "BYOK: <b>tạo key EXTERNAL → GetParametersForImport → wrap → ImportKeyMaterial</b>" c=ok'] },
        { say: 'Thứ tự xoay vòng access key: tạo key mới, cập nhật ứng dụng, vô hiệu hoá key cũ, kiểm tra, rồi xoá.', do: ['li "Xoay key: <b>tạo mới → cập nhật app → deactivate cũ → kiểm tra → xoá</b>" c=blue'] },
        { say: 'Mẹo: khi thấy bước terminate hay xoá, nó thường nằm cuối cùng.', do: ['tip "Ordering: bước <b>phá huỷ</b> (terminate, delete) luôn ở <b>cuối</b>. Bước <b>giữ bằng chứng</b> luôn ở <b>đầu</b>."'] },
      ],
    },
  ],
};
