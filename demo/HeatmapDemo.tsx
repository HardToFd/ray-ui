import { useState } from 'react';
import { ArrowUpRight, CalendarDays, Check, Flame } from 'lucide-react';
import { Button, Heatmap, type HeatmapDatum, type HeatmapTone } from '../src';
import './heatmap.css';

// Fixed sample data makes the gallery reproducible and independent of today's date.
const activity: HeatmapDatum[] = Array.from({ length: 365 }, (_, index) => {
  const wave = Math.sin(index * 1.7) * .5 + .5;
  const cadence = Math.sin(index * .11) * .5 + .5;
  return {
    date: new Date(Date.UTC(2025, 8, 13 + index)).toISOString().slice(0, 10),
    value: wave < .23 ? 0 : Math.round(1 + wave * cadence * 11 + (index > 275 ? wave * 4 : 0)),
  };
});
const tones: { value: HeatmapTone; label: string; color: string }[] = [
  { value: 'green', label: '苔绿', color: '#438557' },
  { value: 'orange', label: '陶橙', color: '#c56338' },
  { value: 'blue', label: '雾蓝', color: '#497fbe' },
  { value: 'purple', label: '暮紫', color: '#8861b8' },
];

export function HeatmapDemo({ expanded = false }: { expanded?: boolean }) {
  const [tone, setTone] = useState<HeatmapTone>('green');
  const [period, setPeriod] = useState<'year' | 'quarter'>('year');
  const [empty, setEmpty] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const startDate = expanded && period === 'year' ? '2025-09-13' : '2026-06-15';
  const visibleData = empty ? [] : activity.filter((day) => day.date >= startDate);
  const total = visibleData.reduce((sum, day) => sum + day.value, 0);
  const activeDays = visibleData.filter((day) => day.value > 0).length;
  let streak = 0;
  let longest = 0;
  visibleData.forEach((day) => { streak = day.value > 0 ? streak + 1 : 0; longest = Math.max(longest, streak); });

  return <div className={`heatmap-demo${expanded ? ' heatmap-demo--expanded' : ''}`} data-period={period}>
    {expanded && <>
      <div className="heatmap-demo__intro"><div><span className="heatmap-demo__eyebrow">A LITTLE, EVERY DAY</span><h3>把坚持，留在每一天。</h3><p>创作、阅读、代码提交，每一份积累都有迹可循。</p></div><span className="heatmap-demo__sample">演示数据</span></div>
      <div className="heatmap-demo__stats">
        <div><span><ArrowUpRight size={14} />累计贡献</span><strong>{total.toLocaleString('zh-CN')}<small>次</small></strong></div>
        <div><span><CalendarDays size={14} />活跃天数</span><strong>{activeDays}<small>天</small></strong></div>
        <div><span><Flame size={14} />最长连续</span><strong>{longest}<small>天</small></strong></div>
      </div>
      <div className="heatmap-demo__toolbar">
        <div className="heatmap-demo__period" role="group" aria-label="时间范围">
          <button type="button" aria-pressed={period === 'year'} onClick={() => { setPeriod('year'); setSelected(null); }}>过去一年</button>
          <button type="button" aria-pressed={period === 'quarter'} onClick={() => { setPeriod('quarter'); setSelected(null); }}>最近 90 天</button>
        </div>
        <div className="heatmap-demo__tones" role="group" aria-label="热力图配色">
          {tones.map((option) => <button type="button" key={option.value} aria-label={option.label} aria-pressed={tone === option.value} style={{ backgroundColor: option.color }} onClick={() => setTone(option.value)}>{tone === option.value && <Check size={12} />}</button>)}
        </div>
      </div>
    </>}
    <Heatmap
      data={visibleData}
      startDate={startDate}
      endDate="2026-09-12"
      title={expanded ? '贡献记录' : '日常积累'}
      tone={tone}
      value={selected}
      onValueChange={setSelected}
      maxValue={16}
      formatValue={(amount) => `${amount} 次贡献`}
    />
    {expanded && <div className="heatmap-demo__footer"><span>悬停查看 · 点击选日 · 方向键浏览</span><Button size="sm" variant="ghost" onClick={() => setEmpty(!empty)}>{empty ? '恢复演示数据' : '查看空状态'}</Button></div>}
  </div>;
}
