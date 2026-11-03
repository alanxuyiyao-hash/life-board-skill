/** 总览：问候 + 年度目标 + 最近动静 + 五板块入口 */
import { useData, useUI } from '../store';
import { Card, GoalLine, Chip, Timeline, type TimelineItem } from '../components/ui';
import { Icon } from '../components/Icons';
import { today, fmtDate, fmtDOW, sortByCreated, goalProgress, goalPace, AREA_COLOR } from '../lib';
import type { AreaKey } from '../types';

function greeting() {
  const h = new Date().getHours();
  if (h < 6) return '夜深了';
  if (h < 11) return '早上好';
  if (h < 14) return '中午好';
  if (h < 18) return '下午好';
  return '晚上好';
}

export function Overview() {
  const data = useData();
  const { setTab } = useUI();
  const t = today();

  const recent: TimelineItem[] = sortByCreated(
    data.entries.filter((e) => e.kind !== 'focus' && e.kind !== 'task'),
    'desc',
  )
    .slice(0, 7)
    .map((e) => {
      const area = data.areas.find((a) => a.key === e.areaKey);
      return {
        id: e.id,
        dotColor: AREA_COLOR[e.areaKey],
        title: e.text,
        meta: (
          <>
            <span style={{ color: AREA_COLOR[e.areaKey], fontWeight: 500 }}>{area?.name}</span>
            <span>·</span>
            <span>{fmtDate(e.date)} {fmtDOW(e.date)}</span>
          </>
        ),
        amount: e.kind === 'transaction' && e.value != null ? { value: e.value, pos: e.value > 0 } : undefined,
      };
    });

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-main">
          <h1 className="page-title">{greeting()}，Alan 👋</h1>
          <div className="page-sub">{fmtDate(t)} {fmtDOW(t)} · 这是你的全景</div>
        </div>
      </div>

      {/* 年度目标 */}
      <Card title="年度目标 · 2026" sub="从日常记录自动归集" style={{ marginBottom: 'var(--gap-card)' }}>
        <div className="stack-tight">
          {data.yearGoals.map((g) => {
            const prog = goalProgress(g);
            const pace = goalPace(g);
            const status = prog >= pace + 5 ? '领先' : prog >= pace - 5 ? '在轨' : '落后';
            const statusTone = prog >= pace + 5 ? 'green' : prog >= pace - 5 ? 'blue' : 'amber';
            return (
              <div key={g.id} className="list-row" style={{ alignItems: 'center', padding: '12px 0' }}>
                <span className="status-dot" style={{ background: AREA_COLOR[g.areaKey] }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row" style={{ marginBottom: 6 }}>
                    <span className="bold" style={{ fontSize: 13.5 }}>{g.title}</span>
                    <span className="muted nowrap" style={{ fontSize: 12 }}>
                      {g.current}{g.unit} / {g.target}{g.unit}
                    </span>
                    <Chip tone={statusTone as 'green' | 'blue' | 'amber'} dot style={{ marginLeft: 'auto' }}>{status}</Chip>
                  </div>
                  <GoalLine percent={prog} now={pace} />
                </div>
              </div>
            );
          })}
          {data.yearGoals.length === 0 && (
            <div className="muted" style={{ padding: 12 }}>还没有年度目标。去对应板块记录，目标会在这里归集。</div>
          )}
        </div>
      </Card>

      <div className="grid grid-2" style={{ marginBottom: 'var(--gap-card)' }}>
        {/* 最近动静 */}
        <Card title="最近动静" sub="跨板块最近发生的事" action={<button className="btn ghost sm" onClick={() => setTab('calendar')}>日历</button>}>
          <Timeline items={recent} empty={<div className="muted" style={{ padding: 12 }}>还没有记录，点击右下角「记录」开始。</div>} />
        </Card>

        {/* 五板块入口 */}
        <Card title="五板块" sub="点进入各板块默认页">
          <div className="grid grid-2" style={{ gap: 'var(--gap-tight)' }}>
            {(data.areas as { key: AreaKey; name: string; emoji: string; color: string; tagline: string }[]).map((a) => {
              const count = data.entries.filter((e) => e.areaKey === a.key).length;
              return (
                <button key={a.key} className="area-tile" onClick={() => setTab(a.key)}>
                  <div className="area-tile-top">
                    <span className="area-tile-emo">{a.emoji}</span>
                    <div>
                      <div className="area-tile-name" style={{ color: a.color }}>{a.name}</div>
                      <div className="area-tile-sub">{a.tagline}</div>
                    </div>
                  </div>
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <span className="chip">{count} 条记录</span>
                    <Icon name="chevron-right" className="icon-sm" style={{ color: a.color }} />
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
