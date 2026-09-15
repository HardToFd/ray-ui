import { useState } from 'react';
import { Bell, Mail, MessageCircle } from 'lucide-react';
import { Button, NotificationHotspot, Switch } from '../src';

export function NotificationHotspotDemo({ expanded = false }: { expanded?: boolean }) {
  const [count, setCount] = useState(8);
  const [pulse, setPulse] = useState(true);
  return <div style={{ display: 'grid', gap: 24, width: '100%', maxWidth: 460 }}>
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 36, padding: 16 }}>
      <NotificationHotspot active={count > 0} pulse={pulse}>
        <Button variant="outline" aria-label="查看提醒" onClick={() => setCount(0)}><Bell size={20} /></Button>
      </NotificationHotspot>
      <NotificationHotspot count={count} pulse={pulse} announce>
        <Button variant="outline" aria-label="阅读消息" onClick={() => setCount(0)}><Mail size={20} /></Button>
      </NotificationHotspot>
      <NotificationHotspot count={128} tone="info"><Button variant="outline" aria-label="讨论区"><MessageCircle size={20} /></Button></NotificationHotspot>
    </div>
    <div style={{ textAlign: 'center', color: 'var(--ray-muted)', fontSize: 13 }}>点击铃铛或信封，清空未读提醒</div>
    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 10 }}>
      <Button size="sm" variant="secondary" onClick={() => setCount(n => n + 1)}>新增通知</Button>
      <Button size="sm" variant="ghost" onClick={() => setCount(0)}>全部已读</Button>
    </div>
    {expanded && <div style={{ display: 'grid', gap: 24 }}>
      <Switch checked={pulse} onCheckedChange={setPulse} label="轻微脉冲" />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
        <NotificationHotspot count={0} showZero />
        <NotificationHotspot tone="success" label="同步完成" />
        <NotificationHotspot tone="warning" placement="bottom-right" label="有待处理事项"><Button variant="outline">待办事项</Button></NotificationHotspot>
        <NotificationHotspot placement="top-left" pulse={pulse}><Button variant="outline">新功能</Button></NotificationHotspot>
      </div>
    </div>}
  </div>;
}
