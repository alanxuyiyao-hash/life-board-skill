/**
 * Life Board · 状态层
 * - dataStore：全量实体 + persist(localStorage)，形状贴合未来换 IndexedDB/SQLite
 * - uiStore：界面态（当前 tab / 侧栏折叠 / 隐藏金额 / 模板开关 / 浮层）
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AppData,
  AreaKey,
  Entry,
  EntryKind,
  Project,
  Resource,
  Workout,
  Tx,
  TxType,
  WishStatus,
  Plan,
  Experience,
  TabId,
} from './types';
import { buildSeed } from './seed';
import { today, uid } from './lib';

/* ============ dataStore ============ */
interface DataState extends AppData {
  // 通用记录
  addEntry: (e: Partial<Entry> & { areaKey: AreaKey; kind: EntryKind; text: string }) => Entry;
  updateEntry: (id: string, patch: Partial<Entry>) => void;
  deleteEntry: (id: string) => void;
  toggleEntryDone: (id: string) => void;
  // 板块专属
  addProject: (p: Partial<Project>) => void;
  addResource: (r: Partial<Resource>) => void;
  updateResource: (id: string, patch: Partial<Resource>) => void;
  addReading: (metricId: string, value: number, date?: string) => void;
  addWorkout: (w: Partial<Workout> & { type: string }) => void;
  deleteWorkout: (id: string) => void;
  addTx: (t: Partial<Tx> & { type: TxType; amount: number; date: string }) => void;
  deleteTx: (id: string) => void;
  addWish: (text: string, status?: WishStatus) => void;
  setWishStatus: (id: string, status: WishStatus) => void;
  deleteWish: (id: string) => void;
  addPlan: (p: Partial<Plan> & { text: string; date: string }) => void;
  deletePlan: (id: string) => void;
  addExperience: (x: Partial<Experience> & { text: string }) => void;
  deleteExperience: (id: string) => void;
  setGoalCurrent: (id: string, current: number) => void;
  // 整体
  importData: (data: Partial<AppData>) => void;
  clearData: () => void;
  reseed: () => void;
}

const seed = buildSeed();

export const useData = create<DataState>()(
  persist(
    (set) => ({
      ...seed,

      addEntry: (e) => {
        const entry: Entry = {
          id: uid('e'),
          areaKey: e.areaKey,
          kind: e.kind,
          text: e.text,
          date: e.date || today(),
          value: e.value,
          unit: e.unit,
          note: e.note,
          tags: e.tags,
          done: e.done,
          refId: e.refId,
          createdAt: Date.now(),
        };
        set((s) => ({ entries: [entry, ...s.entries] }));
        return entry;
      },
      updateEntry: (id, patch) =>
        set((s) => ({ entries: s.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
      deleteEntry: (id) => set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
      toggleEntryDone: (id) =>
        set((s) => ({ entries: s.entries.map((e) => (e.id === id ? { ...e, done: !e.done } : e)) })),

      addProject: (p) =>
        set((s) => ({
          projects: [{ id: uid('p'), name: p.name || '未命名项目', status: p.status || 'active', role: p.role, goal: p.goal, startDate: p.startDate || today() }, ...s.projects],
        })),
      addResource: (r) =>
        set((s) => ({
          resources: [
            { id: uid('r'), type: r.type || 'book', title: r.title || '未命名', author: r.author, total: r.total, current: r.current || 0, status: r.status || 'want', purpose: r.purpose || 'learn' },
            ...s.resources,
          ],
        })),
      updateResource: (id, patch) =>
        set((s) => ({ resources: s.resources.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
      addReading: (metricId, value, date) =>
        set((s) => ({ readings: [{ id: uid('rd'), metricId, value, date: date || today() }, ...s.readings] })),
      addWorkout: (w) =>
        set((s) => ({
          workouts: [{ id: uid('w'), type: w.type, duration: w.duration, distance: w.distance, date: w.date || today(), note: w.note }, ...s.workouts],
        })),
      deleteWorkout: (id) => set((s) => ({ workouts: s.workouts.filter((w) => w.id !== id) })),
      addTx: (t) =>
        set((s) => ({
          txs: [{ id: uid('t'), type: t.type, amount: t.amount, category: t.category || '其他', account: t.account, date: t.date, note: t.note, refId: t.refId }, ...s.txs],
        })),
      deleteTx: (id) => set((s) => ({ txs: s.txs.filter((t) => t.id !== id) })),
      addWish: (text, status = 'idea') =>
        set((s) => ({ wishes: [{ id: uid('ws'), text, status }, ...s.wishes] })),
      setWishStatus: (id, status) =>
        set((s) => ({ wishes: s.wishes.map((w) => (w.id === id ? { ...w, status } : w)) })),
      deleteWish: (id) => set((s) => ({ wishes: s.wishes.filter((w) => w.id !== id) })),
      addPlan: (p) =>
        set((s) => ({ plans: [{ id: uid('pl'), text: p.text, date: p.date, type: p.type, person: p.person }, ...s.plans] })),
      deletePlan: (id) => set((s) => ({ plans: s.plans.filter((p) => p.id !== id) })),
      addExperience: (x) =>
        set((s) => ({ experiences: [{ id: uid('ex'), type: x.type || '日常', text: x.text, date: x.date || today(), rating: x.rating }, ...s.experiences] })),
      deleteExperience: (id) => set((s) => ({ experiences: s.experiences.filter((x) => x.id !== id) })),
      setGoalCurrent: (id, current) =>
        set((s) => ({ yearGoals: s.yearGoals.map((g) => (g.id === id ? { ...g, current } : g)) })),

      importData: (data) =>
        set((s) => {
          const next: AppData = {
            version: data.version ?? s.version,
            areas: data.areas ?? s.areas,
            entries: data.entries ?? s.entries,
            projects: data.projects ?? s.projects,
            resources: data.resources ?? s.resources,
            metrics: data.metrics ?? s.metrics,
            readings: data.readings ?? s.readings,
            workouts: data.workouts ?? s.workouts,
            txs: data.txs ?? s.txs,
            netWorth: data.netWorth ?? s.netWorth,
            wishes: data.wishes ?? s.wishes,
            experiences: data.experiences ?? s.experiences,
            plans: data.plans ?? s.plans,
            yearGoals: data.yearGoals ?? s.yearGoals,
          };
          return next;
        }),
      clearData: () =>
        set(() => ({
          ...buildSeed(),
          // 清空到「空用户」状态而非种子：仅保留板块定义
          entries: [],
          projects: [],
          resources: [],
          readings: [],
          workouts: [],
          txs: [],
          netWorth: [],
          wishes: [],
          experiences: [],
          plans: [],
          yearGoals: [],
          metrics: [
            { id: 'weight', name: '体重', unit: 'kg' },
            { id: 'bodyfat', name: '体脂率', unit: '%' },
          ],
        })),
      reseed: () => set(() => ({ ...buildSeed() })),
    }),
    {
      name: 'life-board:data',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // 只持久化数据字段，不持久化方法
      partialize: (s) => ({
        version: s.version,
        areas: s.areas,
        entries: s.entries,
        projects: s.projects,
        resources: s.resources,
        metrics: s.metrics,
        readings: s.readings,
        workouts: s.workouts,
        txs: s.txs,
        netWorth: s.netWorth,
        wishes: s.wishes,
        experiences: s.experiences,
        plans: s.plans,
        yearGoals: s.yearGoals,
      }),
    },
  ),
);

/* ============ uiStore ============ */
export interface ToastMsg {
  id: string;
  text: string;
}

export interface TemplateState {
  // 工作模板
  work_orders: boolean;
  work_content: boolean;
  // 知识模板
  knowledge_exam: boolean;
  knowledge_language: boolean;
  // 健康模板
  health_running: boolean;
  health_strength: boolean;
  health_diet: boolean;
  // 财务模板
  finance_business: boolean;
  finance_holdings: boolean;
  // 生活模板
  life_family: boolean;
  life_pets: boolean;
}

interface UIState {
  tab: TabId;
  setTab: (t: TabId) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  hideMoney: boolean;
  setHideMoney: (v: boolean) => void;
  templates: TemplateState;
  toggleTemplate: (k: keyof TemplateState) => void;
  // 浮层
  recordOpen: boolean;
  recordDefaultArea: AreaKey | null;
  openRecord: (area?: AreaKey) => void;
  closeRecord: () => void;
  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  confirm: ConfirmOpt | null;
  askConfirm: (opt: ConfirmOpt) => void;
  dismissConfirm: () => void;
  // toast
  toasts: ToastMsg[];
  toast: (text: string) => void;
  dismissToast: (id: string) => void;
}

export interface ConfirmOpt {
  title: string;
  text: string;
  confirmText?: string;
  danger?: boolean;
  onConfirm: () => void;
}

export const useUI = create<UIState>()(
  persist(
    (set, get) => ({
      tab: 'overview',
      setTab: (t) => set({ tab: t }),
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      hideMoney: false,
      setHideMoney: (v) => set({ hideMoney: v }),
      templates: {
        work_orders: false,
        work_content: true,
        knowledge_exam: false,
        knowledge_language: false,
        health_running: false,
        health_strength: false,
        health_diet: false,
        finance_business: true,
        finance_holdings: false,
        life_family: false,
        life_pets: false,
      },
      toggleTemplate: (k) => set((s) => ({ templates: { ...s.templates, [k]: !s.templates[k] } })),

      recordOpen: false,
      recordDefaultArea: null,
      openRecord: (area) => set({ recordOpen: true, recordDefaultArea: area ?? null }),
      closeRecord: () => set({ recordOpen: false, recordDefaultArea: null }),
      searchOpen: false,
      openSearch: () => set({ searchOpen: true }),
      closeSearch: () => set({ searchOpen: false }),
      confirm: null,
      askConfirm: (opt) => set({ confirm: opt }),
      dismissConfirm: () => set({ confirm: null }),

      toasts: [],
      toast: (text) => {
        const id = uid('toast');
        set((s) => ({ toasts: [...s.toasts, { id, text }] }));
        window.setTimeout(() => get().dismissToast(id), 2400);
      },
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: 'life-board:ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed, hideMoney: s.hideMoney, templates: s.templates }),
    },
  ),
);

/* ============ 选择器快捷导出 ============ */
export const selectArea = (key: AreaKey) => (state: DataState) =>
  state.areas.find((a) => a.key === key)!;
