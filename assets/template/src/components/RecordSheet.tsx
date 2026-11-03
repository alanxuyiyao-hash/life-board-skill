/** 通用「记录」浮层：按板块+类型录入，落 Entry（+ 财务/健康专属实体） */
import { useEffect, useRef, useState } from 'react';
import { useData, useUI } from '../store';
import { today } from '../lib';
import type { AreaKey } from '../types';
import { Icon } from './Icons';
import clsx from 'clsx';

interface TypeOpt {
  kind: 'log' | 'task' | 'focus' | 'outcome' | 'note' | 'workout' | 'reading' | 'transaction' | 'event' | 'plan' | 'wish';
  label: string;
  emo: string;
  txType?: 'income' | 'expense' | 'transfer';
  valueType?: 'money' | 'reading' | 'workout';
  needsDate?: boolean;
}

const AREA_TYPES: Record<AreaKey, TypeOpt[]> = {
  work: [
    { kind: 'log', label: '工作记录', emo: '📝' },
    { kind: 'task', label: '待办', emo: '☑️' },
    { kind: 'focus', label: '本周重点', emo: '🎯' },
    { kind: 'outcome', label: '成果', emo: '🏆' },
  ],
  knowledge: [
    { kind: 'log', label: '学习记录', emo: '📖' },
    { kind: 'note', label: '笔记', emo: '✍️' },
  ],
  health: [
    { kind: 'workout', label: '运动', emo: '🏃', valueType: 'workout' },
    { kind: 'reading', label: '身体读数', emo: '📏', valueType: 'reading' },
    { kind: 'log', label: '健康事件', emo: '🩺' },
  ],
  finance: [
    { kind: 'transaction', label: '支出', emo: '➖', txType: 'expense', valueType: 'money' },
    { kind: 'transaction', label: '收入', emo: '➕', txType: 'income', valueType: 'money' },
    { kind: 'transaction', label: '转账', emo: '🔁', txType: 'transfer', valueType: 'money' },
  ],
  life: [
    { kind: 'event', label: '体验记录', emo: '✨' },
    { kind: 'plan', label: '近期计划', emo: '📅', needsDate: true },
    { kind: 'wish', label: '想做的事', emo: '🌠' },
  ],
};

const AREA_LABEL: Record<AreaKey, { name: string; emo: string }> = {
  work: { name: '工作', emo: '💼' },
  knowledge: { name: '知识', emo: '📚' },
  health: { name: '健康', emo: '🌿' },
  finance: { name: '财务', emo: '💰' },
  life: { name: '生活', emo: '🧭' },
};

export function RecordSheet() {
  const { recordOpen, recordDefaultArea, closeRecord } = useUI();
  const data = useData();
  const { toast } = useUI();

  const [area, setArea] = useState<AreaKey>('work');
  const [opt, setOpt] = useState<TypeOpt>(AREA_TYPES.work[0]);
  const [text, setText] = useState('');
  const [date, setDate] = useState(today());
  const [note, setNote] = useState('');
  // 财务
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [account, setAccount] = useState('');
  // 健康
  const [metricId, setMetricId] = useState('weight');
  const [value, setValue] = useState('');
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [workoutType, setWorkoutType] = useState('跑步');

  const mainInputRef = useRef<HTMLInputElement>(null);

  // 打开时重置
  useEffect(() => {
    if (recordOpen) {
      const a = recordDefaultArea || 'work';
      setArea(a);
      setOpt(AREA_TYPES[a][0]);
      setText('');
      setDate(today());
      setNote('');
      setAmount('');
      setCategory('');
      setAccount('');
      setMetricId('weight');
      setValue('');
      setDistance('');
      setDuration('');
      setWorkoutType('跑步');
      setTimeout(() => mainInputRef.current?.focus(), 60);
    }
  }, [recordOpen, recordDefaultArea]);

  // 切换板块
  function pickArea(a: AreaKey) {
    setArea(a);
    setOpt(AREA_TYPES[a][0]);
  }

  function onSave(close: boolean) {
    const trimmed = text.trim();
    if (!trimmed) {
      mainInputRef.current?.focus();
      return;
    }
    if (opt.valueType === 'money' && !amount) {
      toast('请填写金额');
      return;
    }
    if (opt.valueType === 'reading' && !value) {
      toast('请填写读数');
      return;
    }

    // 落库
    if (opt.kind === 'transaction' && opt.txType) {
      const amt = parseFloat(amount) || 0;
      data.addTx({ type: opt.txType, amount: amt, category: category || '其他', account: account || undefined, date, note: note || undefined });
      // 入账金额方向：支出/转账展示负，收入展示正
      const signed = opt.txType === 'income' ? amt : -amt;
      data.addEntry({ areaKey: 'finance', kind: 'transaction', text: trimmed, value: signed, unit: '元', date, note });
    } else if (opt.kind === 'reading') {
      const v = parseFloat(value) || 0;
      data.addReading(metricId, v, date);
      const m = data.metrics.find((x) => x.id === metricId);
      data.addEntry({ areaKey: 'health', kind: 'reading', text: trimmed, value: v, unit: m?.unit || '', date, note });
    } else if (opt.kind === 'workout') {
      const dist = distance ? parseFloat(distance) : undefined;
      const dur = duration ? parseInt(duration, 10) : undefined;
      data.addWorkout({ type: workoutType, distance: dist, duration: dur, date, note });
      data.addEntry({ areaKey: 'health', kind: 'workout', text: trimmed, value: dist, unit: dist ? 'km' : undefined, date, note });
    } else if (opt.kind === 'plan') {
      data.addPlan({ text: trimmed, date, type: '计划' });
      data.addEntry({ areaKey: 'life', kind: 'event', text: trimmed, date, note });
    } else if (opt.kind === 'wish') {
      data.addWish(trimmed, 'idea');
    } else {
      data.addEntry({ areaKey: area, kind: opt.kind, text: trimmed, date, note });
    }

    toast('已记录 · ' + trimmed.slice(0, 16));
    if (close) {
      closeRecord();
    } else {
      // 继续记录：仅清空主文本与数值
      setText('');
      setNote('');
      setAmount('');
      setValue('');
      setDistance('');
      setDuration('');
      setTimeout(() => mainInputRef.current?.focus(), 30);
    }
  }

  if (!recordOpen) return null;

  const mainLabel = opt.kind === 'transaction'
    ? (opt.txType === 'income' ? '收入说明' : opt.txType === 'transfer' ? '转账说明' : '支出说明')
    : opt.kind === 'plan' ? '计划内容'
    : opt.kind === 'wish' ? '想做什么'
    : opt.kind === 'workout' ? '一句话（如 晨跑 5 km）'
    : '一句话';

  return (
    <div className="overlay open" onClick={(e) => e.target === e.currentTarget && closeRecord()}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label="记录">
        <div className="sheet-head">
          <Icon name="plus" className="icon" />
          <div className="sheet-title">记录</div>
          <button className="btn ghost sm" style={{ marginLeft: 'auto' }} onClick={closeRecord} aria-label="关闭">
            <Icon name="x" className="icon-sm" />
          </button>
        </div>

        <div className="sheet-body">
          {/* 板块选择 */}
          <div className="field">
            <label className="field-label">板块</label>
            <div className="type-pick">
              {(Object.keys(AREA_TYPES) as AreaKey[]).map((a) => (
                <button
                  key={a}
                  className={clsx('type-opt', area === a && 'active')}
                  onClick={() => pickArea(a)}
                >
                  <span className="emo">{AREA_LABEL[a].emo}</span>
                  {AREA_LABEL[a].name}
                </button>
              ))}
            </div>
          </div>

          {/* 类型选择 */}
          <div className="field">
            <label className="field-label">类型</label>
            <div className="type-pick">
              {AREA_TYPES[area].map((o) => (
                <button
                  key={o.label}
                  className={clsx('type-opt', opt.label === o.label && 'active')}
                  onClick={() => setOpt(o)}
                >
                  <span className="emo">{o.emo}</span>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* 主文本 */}
          <div className="field">
            <label className="field-label">
              {mainLabel}<span className="field-req">*</span>
            </label>
            <input
              ref={mainInputRef}
              className="input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="今天发生了什么…"
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') onSave(true);
              }}
            />
          </div>

          {/* 财务字段 */}
          {opt.valueType === 'money' && (
            <div className="field-row">
              <div className="field">
                <label className="field-label">金额<span className="field-req">*</span></label>
                <input className="input" type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
              </div>
              <div className="field">
                <label className="field-label">分类</label>
                <input className="input" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="如 餐饮 / 工资" />
              </div>
            </div>
          )}
          {opt.valueType === 'money' && (
            <div className="field">
              <label className="field-label">账户（可选）</label>
              <input className="input" value={account} onChange={(e) => setAccount(e.target.value)} placeholder="如 招行 / 微信" />
            </div>
          )}

          {/* 身体读数字段 */}
          {opt.valueType === 'reading' && (
            <div className="field-row">
              <div className="field">
                <label className="field-label">指标</label>
                <select className="select" value={metricId} onChange={(e) => setMetricId(e.target.value)}>
                  {data.metrics.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}（{m.unit}）</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="field-label">读数<span className="field-req">*</span></label>
                <input className="input" type="number" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0.0" />
              </div>
            </div>
          )}

          {/* 运动字段 */}
          {opt.valueType === 'workout' && (
            <div className="field-row">
              <div className="field">
                <label className="field-label">运动类型</label>
                <input className="input" value={workoutType} onChange={(e) => setWorkoutType(e.target.value)} placeholder="跑步 / 力量…" />
              </div>
              <div className="field">
                <label className="field-label">距离 km</label>
                <input className="input" type="number" inputMode="decimal" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="可选" />
              </div>
              <div className="field">
                <label className="field-label">时长 分</label>
                <input className="input" type="number" inputMode="numeric" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="可选" />
              </div>
            </div>
          )}

          {/* 日期 */}
          <div className="field-row">
            <div className="field">
              <label className="field-label">日期</label>
              <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          {/* 备注 */}
          <div className="field">
            <label className="field-label">备注（可选）</label>
            <textarea className="textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="补充说明…" />
          </div>
        </div>

        <div className="sheet-foot">
          <button className="btn" onClick={() => onSave(false)}>保存并继续</button>
          <button className="btn primary" onClick={() => onSave(true)}>
            <Icon name="check" className="icon-sm" /> 保存
          </button>
        </div>
      </div>
    </div>
  );
}
