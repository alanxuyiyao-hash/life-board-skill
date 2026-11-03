# Life Board 代码审查 · 最终汇总报告（t1-t4 四路合并）

> 审查范围：React 18 + TS strict + Zustand persist 本地优先个人管理应用（约 2966 行 src）+ mckinsey_pptx.py + scripts/verify-roundtrip.ts。
> 四路报告去重合并：t1 架构（architect，14 项）、t2 前端（frontend，27 项）、t3 数据安全（data-security，12 项）、t4 类型/缺陷（quality，18 项）→ 合并为 **高 8 / 中 21 / 低 18**。重复发现已标注「tX/tY 均报告」。

## 一、总体结论

Life Board 的架构骨架与代码质量基线是健康的：双 store 职责清晰、lib 纯函数派生解耦、组件复用度高、TypeScript strict 零错误且无 `any`、无 XSS 注入面与网络外联，隐私声明经核实属实。但存在 8 个高危点，共同特征是**静默失败或不可恢复**：JSON 导入无校验可写入并持久化坏状态（白屏且原数据被覆盖）、persist 无 migrate（未来版本升级=静默清空全库）、localStorage 写满静默丢数据、金额隐藏功能在搜索/日历中失效泄露明文。中危集中在**数据一致性**（Entry 与专属实体双写、refId 悬空、金额符号三处口径矛盾、退款冲减失真）与**可访问性**（浮层无焦点陷阱、多个控件读屏不可用）。MVP 规模下多数问题不致命，但会随数据量与版本演进急剧放大，建议按文末路线图分三档推进。

## 二、高优先级问题清单（8 条）

| # | 问题 | 文件:行号 | 说明 | 建议修复 |
|---|------|-----------|------|----------|
| H1 | **JSON 导入无 schema 校验，坏数据可致白屏并被永久持久化**（t1#10、t2#13、t3#1、t4#1 四路均报告） | Settings.tsx:81-93；store.ts:126-145；崩溃点 Overview.tsx:37、lib.ts:132、_shared.tsx:28 | doImport 仅 JSON.parse + importData 用 `??` 浅合并，不校验类型；导入 `{"entries":"x"}`/`{"areas":[]}`/缺 date/text 的 entry 后，渲染期 `.filter`/`.find(...)!`/localeCompare 抛 TypeError；全板常驻挂载使任一板块崩溃即整应用白屏；persist 把坏状态写回 localStorage，刷新仍崩、Settings 进不去、原数据被覆盖 | importData 前做 schema 校验（Array.isArray、关键字段类型、id 唯一、date 格式），失败整体拒绝不落库；校验器复用为 hydrate 防御（onRehydrateStorage 失败回退 seed 并提示）；main.tsx 包 ErrorBoundary 兜底 |
| H2 | **persist 无 migrate：版本升级=静默清空全部数据**（t1#3、t3#2 报告） | store.ts:168-189（version:1 无 migrate） | zustand v4 实证：版本不匹配且无 migrate → console.error 后状态回退 seed 并立即覆写 storage，用户数据静默丢失重置为示例数据 | 补 migrate(旧结构映射+保底合并)；onRehydrateStorage 对版本/结构异常告警；schema 变更必须 migrate+version 双升并写迁移测试 |
| H3 | **localStorage 5MB 配额写满后静默丢失新增数据**（t3#3） | store.ts:171（createJSONStorage）；zustand middleware.js:369-385 | 每次 set 全量同步序列化写 storage；QuotaExceededError 被 zustand 内部吞掉（无日志），内存态继续更新、持久化停止、用户无感知，刷新即回退；entries/readings/txs 只增不减必达上限 | 包装 storage 捕获写失败 toast 告警；监控占用并提示归档/清理；导出备份提醒前置；规划 IndexedDB |
| H4 | **全量整树订阅 + 全板常驻挂载，每次写入全应用重渲染**（t1#1、t2#1、t4#18 三路报告） | App.tsx:31,70-74；各 board `useData()`（Finance.tsx:9、Overview.tsx:18、Work.tsx:9、Health.tsx:12、Life.tsx:8、Knowledge.tsx:9、CalendarBoard.tsx:10、Settings.tsx:49）；RecordSheet.tsx:56、SearchPalette.tsx:17；App.tsx:39-63（keydown effect deps `[ui]` 每次 UI 变更重建监听） | 8 个面板全部挂载（仅 hidden）+ 无 selector 订阅整个 dataStore；任何一次 addEntry/toast 触发全部板块连同派生计算（过滤/排序）重跑；数据量增大后明显卡顿 | 按切片 selector（`useData(s=>s.txs)`）+ `useShallow`；面板按需挂载/React.lazy；浮层拆「外壳(不订阅)+内容(订阅)」；App effect 按字段订阅 |
| H5 | **Entry 与专属实体双写、无 refId 关联，日历/搜索重复 + ghost 数据**（t1#2、t4#3 报告；t2#5 相关） | RecordSheet.tsx:120-143；store.ts:75,109；CalendarBoard.tsx:61-75；SearchPalette.tsx:32-41 | 一次交易/读数/运动同时写 Tx/Reading/Workout 与 Entry（与 types.ts「一条信息只录一次」相悖），addEntry 从不写 refId；无级联删除/更新：日历选中日同一笔交易出现两条、搜索索引重复、删除一侧另一侧成 ghost | 单一事实源（专属实体入库、Entry 作派生视图/索引），或双写强制 refId 并在日历/搜索按 refId 去重、删除级联清理 |
| H6 | **隐藏金额在搜索与日历中失效，明文泄露金额**（t2#2） | SearchPalette.tsx:39（`¥${t.amount}`）；CalendarBoard.tsx:74（`¥${t.amount}`） | 开启「隐藏金额」后 Money 组件打码，但搜索面板流水文本与日历明细仍直接拼接原始金额字符串，隐私功能不一致 | 展示层两处改走 `<Money value={t.amount} />`；搜索索引可保留原文匹配，展示必须打码 |
| H7 | **浮层无焦点陷阱；ConfirmDialog 的 Esc 失效**（t2#3、t4#12 报告） | Overlays.tsx:18-43；App.tsx:46-51；RecordSheet.tsx:170-171；SearchPalette.tsx:74-75 | 三个 `role="dialog" aria-modal="true"` 浮层无焦点圈禁（Tab 可移出）、关闭后焦点不归还；App 的 Esc 在 confirm 打开时直接 return（注释称「ConfirmDialog 自己处理」，实际它无任何 Esc 处理）→ 键盘用户无法用 Esc 取消确认框 | ConfirmDialog 加 Esc→dismissConfirm；浮层实现 focus trap + 记录/恢复 activeElement |
| H8 | **年度目标「在轨」判定对下降型目标语义错误**（t4#2） | lib.ts:106-109,183-185；Overview.tsx:56-60；seed.ts:23 | 「体重降到 68kg」按 current/target 正比计算：69.2/68=101.76% 被 clamp 到 100%，恒显 100%+「领先」；current=90 也显示 100% 领先。模型无 direction/start，下降目标进度无法正确计算 | YearGoal 增加 direction/start；下降目标用 (start−current)/(start−target)；或标记为绝对目标不参与进度判定 |

## 三、中优先级问题清单（21 条）

| # | 问题 | 文件:行号 | 说明 | 建议修复 |
|---|------|-----------|------|----------|
| M1 | **金额输入无符号/精度校验，三处口径互相矛盾**（t1#5、t2#8、t4#4） | store.ts:107-110；RecordSheet.tsx:121-125,237；Finance.tsx:23；lib.ts:152-168 | 支出输 -50：tx.amount=-50 → monthSummary expense 变负数；流水按 `-t.amount` 显示 +50；Entry value=signed=+50 又呈正数；parseFloat('1e3')=1000；金额未按分圆整，累加浮点误差 | addTx 内 Math.abs/clamp 或 RecordSheet 校验 amount>0（min=0 + step）；金额方向只由 type 决定；保存时 Math.round(x*100)/100 |
| M2 | **退款冲减无下限、储蓄率可超 100%**（t1#6、t4#5） | lib.ts:159-166 | refund 无条件 `expense -= amount`，退款>支出时 expense<0、balance>income → savingRate>100%；income=0 时储蓄率恒 0。转账排除正确（t1 确认口径本身对） | refund 累计后 expense clamp≥0、savingRate clamp 0~100%；精确方案：refund 记 refId 按原方向对冲 |
| M3 | **refId 为悬空特性：仅 seed 使用，无写入/校验/清理**（t1#7） | store.ts:75；types.ts:42,104；seed.ts:31,43,57,58,110 | 运行时从不写入 refId；UI 无关联选择器；删除实体不清理引用；无目标类型信息无法校验指向 | 录入流程提供关联选择并写入；删除时级联清理；refId 改为 `{type,id}` 结构化 |
| M4 | **模板开关为死状态，设置文案与实现不符**（t1#8） | store.ts:199-216,261-274；Settings.tsx:125-143 | templates 仅被 Settings 读写，全库无任何板块消费；「关闭只隐藏专属入口与字段」实际无效果 | 接入各板条件渲染，或移除开关并标注「规划中」 |
| M5 | **store API 大量死代码，模型与 UI 覆盖不一致**（t1#9、t4#13 交集） | store.ts:29-53,123-124,87-90,98-99 | deleteWorkout/deleteTx/deleteWish/deleteExperience/deleteEntry/updateEntry/updateResource/setGoalCurrent 无 UI 调用点；addProject/addExperience 无 UI 入口 → 项目/体验只能看 seed 数据；年度目标无法更新 | 补齐 UI（项目/体验/目标 CRUD）或按 YAGNI 删除；为 store 方法补调用点清单 |
| M6 | **「为 IndexedDB/SQLite 预留」仅为表面文章**（t1#4） | store.ts:1-5,169-191 | 实际是单扁平 JSON 文档：每次变更全量序列化 13 个集合、无 per-collection 粒度、无异步适配、无 repository/DAO 层、无冲突解决时间戳；换 IDB 需重写数据访问层 | 引入 repository 层 + StorageAdapter 接口（同步/异步可插拔）；持久化按集合分片；实体统一 createdAt/updatedAt；预留异步水合 loading 态 |
| M7 | **敏感数据明文存 localStorage，且无 CSP 兜底**（t3#4） | store.ts:169-188；index.html | 财务/健康/家庭计划明文存储；当前无 XSS 注入点（全库 grep 无 dangerouslySetInnerHTML/innerHTML/eval），但同源脚本或浏览器扩展可读取全量数据 | index.html 加 CSP（script-src 'self'）；设置页注明明文存储风险；Tauri 化时换系统钥匙串/加密容器 |
| M8 | **多标签页 last-write-wins 互相覆盖**（t3#5） | store.ts（persist 无跨标签同步） | 同源两个标签同时打开：各自独立写 storage，后写覆盖先写，静默丢数据 | 监听 window 'storage' 事件重新 hydrate/合并，或写前版本时间戳比对 |
| M9 | **importData `??` 语义与「覆盖导入」文案不符，version 无人消费**（t3#7） | store.ts:126-145；Settings.tsx:180-191 | 集合键存在即整组替换、缺失键保留现值 → 旧版备份导入后新旧混存；导入的 version 从不校验/迁移；`null` 被 `??` 跳过（显示成功实际未导入）；非对象 JSON 静默「成功」 | 导入前校验 version（旧版拒绝或补默认字段）；明确合并语义文案；null/缺键按拒绝处理 |
| M10 | **verify-roundtrip.ts 不可运行且未测真实导入路径**（t3#6、t4#15） | scripts/verify-roundtrip.ts:10-16,27-28,40；tsconfig.json:22；package.json:7-11 | 只测 buildSeed() 的 stringify/parse，不过 importData 的 `??` merge 与 doImport 路径（与注释宣称「等价」不符）；tsconfig include 仅 src 不进 tsc；无 tsx 依赖也无 npm script 实际跑不起来；`byteLen: json` 字段名错误；缺键时 TypeError 在 try 外 | 走真实路径（localStorage mock + importData），补非法输入/缺字段/超大数组用例；加 npm script 与运行器（或迁 vitest）；修 byteLen |
| M11 | **净资产为空时显示「NaN月NaN日」**（t2#4、t4#7） | Finance.tsx:31,58 | latestNWDate 空数据为 `'—'` → fmtDate('—') → parseISO Invalid Date → 渲染 "最近一次：NaN月NaN日" | fmtDate 对空/非法输入返回占位，或调用处判空显示「暂无快照」 |
| M12 | **日历「运动」点与选中日明细不一致**（t2#5） | CalendarBoard.tsx:33 vs 60-76 | dotsByDate 纳入 workouts，dayItems 只聚合 entries/plans/experiences/txs；某日只有 workout 时日历有点、点开无条目 | dayItems 补 `data.workouts.filter(w=>w.date===selected)`，或 dots 移除 workouts 保持口径一致 |
| M13 | **健康页空数据硬编码回退日期，显示误导性「最新 8月9日」**（t2#6、t4#11） | Health.tsx:67,74 | `weight?.date \|\| '2026-08-09'` 无读数时显示假日期，用户以为有最新数据 | 无数据显示「暂无读数」 |
| M14 | **ProgressBar 的 aria-valuenow 与视觉宽度不一致**（t2#7） | ui.tsx:138-141；Health.tsx:82；Finance.tsx:52 | aria-valuenow 在 clamp 前取值：跑步超 10km 视觉 100% 但 aria=130+；储蓄率负时 aria 为负，读屏与视觉矛盾 | aria 值用 clamp 后的值，并为进度条加 aria-label |
| M15 | **设置页开关控件无可访问名称**（t2#9） | Settings.tsx:135-139,154-158 | `.switch` 的 label 只包视觉开关，input 与左侧文本无 htmlFor/id 关联，读屏听到未命名复选框 | label htmlFor 指向 input id，或 input 加 aria-label/aria-labelledby |
| M16 | **侧栏折叠态按钮失去可访问名称**（t2#10） | Sidebar.tsx:57-61,88-92；styles.css:157-176 | 折叠时 display:none 隐藏 label/说明，图标 aria-hidden → 搜索/记录按钮折叠后可访问名称为空 | 折叠按钮补 aria-label（「搜索 (⌘K)」「记录 (⌘N)」） |
| M17 | **搜索结果项不可聚焦、无 ARIA 角色**（t2#11） | SearchPalette.tsx:102-116 | 结果是 div+onClick，键盘仅靠私有 Arrow/Enter 逻辑，无 listbox/option/aria-activedescendant，读屏无法浏览 | 加 role=listbox/option + aria-activedescendant + aria-selected，或渲染为 button |
| M18 | **健康「未记录天数」时区不一致**（t4#8） | Health.tsx:34 | `new Date('YYYY-MM-DD')` 按 UTC 解析，其余模块用本地 parseISO；UTC+8 下天数差 ±1，7 天提醒提前/延后一天 | 统一改用 parseISO |
| M19 | **日期可被清空产生脏数据**（t4#9） | RecordSheet.tsx:292；store.ts:69,104,109,118 | entry 有 `e.date\|\|today()` 兜底，addTx/addPlan/addWorkout 无兜底；清空 date 输入存 '' → 不出现在任何范围视图、日历/排序异常 | date 为空阻止保存或统一兜底 today() |
| M20 | **mckinsey_pptx.py 缺入参校验**（t4#10，已实测复现） | mckinsey_pptx.py:226,312,367-390,501-503,300 | add_agenda([])/add_kpis([]) ZeroDivisionError；add_table 行比表头多 IndexError；add_pie_chart highlight_slice 越界 IndexError（与 add_bar_chart 的 guard 不一致）；add_bullets 非数字编号 ValueError | 统一校验长度/索引/数值并给出清晰报错 |
| M21 | **愿望「planned」后从 UI 消失**（t4#6） | Life.tsx:31-32,76-93 | soon→planned 后既不在 soon 也不在 idea 列表，无 planned 视图，用户无法查看/回退 | 增加 planned 分组或允许回退 |

## 四、低优先级问题清单（18 条）

| # | 问题 | 文件:行号 | 说明 |
|---|------|-----------|------|
| L1 | MetricKey 类型坍缩为 string，addReading 不校验指标存在（t1#11） | types.ts:72；store.ts:100-101 | metricId 拼错产生永不显示的孤儿读数；建议加指标注册表校验 |
| L2 | App 键盘 effect 依赖整棵 uiStore（t1#12，H4 同根） | App.tsx:31,39-63 | deps `[ui]` 使 keydown 监听随每次 UI 变更（含 toast 进出栈）重建；按字段 selector 订阅 |
| L3 | 死代码与冗余导出（t1#13、t4#13） | lib.ts:38-42（addMonths 恒真三元 `s===''?d:d`、月末边界未处理）、79-82 fmtDateFull、116-118 fmtNum；store.ts:304-305 selectArea | 全库无调用；建议删除或重写 |
| L4 | 小项（t1#14） | store.ts:291；types.ts:31-44；seed.ts:120 | toast 定时器无句柄清理；Entry.value 正负号约定未注释；tx.account 自由文本无 Account 实体；导出 JSON 不含 uiStore 偏好 |
| L5 | 输入/交互打磨（t2#14、t4#16） | RecordSheet.tsx:226-229；Settings.tsx:69-78,81-93 | 浮层 Enter 不能保存（仅 ⌘/Ctrl+Enter）；导入无确认直接覆盖；导出 revokeObjectURL 紧跟 click（Safari 偶发失败） |
| L6 | 展示打磨（t2#15、t2#16、t2#19、t2#25、t2#26） | Work.tsx:56、Knowledge.tsx:73（0/0 完成）；CalendarBoard.tsx:114-117（dots 截断无 +N 提示）；Overview.tsx:54（年度目标标题硬编码 2026）；Finance.tsx:50-52（KpiCard delta 显示本月值非环比）；Health.tsx:66（体重相等显示 up +0.0kg） | 文案/语义打磨，随迭代清理 |
| L7 | a11y 打磨（t2#17、t2#20、t2#21、t2#22） | SearchPalette.tsx:85（空结果 ArrowDown focusIdx=-1）；ui.tsx:191（可点击 div 无键盘可达）；ui.tsx:290-314（SubTabs 无方向键/tabpanel）；Sidebar.tsx:68-73（活动项无 aria-current） | 按 WAI-ARIA 补齐或降低角色承诺 |
| L8 | 未使用/冗余 props（t2#18） | ui.tsx:263（PageHead areaKey 未用）；RecordSheet.tsx:14,41（needsDate 未用） | 删除或据其控制日期字段显隐 |
| L9 | 待跟进列表无上限（t2#23） | Work.tsx:18-21 | 全部未完成 task 无限累积；`.slice(0,N)` 或「查看全部」 |
| L10 | 板块间重复派生逻辑（t2#24） | Work.tsx:10-21,56-70；Knowledge.tsx:10-25,73-83 | 「本周范围+area 过滤」「focus 勾选卡片」手写重复；抽 `useWeekFocus(areaKey)`/`<FocusCard/>` 入 _shared |
| L11 | 桌面独占无响应式（t2#27） | styles.css:98（min-width:960px） | 窄窗横向滚动、移动端不可用；目标仅桌面可接受，建议加断点或缩放兜底 |
| L12 | 冗余/绕过类型系统的断言（t4#14） | Overview.tsx:70,92；ui.tsx:66 | `as 'green'\|'blue'\|'amber'`、`as Area[]` 可删；`['--tone' as string] as React.CSSProperties` 绕过检查，改 `CSSProperties & {'--tone'?:string}` |
| L13 | mckinsey_pptx.py 边界细节（t4#17） | mckinsey_pptx.py:148,341,49 | `str(text)` 使 None 渲染字面 "None"；add_2x2 未知象限键 KeyError；字体硬编码 Microsoft YaHei 非 Windows 回退不可控 |
| L14 | 导入文件无大小限制（t3#8） | Settings.tsx:81-93 | FileReader+JSON.parse 全同步，百 MB 文件冻结主线程；限制 <4MB 或分片/Worker 解析 |
| L15 | 错误信息笼统（t3#9） | Settings.tsx:86-89 | 解析错/结构非法/配额失败全部显示「导入失败：文件格式不正确」；分类型提示并报告条数 |
| L16 | clearData 依赖 buildSeed 内部结构（t3#10） | store.ts:146-165 | seed 未来新增字段会残留进「清空」状态；独立构造 EMPTY_STATE 常量 |
| L17 | 隐私声明可更精确（t3#11） | Settings.tsx:170；README.md:69-71 | 「数据仅存本机」宜补充：明文未加密、同源脚本/扩展可读、随浏览器 profile 备份 |
| L18 | uid 本地唯一但导入可致 id 冲突（t3#12） | lib.ts:14-18；store.ts importData | 导入备份与现库 id 冲突时 update/delete 按 id 全表匹配会改错/删错；导入时 id 去重/重映射 |

## 五、亮点 / 做得好的地方

1. **类型安全基线良好**：`tsc --noEmit` 在 strict + noUnusedLocals 下零错误，src 内无 `any`；少数断言集中在 CSS 自定义属性与冗余转换，风险可控（t4）。
2. **安全面干净**：全库无 dangerouslySetInnerHTML/innerHTML/eval、无用户可控 href/src、无网络外联（fetch/XHR/WebSocket/beacon 均无）→ 「无云同步、数据仅存本机」的隐私声明经核实属实（t3）。
3. **状态架构清晰**：dataStore/uiStore 双 store 职责划分合理；partialize 白名单只存数据不存方法、uiStore 不持久化 confirm/toast 闭包都做对了；lib.ts 纯函数派生与 store 解耦，聚合函数可平移至任何后端（t1、t3）。
4. **组件复用度高**：Money/KpiCard/Sparkline/Timeline/CheckItem/EmptyState/Card 原子组件 + `_shared.Board` 壳（PageHead+SubTabs+coming 占位）收敛了跨板块重复 UI（t2）。
5. **边界防护用心**：手写 SVG 对空数据/单点/全平数据均有防护（`data.length<2` 早退、`max-min||1` 防除零）、EmptyState 覆盖所有空场景、`prefers-reduced-motion` 与 `:focus-visible` 已支持、导出 revokeObjectURL 无泄漏（t2）。
6. **财务口径本身正确**：转账不计收支、月度窗口、字符串 ISO 日期比较等核心聚合逻辑方向正确（t1）。

## 六、建议修复路线图

### 🔴 立即修（数据安全与崩溃，成本低收益高）
1. **H1** 导入 schema 校验 + onRehydrateStorage 防御 + ErrorBoundary
2. **H2** persist 立即补 migrate 与版本告警
3. **H3** storage 写失败告警与占用监控
4. **H6** 搜索/日历金额走 Money 组件（堵隐藏金额泄露）
5. **M1** 金额符号/精度校验（防双负号与浮点误差）

### 🟠 近期（一致性与体验，一次迭代可完成）
6. **H5 + M3** Entry 双写/refId：定单一事实源或 refId 级联，日历/搜索去重
7. **H4** 选择器切片 + 板块懒挂载（性能主项）
8. **H7** 浮层 focus trap + ConfirmDialog Esc
9. **H8 + M21** 目标口径（direction/start）与愿望 planned 可见性
10. **M2 / M9 / M11 / M12 / M13 / M18 / M19** 财务退款口径、导入语义、NaN 日期、日历口径、健康假日期、时区统一、日期脏数据

### 🔵 后续（架构演进与打磨）
11. **M4 / M5 / M8 / M10 / M20 / L3 / L8 / L12** 死代码清理、模板开关接入或移除、多标签同步、verify 脚本落地、pptx 入参校验
12. **M6 / M7** IndexedDB 迁移路线（repository + StorageAdapter）、CSP 与加密容器
13. **M14-M17 / L1-L2 / L5-L7 / L9-L11 / L13-L18** 可访问性补齐、文案/边界打磨、mckinsey_pptx.py 与脚本细节、文档精确化
