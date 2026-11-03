/** 工作 · 本周（默认页） */
import { useData } from '../store';
import { Board, RecordBtn } from './_shared';
import { Card, CheckItem, Timeline, type TimelineItem, Chip, EmptyState } from '../components/ui';
import { thisWeekRange, entriesInRange, sortByDate, fmtDate, AREA_COLOR } from '../lib';
import type { Entry } from '../types';

export function WorkBoard() {
  const data = useData();
  const [ws, we] = thisWeekRange();
  const weekEntries = entriesInRange(data.entries, ws, we);

  // 本周重点（focus，可勾选）
  const focus = weekEntries.filter((e) => e.areaKey === 'work' && e.kind === 'focus');
  // 本周成果
  const outcomes: Entry[] = weekEntries.filter((e) => e.areaKey === 'work' && e.kind === 'outcome');
  // 待跟进（未完成 task，不限本周，按截止日期升序）
  const pending = sortByDate(
    data.entries.filter((e) => e.areaKey === 'work' && e.kind === 'task' && !e.done),
    'asc',
  );

  const outcomeItems: TimelineItem[] = outcomes.map((e) => ({
    id: e.id,
    dotColor: AREA_COLOR.work,
    title: e.text,
    meta: <span>{fmtDate(e.date)}</span>,
    amount: e.value != null ? { value: e.value, pos: true } : undefined,
  }));
  const pendingItems: TimelineItem[] = pending.map((e) => ({
    id: e.id,
    dotColor: 'var(--el-amber)',
    title: e.text,
    meta: <span>{fmtDate(e.date)} 截止</span>,
    trailing: <Chip tone="amber">待跟进</Chip>,
  }));

  const toggle = data.toggleEntryDone;

  return (
    <Board
      areaKey="work"
      title="工作"
      subtitle="个人职业系统 · 本周"
      defaultTabId="week"
      actions={<RecordBtn areaKey="work" />}
      tabs={[
        { id: 'week', label: '本周' },
        { id: 'log', label: '工作记录', coming: true },
        { id: 'projects', label: '项目成果', coming: true },
        { id: 'review', label: '周期复盘', coming: true },
        { id: 'career', label: '职业档案', coming: true },
      ]}
    >
      <div className="grid grid-3">
        <Card title="本周重点" sub={`${focus.filter((f) => f.done).length}/${focus.length} 完成`}>
          {focus.length === 0 ? (
            <EmptyState icon="flag" title="本周还没有重点" hint="主动选定 3–5 件最该关心的事。" />
          ) : (
            <div>
              {focus.map((e) => (
                <CheckItem
                  key={e.id}
                  text={e.text}
                  done={!!e.done}
                  onToggle={() => toggle(e.id)}
                />
              ))}
            </div>
          )}
        </Card>

        <Card title="本周成果" sub="可进入职业档案的实际价值">
          <Timeline
            items={outcomeItems}
            empty={<EmptyState icon="sparkles" title="本周还没有标记成果" hint="从工作记录里提升真正值得保留的结果。" />}
          />
        </Card>

        <Card title="待跟进" sub="未完成事项与对外承诺">
          <Timeline
            items={pendingItems}
            empty={<EmptyState icon="check" title="没有待跟进事项" />}
          />
        </Card>
      </div>

      <div style={{ height: 'var(--gap-card)' }} />

      {/* 最近工作记录 */}
      <Card title="最近工作记录" sub="按日期排列的事实时间线">
        <Timeline
          items={sortByDate(data.entries.filter((e) => e.areaKey === 'work' && (e.kind === 'log' || e.kind === 'outcome')), 'desc')
            .slice(0, 6)
            .map((e) => ({
              id: e.id,
              dotColor: AREA_COLOR.work,
              title: e.text,
              meta: <span>{fmtDate(e.date)}</span>,
            }))}
          empty={<EmptyState icon="briefcase" title="还没有工作记录" hint="一句话即可记录今天做过的工作。" />}
        />
      </Card>
    </Board>
  );
}
