/** Toast 容器 + 确认对话框 */
import { useUI } from '../store';
import { Icon } from './Icons';

export function ToastHost() {
  const { toasts } = useUI();
  return (
    <div className="toast-host">
      {toasts.map((t) => (
        <div key={t.id} className="toast show" role="status" aria-live="polite">
          {t.text}
        </div>
      ))}
    </div>
  );
}

export function ConfirmDialog() {
  const { confirm, dismissConfirm } = useUI();
  if (!confirm) return null;
  return (
    <div className="overlay open" onClick={(e) => e.target === e.currentTarget && dismissConfirm()}>
      <div className="modal" role="alertdialog" aria-modal="true" aria-labelledby="cf-title" aria-describedby="cf-text">
        <div className="modal-body">
          <div className="modal-title" id="cf-title">
            {confirm.danger && <Icon name="alert" className="icon-sm" style={{ color: 'var(--el-rose)', marginRight: 6, verticalAlign: '-2px' }} />}
            {confirm.title}
          </div>
          <div className="modal-text" id="cf-text">{confirm.text}</div>
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={dismissConfirm} autoFocus>取消</button>
          <button
            className={confirm.danger ? 'btn danger' : 'btn primary'}
            onClick={() => { confirm.onConfirm(); dismissConfirm(); }}
          >
            {confirm.confirmText || '确认'}
          </button>
        </div>
      </div>
    </div>
  );
}
