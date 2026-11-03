/** Life Board · 应用壳 */
import { useEffect } from 'react';
import { useUI } from './store';
import { Sidebar } from './components/Sidebar';
import { RecordSheet } from './components/RecordSheet';
import { SearchPalette } from './components/SearchPalette';
import { ToastHost, ConfirmDialog } from './components/Overlays';
import { Overview } from './boards/Overview';
import { CalendarBoard } from './boards/CalendarBoard';
import { WorkBoard } from './boards/Work';
import { KnowledgeBoard } from './boards/Knowledge';
import { HealthBoard } from './boards/Health';
import { FinanceBoard } from './boards/Finance';
import { LifeBoard } from './boards/Life';
import { SettingsBoard } from './boards/Settings';
import type { TabId } from './types';
import clsx from 'clsx';

const PANELS: { id: TabId; render: () => JSX.Element }[] = [
  { id: 'overview', render: () => <Overview /> },
  { id: 'calendar', render: () => <CalendarBoard /> },
  { id: 'work', render: () => <WorkBoard /> },
  { id: 'knowledge', render: () => <KnowledgeBoard /> },
  { id: 'health', render: () => <HealthBoard /> },
  { id: 'finance', render: () => <FinanceBoard /> },
  { id: 'life', render: () => <LifeBoard /> },
  { id: 'settings', render: () => <SettingsBoard /> },
];

export default function App() {
  const ui = useUI();

  // 隐藏金额 → body class
  useEffect(() => {
    document.body.classList.toggle('hide-money', ui.hideMoney);
  }, [ui.hideMoney]);

  // 键盘快捷键
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      const el = document.activeElement;
      const typing = el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || (el as HTMLElement)?.isContentEditable;
      const anyOverlay = ui.recordOpen || ui.searchOpen || !!ui.confirm;

      if (e.key === 'Escape') {
        if (ui.confirm) return; // ConfirmDialog 自己处理
        ui.recordOpen && ui.closeRecord();
        ui.searchOpen && ui.closeSearch();
        return;
      }
      if (meta && e.key.toLowerCase() === 'k') { e.preventDefault(); ui.openSearch(); return; }
      if (meta && e.key.toLowerCase() === 'n') { e.preventDefault(); ui.openRecord(); return; }
      if (meta && e.key.toLowerCase() === 'b') { e.preventDefault(); ui.toggleSidebar(); return; }
      if (meta && e.key === '1') { e.preventDefault(); ui.setTab('overview'); return; }
      if (!typing && !anyOverlay) {
        if (e.key === '/') { e.preventDefault(); ui.openSearch(); return; }
        if (e.key.toLowerCase() === 'n') { e.preventDefault(); ui.openRecord(); return; }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ui]);

  return (
    <div className={clsx('app', ui.sidebarCollapsed && 'sidebar-collapsed')}>
      <Sidebar />

      <main className="content">
        {PANELS.map((p) => (
          <div key={p.id} hidden={ui.tab !== p.id}>
            {p.render()}
          </div>
        ))}
      </main>

      {/* 浮层 */}
      <RecordSheet />
      <SearchPalette />
      <ConfirmDialog />
      <ToastHost />
    </div>
  );
}
