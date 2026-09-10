import { useState } from 'react';
import { ArrowUpRight, BookOpen, CalendarDays, Camera, Check, ChevronUp, Lightbulb, MapPin, Palette, Sprout } from 'lucide-react';
import { Button, StackedCards, type StackedCardItem } from '../src';
import './stacked-cards.css';

const ideas = [
  { id: 'brand', title: '品牌视觉探索', tone: 'sage', icon: Palette, category: 'DESIGN', date: '09.10', description: '收集喜欢的颜色与字形，找到属于自己的视觉语言。', detail: '配色灵感 · 字体研究 · 标志草图', note: '设计一个让自己心动的小品牌。' },
  { id: 'room', title: '个人空间改造', tone: 'sand', icon: Sprout, category: 'LIVING', date: '09.11', description: '一盏灯、一盆绿植，让每天坐下来的角落更舒服一点。', detail: '书桌整理 · 自然光 · 绿植角落', note: '把平常的日子，过成喜欢的样子。' },
  { id: 'weekend', title: '周末漫游计划', tone: 'clay', icon: Camera, category: 'EXPLORE', date: '09.12', description: '留半天给没有目的地的散步，看看那些平时匆匆经过的风景。', detail: '老街巷 · 独立书店 · 一家新咖啡馆', note: '带上相机，去收集一点日常之外。' },
  { id: 'reading', title: '阅读与记录', tone: 'neutral', icon: BookOpen, category: 'JOURNAL', date: '09.13', description: '给屏幕之外的世界留一点时间，把触动自己的句子记下来。', detail: '床头读物 · 随手笔记 · 本周摘录', note: '慢慢读，慢慢长出自己的想法。' },
] as const;

export function StackedCardsDemo({ expanded = false }: { expanded?: boolean }) {
  const [selected, setSelected] = useState<string | null>(expanded ? 'weekend' : null);
  const [completed, setCompleted] = useState<string[]>([]);
  const items: StackedCardItem[] = ideas.map((idea) => ({
    id: idea.id, title: idea.title, tone: idea.tone,
    icon: <idea.icon size={17} strokeWidth={1.5} />,
    meta: completed.includes(idea.id) ? '已完成' : idea.date,
    content: (
      <div className="stack-list-demo__content">
        <p>{idea.description}</p>
        <div className="stack-list-demo__note">
          <span className="stack-list-demo__note-category">{idea.category}<ArrowUpRight size={15} /></span>
          <strong>{idea.note}</strong>
          <span><MapPin size={12} />{idea.detail}</span>
        </div>
        <div className="stack-list-demo__item-footer"><span><CalendarDays size={13} />9 月 {Number(idea.date.slice(3))} 日</span><Button size="sm" variant="ghost" onClick={() => setCompleted((current) => current.includes(idea.id) ? current.filter((id) => id !== idea.id) : [...current, idea.id])}><Check size={13} />{completed.includes(idea.id) ? '撤销完成' : '标记完成'}</Button></div>
      </div>
    ),
  }));

  return (
    <div className={`stack-list-demo${expanded ? ' stack-list-demo--expanded' : ''}`}>
      {expanded && <div className="stack-list-demo__intro">
        <span className="stack-list-demo__eyebrow"><span />LITTLE THINGS, IN LAYERS</span>
        <h3>把日常的期待，<br />一张张收好。</h3>
        <p>每张卡片，都是清单里的一件小事。<br />点开想看的那张，其余的轻轻叠起。</p>
        <div className="stack-list-demo__legend"><span><Lightbulb size={15} />4 个小计划</span><span>{completed.length} 个已完成</span></div>
        <span className="stack-list-demo__keyboard"><kbd>↑</kbd><kbd>↓</kbd> 切换标题 <span>·</span> <kbd>Enter</kbd> 展开</span>
      </div>}
      <div className="stack-list-demo__list">
        {expanded && <div className="stack-list-demo__toolbar"><span>我的灵感清单 <small>04</small></span><button type="button" disabled={selected === null} onClick={() => setSelected(null)}><ChevronUp size={13} />全部收起</button></div>}
        <StackedCards items={items} value={selected} onValueChange={setSelected} aria-label="我的灵感清单" />
        {expanded && <div className="stack-list-demo__status" role="status"><span>{selected ? `正在浏览 · ${ideas.find((idea) => idea.id === selected)?.title}` : '点击任意一张卡片，展开看看'}</span><span>演示数据</span></div>}
      </div>
    </div>
  );
}
