import { Check, Copy, Download, MoreHorizontal, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { SplitButton } from '../src';
import './new-components-demo.css';

export function SplitButtonDemo({ expanded = false }: { expanded?: boolean }) {
  const [message, setMessage] = useState('准备好导出你的作品了吗？');
  return <div className={`split-demo${expanded ? ' new-demo--expanded' : ''}`}>
    {expanded && <div className="new-demo-heading"><div><small>06 / ONE ACTION, MORE ROADS</small><h3>主按钮之外，还有余地。</h3></div><span className="new-demo-index"><MoreHorizontal size={18} /></span></div>}
    <div className="split-demo__row"><SplitButton onClick={() => setMessage('正在导出 PNG…')} onAction={(action) => setMessage(`已选择「${String(action.label)}」`)} actions={[{ id: 'png', label: '导出 PNG', icon: <Download size={13} />, onSelect: () => setMessage('已选择 PNG 导出') }, { id: 'copy', label: '复制链接', icon: <Copy size={13} />, onSelect: () => setMessage('链接已复制') }, { id: 'reset', label: '重置预览', icon: <RotateCcw size={13} />, onSelect: () => setMessage('预览已重置') }]}><Download size={14} />导出作品</SplitButton><span role="status">{message}</span></div>
    {expanded && <p className="new-demo-note"><Check size={12} /> 菜单项可禁用、带图标或绑定任意异步动作；方向键导航后按 Enter 执行。</p>}
  </div>;
}

