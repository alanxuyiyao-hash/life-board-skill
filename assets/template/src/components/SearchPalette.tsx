/** 通用搜索面板 ⌘K：跨板块记录/项目/资源/愿望/流水/计划/体验 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useData, useUI } from '../store';
import { Icon } from './Icons';
import type { AreaKey } from '../types';

interface Hit {
  id: string;
  emo: string;
  text: string;
  group: string;
  areaKey: AreaKey;
}

export function SearchPalette() {
  const { searchOpen, closeSearch, setTab, toast } = useUI();
  const data = useData();
  const [q, setQ] = useState('');
  const [focusIdx, setFocusIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      setQ('');
      setFocusIdx(0);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [searchOpen]);

  const index = useMemo<Hit[]>(() => {
    const hits: Hit[] = [];
    for (const e of data.entries) {
      const area = data.areas.find((a) => a.key === e.areaKey);
      hits.push({ id: 'e-' + e.id, emo: area?.emoji || '·', text: e.text, group: '记录', areaKey: e.areaKey });
    }
    for (const p of data.projects) hits.push({ id: 'p-' + p.id, emo: '🗂️', text: p.name, group: '项目', areaKey: 'work' });
    for (const r of data.resources) hits.push({ id: 'r-' + r.id, emo: r.type === 'book' ? '📕' : '🎓', text: r.title, group: '资源', areaKey: 'knowledge' });
    for (const w of data.wishes) hits.push({ id: 'w-' + w.id, emo: '🌠', text: w.text, group: '愿望', areaKey: 'life' });
    for (const t of data.txs) hits.push({ id: 't-' + t.id, emo: '💰', text: `${t.category} · ¥${t.amount}`, group: '流水', areaKey: 'finance' });
    for (const pl of data.plans) hits.push({ id: 'pl-' + pl.id, emo: '📅', text: pl.text, group: '计划', areaKey: 'life' });
    for (const x of data.experiences) hits.push({ id: 'x-' + x.id, emo: '✨', text: x.text, group: '体验', areaKey: 'life' });
    return hits;
  }, [data.entries, data.projects, data.resources, data.wishes, data.txs, data.plans, data.experiences, data.areas]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return index.slice(0, 8);
    return index.filter((h) => h.text.toLowerCase().includes(term)).slice(0, 40);
  }, [q, index]);

  // 按组归类
  const grouped = useMemo(() => {
    const map = new Map<string, Hit[]>();
    for (const h of results) {
      if (!map.has(h.group)) map.set(h.group, []);
      map.get(h.group)!.push(h);
    }
    return Array.from(map.entries());
  }, [results]);

  useEffect(() => { setFocusIdx(0); }, [q]);

  function openHit(h: Hit) {
    setTab(h.areaKey);
    closeSearch();
    toast(`已跳转 · ${h.text.slice(0, 16)}`);
  }

  if (!searchOpen) return null;

  const flat = results;

  return (
    <div className="overlay open" onClick={(e) => e.target === e.currentTarget && closeSearch()}>
      <div className="search-panel" role="dialog" aria-modal="true" aria-label="搜索">
        <div className="search-input-wrap">
          <Icon name="search" className="icon" />
          <input
            ref={inputRef}
            className="search-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索记录、项目、资源、流水、愿望…"
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setFocusIdx((i) => Math.min(i + 1, flat.length - 1)); }
              else if (e.key === 'ArrowUp') { e.preventDefault(); setFocusIdx((i) => Math.max(i - 1, 0)); }
              else if (e.key === 'Enter' && flat[focusIdx]) { openHit(flat[focusIdx]); }
              else if (e.key === 'Escape') { closeSearch(); }
            }}
          />
          <span className="kbd">ESC</span>
        </div>
        <div className="search-results">
          {flat.length === 0 && (
            <div style={{ padding: 28, textAlign: 'center', color: 'var(--el-muted)', fontSize: 13 }}>
              没有匹配的内容
            </div>
          )}
          {grouped.map(([group, items]) => (
            <div key={group}>
              <div className="search-group-label">{group}</div>
              {items.map((h) => {
                const idx = flat.indexOf(h);
                return (
                  <div
                    key={h.id}
                    className={'search-item' + (idx === focusIdx ? ' focus' : '')}
                    onClick={() => openHit(h)}
                    onMouseEnter={() => setFocusIdx(idx)}
                  >
                    <span className="emo">{h.emo}</span>
                    <span className="txt">{h.text}</span>
                    <span className="grp">{group}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
