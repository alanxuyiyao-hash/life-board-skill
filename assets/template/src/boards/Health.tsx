/** 健康 · 当前状态（默认页） */
import { useData } from '../store';
import { Board, RecordBtn } from './_shared';
import { Card, KpiCard, Timeline, ProgressBar, type TimelineItem, EmptyState, Chip } from '../components/ui';
import { Sparkline } from '../components/ui';
import {
  latestReading, readingSeries, workoutsThisWeek, sortByDate,
  fmtDate, relativeDay, AREA_COLOR,
} from '../lib';

export function HealthBoard() {
  const data = useData();
  const weight = latestReading(data.readings, 'weight');
  const bodyfat = latestReading(data.readings, 'bodyfat');
  const weightSeries = readingSeries(data.readings, 'weight').map((r) => r.value);
  const bodyfatSeries = readingSeries(data.readings, 'bodyfat').map((r) => r.value);
  const prevWeight = readingSeries(data.readings, 'weight').slice(-2, -1)[0]?.value;

  const wk = workoutsThisWeek(data.workouts);
  const runKm = wk.filter((w) => w.type === '跑步').reduce((s, w) => s + (w.distance || 0), 0);
  const runGoal = 10; // 每周跑步 10km 目标
  const strengthCount = wk.filter((w) => w.type === '力量训练').length;

  const workoutItems: TimelineItem[] = sortByDate(wk, 'desc').map((w) => ({
    id: w.id,
    dotColor: AREA_COLOR.health,
    title: `${w.type}${w.distance ? ` ${w.distance} km` : ''}${w.duration ? ` · ${w.duration} 分` : ''}`,
    meta: <span>{fmtDate(w.date)} {w.note}</span>,
  }));

  // 待处理：体重读数超过 7 天、体检等待等（简化：读数超过 7 天提示）
  const needsLook: TimelineItem[] = [];
  if (weight) {
    const days = Math.round((new Date().getTime() - new Date(weight.date).getTime()) / 86400000);
    if (days >= 7) needsLook.push({ id: 'nl-w', dotColor: 'var(--el-amber)', title: '体重读数到期', meta: <span>{days} 天未记录</span>, trailing: <Chip tone="amber">待记录</Chip> });
  }
  // 固定示例：年度体检（来自 plans 的健康相关）
  data.plans.filter((p) => p.text.includes('体检')).slice(0, 1).forEach((p) => {
    needsLook.push({ id: p.id, dotColor: 'var(--el-amber)', title: p.text, meta: <span>已约 {relativeDay(p.date)}</span> });
  });

  return (
    <Board
      areaKey="health"
      title="健康"
      subtitle="个人健康管理系统 · 当前状态"
      defaultTabId="now"
      actions={<RecordBtn areaKey="health" />}
      tabs={[
        { id: 'now', label: '当前状态' },
        { id: 'training', label: '运动训练', coming: true },
        { id: 'metrics', label: '身体指标', coming: true },
        { id: 'events', label: '健康记录', coming: true },
        { id: 'profile', label: '健康档案', coming: true },
        { id: 'review', label: '健康复盘', coming: true },
      ]}
    >
      <div className="grid grid-3">
        <KpiCard
          hero
          tone="green"
          label="体重"
          value={weight ? weight.value.toFixed(1) : '—'}
          unit="kg"
          delta={prevWeight && weight ? `${(weight.value - prevWeight).toFixed(1)} kg` : undefined}
          deltaDir={prevWeight && weight ? (weight.value < prevWeight ? 'down' : 'up') : 'flat'}
          meta={<span>最新 {fmtDate(weight?.date || '2026-08-09')}</span>}
        />
        <KpiCard
          tone="green"
          label="体脂率"
          value={bodyfat ? bodyfat.value.toFixed(1) : '—'}
          unit="%"
          meta={<span>最新 {fmtDate(bodyfat?.date || '2026-08-09')}</span>}
        />
        <div className="card">
          <div className="kpi-label">本周跑步节奏</div>
          <div className="kpi-value" style={{ fontSize: 22 }}>
            {runKm.toFixed(1)}<span className="kpi-unit"> / {runGoal} km</span>
          </div>
          <div style={{ marginTop: 10 }}>
            <ProgressBar percent={(runKm / runGoal) * 100} tone="green" />
          </div>
          <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>本周力量训练 {strengthCount} 次</div>
        </div>
      </div>

      <div style={{ height: 'var(--gap-card)' }} />

      <div className="grid grid-2">
        <Card title="主要趋势" sub="体重近 8 次读数">
          <div className="row" style={{ justifyContent: 'center', padding: '8px 0' }}>
            <Sparkline data={weightSeries} width={420} height={64} color="var(--el-green)" />
          </div>
          <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>体脂趋势 {bodyfatSeries.length >= 2 ? `${bodyfatSeries[0]}% → ${bodyfatSeries[bodyfatSeries.length - 1]}%` : '—'}</div>
        </Card>

        <Card title="本周运动节奏" sub={`本周 ${wk.length} 次运动`}>
          <Timeline items={workoutItems} empty={<EmptyState icon="activity" title="本周还没有运动" hint="记录一次运动开始你的节奏。" />} />
        </Card>
      </div>

      <div style={{ height: 'var(--gap-card)' }} />

      <Card title="需要处理" sub="待记录与待复查">
        <Timeline
          items={needsLook}
          empty={<EmptyState icon="check" title="暂无待处理事项" />}
        />
      </Card>
    </Board>
  );
}
