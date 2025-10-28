# Next.js 16 + React 19.2 + Convex 迁移进度

## ✅ 已完成

### Phase 1: 框架升级

- [x] 升级 `next` → `^16.0.0`
- [x] 升级 `react` + `react-dom` → `^19.2.0`
- [x] 创建 `next.config.ts` 启用 React Compiler (`reactCompiler: true`)
- [x] 启用 DynamicIO (`dynamicIO: true`)
- [x] **强制变更**: `middleware.ts` → `proxy.ts`（Next.js 16 要求）
- [x] 添加 Convex、Effect-TS、@convex-dev/auth 依赖

### Phase 2: Convex 后端搭建

- [x] 创建 `convex.json` 配置
- [x] 定义完整 Convex Schema (`convex/schema.ts`)
  - Teams, Projects, WorkflowStates, Labels
  - Issues, IssueLabels, Comments
  - TeamMembers, Invitations
  - ChatConversations, ChatMessages
- [x] 配置 Convex Auth (`convex/auth.config.ts`)
  - Google OAuth provider
- [x] HTTP 路由配置 (`convex/http.ts`)
- [x] 核心 Convex Functions:
  - `teams.ts` - 团队管理 (getUserTeams, getTeam, createTeam, getTeamStats)
  - `issues.ts` - Issue CRUD (listIssues, getIssue, createIssue, updateIssue, deleteIssue)
  - `workflowStates.ts` - 工作流状态 (listStates, createState)
  - `projects.ts` - 项目管理 (listProjects, getProject, createProject)

### Phase 3: Effect-TS 数据层

- [x] 创建 Effect HttpApi Schema (`lib/effect/api-schema.ts`)
  - Issue, Team, Project, WorkflowState, Label schemas
  - TeamsApi, IssuesApi, ProjectsApi, LabelsApi, WorkflowStatesApi
- [x] Effect 辅助函数 (`lib/effect/helpers.ts`)
  - `safeApiCall` - 统一错误处理
  - `batchApiCalls` - 批量调用
  - `withRetry` - 重试包装器
- [x] Convex + Effect 集成 Hook (`lib/hooks/use-convex-query.ts`)

### Phase 4: 前端集成

- [x] 改写 `app/provider.tsx` 使用 Convex Auth
  - ConvexProviderWithAuth + useAuth
- [x] 创建示例页面 `app/dashboard/[teamId]/issues/page-convex.tsx`
  - React 19.2 `useEffectEvent` 示例（polyfill 版本）
  - Convex `useQuery` 实时订阅
  - Effect 管道处理副作用
  - Next.js 16 React Compiler 自动优化

### Phase 5: 数据迁移准备

- [x] 创建迁移脚本 `scripts/migrate-to-convex.ts`
  - Prisma → Convex 数据导出逻辑

---

## 🚧 待完成

### 立即执行步骤

#### 1. 安装依赖

```bash
bun install
```

#### 2. 初始化 Convex 项目

```bash
# 登录 Convex 并创建项目
bunx convex dev
```

执行后会：

- 生成 `convex/_generated/` 目录
- 获取 Convex deployment URL
- 创建 `.env.local` 并添加 `NEXT_PUBLIC_CONVEX_URL`

#### 3. 配置环境变量

在 `.env.local` 添加：

```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Convex Auth (Google OAuth)
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
```

#### 4. 初始化 Workflow States 和默认数据

运行 Convex dev 后，使用 Convex Dashboard 或创建 seed mutation 来初始化默认数据。

#### 5. 运行开发服务器

```bash
bun run dev
```

#### 6. 测试新页面

访问 `http://localhost:3000/dashboard/[teamId]/issues/page-convex.tsx`（需先在路由中启用）

---

### 后续迁移步骤

#### Phase 6: 全面替换旧代码

- [ ] 将所有页面从 Prisma API 切换至 Convex
- [ ] 使用 `useEffectEvent` 重构所有 `useEffect` 场景
- [ ] 删除 `lib/api/*.ts` 旧 API 文件
- [ ] 删除 `lib/auth.ts`, `lib/auth-server.ts` (Better Auth)
- [ ] 删除 `prisma/` 目录与 Prisma 依赖
- [ ] 删除 Better Auth 相关代码
- [ ] 更新所有 `import` 路径

#### Phase 7: Next.js 16 缓存优化

- [ ] 在 Server Components 使用 React 19 `cache()` API
- [ ] 应用 Next.js 16 `"use cache"` 指令
- [ ] 配置 Turbopack 优化

#### Phase 8: 测试与优化

- [ ] 端到端功能测试
- [ ] 性能对比（Prisma vs Convex 查询延迟）
- [ ] 修复所有 TypeScript 类型错误
- [ ] 修复所有 linter 错误
- [ ] 验证实时订阅功能
- [ ] 压力测试 Convex Auth

---

## 🔑 关键差异与注意事项

### Next.js 16 强制变更

- **`middleware.ts` → `proxy.ts`**: 文件名与导出函数名必须改变
- **React Compiler**: 自动优化组件，减少手动 `useMemo` / `useCallback`
- **DynamicIO**: 新缓存系统，替代 `unstable_cache`

### React 19.2 `useEffectEvent`

- **当前状态**: 可能仍为实验性 API (`experimental_useEffectEvent`)
- **替代方案**: 使用 `useCallback(() => {...}, [])` polyfill
- **生产环境**: 确认 React 19.2 稳定性后再启用

### Convex vs Prisma 核心差异

| 特性     | Prisma           | Convex                      |
| -------- | ---------------- | --------------------------- |
| 关系     | 原生 `@relation` | 手动 `v.id("table")`        |
| 索引     | 自动推断         | 显式定义 `index()`          |
| 实时订阅 | 无               | `useQuery` 自动             |
| 系统字段 | 需手动定义       | `_id`, `_creationTime` 自动 |
| 事务     | 手动 transaction | Mutation 自动原子性         |

### Effect-TS 使用场景

- ✅ 复杂副作用管道（多步骤异步操作）
- ✅ 需要强类型错误处理
- ✅ API 调用需要重试、批处理
- ❌ 简单 UI 状态管理（useState 即可）

---

## 📚 参考资料

- [Next.js 16 文档](https://nextjs.org/docs)
- [React 19 发布说明](https://react.dev/blog)
- [Convex 文档](https://docs.convex.dev)
- [Convex Auth 指南](https://docs.convex.dev/auth)
- [Effect-TS 文档](https://effect.website)
- [迁移方案详细文档](./next16.plan.md)

---

## ❓ 未解决问题

1. **React 19.2 `useEffectEvent` 正式 API 名称**

   - 当前使用 polyfill，待官方稳定后更新

2. **Prisma 历史数据迁移策略**

   - 是否保留 PostgreSQL 作为归档？
   - 建议：使用 `scripts/migrate-to-convex.ts` 一次性迁移

3. **文件上传功能**

   - 当前无文件上传，未来需使用 Convex Storage API

4. **实时订阅性能**
   - 需测试大量 Issues 场景下的 `useQuery` 性能

---

## 🎯 下一步行动

1. **运行 `bun install` 安装所有依赖**
2. **执行 `bunx convex dev` 初始化 Convex 项目**
3. **配置 `.env.local` 环境变量**
4. **测试示例页面 `page-convex.tsx`**
5. **逐步迁移其他页面**

---

**迁移完成度**: 约 60%（核心基础设施已就绪，需应用到所有页面）
