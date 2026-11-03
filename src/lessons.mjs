// Hai lộ trình. Thứ tự trong LESSONS = thứ tự học. File nội dung: src/lessons/<slug>.html
// video: để trống, sẽ gắn link video bài giảng sau
export const TRACKS = [
  {
    id: 'soa', code: 'SOA-C03', name: 'CloudOps Engineer – Associate', short: 'CloudOps', color: '#ff9900',
    exam: '65 câu (50 tính điểm + 15 không tính), 130 phút, điểm đậu 720/1000',
    desc: 'Vận hành hệ thống trên AWS: giám sát, tự động khắc phục, độ tin cậy, triển khai bằng IaC, bảo mật vận hành và mạng.',
  },
  {
    id: 'scs', code: 'SCS-C03', name: 'Security – Specialty', short: 'Security', color: '#dd344c',
    exam: '65 câu (50 tính điểm + 15 không tính), 170 phút, điểm đậu 750/1000',
    desc: 'Bảo mật chuyên sâu: phát hiện, ứng phó sự cố, bảo mật hạ tầng, IAM, bảo vệ dữ liệu, quản trị nhiều tài khoản.',
  },
];

export const PHASES = [
  { id: 's0', track: 'soa', no: 0, name: 'Khởi động', color: '#64748b', desc: 'Cấu trúc đề, khác SAA ở đâu, cách học.' },
  { id: 's1', track: 'soa', no: 1, name: 'Domain 1 · Monitoring, Logging, Remediation, Performance (22%)', color: '#ff9900', desc: 'CloudWatch, EventBridge, Systems Manager, tối ưu hiệu năng compute, storage, database.' },
  { id: 's2', track: 'soa', no: 2, name: 'Domain 2 · Reliability & Business Continuity (22%)', color: '#16a34a', desc: 'ELB, Auto Scaling, Route 53, backup và DR.' },
  { id: 's3', track: 'soa', no: 3, name: 'Domain 3 · Deployment, Provisioning & Automation (22%)', color: '#7c3aed', desc: 'CloudFormation, CDK, StackSets, AMI, chiến lược deploy.' },
  { id: 's4', track: 'soa', no: 4, name: 'Domain 4 · Security & Compliance (16%)', color: '#dc2626', desc: 'IAM, KMS, Config, các dịch vụ bảo mật ở góc nhìn vận hành.' },
  { id: 's5', track: 'soa', no: 5, name: 'Domain 5 · Networking & Content Delivery (18%)', color: '#0284c7', desc: 'Xử lý sự cố VPC, kết nối lai, Route 53 Resolver, CloudFront.' },
  { id: 's6', track: 'soa', no: 6, name: 'Về đích', color: '#0f766e', desc: 'Bảng từ khoá, mẹo làm bài, rồi luyện đề.' },

  { id: 'c0', track: 'scs', no: 0, name: 'Khởi động', color: '#64748b', desc: 'Cấu trúc đề SCS-C03, tư duy bảo mật trên AWS.' },
  { id: 'c1', track: 'scs', no: 1, name: 'Domain 1 · Detection (16%)', color: '#ea580c', desc: 'GuardDuty, Security Hub, Macie, Inspector, Security Lake, logging tập trung.' },
  { id: 'c2', track: 'scs', no: 2, name: 'Domain 2 · Incident Response (14%)', color: '#b91c1c', desc: 'Kế hoạch ứng phó, cô lập, điều tra, tự động hoá phản ứng.' },
  { id: 'c3', track: 'scs', no: 3, name: 'Domain 3 · Infrastructure Security (18%)', color: '#0284c7', desc: 'Bảo vệ biên mạng, VPC, compute, WAF, Shield, Network Firewall.' },
  { id: 'c4', track: 'scs', no: 4, name: 'Domain 4 · Identity & Access Management (20%)', color: '#7c3aed', desc: 'Xác thực, phân quyền, chính sách, xử lý lỗi Access Denied.' },
  { id: 'c5', track: 'scs', no: 5, name: 'Domain 5 · Data Protection (18%)', color: '#16a34a', desc: 'KMS, CloudHSM, mã hoá S3 / EBS / RDS, secrets, TLS.' },
  { id: 'c6', track: 'scs', no: 6, name: 'Domain 6 · Security Foundations & Governance (14%)', color: '#ca8a04', desc: 'Organizations, Control Tower, SCP / RCP, triển khai nhất quán, tuân thủ.' },
  { id: 'c7', track: 'scs', no: 7, name: 'Về đích', color: '#0f766e', desc: 'Bảng từ khoá, mẹo làm bài, rồi luyện đề.' },
];

export const LESSONS = [
  // ---------- SOA-C03 ----------
  { slug: 'soa-tong-quan', phase: 's0', mins: 20, title: 'Đề SOA-C03 và cách học', desc: 'Cấu trúc đề, 5 domain, khác SAA-C03 ở đâu, lộ trình học.', goals: ['Biết đề hỏi gì và tỉ trọng từng domain', 'Biết phần nào đã có từ SAA, phần nào phải học mới', 'Có kế hoạch học'] },
  { slug: 'soa-cloudwatch', phase: 's1', mins: 75, title: 'CloudWatch metrics và alarms', desc: 'Metric có sẵn và custom, resolution, CloudWatch agent (cấu hình chi tiết), alarm, composite alarm, anomaly detection, metric math, dashboards nhiều account.', goals: ['Biết metric nào có sẵn, metric nào cần agent', 'Cấu hình được agent cho EC2, on-premises, container', 'Dựng alarm đúng và hiểu từng tham số'] },
  { slug: 'soa-cloudwatch-logs', phase: 's1', mins: 70, title: 'CloudWatch Logs, tracing và observability', desc: 'Log group, retention, metric filter, Logs Insights, subscription, export, Embedded Metric Format, X-Ray, Application Signals, Synthetics, RUM, Container / Lambda Insights, Prometheus, Grafana, CloudTrail cho vận hành.', goals: ['Đưa log từ mọi nguồn vào CloudWatch và phân tích được', 'Chọn đúng công cụ tracing / giám sát người dùng', 'Gom log nhiều account'] },
  { slug: 'soa-eventbridge', phase: 's1', mins: 50, title: 'EventBridge: tự động hoá theo sự kiện', desc: 'Event bus, event pattern, target, input transformer, cross-account / cross-Region, Scheduler, Pipes, archive và replay, AWS Health, xử lý sự cố rule.', goals: ['Viết event pattern đúng', 'Ghép event với hành động khắc phục', 'Sửa rule không chạy'] },
  { slug: 'soa-ssm', phase: 's1', mins: 80, title: 'Systems Manager toàn tập', desc: 'Managed node, Run Command, Automation runbook, Patch Manager, State Manager, Maintenance Windows, Session Manager, Parameter Store, Inventory, OpsCenter, Incident Manager, Distributor, Change Manager, hybrid activation.', goals: ['Chọn đúng tính năng SSM cho từng việc', 'Vá lỗi máy chủ hàng loạt an toàn', 'Viết và chạy runbook tự khắc phục'] },
  { slug: 'soa-perf-compute', phase: 's1', mins: 60, title: 'EC2: chẩn đoán và tối ưu', desc: 'Instance family, status check, lỗi khởi chạy, placement group, ENA / EFA, burstable, Nitro, Capacity Reservation, Spot, Compute Optimizer, chi phí.', goals: ['Chẩn đoán EC2 chậm hay lỗi', 'Chọn instance và cấu hình mạng phù hợp', 'Right-size và tối ưu chi phí'] },
  { slug: 'soa-perf-storage', phase: 's1', mins: 75, title: 'Storage: EBS, S3, EFS, FSx, DataSync', desc: 'Loại EBS và giới hạn, Elastic Volumes, snapshot, FSR, S3 performance, multipart, Transfer Acceleration, lifecycle, storage class, EFS / FSx, DataSync, Storage Gateway.', goals: ['Chọn và chỉnh EBS theo IOPS / throughput', 'Tăng tốc và tiết kiệm S3', 'Chọn shared storage đúng'] },
  { slug: 'soa-perf-database', phase: 's1', mins: 60, title: 'Database: RDS, Aurora, DynamoDB, ElastiCache', desc: 'Metric, Performance Insights, Enhanced Monitoring, RDS Proxy, parameter group, read replica, Multi-AZ, Aurora, DynamoDB capacity và throttle, DAX, ElastiCache.', goals: ['Tìm nguyên nhân database chậm', 'Chọn giải pháp mở rộng đọc / ghi', 'Xử lý throttle và hết kết nối'] },
  { slug: 'soa-elb-asg', phase: 's2', mins: 70, title: 'Load balancer và Auto Scaling', desc: 'ALB / NLB / GWLB, target group, health check, mã lỗi, access log, stickiness, cross-zone, TLS; ASG: policy, lifecycle hook, warm pool, instance refresh, health check, xử lý sự cố.', goals: ['Đọc mã lỗi ELB và tìm nguyên nhân', 'Cấu hình scaling đúng cho từng kiểu tải', 'Sửa ASG launch / terminate lỗi'] },
  { slug: 'soa-route53', phase: 's2', mins: 50, title: 'Route 53 và tính sẵn sàng nhiều Region', desc: 'Hosted zone, record, alias, routing policy, health check, DNS failover, Application Recovery Controller, thiết kế Multi-AZ / Multi-Region.', goals: ['Chọn routing policy', 'Cấu hình health check và failover', 'Thiết kế sống sót khi mất AZ / Region'] },
  { slug: 'soa-backup-dr', phase: 's2', mins: 55, title: 'Backup và khôi phục thảm hoạ', desc: 'RPO / RTO, 4 chiến lược DR, AWS Backup chi tiết, khôi phục từng dịch vụ, S3 versioning / replication, Elastic Disaster Recovery.', goals: ['Chọn chiến lược DR theo RPO / RTO', 'Cấu hình AWS Backup tập trung', 'Khôi phục đúng loại tài nguyên'] },
  { slug: 'soa-cloudformation', phase: 's3', mins: 80, title: 'CloudFormation chuyên sâu', desc: 'Template, intrinsic function, pseudo parameter, dynamic reference, change set, drift, stack policy, rollback, helper scripts, nested stack, StackSets, lỗi và cách xử lý, CDK, Terraform.', goals: ['Đọc và sửa lỗi CloudFormation', 'Triển khai nhiều account / Region', 'Bảo vệ tài nguyên khi update / xoá'] },
  { slug: 'soa-ami-sharing', phase: 's3', mins: 40, title: 'AMI, container image và chia sẻ tài nguyên', desc: 'EC2 Image Builder, quản lý AMI, ECR, chia sẻ AMI / snapshot, AWS RAM, Service Catalog, Service Quotas.', goals: ['Dựng image chuẩn tự động', 'Chia sẻ tài nguyên giữa account an toàn'] },
  { slug: 'soa-deploy-automation', phase: 's3', mins: 60, title: 'Deploy và vận hành ứng dụng', desc: 'Chiến lược deploy, Elastic Beanstalk, CodeDeploy, ECS / EKS / Lambda ở góc vận hành, automation hướng sự kiện.', goals: ['Chọn chiến lược deploy theo yêu cầu', 'Vận hành container và serverless', 'Dựng automation hướng sự kiện'] },
  { slug: 'soa-security', phase: 's4', mins: 70, title: 'IAM và bảo mật trong vận hành', desc: 'IAM troubleshooting, policy, role, MFA, Organizations / SCP, Identity Center, Access Analyzer, credential report, KMS, ACM, Secrets Manager.', goals: ['Sửa lỗi AccessDenied', 'Quản lý quyền và bí mật đúng cách', 'Dùng KMS và ACM trong vận hành'] },
  { slug: 'soa-compliance', phase: 's4', mins: 55, title: 'Tuân thủ: Config, Security Hub, GuardDuty, Inspector', desc: 'AWS Config chi tiết, remediation, conformance pack, aggregator; Security Hub, GuardDuty, Inspector, Macie, Trusted Advisor, CloudTrail.', goals: ['Bắt tài nguyên sai cấu hình và tự sửa', 'Biết dịch vụ bảo mật nào làm gì'] },
  { slug: 'soa-networking', phase: 's5', mins: 80, title: 'VPC và xử lý sự cố mạng', desc: 'Subnet, route table, IGW, NAT, SG vs NACL, VPC endpoint, Flow Logs, Reachability Analyzer, IPv6, IPAM, VPC sharing, các lỗi kết nối kinh điển.', goals: ['Tìm ra vì sao hai máy không nói chuyện được', 'Cấu hình endpoint, NAT đúng'] },
  { slug: 'soa-hybrid-dns', phase: 's5', mins: 60, title: 'Kết nối lai và DNS', desc: 'VPC peering, Transit Gateway, Site-to-Site VPN, Direct Connect, Client VPN, PrivateLink, Route 53 Resolver endpoints và rules, DNS Firewall.', goals: ['Chọn cách kết nối VPC và on-premises', 'Cấu hình phân giải DNS hai chiều'] },
  { slug: 'soa-cdn', phase: 's5', mins: 55, title: 'CloudFront, WAF, Shield và Global Accelerator', desc: 'Cache behavior, cache / origin request policy, TTL, invalidation, OAC, signed URL, lỗi 4xx / 5xx, edge function, WAF rule, Shield, Global Accelerator.', goals: ['Cấu hình CloudFront đúng cho S3 và ALB', 'Xử lý lỗi cache và lỗi origin', 'Bảo vệ ứng dụng ở biên'] },
  { slug: 'soa-meo-thi', phase: 's6', mins: 30, title: 'Bảng từ khoá và mẹo làm bài SOA', desc: 'Từ khoá trong đề trỏ tới dịch vụ nào, bẫy hay gặp, cách loại đáp án.', goals: ['Nhìn từ khoá là đoán được hướng đáp án', 'Tránh các bẫy kinh điển'] },

  // ---------- SCS-C03 ----------
  { slug: 'scs-tong-quan', phase: 'c0', mins: 20, title: 'Đề SCS-C03 và tư duy bảo mật AWS', desc: '6 domain, dạng câu hỏi mới (ordering, matching), shared responsibility, phòng thủ nhiều lớp.', goals: ['Biết đề hỏi gì', 'Có khung tư duy để chọn đáp án bảo mật'] },
  { slug: 'scs-detection', phase: 'c1', mins: 60, title: 'Dịch vụ phát hiện mối đe doạ', desc: 'GuardDuty, Security Hub, Macie, Inspector, Detective, Security Lake, Config, cách tổng hợp nhiều account.', goals: ['Phân biệt rõ 6 dịch vụ phát hiện', 'Bật tập trung cho cả Organization bằng delegated administrator'] },
  { slug: 'scs-logging', phase: 'c1', mins: 55, title: 'Logging tập trung và phân tích log', desc: 'CloudTrail (organization trail, data events, integrity validation, Lake), VPC / TGW Flow Logs, Route 53 Resolver logs, Athena, Logs Insights, sửa lỗi thiếu log.', goals: ['Thiết kế account log tập trung', 'Biết log nào trả lời câu hỏi nào', 'Sửa lỗi log không về'] },
  { slug: 'scs-incident-response', phase: 'c2', mins: 55, title: 'Ứng phó sự cố', desc: 'Quy trình IR, cô lập EC2, thu thập bằng chứng, credential bị lộ, tự động hoá phản ứng bằng EventBridge, Lambda, SSM.', goals: ['Biết đúng thứ tự xử lý EC2 bị chiếm', 'Xử lý access key bị lộ', 'Dựng phản ứng tự động'] },
  { slug: 'scs-infra-network', phase: 'c3', mins: 60, title: 'Bảo mật mạng và biên', desc: 'SG, NACL, VPC endpoint policy, PrivateLink, Network Firewall, WAF, Shield Advanced, CloudFront, Firewall Manager, Route 53 Resolver DNS Firewall.', goals: ['Chọn đúng lớp bảo vệ cho layer 3 đến 7', 'Chặn dữ liệu đi ra ngoài trái phép'] },
  { slug: 'scs-infra-compute', phase: 'c3', mins: 40, title: 'Bảo mật compute và container', desc: 'IMDSv2, Session Manager thay SSH, Inspector, patching, ECR scanning, Lambda, EKS / ECS, Nitro Enclaves.', goals: ['Giảm bề mặt tấn công của EC2', 'Quản lý lỗ hổng phần mềm'] },
  { slug: 'scs-iam-authn', phase: 'c4', mins: 55, title: 'Xác thực: Identity Center, federation, Cognito, STS', desc: 'IAM Identity Center, SAML / OIDC, Cognito user pool và identity pool, STS AssumeRole, external ID, presigned URL, IAM Roles Anywhere.', goals: ['Chọn giải pháp định danh cho người, ứng dụng, máy', 'Cấp thông tin xác thực tạm thời đúng cách'] },
  { slug: 'scs-iam-authz', phase: 'c4', mins: 65, title: 'Phân quyền: logic đánh giá policy và Access Analyzer', desc: 'Thứ tự đánh giá policy, SCP, RCP, permission boundary, session policy, resource policy, cross-account, ABAC, Access Analyzer, Policy Simulator, Verified Permissions.', goals: ['Đoán đúng một request bị Allow hay Deny', 'Viết policy least privilege', 'Tìm quyền thừa'] },
  { slug: 'scs-kms', phase: 'c5', mins: 60, title: 'KMS, CloudHSM và mã hoá', desc: 'Key type, key policy, grant, envelope encryption, rotation, multi-Region key, imported key material, CloudHSM, encryption context.', goals: ['Đọc hiểu key policy', 'Chọn KMS hay CloudHSM', 'Xử lý lỗi không giải mã được'] },
  { slug: 'scs-data-protection', phase: 'c5', mins: 55, title: 'Bảo vệ dữ liệu: S3, secrets, TLS, backup', desc: 'Mã hoá S3 / EBS / RDS, bucket policy ép mã hoá và TLS, Object Lock, Secrets Manager vs Parameter Store, ACM, Macie, Backup Vault Lock.', goals: ['Ép buộc mã hoá at rest và in transit', 'Quản lý secret và xoay vòng', 'Chống xoá dữ liệu (WORM)'] },
  { slug: 'scs-governance', phase: 'c6', mins: 60, title: 'Quản trị nhiều account và tuân thủ', desc: 'Organizations, Control Tower, SCP / RCP / declarative policy, delegated admin, quản lý root, StackSets, CloudFormation Guard, Firewall Manager, RAM, Config, Audit Manager, Artifact.', goals: ['Thiết kế landing zone an toàn', 'Áp chính sách cho cả Organization', 'Thu thập bằng chứng tuân thủ'] },
  { slug: 'scs-meo-thi', phase: 'c7', mins: 30, title: 'Bảng từ khoá và mẹo làm bài SCS', desc: 'Từ khoá trong đề trỏ tới dịch vụ nào, bẫy hay gặp, cách xử lý câu ordering / matching.', goals: ['Nhìn từ khoá là đoán được hướng đáp án', 'Tránh các bẫy kinh điển'] },
];

export const EXTRA = [
  { slug: 'luyen-de-soa', track: 'soa', title: 'Luyện đề SOA-C03', desc: 'Đề luyện theo phong cách thi thật, có giải thích từng đáp án.' },
  { slug: 'luyen-de-scs', track: 'scs', title: 'Luyện đề SCS-C03', desc: 'Đề luyện theo phong cách thi thật, có giải thích từng đáp án.' },
  { slug: 'nguon-tham-khao', title: 'Nguồn tham khảo', desc: 'Tài liệu chính thức của AWS và các nguồn ôn thi uy tín.' },
];
