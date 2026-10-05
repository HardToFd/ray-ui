import { useState } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import { Button, Switch, Timeline, type TimelineItem } from '../src';
import './new-components-demo.css';

export function TimelineDemo({ expanded = false }: { expanded?: boolean }) {
  const [step, setStep] = useState(2);
  const [failed, setFailed] = useState(false);
  const [details, setDetails] = useState(false);
  const entries = [
    { title: '收集灵感，确定方向', time: '09:20', description: '从一张草图开始，整理颜色、材质与想法。' },
    { title: '打磨每一个细节', time: '10:45', description: '交互、排版和深浅主题，逐一对齐。' },
    { title: '邀请最后一次预览', time: '现在', description: '一切就绪，等你给这份作品最后一个点头。' },
    { title: '让作品与世界见面', time: '下一步', description: '发布新版本，把想法变成可以使用的东西。' },
  ];
  const items: TimelineItem[] = entries.map((entry, index) => ({
    ...entry, id: String(index), description: expanded ? entry.description : undefined,
    status: index < step ? 'complete' : index === step ? failed ? 'error' : 'current' : 'pending',
    action: expanded && index === step ? <><Button variant="ghost" size="sm" aria-expanded={details} onClick={() => setDetails(!details)}>查看交付清单 <ArrowUpRight size={13} /></Button>
      {details && <p className="timeline-demo__checklist">组件、示例与使用说明已准备好。这是一段可推进、可重置的演示流程。</p>}</> : undefined,
  }));
  return <div className={`timeline-demo${expanded ? ' new-demo--expanded' : ''}`}>
    {expanded && <div className="new-demo-heading"><div><small>03 / FROM IDEA TO REALITY</small><h3>每一步，都有迹可循。</h3></div><span className="timeline-demo__edition">VOL. 03</span></div>}
    <Timeline aria-label="作品发布流程" items={expanded ? items : items.slice(1, 3)} size={expanded ? 'md' : 'sm'} />
    {expanded && <div className="timeline-demo__footer"><Switch label="模拟异常" checked={failed} disabled={step >= entries.length} onCheckedChange={setFailed} />
      <Button size="sm" onClick={() => { setStep((current) => current >= entries.length ? 0 : current + 1); setFailed(false); setDetails(false); }}>
        {step >= entries.length ? '重新演示' : failed ? '解决并继续' : '推进到下一步'}{step >= entries.length ? <Check size={13} /> : <ArrowUpRight size={13} />}
      </Button></div>}
  </div>;
}
