/** 通用 UI 原子组件 */
import type { ReactNode, CSSProperties } from 'react';
import clsx from 'clsx';
import { Icon, type IconName } from './Icons';
import { fmtMoney } from '../lib';
import { useUI } from '../store';
import type { AreaKey } from '../types';

/* ---------- Money（隐藏金额友好：开启后显示 ¥•••，保留正负方向） ---------- */
export function Money({
  value,
  withSign = false,
  className,
}: {
  value: number;
  withSign?: boolean;
  className?: string;
}) {
  const { sym, digits } = fmtMoney(value, withSign);
  const hideMoney = useUI(s => s.hideMoney);
  // 保留正负方向：取 digits 开头的符号（+ / −），其余以 ••• 占位
  const sign = /^[+\u2212]/.test(digits) ? digits[0] : '';
  const shown = hideMoney ? `${sign}•••` : digits;
  return (
    <span className={clsx('money', className)}>
      <span className="cur-sym sym">{sym}</span>
      <span className="digits">{shown}</span>
    </span>
  );
}

/* ---------- KpiCard ---------- */
export type Tone = 'neutral' | 'accent' | 'green' | 'amber' | 'rose' | 'blue';

export function KpiCard({
  label,
  value,
  unit,
  tone = 'neutral',
  hero = false,
  delta,
  deltaDir = 'flat',
  meta,
  icon,
}: {
  label: ReactNode;
  value: ReactNode;
  unit?: ReactNode;
  tone?: Tone;
  hero?: boolean;
  delta?: ReactNode;
  deltaDir?: 'up' | 'down' | 'flat';
  meta?: ReactNode;
  icon?: IconName;
}) {
  const toneColor =
    tone === 'accent' ? 'var(--el-lime-deep)'
      : tone === 'green' ? 'var(--el-green)'
      : tone === 'amber' ? 'var(--el-amber)'
      : tone === 'rose' ? 'var(--el-rose)'
      : tone === 'blue' ? 'var(--el-blue)'
      : 'var(--el-lime-deep)';
  return (
    <div
      className={clsx('kpi', hero && 'hero')}
      style={hero ? ({ ['--tone' as string]: toneColor } as React.CSSProperties) : undefined}
    >
      <div className="kpi-label">
        {icon && <Icon name={icon} className="icon-sm" />}
        {label}
      </div>
      <div className="kpi-value" style={tone !== 'neutral' ? { color: toneColor } : undefined}>
        {value}
        {unit && <span className="kpi-unit">{unit}</span>}
      </div>
      {(delta || meta) && (
        <div className="kpi-meta">
          {delta && (
            <span className={clsx('delta', deltaDir)}>
              <Icon name={deltaDir === 'up' ? 'trending-up' : deltaDir === 'down' ? 'trending-down' : 'minus'} className="icon-sm" />
              {delta}
            </span>
          )}
          {meta}
        </div>
      )}
    </div>
  );
}

/* ---------- Sparkline（手写 SVG） ---------- */
export function Sparkline({
  data,
  width = 120,
  height = 36,
  color = 'var(--el-green)',
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  if (data.length < 2) {
    return <div style={{ width, height }} />;
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pad = 3;
  const w = width;
  const h = height;
  const xs = data.map((_, i) => pad + (i * (w - pad * 2)) / (data.length - 1));
  const ys = data.map((v) => h - pad - ((v - min) / span) * (h - pad * 2));
  const line = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  const area = `${line} L${xs[xs.length - 1].toFixed(1)},${h} L${xs[0].toFixed(1)},${h} Z`;
  const lastX = xs[xs.length - 1];
  const lastY = ys[ys.length - 1];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <path d={area} fill={color} fillOpacity={0.1} />
      <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r={2.6} fill={color} />
    </svg>
  );
}

/* ---------- ProgressBar ---------- */
export function ProgressBar({
  percent,
  tone = 'accent',
  className,
}: {
  percent: number;
  tone?: 'accent' | 'amber' | 'green' | 'blue';
  className?: string;
}) {
  return (
    <div className={clsx('progress', tone !== 'accent' && tone, className)} role="progressbar" aria-valuenow={Math.round(percent)} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
    </div>
  );
}

/* ---------- GoalLine（进度条 + 今天标记） ---------- */
export function GoalLine({ percent, now }: { percent: number; now?: number }) {
  return (
    <div className="goal-line">
      <div className="gl-track">
        <div className="gl-fill" style={{ width: `${Math.min(100, percent)}%` }} />
        {now != null && <div className="gl-now" style={{ left: `${Math.min(100, now)}%` }} />}
      </div>
    </div>
  );
}

/* ---------- Chip ---------- */
export function Chip({
  children,
  tone = 'neutral',
  dot = false,
  className,
  style,
}: {
  children: ReactNode;
  tone?: 'neutral' | 'green' | 'amber' | 'rose' | 'blue';
  dot?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span className={clsx('chip', tone !== 'neutral' && tone, dot && 'dot', className)} style={style}>{children}</span>
  );
}

/* ---------- Timeline ---------- */
export interface TimelineItem {
  id: string;
  dotColor?: string;
  title: ReactNode;
  meta?: ReactNode;
  amount?: { value: number; pos?: boolean };
  trailing?: ReactNode;
  onClick?: () => void;
}

export function Timeline({ items, empty }: { items: TimelineItem[]; empty?: ReactNode }) {
  if (items.length === 0) return <>{empty}</>;
  return (
    <div className="timeline">
      {items.map((it) => (
        <div key={it.id} className="tl-item" onClick={it.onClick} style={it.onClick ? { cursor: 'pointer' } : undefined}>
          <span className="tl-dot" style={{ background: it.dotColor || 'var(--el-mut2)' }} />
          <div className="tl-body">
            <div className="tl-title">{it.title}</div>
            {it.meta && <div className="tl-meta">{it.meta}</div>}
          </div>
          {it.amount && (
            <span className={clsx('tl-amount', it.amount.pos ? 'pos' : 'neg')}>
              <Money value={it.amount.value} withSign />
            </span>
          )}
          {it.trailing}
        </div>
      ))}
    </div>
  );
}

/* ---------- CheckItem ---------- */
export function CheckItem({
  text,
  done = false,
  meta,
  onToggle,
}: {
  text: ReactNode;
  done?: boolean;
  meta?: ReactNode;
  onToggle?: () => void;
}) {
  return (
    <div className={clsx('check-item', done && 'done')}>
      <button className="check-box" onClick={onToggle} aria-pressed={done} aria-label={done ? '标记未完成' : '标记完成'}>
        {done && <Icon name="check" className="icon-sm" />}
      </button>
      <div style={{ flex: 1 }}>
        <div className="check-text">{text}</div>
        {meta && <div className="check-meta">{meta}</div>}
      </div>
    </div>
  );
}

/* ---------- EmptyState ---------- */
export function EmptyState({
  icon = 'sparkles',
  title,
  hint,
  action,
}: {
  icon?: IconName;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <div className="empty-icon"><Icon name={icon} /></div>
      <div className="empty-title">{title}</div>
      {hint && <div className="empty-hint">{hint}</div>}
      {action}
    </div>
  );
}

/* ---------- PageHead ---------- */
export function PageHead({
  areaColor,
  title,
  subtitle,
  actions,
}: {
  areaKey?: AreaKey;
  areaColor?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="page-head">
      <div className="page-head-main">
        <h1 className="page-title">
          {areaColor && <span className="area-dot" style={{ background: areaColor }} />}
          {title}
        </h1>
        {subtitle && <div className="page-sub">{subtitle}</div>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

/* ---------- SubTabs ---------- */
export interface SubTab {
  id: string;
  label: string;
  coming?: boolean;
}

export function SubTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: SubTab[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="subtabs" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          className={clsx('subtab', active === t.id && 'active', t.coming && 'coming')}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Card ---------- */
export function Card({
  title,
  sub,
  action,
  children,
  className,
  style,
  tight = false,
  flush = false,
}: {
  title?: ReactNode;
  sub?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  tight?: boolean;
  flush?: boolean;
}) {
  return (
    <div className={clsx('card', tight && 'tight', flush && 'flush', className)} style={style}>
      {(title || action) && (
        <div className="card-head">
          <div>
            {title && <div className="card-title">{title}</div>}
            {sub && <div className="card-sub">{sub}</div>}
          </div>
          {action && <div className="card-action">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
