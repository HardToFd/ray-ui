import { useState } from 'react';
import { SegmentedControl } from '../src';

export function SegmentedControlDemo({ expanded = false }: { expanded?: boolean }) {
  const [view, setView] = useState('overview');
  return <div style={{ display: 'grid', gap: expanded ? 18 : 12, width: expanded ? 420 : 300, maxWidth: '100%' }}>
    <SegmentedControl aria-label="工作台视图" value={view} onValueChange={setView} fullWidth options={[
      { value: 'overview', label: '概览' },
      { value: 'activity', label: '活动' },
      { value: 'settings', label: '设置' },
    ]} />
    <span style={{ color: 'var(--ray-muted)', fontSize: 12 }}>当前视图：<b style={{ color: 'var(--ray-text)', fontWeight: 500 }}>{view === 'overview' ? '概览' : view === 'activity' ? '活动' : '设置'}</b></span>
    {expanded && <SegmentedControl aria-label="密度" size="sm" defaultValue="comfortable" options={[
      { value: 'compact', label: '紧凑' },
      { value: 'comfortable', label: '舒适' },
      { value: 'spacious', label: '宽松', disabled: true },
    ]} />}
  </div>;
}
