/**
 * Life Board · 工具函数（id / 日期 / 格式 / 派生聚合）
 */
import type {
  AreaKey,
  Entry,
  Tx,
  Reading,
  Workout,
  YearGoal,
} from './types';

/* ---------- id ---------- */
let _seq = 0;
export function uid(prefix = 'id'): string {
  _seq += 1;
  return `${prefix}_${Date.now().toString(36)}_${(_seq).toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

/* ---------- 日期（本地时区，周一为一周起点） ---------- */
const pad = (n: number) => String(n).padStart(2, '0');

export function toISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
export function today(): string {
  return toISO(new Date());
}
export function parseISO(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}
export function addDays(s: string, n: number): string {
  const d = parseISO(s);
  d.setDate(d.getDate() + n);
  return toISO(d);
}
export function addMonths(s: string, n: number): string {
  const d = parseISO(s);
  d.setMonth(d.getMonth() + n);
  return toISO(s === '' ? d : d);
}
export function startOfWeek(s: string): string {
  // 周一为起点
  const d = parseISO(s);
  const day = d.getDay(); // 0=日..6=六
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  return toISO(d);
}
export function startOfMonth(s: string): string {
  const d = parseISO(s);
  d.setDate(1);
  return toISO(d);
}
export function endOfMonth(s: string): string {
  const d = parseISO(s);
  d.setMonth(d.getMonth() + 1, 0); // 月末
  return toISO(d);
}
export function daysInMonth(year: number, month0: number): number {
  return new Date(year, month0 + 1, 0).getDate();
}
/** 该日期是周几（周一=0 ... 周日=6） */
export function weekdayMon0(s: string): number {
  const day = parseISO(s).getDay();
  return day === 0 ? 6 : day - 1;
}

const DOW = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
export function fmtDOW(s: string): string {
  return DOW[weekdayMon0(s)];
}

export function fmtDate(s: string): string {
  const d = parseISO(s);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}
export function fmtDateFull(s: string): string {
  const d = parseISO(s);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}
export function fmtMonth(s: string): string {
  const d = parseISO(s);
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
}
export function fmtMonthShort(s: string): string {
  const d = parseISO(s);
  return `${d.getMonth() + 1}月`;
}
export function relativeDay(s: string, ref = today()): string {
  const diff = Math.round((parseISO(s).getTime() - parseISO(ref).getTime()) / 86400000);
  if (diff === 0) return '今天';
  if (diff === -1) return '昨天';
  if (diff === 1) return '明天';
  if (diff === 2) return '后天';
  if (diff > 1 && diff <= 13) return `${diff} 天后`;
  if (diff < -1 && diff >= -6) return `${-diff} 天前`;
  return fmtDate(s);
}

/* ---------- 格式 ---------- */
export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
export function pct(current: number, target: number): number {
  if (target <= 0) return 0;
  return clamp((current / target) * 100, 0, 100);
}
export function fmtMoney(n: number, withSign = false): { sym: string; digits: string } {
  const sign = n < 0 ? '−' : withSign && n > 0 ? '+' : '';
  const abs = Math.abs(n);
  const digits = `${sign}${abs.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}`;
  return { sym: '¥', digits };
}
export function fmtNum(n: number, frac = 1): string {
  return n.toLocaleString('zh-CN', { maximumFractionDigits: frac });
}

/* ---------- 派生：通用记录 ---------- */
export function inRange(date: string, from: string, to: string): boolean {
  return date >= from && date <= to;
}
export function entriesInRange(entries: Entry[], from: string, to: string): Entry[] {
  return entries.filter((e) => inRange(e.date, from, to));
}
export function thisWeekRange(ref = today()): [string, string] {
  const s = startOfWeek(ref);
  return [s, addDays(s, 6)];
}
export function sortByDate<T extends { date: string }>(arr: T[], dir: 'desc' | 'asc' = 'desc'): T[] {
  return [...arr].sort((a, b) => (dir === 'desc' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)));
}
export function sortByCreated<T extends { createdAt?: number }>(arr: T[], dir: 'desc' | 'asc' = 'desc'): T[] {
  return [...arr].sort((a, b) => ((a.createdAt || 0) - (b.createdAt || 0)) * (dir === 'desc' ? -1 : 1));
}

/* ---------- 派生：财务 ---------- */
export interface MonthSummary {
  income: number;
  expense: number;
  balance: number;
  savingRate: number;
}
export function monthRange(ref = today()): [string, string] {
  return [startOfMonth(ref), endOfMonth(ref)];
}
export function txsInMonth(txs: Tx[], ref = today()): Tx[] {
  const [from, to] = monthRange(ref);
  return txs.filter((t) => inRange(t.date, from, to));
}
export function monthSummary(txs: Tx[], ref = today()): MonthSummary {
  const ms = txsInMonth(txs, ref);
  let income = 0;
  let expense = 0;
  for (const t of ms) {
    if (t.type === 'income') income += t.amount;
    else if (t.type === 'expense') expense += t.amount;
    else if (t.type === 'refund') {
      // 退款冲减原口径：简化为冲减对应方向，按分类无法判定，统一从支出冲减
      expense -= t.amount;
    }
    // transfer 不计入
  }
  const balance = income - expense;
  const savingRate = income > 0 ? (balance / income) * 100 : 0;
  return { income, expense, balance, savingRate };
}

/* ---------- 派生：健康 ---------- */
export function latestReading(readings: Reading[], metricId: string): Reading | undefined {
  return sortByDate(readings.filter((r) => r.metricId === metricId), 'desc')[0];
}
export function readingSeries(readings: Reading[], metricId: string, limit = 12): Reading[] {
  return sortByDate(readings.filter((r) => r.metricId === metricId), 'asc').slice(-limit);
}
export function workoutsThisWeek(workouts: Workout[], ref = today()): Workout[] {
  const [from, to] = thisWeekRange(ref);
  return workouts.filter((w) => inRange(w.date, from, to));
}

/* ---------- 派生：年度目标进度（current/target + pace） ---------- */
export function goalProgress(g: Pick<YearGoal, 'current' | 'target'>): number {
  return pct(g.current, g.target);
}
export function goalPace(g: YearGoal, ref = today()): number {
  if (g.pace != null) return g.pace;
  // 默认按年内天数线性推算
  const d = parseISO(ref);
  const yearStart = `${d.getFullYear()}-01-01`;
  const yearEnd = `${d.getFullYear()}-12-31`;
  const total = Math.round((parseISO(yearEnd).getTime() - parseISO(yearStart).getTime()) / 86400000) + 1;
  const passed = Math.round((d.getTime() - parseISO(yearStart).getTime()) / 86400000) + 1;
  return clamp((passed / total) * 100, 0, 100);
}

/* ---------- 颜色 ---------- */
export const AREA_COLOR: Record<AreaKey, string> = {
  work: 'var(--c-work)',
  knowledge: 'var(--c-knowledge)',
  health: 'var(--c-health)',
  finance: 'var(--c-finance)',
  life: 'var(--c-life)',
};
