// Kịch bản video: Quản trị nhiều account
export default {
  scenes: [
    {
      title: 'Cấu trúc nhiều account',
      groups: {
        org: [60, 140, 1160, 450, 'ou', 'Organization'],
        sec: [300, 200, 280, 330, 'ou', 'OU Security'],
        wl: [640, 200, 520, 330, 'ou', 'OU Workloads'],
      },
      nodes: {
        mg: [170, 360, 'organizations', 'Management', 'chỉ quản lý, billing'],
        log: [440, 290, 's3', 'Log Archive'],
        aud: [440, 425, 'guardduty', 'Audit / Security Tooling', 'delegated admin'],
        dev: [780, 360, 'cfn', 'Dev'],
        prd: [1020, 360, 'cfn', 'Prod'],
      },
      steps: [
        { say: 'Management account chỉ dùng để quản lý Organizations và thanh toán, không chạy ứng dụng. SCP không áp cho nó, nên càng ít người dùng càng tốt.', do: ['show org,mg'] },
        { say: 'OU Security chứa account Log Archive giữ log, và account Audit làm delegated admin cho các dịch vụ bảo mật.', do: ['show sec,log,aud'] },
        { say: 'Workload tách account theo môi trường để giới hạn phạm vi ảnh hưởng. Dev bị chiếm không lan sang Prod.', do: ['show wl,dev,prd', 'bad dev @1.0', 'ok prd @1.4'] },
        { say: 'Thêm OU Suspended cho account chờ đóng, với SCP chặn mọi thứ.', do: ['tip "Không chạy workload ở <b>management account</b>. Dịch vụ bảo mật → <b>delegated admin</b> ở account Security Tooling."'] },
      ],
    },
    {
      title: 'Các loại organization policy',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Organizations có nhiều loại policy, mỗi loại áp lên một thứ.', do: [] },
        { say: 'SCP giới hạn quyền tối đa của principal trong account thành viên.', do: ['li "<b>SCP</b>: giới hạn <b>principal</b> (user, role)"'] },
        { say: 'RCP là mới: giới hạn quyền trên tài nguyên như S3, KMS, STS, áp cả với principal ở ngoài tổ chức. Dùng để dựng vành đai dữ liệu.', do: ['li "<b>RCP</b>: giới hạn <b>tài nguyên</b> (S3, KMS, STS...), cả principal ngoài tổ chức → data perimeter" c=ok'] },
        { say: 'Declarative policy ép cấu hình bền vững: IMDSv2 mặc định, chặn VPC ra Internet, chặn chia sẻ AMI công khai, kể cả khi có API mới.', do: ['li "<b>Declarative policy</b>: IMDSv2, VPC Block Public Access, Allowed AMIs" c=blue'] },
        { say: 'Tag policy chuẩn hoá tag. Backup policy áp kế hoạch backup.', do: ['li "<b>Tag policy</b> · <b>Backup policy</b> · AI opt-out"'] },
        { say: 'Mẫu SCP hay thi: chặn Region, cấm dùng root của account thành viên, cấm tắt dịch vụ bảo mật.', do: ['tip "Chặn principal → <b>SCP</b>. Chặn truy cập vào tài nguyên từ ngoài tổ chức → <b>RCP</b>. Ép cấu hình dịch vụ → <b>declarative policy</b>."'] },
      ],
    },
    {
      title: 'Control Tower',
      nodes: {
        ct: [200, 330, 'controltower', 'Control Tower', 'landing zone'],
        af: [560, 200, 'servicecatalog', 'Account Factory', 'account mới chuẩn sẵn'],
        ctl: [560, 460, 'config', 'Controls', 'preventive · detective · proactive'],
        acc: [940, 200, 'cfn', 'Account mới'],
      },
      steps: [
        { say: 'Control Tower dựng landing zone: Organizations, OU Security, Log Archive, Audit, organization trail, Config ở mọi account.', do: ['show ct'] },
        { say: 'Account Factory tạo account mới đã có sẵn mọi cấu hình chuẩn.', do: ['show af,acc', 'edge ct af', 'edge af acc c=ok', 'flow ct af', 'flow af acc @1.2'] },
        { say: 'Controls có ba loại: preventive dùng SCP, detective dùng Config rule, proactive dùng CloudFormation Hook kiểm tra trước khi tạo.', do: ['show ctl', 'edge ct ctl'] },
        { say: 'Ai sửa tay SCP hay role do Control Tower quản lý thì sinh drift, phải repair landing zone.', do: ['tip "Landing zone, account mới chuẩn sẵn → <b>Control Tower + Account Factory</b>. Sửa tay → <b>drift</b> → repair. Proactive control = <b>CloudFormation Hook</b>."'] },
      ],
    },
    {
      title: 'Root user và break-glass',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Quản lý root của account thành viên tập trung: xoá hết credential root, việc cần root thì mở phiên đặc quyền ngắn hạn từ management account.', do: ['li "<b>Centralized root access</b>: xoá credential root thành viên, <b>privileged root session</b> khi cần" c=ok'] },
        { say: 'Root của management account: mật khẩu mạnh, MFA phần cứng, không access key, email nhóm.', do: ['li "Root management: MFA phần cứng / passkey, <b>không access key</b>, email nhóm"'] },
        { say: 'Cảnh báo mỗi lần root đăng nhập, bằng EventBridge hoặc GuardDuty.', do: ['li "Cảnh báo root đăng nhập: EventBridge <code>ConsoleLogin</code> Root · GuardDuty <code>RootCredentialUsage</code>" c=bad'] },
        { say: 'Break-glass: một role hoặc user khẩn cấp ngoài Identity Center, MFA phần cứng cất trong két, mọi lần dùng đều báo động.', do: ['li "<b>Break-glass</b>: tách khỏi IdP, MFA trong két, dùng là báo động, diễn tập định kỳ" c=blue'] },
      ],
    },
  ],
};
