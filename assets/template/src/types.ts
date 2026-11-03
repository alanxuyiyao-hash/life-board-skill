/**
 * Life Board · 数据模型
 * 口径对齐 docs/PRD-产品需求文档.md；MVP 精简字段。
 * 「一条信息只录一次」：通用 Entry 是高频入口落点，板块专属实体保留语义口径。
 */

export type AreaKey = 'work' | 'knowledge' | 'health' | 'finance' | 'life';

export interface Area {
  key: AreaKey;
  name: string;
  emoji: string;
  color: string;
  tagline: string;
}

/* ---------- 通用记录（高频「记录」浮层落点） ---------- */
// kind 语义：log 事实 / task 待办 / note 笔记 / reading 身体读数 / workout 运动 /
//           transaction 收支 / event 体验事件 / focus 本周重点 / outcome 成果
export type EntryKind =
  | 'log'
  | 'task'
  | 'note'
  | 'reading'
  | 'workout'
  | 'transaction'
  | 'event'
  | 'focus'
  | 'outcome';

export interface Entry {
  id: string;
  areaKey: AreaKey;
  kind: EntryKind;
  text: string; // 一句话（必填）
  date: string; // ISO yyyy-mm-dd
  value?: number; // 数值（读数/金额/页数等，视 kind）
  unit?: string;
  note?: string;
  tags?: string[];
  done?: boolean; // task/focus 是否完成
  refId?: string; // 关联实体（项目/资源/交易/计划）
  createdAt: number;
}

/* ---------- 工作 ---------- */
export type ProjectStatus = 'active' | 'done' | 'paused';
export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  role?: string;
  goal?: string;
  startDate?: string;
}

/* ---------- 知识 ---------- */
export type ResourceType = 'book' | 'course';
export type ResourceStatus = 'want' | 'reading' | 'paused' | 'done';
export interface Resource {
  id: string;
  type: ResourceType;
  title: string;
  author?: string;
  total?: number; // 总页数 / 总课节
  current?: number; // 当前绝对位置
  status: ResourceStatus;
  purpose?: 'learn' | 'leisure'; // 学习 / 休闲
}

/* ---------- 健康 ---------- */
export type MetricKey = 'weight' | 'bodyfat' | string;
export interface Metric {
  id: MetricKey;
  name: string;
  unit: string;
  goal?: number;
}
export interface Reading {
  id: string;
  metricId: MetricKey;
  value: number;
  date: string;
}
export interface Workout {
  id: string;
  type: string; // 跑步 / 力量 / ...
  duration?: number; // 分钟
  distance?: number; // km
  date: string;
  note?: string;
}

/* ---------- 财务 ---------- */
export type TxType = 'income' | 'expense' | 'transfer' | 'refund';
export interface Tx {
  id: string;
  type: TxType;
  amount: number;
  category: string;
  account?: string;
  date: string;
  note?: string;
  refId?: string; // 关联项目/计划
}
export interface NetWorthSnapshot {
  date: string;
  value: number;
}

/* ---------- 生活 ---------- */
export type WishStatus = 'idea' | 'soon' | 'planned' | 'done' | 'shelved';
export interface Wish {
  id: string;
  text: string;
  type?: string;
  status: WishStatus;
}
export interface Experience {
  id: string;
  type: string; // 影视/演出/展览/餐饮/活动/日常
  text: string;
  date: string;
  rating?: number; // 1-5
}
export interface Plan {
  id: string;
  text: string;
  date: string; // 未来日期
  type?: string;
  person?: string;
}

/* ---------- 总览：年度目标 ---------- */
export interface YearGoal {
  id: string;
  areaKey: AreaKey;
  title: string;
  target: number;
  current: number;
  unit: string;
  // todayMarker：当前时间点理想进度百分比（可选，用于「在轨」判断线）
  pace?: number;
}

/* ---------- 应用数据全量 ---------- */
export interface AppData {
  areas: Area[];
  entries: Entry[];
  projects: Project[];
  resources: Resource[];
  metrics: Metric[];
  readings: Reading[];
  workouts: Workout[];
  txs: Tx[];
  netWorth: NetWorthSnapshot[];
  wishes: Wish[];
  experiences: Experience[];
  plans: Plan[];
  yearGoals: YearGoal[];
  version: number;
}

/* ---------- UI 态 ---------- */
export type TabId =
  | 'overview'
  | 'calendar'
  | 'work'
  | 'knowledge'
  | 'health'
  | 'finance'
  | 'life'
  | 'settings';
