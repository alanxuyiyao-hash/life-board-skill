/** 知识 · 学习中（默认页） */
import { useData } from '../store';
import { Board, RecordBtn } from './_shared';
import { Card, CheckItem, Timeline, ProgressBar, type TimelineItem, Chip, EmptyState } from '../components/ui';
import { Icon } from '../components/Icons';
import { thisWeekRange, entriesInRange, sortByDate, fmtDate, pct, AREA_COLOR } from '../lib';

export function KnowledgeBoard() {
  const data = useData();
  const [ws, we] = thisWeekRange();
  const weekEntries = entriesInRange(data.entries, ws, we);

  const current = data.resources.filter((r) => r.status === 'reading');
  const focus = weekEntries.filter((e) => e.areaKey === 'knowledge' && e.kind === 'focus');
  const logs: TimelineItem[] = sortByDate(
    data.entries.filter((e) => e.areaKey === 'knowledge' && e.kind === 'log'),
    'desc',
  )
    .slice(0, 5)
    .map((e) => ({
      id: e.id,
      dotColor: AREA_COLOR.knowledge,
      title: e.text,
      meta: <span>{fmtDate(e.date)}</span>,
    }));

  return (
    <Board
      areaKey="knowledge"
      title="知识"
      subtitle="个人学习系统 · 学习中"
      defaultTabId="now"
      actions={<RecordBtn areaKey="knowledge" />}
      tabs={[
        { id: 'now', label: '学习中' },
        { id: 'log', label: '学习记录', coming: true },
        { id: 'books', label: '书籍', coming: true },
        { id: 'courses', label: '课程与技能', coming: true },
        { id: 'notes', label: '笔记与洞察', coming: true },
        { id: 'review', label: '学习复盘', coming: true },
      ]}
    >
      <div className="grid grid-2">
        <Card title="当前学习" sub="正在阅读的书籍与进行中的课程">
          {current.length === 0 ? (
            <EmptyState icon="book" title="没有进行中的学习" hint="添加一本书或一门课程开始。" />
          ) : (
            <div className="stack-tight">
              {current.map((r) => {
                const percent = r.total ? pct(r.current || 0, r.total) : 0;
                return (
                  <div key={r.id} className="card tight" style={{ background: 'var(--el-bg)', borderColor: 'var(--el-line)' }}>
                    <div className="row" style={{ marginBottom: 8 }}>
                      <Icon name={r.type === 'book' ? 'book' : 'graduation'} className="icon-sm" style={{ color: AREA_COLOR.knowledge }} />
                      <span className="bold" style={{ flex: 1 }}>{r.title}</span>
                      {r.author && <span className="muted" style={{ fontSize: 12 }}>{r.author}</span>}
                    </div>
                    <div className="row" style={{ marginBottom: 6 }}>
                      <span className="muted" style={{ fontSize: 12 }}>
                        {r.total ? `${r.current} / ${r.total} ${r.type === 'book' ? '页' : '节'}` : `当前位置 ${r.current || 0}`}
                      </span>
                      {r.total && <Chip tone="blue" style={{ marginLeft: 'auto' }}>{Math.round(percent)}%</Chip>}
                    </div>
                    {r.total && <ProgressBar percent={percent} tone="blue" />}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <div className="stack">
          <Card title="本周学习计划" sub={`${focus.filter((f) => f.done).length}/${focus.length} 完成`}>
            {focus.length === 0 ? (
              <EmptyState icon="flag" title="本周还没有学习计划" />
            ) : (
              <div>
                {focus.map((e) => (
                  <CheckItem key={e.id} text={e.text} done={!!e.done} onToggle={() => data.toggleEntryDone(e.id)} />
                ))}
              </div>
            )}
          </Card>

          <Card title="最近学习记录">
            <Timeline items={logs} empty={<EmptyState icon="book" title="还没有学习记录" hint="一句话记录今天学了什么。" />} />
          </Card>
        </div>
      </div>
    </Board>
  );
}
