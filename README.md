# Life Board Skill · 人生看板

可复用的 Codex Skill，附带完整 React + TypeScript + Vite 应用源码。用它生成同款人生看板，保留暖纸白与深林绿视觉，以及工作、知识、健康、财务、生活五板块。

## 安装与调用

将本仓库克隆到个人技能目录中尚不存在的 `life-board` 目录：

```bash
git clone https://github.com/alanxuyiyao-hash/life-board-skill.git ~/.codex/skills/life-board
```

已有同名技能时先保留已有版本，不要直接覆盖。重新打开会话后调用：

> 使用 $life-board 生成一个新的 Life Board，并打开预览。

## 手动生成

需要 Python 3、Node.js 18+ 和 npm。

```bash
python3 scripts/create_board.py --output /absolute/path/to/new-life-board
cd /absolute/path/to/new-life-board
npm ci
npm run build
npm run dev -- --host 127.0.0.1
```

生成器拒绝覆盖已有目录。打开终端实际输出的预览地址；同时运行多个副本时，为它们使用不同端口，以隔离浏览器数据。

## 包含内容

- `SKILL.md`：触发条件、生成流程、视觉与数据约束、验证要求。
- `agents/openai.yaml`：技能显示信息。
- `scripts/create_board.py`：复制模板到新目录。
- `assets/template/`：完整应用源码、锁文件、原型和项目文档。

## 当前范围

五板块广度 MVP，含总览、日历、设置、记录、搜索及 localStorage 持久化。部分子标签仍为“即将上线”，没有账号、云同步或原生桌面壳。保留文档包含规划和历史版本说明，实现范围以当前源码为准。

所有内置记录均为演示样例，基准日期为 2026-08-11，因此当前周/月可能为空。真实数据保存在使用者浏览器中，不包含在本仓库内。财务转账不计入收入和支出。

## 验证

模板已通过 TypeScript 检查和 Vite 生产构建；新副本已验证板块切换、日历、设置、记录保存、搜索和刷新后保留。
