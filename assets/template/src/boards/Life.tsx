/** 生活 · 近期（默认页） */
import { useData } from '../store';
import { Board, RecordBtn } from './_shared';
import { Card, Timeline, type TimelineItem, CheckItem, Chip, EmptyState } from '../components/ui';
import { sortByDate, addDays, today, relativeDay, fmtDate, AREA_COLOR } from '../lib';

export function LifeBoard() {
  const data = useData();
  const t = today();
  const horizon = addDays(t, 30);

  // 未来 30 天计划
  const upcoming = sortByDate(
    data.plans.filter((p) => p.date >= t && p.date <= horizon),
    'asc',
  );
  const upcomingItems: TimelineItem[] = upcoming.map((p) => ({
    id: p.id,
    dotColor: AREA_COLOR.life,
    title: p.text,
    meta: (
      <>
        <Chip>{p.type || '计划'}</Chip>
        <span>· {relativeDay(p.date)}（{fmtDate(p.date)}）{p.person ? ' · ' + p.person : ''}</span>
      </>
    ),
    trailing: <button className="btn ghost sm" onClick={() => data.deletePlan(p.id)} aria-label="删除"><span style={{ fontSize: 14 }}>×</span></button>,
  }));

  // 本月想做（愿望选入近期）
  const soonWishes = data.wishes.filter((w) => w.status === 'soon');
  const ideaWishes = data.wishes.filter((w) => w.status === 'idea').slice(0, 4);

  // 最近体验
  const expItems: TimelineItem[] = sortByDate(data.experiences, 'desc').slice(0, 5).map((x) => ({
    id: x.id,
    dotColor: AREA_COLOR.life,
    title: x.text,
    meta: (
      <>
        <Chip>{x.type}</Chip>
        <span>· {fmtDate(x.date)}{x.rating ? ' · ' + '★'.repeat(x.rating) : ''}</span>
      </>
    ),
  }));

  return (
    <Board
      areaKey="life"
      title="生活"
      subtitle="个人体验与关系系统 · 近期"
      defaultTabId="soon"
      actions={<RecordBtn areaKey="life" />}
      tabs={[
        { id: 'soon', label: '近期' },
        { id: 'wishes', label: '想做的事', coming: true },
        { id: 'trips', label: '旅行', coming: true },
        { id: 'experiences', label: '体验', coming: true },
        { id: 'people', label: '人际', coming: true },
        { id: 'review', label: '生活回顾', coming: true },
      ]}
    >
      <div className="grid grid-3">
        <Card title="未来 30 天" sub="已经确定的安排">
          <Timeline
            items={upcomingItems}
            empty={<EmptyState icon="calendar" title="未来 30 天没有安排" hint="添加一个计划或旅行。" />}
          />
        </Card>

        <Card title="本月想主动发生" sub="从愿望里选入近期">
          {soonWishes.length === 0 && ideaWishes.length === 0 ? (
            <EmptyState icon="sparkles" title="还没有愿望" hint="记一件你想做的事，不必给截止日期。" />
          ) : (
            <div>
              {soonWishes.map((w) => (
                <CheckItem
                  key={w.id}
                  text={w.text}
                  meta={<span>已选入近期 · {w.type}</span>}
                  done={false}
                  onToggle={() => data.setWishStatus(w.id, 'planned')}
                />
              ))}
              {ideaWishes.map((w) => (
                <div key={w.id} className="check-item">
                  <button className="check-box" aria-label="选入近期" onClick={() => data.setWishStatus(w.id, 'soon')} />
                  <div style={{ flex: 1 }}>
                    <div className="check-text">{w.text}</div>
                    <div className="check-meta">{w.type} · 点击选入近期</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="最近体验" sub="看过、去过、经历过">
          <Timeline items={expItems} empty={<EmptyState icon="compass" title="还没有体验记录" hint="一句话记下最近的一次体验。" />} />
        </Card>
      </div>
    </Board>
  );
}
