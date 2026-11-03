/** 板块共享：Board 壳（PageHead + SubTabs + 默认页/「即将上线」占位） */
import { useState, type ReactNode } from 'react';
import { PageHead, SubTabs, type SubTab, EmptyState } from '../components/ui';
import { useUI } from '../store';
import { AREA_COLOR } from '../lib';
import type { AreaKey } from '../types';
import { useData } from '../store';

export function Board({
  areaKey,
  title,
  subtitle,
  tabs,
  defaultTabId,
  actions,
  children,
}: {
  areaKey: AreaKey;
  title: string;
  subtitle?: ReactNode;
  tabs: SubTab[];
  defaultTabId: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { toast } = useUI();
  const areas = useData((s) => s.areas);
  const area = areas.find((a) => a.key === areaKey)!;
  const [active, setActive] = useState(defaultTabId);

  function onChange(id: string) {
    const tab = tabs.find((t) => t.id === id);
    if (tab?.coming) {
      toast(`「${tab.label}」即将上线`);
      return;
    }
    setActive(id);
  }

  return (
    <div className="page">
      <PageHead
        areaKey={areaKey}
        areaColor={AREA_COLOR[areaKey]}
        title={
          <span>
            <span style={{ marginRight: 8 }}>{area.emoji}</span>
            {title}
          </span>
        }
        subtitle={subtitle}
        actions={actions}
      />
      <SubTabs tabs={tabs} active={active} onChange={onChange} />
      {active === defaultTabId ? children : <ComingSoon />}
    </div>
  );
}

export function ComingSoon({ hint = '本轮 MVP 暂未开放，已规划在后续版本。' }: { hint?: string }) {
  return (
    <EmptyState
      icon="sparkles"
      title="即将上线"
      hint={hint}
      action={null}
    />
  );
}

/** 板块通用「记录」按钮 */
export function RecordBtn({ areaKey }: { areaKey: AreaKey }) {
  const { openRecord } = useUI();
  return (
    <button className="btn primary" onClick={() => openRecord(areaKey)}>＋ 记录</button>
  );
}
