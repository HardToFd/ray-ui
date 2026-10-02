import { useEffect, useState } from 'react';
import { ProgressRing } from '../src';

export function ProgressRingDemo({ expanded = false }: { expanded?: boolean }) {
  const [value, setValue] = useState(68);
  useEffect(() => {
    if (!expanded) return;
    const id = window.setInterval(() => setValue((current) => current >= 100 ? 12 : current + 2), 900);
    return () => window.clearInterval(id);
  }, [expanded]);
  return <div style={{ display: 'flex', alignItems: 'center', gap: expanded ? 28 : 18, flexWrap: 'wrap' }}>
    <ProgressRing value={value} label="上传进度" tone="accent" />
    {expanded && <>
      <ProgressRing value={42} label="同步进度" tone="success" size="sm" />
      <ProgressRing value={null} label="分析中" tone="warning" size="lg" />
    </>}
  </div>;
}
