# 安全策略

## 支持的版本

| 版本 | 支持状态 |
|------|:-------:|
| v1.3.x | ✅ 当前版本 |
| < v1.3 | ❌ 不再维护 |

## 报告漏洞

如果您发现了安全漏洞，**请勿在公开 Issue 中报告**。

请通过以下方式私密联系：

1. **GitHub Security Advisories**（推荐）：前往 [Security](https://github.com/one-ea/Monolith/security/advisories/new) 页面创建私密报告
2. **GitHub 私信**：通过 [@one-ea](https://github.com/one-ea) 个人主页联系

### 报告内容应包含

- 漏洞描述
- 复现步骤
- 影响范围
- 如有可能，请提供修复建议

### 响应时间

- **确认收到**：48 小时内
- **初步评估**：7 天内
- **修复发布**：视严重程度，高危漏洞优先处理

## 安全最佳实践

本项目遵循以下安全实践：

- JWT Token 认证（7 天有效期）
- 密钥通过 Cloudflare Wrangler Secrets 管理，不存入代码仓库
- 后端 API 双重验证
- 管理入口隐藏设计
- Honeypot 反垃圾机制
- CodeRabbit + Gitleaks + TruffleHog 自动安全扫描
