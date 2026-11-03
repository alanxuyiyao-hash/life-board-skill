/** 财务 · 本月（默认页） */
import { useData } from '../store';
import { Board, RecordBtn } from './_shared';
import { Card, KpiCard, Money, Timeline, type TimelineItem, Chip, EmptyState } from '../components/ui';
import { Sparkline } from '../components/ui';
import { monthSummary, txsInMonth, sortByDate, fmtDate, fmtMonthShort } from '../lib';

export function FinanceBoard() {
  const data = useData();
  const ms = monthSummary(data.txs);
  const monthTxs = sortByDate(txsInMonth(data.txs), 'desc').filter((t) => t.type !== 'transfer');

  const flowItems: TimelineItem[] = monthTxs.slice(0, 7).map((t) => ({
    id: t.id,
    dotColor: t.type === 'income' ? 'var(--el-green)' : t.type === 'refund' ? 'var(--el-blue)' : 'var(--el-rose)',
    title: `${t.category}${t.note ? ' · ' + t.note : ''}`,
    meta: (
      <>
        <Chip>{t.type === 'income' ? '收入' : t.type === 'refund' ? '退款' : '支出'}</Chip>
        <span>· {fmtDate(t.date)}{t.account ? ' · ' + t.account : ''}</span>
      </>
    ),
    amount: { value: t.type === 'income' ? t.amount : -t.amount, pos: t.type === 'income' },
  }));

  // 净资产趋势
  const nwSeries = [...data.netWorth].sort((a, b) => a.date.localeCompare(b.date)).map((n) => n.value);
  const latestNW = nwSeries[nwSeries.length - 1];
  const prevNW = nwSeries[nwSeries.length - 2];
  const nwDelta = latestNW != null && prevNW != null ? latestNW - prevNW : undefined;
  const latestNWDate = data.netWorth.length ? sortByDate(data.netWorth, 'desc')[0].date : '—';

  return (
    <Board
      areaKey="finance"
      title="财务"
      subtitle="个人财务管理系统 · 本月"
      defaultTabId="month"
      actions={<RecordBtn areaKey="finance" />}
      tabs={[
        { id: 'month', label: '本月' },
        { id: 'flow', label: '收支流水', coming: true },
        { id: 'assets', label: '资产负债', coming: true },
        { id: 'invest', label: '投资理财', coming: true },
        { id: 'budget', label: '预算计划', coming: true },
        { id: 'review', label: '财务复盘', coming: true },
      ]}
    >
      <div className="grid grid-3">
        <KpiCard hero tone="green" label="本月实际收入" value={<Money value={ms.income} />} delta={<Money value={ms.income} />} deltaDir="up" meta={<span>按到账日期</span>} />
        <KpiCard tone="rose" label="本月实际支出" value={<Money value={ms.expense} />} delta={<Money value={ms.expense} />} deltaDir="down" meta={<span>不含账户间转账</span>} />
        <KpiCard tone="accent" label="本月结余" value={<Money value={ms.balance} />} delta={`${ms.savingRate.toFixed(0)}% 储蓄率`} deltaDir={ms.balance >= 0 ? 'up' : 'down'} meta={<span>收入 − 支出</span>} />
      </div>

      <div style={{ height: 'var(--gap-card)' }} />

      <div className="grid grid-2">
        <Card title="净资产状态" sub={`最近一次：${fmtDate(latestNWDate)}`}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
            <div>
              <div className="kpi-value"><Money value={latestNW || 0} /></div>
              {nwDelta != null && (
                <div className={'delta ' + (nwDelta >= 0 ? 'up' : 'down')} style={{ marginTop: 4 }}>
                  比 {fmtMonthShort(data.netWorth.length >= 2 ? sortByDate(data.netWorth, 'desc')[1].date : latestNWDate)}{' '}
                  {nwDelta >= 0 ? '+' : ''}<Money value={nwDelta} />
                </div>
              )}
            </div>
            <Sparkline data={nwSeries} width={240} height={56} color="var(--el-lime-deep)" />
          </div>
          <div className="muted" style={{ fontSize: 12 }}>净资产 = 资产合计 − 负债合计；余额按时间点快照保存</div>
        </Card>

        <Card title="最近流水" sub={`本月 ${monthTxs.length} 笔（已排除转账）`}>
          <Timeline items={flowItems} empty={<EmptyState icon="wallet" title="本月还没有流水" hint="记一笔收入或支出开始。" />} />
        </Card>
      </div>
    </Board>
  );
}
