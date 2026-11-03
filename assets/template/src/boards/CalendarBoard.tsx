/** 日历：按真实记录日期打点，可翻月 */
import { useMemo, useState } from 'react';
import { useData } from '../store';
import { Timeline, type TimelineItem, EmptyState, Chip } from '../components/ui';
import { Icon } from '../components/Icons';
import { toISO, today, daysInMonth, weekdayMon0, fmtMonth, fmtDate, AREA_COLOR, parseISO } from '../lib';
import type { AreaKey } from '../types';

export function CalendarBoard() {
  const data = useData();
  const [cursor, setCursor] = useState(() => {
    const t = parseISO(today());
    return toISO(new Date(t.getFullYear(), t.getMonth(), 1));
  });
  const [selected, setSelected] = useState<string>(today());

  const cur = parseISO(cursor);
  const year = cur.getFullYear();
  const month0 = cur.getMonth();
  const firstDow = weekdayMon0(toISO(new Date(year, month0, 1)));
  const dim = daysInMonth(year, month0);

  // 按日期归集 dots（来自 entries + plans + experiences + workouts）
  const dotsByDate = useMemo(() => {
    const map = new Map<string, Set<AreaKey>>();
    const add = (date: string, area: AreaKey) => {
      if (!map.has(date)) map.set(date, new Set());
      map.get(date)!.add(area);
    };
    data.entries.forEach((e) => add(e.date, e.areaKey));
    data.plans.forEach((p) => add(p.date, 'life'));
    data.experiences.forEach((x) => add(x.date, 'life'));
    data.workouts.forEach((w) => add(w.date, 'health'));
    data.txs.forEach((t) => add(t.date, 'finance'));
    return map;
  }, [data.entries, data.plans, data.experiences, data.workouts, data.txs]);

  const cells: { day: number; date: string; dim: boolean }[] = [];
  // 上月补位
  const prevDim = daysInMonth(year, month0 - 1);
  for (let i = firstDow - 1; i >= 0; i--) {
    const d = new Date(year, month0 - 1, prevDim - i);
    cells.push({ day: d.getDate(), date: toISO(d), dim: true });
  }
  for (let d = 1; d <= dim; d++) {
    cells.push({ day: d, date: toISO(new Date(year, month0, d)), dim: false });
  }
  // 补满 6 行（42 格）
  let nxt = 1;
  while (cells.length < 42) {
    const d = new Date(year, month0 + 1, nxt++);
    cells.push({ day: d.getDate(), date: toISO(d), dim: true });
  }

  function shiftMonth(n: number) {
    setCursor(toISO(new Date(year, month0 + n, 1)));
  }

  // 选中日条目
  const dayItems: TimelineItem[] = [
    ...data.entries.filter((e) => e.date === selected).map((e) => ({
      id: 'e-' + e.id,
      dotColor: AREA_COLOR[e.areaKey],
      title: e.text,
      meta: <Chip>{data.areas.find((a) => a.key === e.areaKey)?.name}</Chip>,
    })),
    ...data.plans.filter((p) => p.date === selected).map((p) => ({
      id: 'p-' + p.id, dotColor: AREA_COLOR.life, title: p.text, meta: <Chip>计划</Chip>,
    })),
    ...data.experiences.filter((x) => x.date === selected).map((x) => ({
      id: 'x-' + x.id, dotColor: AREA_COLOR.life, title: x.text, meta: <Chip>{x.type}</Chip>,
    })),
    ...data.txs.filter((t) => t.date === selected).map((t) => ({
      id: 't-' + t.id, dotColor: AREA_COLOR.finance, title: `${t.category} ¥${t.amount}`, meta: <Chip>{t.type}</Chip>,
    })),
  ];

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-main">
          <h1 className="page-title"><Icon name="calendar" className="icon-lg" /> 日历</h1>
          <div className="page-sub">按日期聚合所有板块的记录</div>
        </div>
      </div>

      <div className="cal-wrap">
        <div className="cal-card">
          <div className="cal-head">
            <button className="cal-nav" onClick={() => shiftMonth(-1)} aria-label="上一月"><Icon name="chevron-left" className="icon-sm" /></button>
            <div className="cal-title">{fmtMonth(cursor)}</div>
            <button className="cal-nav" onClick={() => shiftMonth(1)} aria-label="下一月"><Icon name="chevron-right" className="icon-sm" /></button>
            <button className="btn ghost sm" style={{ marginLeft: 8 }} onClick={() => { const t = parseISO(today()); setCursor(toISO(new Date(t.getFullYear(), t.getMonth(), 1))); setSelected(today()); }}>今天</button>
          </div>

          <div className="cal-grid">
            {['一', '二', '三', '四', '五', '六', '日'].map((d) => (
              <div key={d} className="cal-dow">{d}</div>
            ))}
            {cells.map((c, i) => {
              const dots = dotsByDate.get(c.date);
              const isToday = c.date === today();
              const isSel = c.date === selected;
              return (
                <button
                  key={i}
                  className={'cal-cell' + (c.dim ? ' dim' : '') + (dots ? ' has' : '') + (isToday ? ' today' : '')}
                  style={isSel ? { outline: '2px solid var(--el-lime-deep)', outlineOffset: -2 } : undefined}
                  onClick={() => setSelected(c.date)}
                >
                  <span className="cal-day">{c.day}</span>
                  {dots && (
                    <span className="cal-dots">
                      {Array.from(dots).slice(0, 4).map((a) => (
                        <span key={a} style={{ background: AREA_COLOR[a] }} />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="cal-legend">
            {data.areas.map((a) => (
              <span key={a.key} className="legend-item">
                <span className="status-dot" style={{ background: AREA_COLOR[a.key] }} />
                {a.name}
              </span>
            ))}
          </div>
        </div>

        <div className="cal-side">
          <div className="card-title" style={{ marginBottom: 4 }}>{fmtDate(selected)}</div>
          <div className="card-sub" style={{ marginBottom: 14 }}>{dayItems.length} 条记录</div>
          {dayItems.length === 0 ? (
            <EmptyState icon="calendar" title="这一天没有记录" />
          ) : (
            <Timeline items={dayItems} />
          )}
        </div>
      </div>
    </div>
  );
}
