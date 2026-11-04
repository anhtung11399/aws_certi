// Kịch bản video: Phản ứng với sự cố
export default {
  scenes: [
    {
      title: 'EC2 bị chiếm quyền: làm theo thứ tự',
      groups: { asg: [80, 160, 340, 360, 'plain', 'Auto Scaling group'], iso: [700, 160, 300, 360, 'bad', 'SG cách ly · không rule'] },
      nodes: {
        ec2: [250, 340, 'ec2', 'EC2 bị chiếm'],
        q: [850, 340, 'ec2', 'EC2 đã cô lập', 'Quarantine=true'],
        snap: [1130, 220, 'snapshot', 'Snapshot EBS'],
        mem: [1130, 460, 'file', 'Memory dump', 'qua SSM'],
      },
      steps: [
        { say: 'Máy EC2 bị chiếm quyền. Đây là dạng câu sắp xếp thứ tự rất hay gặp.', do: ['show asg,ec2', 'badge ec2 "COMPROMISED" c=bad'] },
        { say: 'Bước một: bật termination protection, gắn tag đánh dấu, ghi lại thông tin máy.', do: ['badge ec2 "1. protect + tag" c=go'] },
        { say: 'Bước hai: tách máy khỏi Auto Scaling group và target group, để Auto Scaling không xoá mất bằng chứng.', do: ['show iso,q', 'edge ec2 q "2. detach" c=go', 'flow ec2 q'] },
        { say: 'Bước ba: cô lập mạng bằng security group không có rule nào.', do: ['hl q', 'badge q "3. isolate" c=bad'] },
        { say: 'Bước bốn: thu bằng chứng. Chụp snapshot mọi ổ đĩa, và chụp bộ nhớ qua SSM trước khi tắt máy.', do: ['show snap,mem', 'edge q snap c=ok', 'edge q mem c=ok', 'flow q snap', 'flow q mem @1.2'] },
        { say: 'Bẫy: đáp án terminate ngay hoặc stop máy để chụp snapshot là sai. Tắt máy là mất dữ liệu trong RAM.', do: ['tip "<b>Không</b> terminate / stop ngay → mất RAM. Thứ tự: <b>protect → detach ASG / TG → SG cách ly → snapshot + memory → điều tra ở forensics account</b>."'] },
      ],
    },
    {
      title: 'Security group cách ly: một chi tiết hay bị quên',
      nodes: {
        att: [170, 330, 'hacker', 'Kẻ tấn công', 'kết nối đang mở'],
        q: [620, 330, 'ec2', 'EC2', 'đã đổi SG cách ly'],
        nacl: [620, 520, 'nacl', 'NACL Deny', 'cắt mọi kết nối'],
      },
      steps: [
        { say: 'Security group là stateful. Kết nối đang mở từ trước vẫn có thể còn sống sau khi đổi sang security group cách ly.', do: ['show att,q', 'edge att q "phiên SSH cũ" c=bad both', 'flow att q c=bad'] },
        { say: 'Muốn cắt ngay mọi kết nối, thêm NACL deny ở subnet, vì NACL không theo dõi trạng thái.', do: ['show nacl', 'edge nacl q c=ok route=v', 'bad att @0.8'] },
        { say: 'Hoặc đổi sang security group cho phép mọi thứ trước, rồi mới đổi sang security group rỗng, để các kết nối đang được theo dõi bị huỷ.', do: ['tip "SG stateful: kết nối <b>tracked</b> có thể còn. Cắt ngay → <b>NACL Deny</b> ở subnet."'] },
      ],
    },
    {
      title: 'Access key bị lộ lên GitHub',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Access key của IAM user bị đẩy lên GitHub. AWS thường tự gắn policy cách ly và gửi thông báo qua AWS Health.', do: [] },
        { say: 'Một: vô hiệu hoá access key ngay lập tức.', do: ['li "1. <b>Deactivate</b> access key ngay" c=bad'] },
        { say: 'Hai: tra CloudTrail mọi hành động của key đó. Kẻ tấn công thường tạo thêm user, key, role, hay máy đào coin.', do: ['li "2. Tra <b>CloudTrail</b> theo access key ID: user / key / role / máy mới tạo?"'] },
        { say: 'Ba: dọn mọi thứ kẻ tấn công tạo ra, kiểm tra mọi Region.', do: ['li "3. Dọn tài nguyên lạ ở <b>mọi Region</b>, xem hoá đơn" c=blue'] },
        { say: 'Bốn: tạo key mới cho ứng dụng. Tốt hơn nữa là chuyển sang dùng role, rồi xoá key cũ.', do: ['li "4. Xoay vòng: tốt nhất chuyển sang <b>IAM role</b>, xoá key cũ" c=ok'] },
      ],
    },
    {
      title: 'Credential tạm thời của role bị lộ',
      nodes: {
        ec2: [180, 330, 'ec2', 'EC2', 'IMDSv1 + lỗ hổng SSRF'],
        att: [560, 200, 'hacker', 'Kẻ tấn công', 'dùng credential ngoài AWS'],
        role: [560, 460, 'iam', 'Role', 'Revoke active sessions'],
        s3: [960, 330, 's3', 'Dữ liệu'],
      },
      steps: [
        { say: 'Kẻ tấn công lợi dụng lỗ hổng SSRF đọc credential của role từ metadata của máy, rồi dùng nó từ ngoài AWS.', do: ['show ec2,att,s3', 'edge ec2 att "credential bị đọc" c=bad route=hvh', 'edge att s3 c=bad route=hvh', 'flow ec2 att', 'flow att s3 @1.4'] },
        { say: 'GuardDuty báo finding InstanceCredentialExfiltration. Credential tạm thời không xoá được.', do: ['badge att "InstanceCredentialExfiltration" c=bad'] },
        { say: 'Dùng Revoke active sessions trên role. IAM gắn policy từ chối mọi credential cấp trước thời điểm thu hồi.', do: ['show role', 'edge role att "Deny aws:TokenIssueTime cũ" c=ok route=v', 'bad att @1.0'] },
        { say: 'Phòng ngừa: bắt buộc IMDSv2, vì nó chặn phần lớn kiểu tấn công SSRF.', do: ['tip "Credential tạm thời lộ → <b>Revoke active sessions</b> (Deny theo <code>aws:TokenIssueTime</code>). Phòng ngừa → <b>IMDSv2</b> bắt buộc."'] },
      ],
    },
    {
      title: 'Thu và giữ bằng chứng',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Bằng chứng phải được thu đúng thứ tự và giữ nguyên vẹn.', do: [] },
        { say: 'Bộ nhớ thu trước tiên, vì dễ mất nhất, bằng công cụ chạy qua SSM Run Command.', do: ['li "<b>RAM</b> trước tiên (LiME, AVML qua <b>SSM Run Command</b>) → S3" c=bad'] },
        { say: 'Ổ đĩa: snapshot mọi volume, copy sang account forensics, mã hoá bằng khoá của forensics.', do: ['li "<b>Đĩa</b>: snapshot EBS → copy sang forensics account (key của forensics)"'] },
        { say: 'Giữ chuỗi giám sát bằng chứng: ai thu, lúc nào, mã băm SHA-256, lưu ở đâu.', do: ['li "<b>Chain of custody</b>: ai, khi nào, <b>hash SHA-256</b>, lưu ở đâu" c=blue'] },
        { say: 'Bucket bằng chứng có versioning, Object Lock chế độ compliance, mã hoá KMS.', do: ['li "Bucket bằng chứng: versioning + <b>Object Lock compliance</b> + SSE-KMS" c=ok'] },
      ],
    },
  ],
};
