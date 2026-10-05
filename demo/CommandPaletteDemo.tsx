import { useState } from 'react';
import { ArrowRight, Command, FileText, Search, Sparkles } from 'lucide-react';
import { Button, CommandPalette, type CommandItem } from '../src';
import './new-components-demo.css';

export function CommandPaletteDemo({ expanded = false }: { expanded?: boolean }) {
  const [open, setOpen] = useState(false);
  const [lastAction, setLastAction] = useState('按 ⌘ K 或点击按钮开始');
  const select = (item: CommandItem) => setLastAction(`已执行「${String(item.label)}」`);
  return <div className={`command-demo${expanded ? ' new-demo--expanded' : ''}`}>
    {expanded && <div className="new-demo-heading"><div><small>04 / FIND YOUR WAY</small><h3>让下一步，近一点。</h3></div><span className="new-demo-index"><Command size={18} /></span></div>}
    <div className="command-demo__trigger"><Button variant={expanded ? 'primary' : 'outline'} onClick={() => setOpen(true)}><Search size={14} />打开命令面板 <kbd>⌘ K</kbd></Button><span role="status">{lastAction}</span></div>
    <CommandPalette hotkey={expanded ? 'k' : false} open={open} onOpenChange={setOpen} onSelect={select} groups={[{ heading: '快速开始', items: [
      { id: 'new', label: '创建新项目', description: '从一张空白画布开始', icon: <Sparkles size={14} />, shortcut: ['⌘', 'N'], keywords: ['新建', '项目'] },
      { id: 'search', label: '搜索灵感', description: '在你的收藏中找到想法', icon: <Search size={14} />, shortcut: ['⌘', 'F'], keywords: ['查找', '筛选'] },
    ] }, { heading: '最近使用', items: [{ id: 'docs', label: '阅读组件文档', description: '回到上次浏览的位置', icon: <FileText size={14} />, shortcut: ['⌘', 'D'] }] }]} />
    {expanded && <p className="new-demo-note"><ArrowRight size={12} /> 面板支持搜索、方向键、Home / End、Enter 和 Escape；组件不会接管你的路由或命令执行逻辑。</p>}
  </div>;
}
