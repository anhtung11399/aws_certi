// Kịch bản video: Xác thực
export default {
  scenes: [
    {
      title: 'Ai cần đăng nhập, dùng gì',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Chọn giải pháp định danh theo người dùng.', do: [] },
        { say: 'Nhân viên vào nhiều account AWS: IAM Identity Center, nối với nhà cung cấp danh tính của công ty.', do: ['li "Nhân viên, nhiều account → <b>IAM Identity Center</b> (+ Okta / Entra ID qua SAML, SCIM)" c=ok'] },
        { say: 'Khách hàng của ứng dụng web và mobile: Amazon Cognito.', do: ['li "Người dùng ứng dụng → <b>Cognito</b> user pool / identity pool" c=blue'] },
        { say: 'Máy chủ, ứng dụng: IAM role với credential tạm thời. Máy ngoài AWS dùng IAM Roles Anywhere.', do: ['li "Workload → <b>IAM role</b> · ngoài AWS → <b>Roles Anywhere</b>"'] },
        { say: 'IAM user với access key dài hạn chỉ là phương án cuối cùng.', do: ['li "IAM user + access key dài hạn → <b>tránh</b>" c=bad'] },
      ],
    },
    {
      title: 'IAM Identity Center',
      nodes: {
        idp: [150, 330, 'users', 'IdP công ty', 'Okta, Entra ID'],
        idc: [500, 330, 'identitycenter', 'Identity Center', 'permission set'],
        a1: [900, 190, 'cfn', 'Account Dev', 'role từ permission set'],
        a2: [900, 470, 'cfn', 'Account Prod', 'role từ permission set'],
      },
      steps: [
        { say: 'Người dùng và nhóm đồng bộ từ nhà cung cấp danh tính của công ty qua SCIM, đăng nhập qua SAML.', do: ['show idp,idc', 'edge idp idc "SAML + SCIM" c=go', 'flow idp idc'] },
        { say: 'Permission set là bộ quyền. Gán permission set cho nhóm trên account nào, Identity Center tự tạo role trong account đó.', do: ['show a1,a2', 'edge idc a1', 'edge idc a2', 'flow idc a1', 'flow idc a2 @1.2'] },
        { say: 'Người dùng nhận credential tạm thời, không có access key dài hạn nào.', do: ['ok a1,a2'] },
        { say: 'ABAC: truyền thuộc tính như phòng ban từ IdP thành session tag, dùng trong policy.', do: ['tip "Nhân viên nhiều account → <b>Identity Center</b>. Thuộc tính IdP → <b>attributes for access control</b> (ABAC, <code>aws:PrincipalTag</code>)."'] },
      ],
    },
    {
      title: 'STS và AssumeRole',
      groups: { a: [80, 160, 420, 360, 'account', 'Account A'], b: [780, 160, 420, 360, 'account', 'Account B'] },
      nodes: {
        u: [210, 340, 'user', 'Principal A'],
        sts: [640, 220, 'sts', 'STS', 'AssumeRole'],
        role: [990, 340, 'iam', 'Role trong B', 'trust policy: cho A'],
      },
      steps: [
        { say: 'Truy cập chéo account bằng AssumeRole. Principal ở account A gọi STS.', do: ['show a,b,u,sts', 'edge u sts route=vh', 'flow u sts'] },
        { say: 'Role ở account B phải có trust policy cho phép A. Và A phải có quyền sts:AssumeRole. Thiếu một trong hai là lỗi.', do: ['show role', 'edge sts role route=hv', 'flow sts role', 'badge role "trust policy" c=go'] },
        { say: 'STS trả về credential tạm thời, mặc định một giờ.', do: ['edge role u "credential tạm thời" c=ok route=hvh mid=640', 'flow role u c=ok'] },
        { say: 'Khi bên thứ ba assume role vào account của bạn, bắt buộc external ID để chống lỗi confused deputy.', do: ['tip "Bên thứ ba assume role → <b>sts:ExternalId</b> (confused deputy). AssumeRole cần <b>cả hai</b>: quyền bên gọi + <b>trust policy</b>."'] },
      ],
    },
    {
      title: 'MFA và gỡ lỗi xác thực',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Bắt buộc MFA bằng điều kiện aws:MultiFactorAuthPresent.', do: ['li "Bắt buộc MFA → điều kiện <code>aws:MultiFactorAuthPresent</code>" c=ok'] },
        { say: 'Bẫy: dùng CLI với access key thì không có MFA trong phiên. Phải gọi sts get-session-token kèm mã MFA trước.', do: ['li "CLI với access key → <b>không có MFA</b> → <code>sts get-session-token --serial-number --token-code</code>" c=bad'] },
        { say: 'MFA chống lừa đảo tốt nhất là passkey và khoá bảo mật phần cứng FIDO2.', do: ['li "MFA chống phishing → <b>passkey / FIDO2 security key</b>" c=blue'] },
        { say: 'Lỗi AccessDenied khi assume role: kiểm tra trust policy, external ID, điều kiện MFA, và thời gian phiên tối đa của role.', do: ['tip "AssumeRole lỗi: <b>trust policy</b>, <b>ExternalId</b>, điều kiện MFA / SourceIp, <b>MaxSessionDuration</b>, SCP."'] },
      ],
    },
  ],
};
