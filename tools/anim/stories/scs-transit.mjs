// Kịch bản video: Bảo vệ dữ liệu khi truyền
export default {
  scenes: [
    {
      title: 'Ép buộc mã hoá khi kết nối',
      nodes: {
        c1: [170, 220, 'laptop', 'Client HTTPS'],
        c2: [170, 440, 'laptop', 'Client HTTP'],
        s3: [700, 330, 's3', 'S3', 'Deny SecureTransport=false'],
      },
      steps: [
        { say: 'Bucket policy từ chối mọi request có aws:SecureTransport bằng false. Request không dùng HTTPS bị chặn.', do: ['show c1,c2,s3', 'edge c1 s3 "HTTPS" c=ok', 'edge c2 s3 "HTTP" c=bad', 'flow c1 s3 c=ok', 'flow c2 s3 c=bad @1.0', 'bad c2 @2.0'] },
        { say: 'Có thể yêu cầu cả phiên bản TLS tối thiểu bằng điều kiện s3:TlsVersion.', do: ['note t 860 470 360 "<code>s3:TlsVersion &lt; 1.2</code> → Deny" c=go'] },
        { say: 'Với load balancer, chọn security policy chỉ cho TLS 1.2 và 1.3. RDS ép SSL bằng tham số rds.force_ssl.', do: ['tip "S3 → <code>aws:SecureTransport</code>. ELB / CloudFront → <b>security policy</b> TLS 1.2+. RDS → <code>rds.force_ssl=1</code>. Redshift → <code>require_ssl</code>."'] },
      ],
    },
    {
      title: 'Truy cập riêng tư, không qua Internet',
      groups: { vpc: [80, 160, 520, 360, 'private', 'Private subnet'] },
      nodes: {
        ec2: [220, 340, 'ec2', 'Ứng dụng'],
        ep: [470, 340, 'endpoint', 'VPC endpoint', 'endpoint policy'],
        s3: [900, 220, 's3', 'Bucket của tổ chức', 'aws:ResourceOrgID'],
        ext: [900, 460, 's3', 'Bucket lạ', 'bị chặn'],
      },
      steps: [
        { say: 'Dữ liệu đi qua VPC endpoint thì không ra Internet.', do: ['show vpc,ec2,ep,s3', 'edge ec2 ep', 'edge ep s3 c=ok', 'flow ec2 ep', 'flow ep s3 @1.2 c=ok'] },
        { say: 'Endpoint policy giới hạn chỉ tới bucket của tổ chức mình, chống rò dữ liệu sang bucket của kẻ tấn công.', do: ['show ext', 'edge ep ext c=bad', 'bad ext @0.6'] },
        { say: 'Kết hợp với bucket policy chỉ nhận qua endpoint đó, ta có vành đai dữ liệu hai chiều.', do: ['tip "Data perimeter: <b>endpoint policy</b> (<code>aws:ResourceOrgID</code>) + <b>bucket policy</b> (<code>aws:SourceVpce</code>, <code>aws:PrincipalOrgID</code>)."'] },
      ],
    },
    {
      title: 'Mã hoá giữa các thành phần',
      panel: [90, 150, 1100],
      steps: [
        { say: 'Bên trong hệ thống cũng cần mã hoá.', do: [] },
        { say: 'Load balancer tới máy chủ: dùng target group HTTPS để mã hoá lại. Hoặc NLB chuyển thẳng TCP để máy chủ tự giải mã.', do: ['li "LB → target: <b>HTTPS target group</b> (re-encrypt) hoặc <b>NLB TCP passthrough</b>"'] },
        { say: 'Xác thực hai chiều bằng chứng chỉ: mTLS trên ALB hoặc API Gateway, chứng chỉ client cấp từ AWS Private CA.', do: ['li "<b>mTLS</b> trên ALB / API Gateway, chứng chỉ từ <b>AWS Private CA</b>" c=ok'] },
        { say: 'Giữa các service trong ECS hay EKS: dùng ECS Service Connect hoặc service mesh có TLS.', do: ['li "Service-to-service: <b>Service Connect</b>, mesh với TLS" c=blue'] },
        { say: 'Một số loại máy Nitro tự mã hoá lưu lượng giữa các máy trong cùng VPC ở tầng phần cứng.', do: ['li "Nitro instances: tự mã hoá traffic giữa các instance hỗ trợ"'] },
      ],
    },
  ],
};
