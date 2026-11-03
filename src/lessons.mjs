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
  { slug: 'soa-tong-quan', phase: 's0', mins: 20, title: 'Đề SOA-C03 và cách học', desc: 'Cấu trúc đề, 5 domain, khác SAA-C03 ở đâu, lộ trình 4 tuần.', goals: ['Biết đề hỏi gì và tỉ trọng từng domain', 'Biết phần nào đã có từ SAA, phần nào phải học mới', 'Có kế hoạch học và luyện đề'] },
  { slug: 'soa-cloudwatch', phase: 's1', mins: 60, title: 'CloudWatch: metrics, logs, alarms, dashboards', desc: 'Metric mặc định và custom, CloudWatch agent, Logs Insights, metric filter, alarm và composite alarm, dashboard nhiều account.', goals: ['Biết metric nào có sẵn, metric nào cần agent', 'Dựng alarm đúng và đọc được trạng thái INSUFFICIENT_DATA', 'Dùng Logs Insights và metric filter'] },
  { slug: 'soa-eventbridge-ssm', phase: 's1', mins: 60, title: 'EventBridge và Systems Manager: tự động khắc phục', desc: 'Event bus, rule, target; SSM Run Command, Automation runbook, Patch Manager, State Manager, Session Manager, Parameter Store.', goals: ['Ghép alarm / event với hành động tự khắc phục', 'Chọn đúng công cụ SSM cho từng việc', 'Vá lỗi máy chủ hàng loạt an toàn'] },
  { slug: 'soa-perf-compute', phase: 's1', mins: 45, title: 'Tối ưu EC2 và Auto Scaling', desc: 'Loại instance, placement group, ENA, status check, auto recovery, scaling policy, lifecycle hook, warm pool, Compute Optimizer.', goals: ['Chẩn đoán EC2 chậm hay lỗi', 'Chọn scaling policy phù hợp', 'Dùng Compute Optimizer để right-size'] },
  { slug: 'soa-perf-storage', phase: 's1', mins: 50, title: 'Tối ưu storage và database', desc: 'EBS gp3 / io2, snapshot, S3 multipart, Transfer Acceleration, lifecycle, EFS / FSx, DataSync, RDS Performance Insights, RDS Proxy.', goals: ['Chọn và chỉnh EBS theo IOPS / throughput', 'Tăng tốc S3 đúng cách', 'Giải bài toán RDS quá tải kết nối'] },
  { slug: 'soa-reliability', phase: 's2', mins: 55, title: 'Độ tin cậy: ELB, Auto Scaling, Route 53', desc: 'Health check, xử lý lỗi 5xx của ALB, Multi-AZ, Route 53 routing policy và health check, caching.', goals: ['Đọc được mã lỗi ALB và tìm nguyên nhân', 'Thiết kế ứng dụng sống sót khi mất một AZ', 'Chọn routing policy Route 53'] },
  { slug: 'soa-backup-dr', phase: 's2', mins: 45, title: 'Backup và khôi phục thảm hoạ', desc: 'AWS Backup, snapshot, PITR, versioning, cross-Region replication, 4 chiến lược DR, RPO / RTO, Elastic Disaster Recovery.', goals: ['Chọn chiến lược DR theo RPO / RTO và chi phí', 'Cấu hình backup tập trung với AWS Backup', 'Khôi phục đúng loại tài nguyên'] },
  { slug: 'soa-cloudformation', phase: 's3', mins: 60, title: 'CloudFormation, CDK và StackSets', desc: 'Template, change set, drift, rollback, helper scripts, DeletionPolicy, lỗi hay gặp, StackSets, CDK, Image Builder, RAM.', goals: ['Đọc và sửa lỗi CloudFormation', 'Triển khai nhiều account / Region bằng StackSets', 'Tạo AMI chuẩn bằng EC2 Image Builder'] },
  { slug: 'soa-deploy-automation', phase: 's3', mins: 40, title: 'Chiến lược deploy và tự động hoá', desc: 'In-place, rolling, blue/green, canary; CodeDeploy, Elastic Beanstalk; S3 Event Notifications, Lambda, Terraform.', goals: ['Chọn chiến lược deploy theo yêu cầu downtime và rollback', 'Dựng automation hướng sự kiện'] },
  { slug: 'soa-security', phase: 's4', mins: 55, title: 'Bảo mật và tuân thủ trong vận hành', desc: 'IAM troubleshooting, SCP, MFA, KMS, ACM, Secrets Manager, Config rules và remediation, Security Hub, GuardDuty, Inspector, Trusted Advisor.', goals: ['Sửa lỗi AccessDenied', 'Bắt tài nguyên sai cấu hình và tự sửa', 'Biết dịch vụ bảo mật nào làm gì'] },
  { slug: 'soa-networking', phase: 's5', mins: 60, title: 'VPC và xử lý sự cố mạng', desc: 'Route table, SG vs NACL, NAT, VPC endpoint, Flow Logs, Reachability Analyzer, Transit Gateway, VPN, Direct Connect, Route 53 Resolver.', goals: ['Tìm ra vì sao hai máy không nói chuyện được', 'Chọn cách kết nối VPC và on-premises'] },
  { slug: 'soa-cdn', phase: 's5', mins: 40, title: 'CloudFront, WAF, Shield và Global Accelerator', desc: 'Cache behavior, TTL, invalidation, OAC, lỗi 403 / 502 / 504, WAF rule, Shield, Global Accelerator.', goals: ['Cấu hình CloudFront đúng cho S3 và ALB', 'Xử lý lỗi cache và lỗi origin'] },
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
