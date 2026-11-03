# Life Board · 人生看板

一个本地优先的个人管理桌面 Web 应用，覆盖 **工作 / 知识 / 健康 / 财务 / 生活** 五个板块。
本仓库为 **五板块广度 MVP**：每个板块的默认页 + 通用「记录 / 搜索 / 设置」链路全部跑通真实增删改查与本地持久化。

> 设计与产品定义见 `docs/`：PRD（五板块产品需求）、技术架构方案、视觉效果文档报告，以及单文件原型 `prototype.html`（视觉参照）。

## 快速开始

```bash
npm install      # 安装依赖
npm run dev      # 启动开发服务器 → http://localhost:5173
npm run build    # 类型检查 + 生产构建（产物在 dist/）
npm run preview  # 预览生产构建
```

要求：Node 18+（开发环境为 Node 26）。

## 技术栈

- **Vite 5 + React 18 + TypeScript**（strict）
- **Zustand + persist**（localStorage 本地持久化，离线优先；store 抽象层已为后续换 IndexedDB/SQLite 预留）
- **手写 SVG** 图表（折线 / sparkline / 进度条），零第三方图表库
- 内联 SVG 图标，无图标依赖
- 依赖极简：`react` `react-dom` `zustand` `clsx`

结构 Tauri-ready：当前是 Web 应用，后续可直接套 Tauri 2 壳变为原生桌面端，不违背 `docs/技术架构方案.md`。

## 目录结构

```
Life Board/
├── docs/                      # PRD / 架构 / 视觉报告 / 单文件原型
├── index.html                 # Vite 入口
├── package.json / tsconfig.json / vite.config.ts
├── public/favicon.svg
└── src/
    ├── main.tsx / App.tsx     # 应用壳：侧栏 + keep-alive 路由 + 浮层 + 快捷键
    ├── styles.css             # 设计 token + 组件样式（移植自原型）
    ├── types.ts               # 全部实体类型（口径对齐 PRD）
    ├── seed.ts                # 开箱即"活"的示例数据
    ├── lib.ts                 # id / 日期 / 格式 / 派生聚合
    ├── store.ts               # dataStore(持久化) + uiStore
    ├── components/            # Icons / ui / Sidebar / RecordSheet / SearchPalette / Overlays
    └── boards/                # Overview / Work / Knowledge / Health / Finance / Life / Calendar / Settings
```

## 本轮覆盖（已实现）

- **总览**：问候 + 年度目标进度（在轨/领先/落后）+ 跨板块最近动静 + 五板块入口
- **工作·本周**：本周重点（可勾选）/ 本周成果 / 待跟进 / 最近工作记录
- **知识·学习中**：当前书/课程进度 + 本周学习计划 + 最近学习记录
- **健康·当前状态**：最新体重/体脂 + 趋势 sparkline + 本周运动节奏 + 待处理
- **财务·本月**：本月收入/支出/结余（转账不计、正确口径）+ 净资产趋势 + 最近流水
- **生活·近期**：未来 30 天计划 + 本月想做（愿望）+ 最近体验
- **日历**：按真实记录日期打点（可翻月、按日查看）
- **设置**：板块模板开关 · 隐藏金额 · 导出/导入 JSON · 载入示例 · 清空数据
- **通用「记录」浮层**：按板块+类型录入，自动落 Entry，财务/健康额外落专属实体
- **搜索 ⌘K**：跨记录/项目/资源/愿望/流水/计划/体验
- **键盘快捷键**：⌘K 搜索 · ⌘N 记录 · ⌘B 折叠侧栏 · ⌘1 总览 · Esc 关闭浮层
- **本地持久化**：刷新不丢；JSON 备份导入导出

## 本轮未做（后续阶段）

- 各板块非默认子页（工作记录/项目/复盘/档案、书籍/课程/笔记、运动/指标/档案、流水/资产/投资/预算、愿望/旅行/体验/人际 等约 25 个子页）—— 当前保留子 tab，点击提示「即将上线」
- Tauri 原生壳、React Native 移动端、Supabase 云同步、SQLite（架构文档自身的后续阶段）
- 模板专属内容、AI 复盘归集、趋势 delta 环比

## 数据与隐私

所有数据仅存在本机浏览器 localStorage，无账号、无云同步。备份走「设置 → 导出 JSON」。

## 键盘快捷键

| 快捷键 | 功能 |
|---|---|
| ⌘K / `/` | 搜索 |
| ⌘N / `n` | 记录 |
| ⌘B | 折叠/展开侧栏 |
| ⌘1 | 回到总览 |
| Esc | 关闭浮层 |
