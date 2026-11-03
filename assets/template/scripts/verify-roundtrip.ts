/**
 * 一次性校验：导出(JSON.stringify) → 导入(JSON.parse) 的 JSON 往返完整性。
 * 直接复用真实 buildSeed() 与 AppData 类型，等价于 Settings 里 doExport/doImport 的数据路径。
 */
import { buildSeed } from '../src/seed';
import type { AppData } from '../src/types';

const data: AppData = buildSeed();

// —— 等价于 Settings.doExport 的序列化 ——
const json = JSON.stringify(data, null, 2);

// —— 等价于 Settings.doImport 的解析 ——
let parsed: AppData;
try {
  parsed = JSON.parse(json) as AppData;
} catch (e) {
  console.error('PARSE_FAILED', e);
  process.exit(1);
}

const listKeys = [
  'entries', 'projects', 'resources', 'readings', 'workouts',
  'txs', 'netWorth', 'wishes', 'plans', 'experiences', 'yearGoals',
] as const;

const counts = Object.fromEntries(listKeys.map(k => [k, (parsed[k] as unknown[]).length])) as Record<string, number>;
const originalCounts = Object.fromEntries(listKeys.map(k => [k, (data[k] as unknown[]).length])) as Record<string, number>;

const countsMatch = listKeys.every(k => counts[k] === originalCounts[k]);
// netWorth 以 date 为键（无 id），其余实体均有 id
const idKeys = listKeys.filter(k => k !== 'netWorth') as (typeof listKeys)[number][];
const allHaveId = idKeys.every(k => (parsed[k] as { id?: unknown }[]).every(x => typeof x.id === 'string'));
const netWorthKeyed = (parsed.netWorth as { date?: unknown }[]).every(x => typeof x.date === 'string');
const areasPreserved = parsed.areas.length === data.areas.length && parsed.areas.every(a => typeof a.key === 'string');
const versionMatch = parsed.version === data.version;

const result = {
  validJson: true,
  byteLen: json,
  version: parsed.version,
  versionMatch,
  areasPreserved,
  counts,
  countsMatch,
  allHaveId,
  netWorthKeyed,
  // 模拟 importData 后能否正常被各板块消费：抽几个关键字段类型
  sampleTx: parsed.txs[0] && { id: typeof parsed.txs[0].id, type: typeof parsed.txs[0].type, amount: typeof parsed.txs[0].amount },
  sampleEntry: parsed.entries[0] && { id: typeof parsed.entries[0].id, areaKey: typeof parsed.entries[0].areaKey, kind: typeof parsed.entries[0].kind },
};

// 退出码：全绿才 0
const ok = countsMatch && allHaveId && netWorthKeyed && areasPreserved && versionMatch;
console.log(JSON.stringify(result, null, 2));
process.exit(ok ? 0 : 2);
