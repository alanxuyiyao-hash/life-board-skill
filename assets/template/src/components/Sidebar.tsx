/** 侧栏导航：品牌 / 搜索 / 总览+日历 / 五板块 / 设置 / 记录 / 头像 */
import { useUI } from '../store';
import { Icon, type IconName } from './Icons';
import type { TabId } from '../types';
import clsx from 'clsx';

interface NavItem {
  id: TabId;
  label: string;
  icon: IconName;
  emoji?: string;
}

const NAV: { section?: string; items: NavItem[] }[] = [
  {
    items: [
      { id: 'overview', label: '总览', icon: 'overview' },
      { id: 'calendar', label: '日历', icon: 'calendar' },
    ],
  },
  {
    section: '板块',
    items: [
      { id: 'work', label: '工作', icon: 'briefcase', emoji: '💼' },
      { id: 'knowledge', label: '知识', icon: 'book', emoji: '📚' },
      { id: 'health', label: '健康', icon: 'activity', emoji: '🌿' },
      { id: 'finance', label: '财务', icon: 'wallet', emoji: '💰' },
      { id: 'life', label: '生活', icon: 'compass', emoji: '🧭' },
    ],
  },
  {
    section: '系统',
    items: [{ id: 'settings', label: '设置', icon: 'settings' }],
  },
];

export function Sidebar() {
  const { tab, setTab, sidebarCollapsed, toggleSidebar, openSearch, openRecord } = useUI();

  function go(id: TabId) {
    setTab(id);
  }

  return (
    <nav className="tabbar" aria-label="主导航">
      <div className="side-brand">
        <div className="side-logo">L</div>
        <div className="side-brand-tw">
          <span className="side-brand-t">Life Board</span>
          <span className="side-brand-sub">人生看板</span>
        </div>
        <button className="side-collapse" onClick={toggleSidebar} aria-label="折叠侧栏" title="折叠 (⌘B)">
          <Icon name={sidebarCollapsed ? 'chevron-right' : 'chevron-left'} className="icon-sm" />
        </button>
      </div>

      <button className="side-search" onClick={openSearch} title="搜索 (⌘K)">
        <Icon name="search" className="icon-sm" />
        <span>搜索…</span>
        <span className="kbd" style={{ marginLeft: 'auto' }}>⌘K</span>
      </button>

      {NAV.map((grp, gi) => (
        <div key={gi}>
          {grp.section && <div className="side-section-label">{grp.section}</div>}
          {grp.items.map((it) => {
            return (
              <button
                key={it.id}
                className={clsx('tab', tab === it.id && 'active')}
                onClick={() => go(it.id)}
                title={it.label}
              >
                {it.emoji ? (
                  <span className="tab-emoji">{it.emoji}</span>
                ) : (
                  <Icon name={it.icon} className="icon-sm" />
                )}
                <span className="tab-label">{it.label}</span>
              </button>
            );
          })}
        </div>
      ))}

      <div className="side-spacer" />

      <button className="side-record-btn" onClick={() => openRecord()}>
        <Icon name="plus" className="icon-sm" />
        <span>记录</span>
        <span className="kbd" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', borderColor: 'transparent' }}>⌘N</span>
      </button>

      <div className="side-foot">
        <div className="side-avatar">A</div>
        <div className="side-brand-tw">
          <span className="side-brand-t" style={{ fontSize: 13 }}>Alan</span>
          <span className="side-brand-sub">个人账户</span>
        </div>
      </div>
    </nav>
  );
}
