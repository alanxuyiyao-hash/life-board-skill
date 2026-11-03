/** 设置：模板开关 / 偏好（隐藏金额）/ 本地数据（导出/导入/清空/重置示例） */
import { useRef } from 'react';
import { useData, useUI, type TemplateState } from '../store';
import { Card } from '../components/ui';
import { Icon } from '../components/Icons';
import type { AppData } from '../types';

const TEMPLATE_GROUPS: { group: string; items: { key: keyof TemplateState; name: string; desc: string }[] }[] = [
  {
    group: '工作',
    items: [
      { key: 'work_orders', name: '商单管理', desc: '客户、报价、阶段、应收关联' },
      { key: 'work_content', name: '内容创作', desc: '选题、排期、发布与内容指标' },
    ],
  },
  {
    group: '知识',
    items: [
      { key: 'knowledge_exam', name: '考证备考', desc: '考试日期、科目、模考' },
      { key: 'knowledge_language', name: '语言学习', desc: '词汇、听说读写、考试目标' },
    ],
  },
  {
    group: '健康',
    items: [
      { key: 'health_running', name: '跑步训练', desc: '配速、分段、跑量计划' },
      { key: 'health_strength', name: '力量训练', desc: '动作、组数、次数、重量' },
      { key: 'health_diet', name: '饮食管理', desc: '饮食记录、饮水、计划' },
    ],
  },
  {
    group: '财务',
    items: [
      { key: 'finance_business', name: '经营财务', desc: '商单回款、项目成本、税务' },
      { key: 'finance_holdings', name: '详细持仓', desc: '证券、数量、成本价' },
    ],
  },
  {
    group: '生活',
    items: [
      { key: 'life_family', name: '家庭事务', desc: '家务、维修、家庭计划' },
      { key: 'life_pets', name: '宠物', desc: '健康、护理、日常' },
    ],
  },
];

export function SettingsBoard() {
  const ui = useUI();
  const data = useData();
  const fileRef = useRef<HTMLInputElement>(null);

  function doExport() {
    const snapshot: AppData = {
      version: data.version,
      areas: data.areas,
      entries: data.entries,
      projects: data.projects,
      resources: data.resources,
      metrics: data.metrics,
      readings: data.readings,
      workouts: data.workouts,
      txs: data.txs,
      netWorth: data.netWorth,
      wishes: data.wishes,
      experiences: data.experiences,
      plans: data.plans,
      yearGoals: data.yearGoals,
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `life-board-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    ui.toast('已导出 JSON 备份');
  }

  function doImport(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        data.importData(parsed);
        ui.toast('导入成功');
      } catch {
        ui.toast('导入失败：文件格式不正确');
      }
    };
    reader.readAsText(file);
  }

  function askClear() {
    ui.askConfirm({
      title: '清空全部数据？',
      text: '将删除所有记录、项目、流水等，仅保留板块定义。此操作不可撤销，建议先导出备份。',
      confirmText: '清空',
      danger: true,
      onConfirm: () => { data.clearData(); ui.toast('已清空全部数据'); },
    });
  }

  function askReseed() {
    ui.askConfirm({
      title: '载入示例数据？',
      text: '会用内置示例数据覆盖当前数据（用于演示/体验）。',
      confirmText: '载入示例',
      onConfirm: () => { data.reseed(); ui.toast('已载入示例数据'); },
    });
  }

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-main">
          <h1 className="page-title"><Icon name="settings" className="icon-lg" /> 设置</h1>
          <div className="page-sub">模板 · 偏好 · 本地数据</div>
        </div>
      </div>

      <div className="grid grid-2">
        {/* 模板 */}
        <Card title="板块模板" sub="关闭只隐藏专属入口与字段，不删除历史数据">
          {TEMPLATE_GROUPS.map((g) => (
            <div key={g.group}>
              <div className="side-section-label" style={{ paddingLeft: 0 }}>{g.group}</div>
              {g.items.map((it) => (
                <div key={it.key} className="setting-row">
                  <div className="setting-main">
                    <div className="setting-title">{it.name}</div>
                    <div className="setting-desc">{it.desc}</div>
                  </div>
                  <label className="switch">
                    <input type="checkbox" checked={ui.templates[it.key]} onChange={() => ui.toggleTemplate(it.key)} />
                    <span className="track" />
                    <span className="thumb" />
                  </label>
                </div>
              ))}
            </div>
          ))}
        </Card>

        <div className="stack">
          {/* 偏好 */}
          <Card title="偏好">
            <div className="setting-row">
              <div className="setting-main">
                <div className="setting-title">隐藏金额</div>
                <div className="setting-desc">财务页金额以 ¥••• 显示，保留正负方向</div>
              </div>
              <label className="switch">
                <input type="checkbox" checked={ui.hideMoney} onChange={(e) => ui.setHideMoney(e.target.checked)} />
                <span className="track" />
                <span className="thumb" />
              </label>
            </div>
            <div className="setting-row">
              <div className="setting-main">
                <div className="setting-title">基础货币</div>
                <div className="setting-desc">多币种模板未启用，默认 CNY</div>
              </div>
              <span className="chip">CNY ¥</span>
            </div>
          </Card>

          {/* 本地数据 */}
          <Card title="本地数据" sub="数据仅存在本机 localStorage，无云同步">
            <div className="setting-row">
              <div className="setting-main">
                <div className="setting-title">导出 JSON 备份</div>
                <div className="setting-desc">下载全部数据为 JSON 文件</div>
              </div>
              <button className="btn" onClick={doExport}><Icon name="download" className="icon-sm" /> 导出</button>
            </div>
            <div className="setting-row">
              <div className="setting-main">
                <div className="setting-title">导入 JSON</div>
                <div className="setting-desc">从备份文件恢复（覆盖当前数据）</div>
              </div>
              <button className="btn" onClick={() => fileRef.current?.click()}><Icon name="upload" className="icon-sm" /> 导入</button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                style={{ display: 'none' }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) doImport(f); e.target.value = ''; }}
              />
            </div>
            <div className="setting-row">
              <div className="setting-main">
                <div className="setting-title">载入示例数据</div>
                <div className="setting-desc">用内置演示数据覆盖当前数据</div>
              </div>
              <button className="btn" onClick={askReseed}><Icon name="sparkles" className="icon-sm" /> 载入</button>
            </div>
          </Card>

          {/* 危险区 */}
          <Card title="危险区">
            <div className="setting-row">
              <div className="setting-main">
                <div className="setting-title">清空全部数据</div>
                <div className="setting-desc">删除所有记录，仅保留板块定义。不可撤销。</div>
              </div>
              <button className="btn danger" onClick={askClear}><Icon name="trash" className="icon-sm" /> 清空</button>
            </div>
          </Card>
        </div>
      </div>

      <div className="muted" style={{ textAlign: 'center', marginTop: 24, fontSize: 12 }}>
        Life Board · 五板块广度 MVP · 本地优先 · 数据由 Zustand 持久化到 localStorage
      </div>
    </div>
  );
}
