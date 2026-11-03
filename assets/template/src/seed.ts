/**
 * Life Board · 种子数据（取自原型 docs/prototype.html 的样例，开箱即"活"）
 * 基准日：2026-08-11（周二）
 */
import type { AppData, Area } from './types';

export const AREAS: Area[] = [
  { key: 'work', name: '工作', emoji: '💼', color: '#b5791a', tagline: '个人职业系统' },
  { key: 'knowledge', name: '知识', emoji: '📚', color: '#5a6ea0', tagline: '个人学习系统' },
  { key: 'health', name: '健康', emoji: '🌿', color: '#2c7a4e', tagline: '个人健康管理系统' },
  { key: 'finance', name: '财务', emoji: '💰', color: '#14422b', tagline: '个人财务管理系统' },
  { key: 'life', name: '生活', emoji: '🧭', color: '#c0564d', tagline: '个人体验与关系系统' },
];

export function buildSeed(): AppData {
  return {
    version: 1,
    areas: AREAS,
    /* ---------- 总览 · 年度目标 ---------- */
    yearGoals: [
      { id: 'yg1', areaKey: 'knowledge', title: '读 24 本书', target: 24, current: 14, unit: '本', pace: 61 },
      { id: 'yg2', areaKey: 'health', title: '跑步 500 km', target: 500, current: 340, unit: 'km', pace: 61 },
      { id: 'yg3', areaKey: 'health', title: '体重降到 68 kg', target: 68, current: 69.2, unit: 'kg', pace: 61 },
    ],

    /* ---------- 通用记录（跨板块最近动静） ---------- */
    entries: [
      // 本周
      { id: 'e1', areaKey: 'health', kind: 'workout', text: '晨跑 5.2 km', date: '2026-08-11', value: 5.2, unit: 'km', note: '配速 7\'18"', createdAt: 1 },
      { id: 'e2', areaKey: 'work', kind: 'outcome', text: '商单确认 ¥8,800', date: '2026-08-11', value: 8800, unit: '元', createdAt: 2 },
      { id: 'e3', areaKey: 'knowledge', kind: 'log', text: '读《思考，快与慢》28 页', date: '2026-08-10', value: 28, unit: '页', refId: 'r1', createdAt: 3 },
      { id: 'e4', areaKey: 'finance', kind: 'transaction', text: '超市采买', date: '2026-08-10', value: -186, unit: '元', createdAt: 4 },
      { id: 'e5', areaKey: 'life', kind: 'event', text: '和朋友吃晚饭', date: '2026-08-09', createdAt: 5 },
      { id: 'e6', areaKey: 'health', kind: 'reading', text: '体重 69.2 kg', date: '2026-08-09', value: 69.2, unit: 'kg', createdAt: 6 },

      // 工作 · 本周重点（focus）
      { id: 'e7', areaKey: 'work', kind: 'focus', text: '完成 Q3 述职 PPT 初稿', date: '2026-08-11', done: false, createdAt: 7 },
      { id: 'e8', areaKey: 'work', kind: 'focus', text: '交付品牌片 v2 脚本', date: '2026-08-11', done: true, createdAt: 8 },
      { id: 'e9', areaKey: 'work', kind: 'focus', text: '梳理 9 月内容排期', date: '2026-08-11', done: false, createdAt: 9 },
      { id: 'e10', areaKey: 'work', kind: 'focus', text: '回访 3 个潜在客户', date: '2026-08-11', done: false, createdAt: 10 },

      // 工作 · 本周成果
      { id: 'e11', areaKey: 'work', kind: 'outcome', text: '品牌片脚本定稿交付', date: '2026-08-10', refId: 'p1', createdAt: 11 },
      { id: 'e12', areaKey: 'work', kind: 'outcome', text: '全网粉丝周增 +1,240', date: '2026-08-09', value: 1240, unit: '人', createdAt: 12 },

      // 工作 · 待跟进（未完成 task）
      { id: 'e13', areaKey: 'work', kind: 'task', text: '催收尾款 ¥4,400（应收 8/15）', date: '2026-08-15', done: false, createdAt: 13 },
      { id: 'e14', areaKey: 'work', kind: 'task', text: '合同盖章寄回', date: '2026-08-13', done: false, createdAt: 14 },
      { id: 'e15', areaKey: 'work', kind: 'task', text: '确认 9 月内容排期', date: '2026-08-14', done: false, createdAt: 15 },

      // 知识 · 本周计划
      { id: 'e16', areaKey: 'knowledge', kind: 'focus', text: '读完《思考，快与慢》第 4 部', date: '2026-08-11', done: false, createdAt: 16 },
      { id: 'e17', areaKey: 'knowledge', kind: 'focus', text: '剪辑课第 10 节练习', date: '2026-08-11', done: false, createdAt: 17 },
      { id: 'e18', areaKey: 'knowledge', kind: 'focus', text: '整理本周 3 条读书笔记', date: '2026-08-11', done: true, createdAt: 18 },

      // 知识 · 最近学习记录
      { id: 'e19', areaKey: 'knowledge', kind: 'log', text: '《纳瓦尔宝典》读 40 页', date: '2026-08-09', value: 40, unit: '页', refId: 'r2', createdAt: 19 },
      { id: 'e20', areaKey: 'knowledge', kind: 'log', text: '剪辑课第 9 节：调色基础', date: '2026-08-08', refId: 'r3', createdAt: 20 },

      // 健康 · 运动
      { id: 'e21', areaKey: 'health', kind: 'workout', text: '恢复跑 1.3 km', date: '2026-08-09', value: 1.3, unit: 'km', createdAt: 21 },

      // 生活 · 最近体验
      { id: 'e22', areaKey: 'life', kind: 'event', text: '看了《奥本海默》重映', date: '2026-08-07', createdAt: 22 },
      { id: 'e23', areaKey: 'life', kind: 'event', text: '胡同里散步喝咖啡', date: '2026-08-08', createdAt: 23 },
    ],

    /* ---------- 工作 · 项目 ---------- */
    projects: [
      { id: 'p1', name: '某品牌年度内容合作', status: 'active', role: '内容策划 / 导演', goal: '交付 12 支短视频 + 2 场直播', startDate: '2026-07-01' },
      { id: 'p2', name: '个人知识管理课程', status: 'active', role: '主理人', goal: '上线第一门付费课', startDate: '2026-06-15' },
    ],

    /* ---------- 知识 · 资源 ---------- */
    resources: [
      { id: 'r1', type: 'book', title: '思考，快与慢', author: '丹尼尔·卡尼曼', total: 380, current: 244, status: 'reading', purpose: 'learn' },
      { id: 'r2', type: 'book', title: '纳瓦尔宝典', author: '埃里克·乔根森', total: 200, current: 60, status: 'reading', purpose: 'learn' },
      { id: 'r3', type: 'course', title: '视频剪辑进阶课', author: '某讲师', total: 20, current: 9, status: 'reading', purpose: 'learn' },
    ],

    /* ---------- 健康 · 指标 + 读数 ---------- */
    metrics: [
      { id: 'weight', name: '体重', unit: 'kg', goal: 68 },
      { id: 'bodyfat', name: '体脂率', unit: '%' },
    ],
    readings: [
      // 体重趋势（最近 8 次，整体缓降）
      { id: 'rd1', metricId: 'weight', value: 71.8, date: '2026-06-10' },
      { id: 'rd2', metricId: 'weight', value: 71.3, date: '2026-06-24' },
      { id: 'rd3', metricId: 'weight', value: 70.9, date: '2026-07-08' },
      { id: 'rd4', metricId: 'weight', value: 70.4, date: '2026-07-22' },
      { id: 'rd5', metricId: 'weight', value: 70.0, date: '2026-07-29' },
      { id: 'rd6', metricId: 'weight', value: 69.6, date: '2026-08-05' },
      { id: 'rd7', metricId: 'weight', value: 69.2, date: '2026-08-09' },
      // 体脂
      { id: 'rd8', metricId: 'bodyfat', value: 19.4, date: '2026-07-08' },
      { id: 'rd9', metricId: 'bodyfat', value: 19.0, date: '2026-07-22' },
      { id: 'rd10', metricId: 'bodyfat', value: 18.7, date: '2026-07-29' },
      { id: 'rd11', metricId: 'bodyfat', value: 18.5, date: '2026-08-09' },
    ],
    workouts: [
      { id: 'w1', type: '跑步', distance: 5.2, duration: 38, date: '2026-08-11', note: '配速 7\'18"' },
      { id: 'w2', type: '跑步', distance: 1.3, duration: 9, date: '2026-08-09', note: '恢复跑' },
      { id: 'w3', type: '力量训练', duration: 45, date: '2026-08-07' },
    ],

    /* ---------- 财务 · 流水 + 净资产 ---------- */
    txs: [
      // 本月收入（按到账日）
      { id: 't1', type: 'income', amount: 8800, category: '内容合作', account: '招行', date: '2026-08-08', note: '品牌片定金', refId: 'p1' },
      { id: 't2', type: 'income', amount: 9800, category: '工资', account: '招行', date: '2026-08-05' },
      // 本月支出
      { id: 't3', type: 'expense', amount: 4200, category: '房租', account: '招行', date: '2026-08-01' },
      { id: 't4', type: 'expense', amount: 186, category: '超市/日用', account: '招行', date: '2026-08-10' },
      { id: 't5', type: 'expense', amount: 1200, category: '储蓄/转账', account: '招行', date: '2026-08-09', note: '转入储蓄卡（账户间）' },
      { id: 't6', type: 'expense', amount: 88, category: '餐饮', account: '微信', date: '2026-08-09' },
      { id: 't7', type: 'expense', amount: 3200, category: '设备/软件', account: '招行', date: '2026-08-03', note: '麦克风 + 订阅' },
      { id: 't8', type: 'expense', amount: 366, category: '其他', account: '微信', date: '2026-08-06' },
      // 转账示例（不计入收支）
      { id: 't9', type: 'transfer', amount: 1500, category: '信用卡还款', account: '招行→招行信用卡', date: '2026-08-07' },
    ],
    netWorth: [
      { date: '2026-06-01', value: 172800 },
      { date: '2026-07-01', value: 178300 },
      { date: '2026-08-01', value: 184500 },
    ],

    /* ---------- 生活 ---------- */
    wishes: [
      { id: 'ws1', text: '学会冲浪', type: '兴趣', status: 'soon' },
      { id: 'ws2', text: '去京都看红叶', type: '旅行', status: 'idea' },
      { id: 'ws3', text: '买一台胶片相机', type: '兴趣', status: 'idea' },
      { id: 'ws4', text: '独自露营一次', type: '体验', status: 'done' },
    ],
    plans: [
      { id: 'pl1', text: '莫干山两天一夜', date: '2026-08-15', type: '旅行', person: '家人' },
      { id: 'pl2', text: '《奥本海默》重映', date: '2026-08-13', type: '体验' },
      { id: 'pl3', text: '妈妈生日', date: '2026-08-22', type: '家庭', person: '妈妈' },
    ],
    experiences: [
      { id: 'ex1', type: '影视', text: '《奥本海默》重映', date: '2026-08-07', rating: 5 },
      { id: 'ex2', type: '日常', text: '胡同散步 + 咖啡', date: '2026-08-08', rating: 4 },
      { id: 'ex3', type: '餐饮', text: '巷子里那家小馆', date: '2026-08-04', rating: 4 },
    ],
  };
}
