// Kịch bản video: Phân quyền
export default {
  scenes: [
    {
      title: 'Đánh giá policy đầy đủ',
      nodes: {
        r: [110, 330, 'user', 'Request'],
        d: [310, 330, 'iam', 'Explicit Deny?'],
        rcp: [500, 330, 'organizations', 'SCP + RCP?'],
        res: [690, 330, 's3', 'Resource policy?'],
        id: [880, 330, 'iam', 'Identity policy?'],
        pb: [1070, 330, 'iam', 'Boundary, session?'],
      },
      steps: [
        { say: 'Đây là domain nặng nhất. Một request được đánh giá qua nhiều lớp policy.', do: ['show r,d', 'edge r d', 'flow r d'] },
        { say: 'Deny tường minh ở bất kỳ đâu: từ chối ngay. Sau đó SCP giới hạn principal, RCP giới hạn tài nguyên trong tổ chức.', do: ['show rcp', 'edge d rcp', 'flow d rcp'] },
        { say: 'Resource policy và identity policy cấp quyền. Cùng account, chỉ cần một trong hai cho phép.', do: ['show res,id', 'edge rcp res', 'edge res id', 'flow rcp res', 'flow res id @1.2'] },
        { say: 'Permission boundary và session policy chỉ giới hạn, không bao giờ cấp thêm.', do: ['show pb', 'edge id pb', 'flow id pb'] },
        { say: 'Khác account: cả resource policy bên kia và identity policy bên này đều phải cho phép.', do: ['tip "Cùng account: identity <b>HOẶC</b> resource policy. Khác account: identity <b>VÀ</b> resource policy. SCP / RCP / boundary <b>chỉ giới hạn</b>."'] },
      ],
    },
    {
      title: 'Các điều kiện hay thi',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Những điều kiện xuất hiện nhiều nhất trong policy của đề.', do: [] },
        { say: 'aws:PrincipalOrgID: chỉ principal trong tổ chức của tôi. aws:ResourceOrgID: chỉ tài nguyên trong tổ chức. Đây là nền của data perimeter.', do: ['li "<code>aws:PrincipalOrgID</code> · <code>aws:ResourceOrgID</code> → <b>data perimeter</b>" c=ok'] },
        { say: 'aws:SourceVpce, aws:SourceVpc: chỉ qua VPC endpoint. aws:SecureTransport bằng false thì từ chối: ép HTTPS.', do: ['li "<code>aws:SourceVpce</code> (qua endpoint) · <code>aws:SecureTransport=false</code> → Deny (ép HTTPS)" c=blue'] },
        { say: 'aws:SourceArn và aws:SourceAccount trong trust policy của dịch vụ: chống confused deputy.', do: ['li "<code>aws:SourceArn</code> / <code>aws:SourceAccount</code> → chống <b>confused deputy</b>"'] },
        { say: 'iam:PassRole: ai được giao role cho dịch vụ. Đây là đường leo quyền kinh điển.', do: ['li "<code>iam:PassRole</code> giới hạn chặt → chặn <b>leo thang đặc quyền</b>" c=bad'] },
      ],
    },
    {
      title: 'RBAC và ABAC',
      nodes: {
        u1: [170, 220, 'user', 'Lan', 'tag team=alpha'],
        u2: [170, 440, 'user', 'Minh', 'tag team=beta'],
        pol: [560, 330, 'iam', 'Một policy ABAC', 'PrincipalTag = ResourceTag'],
        e1: [960, 220, 'ec2', 'EC2', 'team=alpha'],
        e2: [960, 440, 'ec2', 'EC2', 'team=beta'],
      },
      steps: [
        { say: 'RBAC: mỗi vai trò một policy. Thêm dự án là thêm policy, số policy phình ra.', do: ['show u1,u2'] },
        { say: 'ABAC: một policy duy nhất so tag của người với tag của tài nguyên.', do: ['show pol', 'edge u1 pol', 'edge u2 pol'] },
        { say: 'Lan có tag team alpha chỉ thao tác được máy có tag team alpha. Minh tương tự với beta.', do: ['show e1,e2', 'edge pol e1 c=ok', 'edge pol e2 c=ok', 'flow u1 pol', 'flow pol e1 @1.0 c=ok', 'flow u2 pol @1.6', 'flow pol e2 @2.6 c=ok'] },
        { say: 'Phải khoá quyền sửa tag, nếu không người dùng tự đổi tag để vượt quyền.', do: ['tip "ABAC: <code>aws:PrincipalTag/team</code> = <code>aws:ResourceTag/team</code>. Nhớ chặn sửa tag (<code>aws:TagKeys</code>, <code>aws:RequestTag</code>)."'] },
      ],
    },
    {
      title: 'Tìm và sửa quyền sai',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Công cụ tìm quyền sai và thừa.', do: [] },
        { say: 'IAM Access Analyzer: tìm tài nguyên chia sẻ ra ngoài tổ chức, quyền không dùng, và kiểm tra policy trước khi triển khai.', do: ['li "<b>Access Analyzer</b>: external access, unused access, <b>policy validation</b>, custom policy checks" c=ok'] },
        { say: 'Sinh policy tối thiểu từ hoạt động thật trong CloudTrail.', do: ['li "<b>Policy generation</b> từ CloudTrail → least privilege" c=blue'] },
        { say: 'Policy Simulator thử một hành động có được phép không. Thông báo AccessDenied thường nói loại policy nào chặn.', do: ['li "<b>Policy Simulator</b> · đọc thông báo AccessDenied (loại policy chặn)"'] },
        { say: 'Chặn leo quyền: permission boundary cho người được tạo role, giới hạn PassRole.', do: ['tip "Cho dev tự tạo role mà không leo quyền → bắt buộc <b>permission boundary</b> khi tạo (<code>iam:PermissionsBoundary</code>)."'] },
      ],
    },
  ],
};
