import { useState } from 'react';
import { Minus, Triangle } from 'lucide-react';
import { Button, Leaderboard, type LeaderboardItem } from '../src';
import avatar1 from './assets/leaderboard/avatar-1.png';
import avatar2 from './assets/leaderboard/avatar-2.png';
import avatar3 from './assets/leaderboard/avatar-3.png';
import avatar4 from './assets/leaderboard/avatar-4.png';

const entries: LeaderboardItem[] = [
  { id: 'lin', name: '林予安', value: 12860, avatar: avatar1, tone: 'orange', change: 3 },
  { id: 'chen', name: '陈墨', value: 11420, avatar: avatar2, tone: 'blue', change: 1 },
  { id: 'xu', name: '许知远', value: 10980, avatar: avatar3, tone: 'purple', change: -1 },
  { id: 'zhou', name: '周可', value: 9640, avatar: avatar4, tone: 'teal', change: 0 },
];
export function LeaderboardDemo({ expanded = false }: { expanded?: boolean }) {
  const [updated, setUpdated] = useState(false);
  const [empty, setEmpty] = useState(false);
  const items = empty ? [] : updated ? entries.map((item) => ({ ...item, value: item.id === 'chen' ? 13980 : item.value, change: item.id === 'chen' ? 1 : item.id === 'lin' ? -1 : 0 })) : entries;
  return <div style={{ width: expanded ? 780 : 480, maxWidth: '100%', minWidth: 0 }}>
    <Leaderboard items={items} renderChange={(change) => change === 0 ? <Minus size={14} /> : <><Triangle size={12} fill="currentColor" strokeWidth={0} style={{ transform: change < 0 ? 'rotate(180deg)' : undefined }} />{Math.abs(change)}</>} />
    {expanded && <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginTop: 24 }}>
      <Button variant="outline" size="sm" onClick={() => { setUpdated(!updated); setEmpty(false); }}>{updated ? '还原分数' : '模拟分数更新'}</Button>
      <Button variant="ghost" size="sm" onClick={() => setEmpty(!empty)}>{empty ? '显示排行' : '查看空状态'}</Button>
      <span role="status" style={{ fontSize: 12, color: 'var(--ray-muted)', marginLeft: 'auto' }}>演示数据 · {empty ? '暂无数据' : updated ? '陈墨升至第 1 名' : '百分比相对榜首'}</span>
    </div>}
  </div>;
}
