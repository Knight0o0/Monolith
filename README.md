<div align="center">

<img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/box.svg" width="96" height="96" alt="Monolith" />

# Monolith

**高质感无服务器边缘博客系统**

*极致视觉 · 边缘计算 · 多后端存储 · 零运维成本*

<br/>

[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Hono](https://img.shields.io/badge/Hono-4.x-E36002?style=flat-square&logo=hono&logoColor=white)](https://hono.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

<br/>

[**📚 Wiki 文档**](https://github.com/one-ea/Monolith/wiki) · [**🐛 提交 Issue**](https://github.com/one-ea/Monolith/issues) · [**☁️ 在线预览**](https://monolith-client.pages.dev)

</div>

---

## ✨ 项目简介

Monolith 是一套运行在 **Cloudflare 全球边缘网络**上的现代化无服务器博客系统。前后端完全解耦，通过适配器模式支持多种数据库与对象存储后端，无需运维，全球延迟 < 50ms。

> 🎨 **双主题设计语言**：支持**暗色（Slate & Cyan）**与**亮色**双主题，三态切换（暗色 / 亮色 / 跟随系统），玻璃拟态效果，Apple 级 `cubic-bezier` 阻尼动画，为读者和作者提供沉浸式体验。

---

## 🌟 核心特性

| 特性 | 描述 |
|------|------|
| ⚡ **边缘原生** | Hono 运行于 Cloudflare Workers，无冷启动，全球毫秒级响应 |
| 🔌 **存储适配器** | 数据库：D1 / Turso / PostgreSQL；对象存储：R2 / S3 兼容，环境变量一键切换 |
| 🌗 **双主题系统** | 暗色 / 亮色 / 跟随系统 三态切换，CSS 变量驱动零闪烁，代码高亮自适应 |
| 🎨 **高级视觉层** | Slate & Cyan 配色、玻璃拟态、平滑动画、完全响应式布局 |
| 📝 **Markdown 渲染** | 代码高亮 + 一键复制、自动 TOC、阅读进度条、预计阅读时间 |
| 🔐 **安全设计** | JWT 认证 + 路由守卫双重防护，管理入口隐藏设计 |
| 📊 **数据洞察** | 文章浏览量统计、14 日访问趋势图、热门内容排行 |
| 💬 **评论系统** | 访客留言、Honeypot 反垃圾、人工审核机制 |
| 💾 **多端备份** | 导出 JSON / 备份到 R2-S3 / WebDAV 远端同步 |
| 🗺️ **SEO 就绪** | 动态 sitemap.xml、RSS 2.0、robots.txt、语义化 HTML |
| 🔀 **Pages Functions 代理** | 前端自带 API 反向代理，前后端可独立域名部署 |
| 🧩 **自定义代码注入** | 后台可注入任意 `<script>` / `<style>`，支持广告、统计等第三方脚本 |
| 🔄 **博客迁移** | 支持从 Halo 等系统一键导入，自动转换外链图片为本地存储 |
| 🔍 **全站搜索** | 实时搜索弹窗，⌘K / Ctrl+K 快捷触发，支持标题与内容全文检索 |

---

## 🏗️ 架构概览

```
┌──────────────────────┐         ┌──────────────────────────┐
│  Cloudflare Pages    │         │   Cloudflare Workers     │
│                      │         │                          │
│  Vite + React SPA    │         │  Hono  ──▶  IDatabase    │
│  Pages Functions     │──API──▶ │           ├── D1         │
│  (反向代理层)         │         │           ├── Turso      │
└──────────────────────┘         │           └── PostgreSQL │
                                 │                          │
                                 │        ──▶  IObjectStorage│
                                 │           ├── R2         │
                                 │           └── S3 兼容    │
                                 └──────────────────────────┘
```

前端通过 **Pages Functions** 将 `/api/*`、`/cdn/*`、`/rss.xml` 请求反向代理到 Workers 后端，实现同域调用零 CORS 问题。

> 详细架构说明请参阅 [Wiki · 架构概览](https://github.com/one-ea/Monolith/wiki/Architecture)

---

## 🚀 快速开始

### 环境要求

- Node.js 18+（推荐通过 nvm 管理）
- Wrangler CLI 4.x
- Cloudflare 账号

### 本地开发

```bash
# 1. 克隆项目
git clone https://github.com/one-ea/Monolith.git
cd Monolith

# 2. 安装依赖
cd client && npm install && cd ../server && npm install && cd ..

# 3. 配置环境变量
cat > server/.dev.vars << 'EOF'
ADMIN_PASSWORD=your_secure_password
JWT_SECRET=your_random_secret_key
EOF

# 4. 初始化本地数据库
cd server && npx wrangler d1 migrations apply monolith-db --local

# 5. 启动服务（两个终端）
cd server && npm run dev      # → http://localhost:8787
cd client && npm run dev      # → http://localhost:5173
```

> 📖 完整指南请参阅 [Wiki · 快速开始](https://github.com/one-ea/Monolith/wiki/Quick-Start)

---

## ☁️ 一键部署

### 1. 后端 (Workers)

```bash
cd server

# 设置密钥
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put JWT_SECRET

# 运行数据库迁移
npx wrangler d1 migrations apply monolith-db --remote

# 部署
npx wrangler deploy
# → 记录输出的 Workers URL
```

### 2. 前端 (Pages)

```bash
cd client

# 构建
npm run build

# 部署到生产（必须指定 --branch=master）
npx wrangler pages deploy dist --project-name monolith-client --branch=master
```

### 3. 配置 API 代理地址（可选）

前端默认通过 **Pages Functions** 代理 API 请求。如果你的 Workers 后端 URL 与默认不同，需要在 Cloudflare Pages 项目设置中添加环境变量：

| 变量名 | 值 | 说明 |
|--------|---|------|
| `API_BASE` | `https://your-worker.your-account.workers.dev` | Workers 后端地址 |

> 📖 完整部署步骤请参阅 [Wiki · 部署指南](https://github.com/one-ea/Monolith/wiki/Deployment)

---

## 📁 项目结构

```
Monolith/
├── client/                   # 前端 Vite + React SPA
│   ├── src/
│   │   ├── app.tsx           # 路由（含 ProtectedRoute 守卫）
│   │   ├── globals.css       # 全局样式 + 双主题 CSS 变量系统
│   │   ├── components/       # 组件库
│   │   │   ├── navbar.tsx    # 导航栏（含搜索 + 主题切换）
│   │   │   ├── theme-toggle.tsx  # 三态主题切换组件
│   │   │   ├── search.tsx    # 全站搜索弹窗
│   │   │   └── ...          # Hero / Footer / ArticleCard / Sparkline...
│   │   ├── pages/            # 页面
│   │   │   ├── home.tsx      # 首页（含博主名片 + 趋势图）
│   │   │   ├── post.tsx      # 文章详情（TOC / 进度条 / 评论）
│   │   │   └── admin/        # 后台（仪表盘 / 编辑器 / 设置 / 备份...）
│   │   └── lib/api.ts        # API 客户端
│   ├── functions/            # Cloudflare Pages Functions（API 反向代理）
│   │   ├── api/[[path]].ts   # /api/* 代理
│   │   ├── cdn/[[path]].ts   # /cdn/* 代理
│   │   └── rss.xml.ts        # /rss.xml 代理
│   └── vite.config.ts
│
└── server/                   # 后端 Hono Workers
    ├── src/
    │   ├── index.ts           # API 路由总入口
    │   ├── storage/           # 存储适配器层
    │   │   ├── interfaces.ts  # IDatabase / IObjectStorage 接口
    │   │   ├── factory.ts     # 工厂（按环境变量选择实现）
    │   │   ├── db/            # D1 / Turso / PostgreSQL 适配器
    │   │   └── object/        # R2 / S3 适配器
    │   └── db/                # Drizzle ORM Schema + 迁移文件
    └── wrangler.toml          # Workers 配置
```

---

## 🔀 分支策略

| 分支 | 环境 | 说明 |
|------|------|------|
| `main` | **生产** `monolith-client.pages.dev` | 保护分支，只接受 PR 合并 |
| `dev` | 开发预览 | 日常开发在此分支进行 |

---

## 📚 文档

| 文档 | 链接 |
|------|------|
| 架构概览 | [Wiki · Architecture](https://github.com/one-ea/Monolith/wiki/Architecture) |
| 快速开始 | [Wiki · Quick-Start](https://github.com/one-ea/Monolith/wiki/Quick-Start) |
| 前端开发指南 | [Wiki · Frontend-Guide](https://github.com/one-ea/Monolith/wiki/Frontend-Guide) |
| 后端开发指南 | [Wiki · Backend-Guide](https://github.com/one-ea/Monolith/wiki/Backend-Guide) |
| 存储适配器 | [Wiki · Storage-Adapters](https://github.com/one-ea/Monolith/wiki/Storage-Adapters) |
| 安全设计 | [Wiki · Security](https://github.com/one-ea/Monolith/wiki/Security) |
| API 参考 | [Wiki · API-Reference](https://github.com/one-ea/Monolith/wiki/API-Reference) |
| 部署指南 | [Wiki · Deployment](https://github.com/one-ea/Monolith/wiki/Deployment) |
| 功能特性 | [Wiki · Features](https://github.com/one-ea/Monolith/wiki/Features) |

---

## 📝 更新日志

### V1.3 (2026-04-11)
- ✨ **亮色模式**：暗色 / 亮色 / 跟随系统三态切换，CSS 变量驱动零闪烁
- ✨ **自定义代码注入**：后台可注入 `<script>` / `<style>` 到全站头部/底部
- ✨ **Halo 博客迁移**：一键导入 Halo 导出数据，自动转换外链图片为本地存储
- 🎨 代码高亮亮色配色方案（20+ token 覆盖）
- 🎨 Prose 排版亮色适配（标题/链接/引用/表格/行内代码）
- 🔧 导航栏图标优化（搜索 + 主题切换 + 移动端菜单统一布局）

### V1.2 (2026-04-07)
- ✨ 流量统计与 14 日趋势图
- ✨ 后台仪表盘重构
- ✨ Pages Functions API 反向代理
- ✨ 文章搜索（全文检索）
- ✨ 文章目录 TOC + 阅读进度条

### V1.1 (2026-04-05)
- ✨ 评论系统（Honeypot 反垃圾 + 人工审核）
- ✨ 数据备份与恢复（JSON / R2 / WebDAV）
- ✨ 独立页管理
- ✨ SEO 三件套（sitemap / RSS / robots）

### V1.0 (2026-04-04)
- 🎉 首个版本发布
- ✨ 文章 CRUD + Markdown 渲染 + 代码高亮
- ✨ D1 / Turso / PostgreSQL 数据库适配器
- ✨ R2 / S3 对象存储适配器
- ✨ JWT 认证 + 管理后台

---

## 📄 License

[MIT](LICENSE) · Crafted with passion & relentless design aesthetics.
