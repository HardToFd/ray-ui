import { useEffect, useState } from 'react';
import { ProgressRing } from '../src';
import './progress-ring-demo.css';

export function ProgressRingDemo({ expanded = false }: { expanded?: boolean }) {
  const [value, setValue] = useState(68);
  useEffect(() => {
    if (!expanded) return;
    const id = window.setInterval(() => setValue((current) => current >= 100 ? 12 : current + 2), 900);
    return () => window.clearInterval(id);
  }, [expanded]);
  return <div className={`progress-ring-demo${expanded ? ' progress-ring-demo--expanded' : ''}`}>
    <div className="progress-ring-demo__topline"><span><i /> LIVE PIPELINE</span><span>UPDATED NOW</span></div>
    <div className="progress-ring-demo__grid">
      <div className="progress-ring-demo__item progress-ring-demo__item--primary"><ProgressRing value={value} label="上传进度" tone="accent" size={expanded ? 124 : 96} /><span>UPLOAD</span><small>ASSETS / 24 MB</small></div>
      {expanded && <div className="progress-ring-demo__item"><ProgressRing value={42} label="同步进度" tone="success" size="sm" /><span>SYNC</span><small>42 ITEMS</small></div>}
      {expanded && <div className="progress-ring-demo__item progress-ring-demo__item--pending"><ProgressRing value={null} label="分析中" tone="warning" size="lg" /><span>ANALYSIS</span><small>PROCESSING</small></div>}
    </div>
    {expanded && <div className="progress-ring-demo__footer"><span>3 ACTIVE JOBS</span><span><b /> ALL SYSTEMS NOMINAL</span></div>}
  </div>;
}
