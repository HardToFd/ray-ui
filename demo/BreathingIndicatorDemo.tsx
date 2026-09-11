import { useState } from 'react';
import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { BreathingIndicator, Button, type BreathingTone, type BreathingVariant, type BreathingStatus } from '../src';
import './breathing-demo.css';

const concepts: { variant: BreathingVariant; name: string; subtitle: string; description: string }[] = [
  { variant: 'glow', name: '浮光', subtitle: 'FLUID GLOW', description: '柔光缓慢流动，轮廓轻轻舒展。' },
  { variant: 'orbit', name: '游环', subtitle: 'LIVING ORBIT', description: '光沿曲线游走，轮廓缓慢起伏。' },
  { variant: 'wave', name: '潮息', subtitle: 'SOFT TIDE', description: '像一阵微风，轻轻起伏。' },
];
const tones: { value: BreathingTone; label: string }[] = [
  { value: 'green', label: '青绿' }, { value: 'blue', label: '雾蓝' }, { value: 'orange', label: '暖橙' }, { value: 'purple', label: '淡紫' },
];
const states: { value: BreathingStatus; label: string; description: string }[] = [
  { value: 'normal', label: '正常运行', description: '所有服务正常，持续响应。' },
  { value: 'degraded', label: '系统部分出错', description: '部分服务异常，其余功能仍在运行。' },
  { value: 'failed', label: '系统完全瘫痪', description: '所有服务不可用，运行已停止。' },
];
export function BreathingIndicatorDemo({ expanded = false }: { expanded?: boolean }) {
  const [status, setStatus] = useState<BreathingStatus>('normal');
  const currentState = states.find((item) => item.value === status)!;
  const [paused, setPaused] = useState(false);
  const [tone, setTone] = useState<BreathingTone>('green');
  const [variant, setVariant] = useState<BreathingVariant>('glow');
  const [duration, setDuration] = useState(6000);
  if (!expanded) return <div className="breath-demo-compact">
    <BreathingIndicator variant={variant} tone={tone} label="系统运行中" paused={paused} />
    <div className="breath-demo-tabs" role="group" aria-label="呼吸样式">
      {concepts.map((concept) => <button key={concept.variant} type="button" aria-pressed={variant === concept.variant} onClick={() => setVariant(concept.variant)}>{concept.name}</button>)}
    </div>
  </div>;
  return <div className="breath-demo">
    <div className="breath-demo-heading"><span>THREE WAYS TO FEEL ALIVE</span><h2>让状态，有一点生命力。</h2><p>三种形态，三种自然流动的节奏。</p></div>
    <div className="breath-demo-state-control" role="group" aria-label="系统状态">
      {states.map((item) => <button type="button" key={item.value} data-status={item.value} aria-pressed={status === item.value} onClick={() => { setStatus(item.value); setPaused(false); }}>{item.label}</button>)}
    </div>
    <p className="breath-demo-state-description" role="status">{currentState.description}</p>
    <div className="breath-demo-concepts">
      {concepts.map((concept, index) => <section className="breath-demo-concept" key={concept.variant} aria-label={concept.name}>
        <div className="breath-demo-concept-title"><span>0{index + 1}</span><h3>{concept.name}<small>{concept.subtitle}</small></h3></div>
        <div className="breath-demo-artwork"><BreathingIndicator variant={concept.variant} size="lg" hideLabel label={`${concept.name}：${currentState.label}`} status={status} tone={tone} duration={duration} paused={paused} /></div>
        <strong className="breath-demo-status" data-status={status}>{currentState.label}</strong><p>{status === 'normal' ? concept.description : currentState.description}</p>
      </section>)}
    </div>
    <div className="breath-demo-controls">
      <div className="breath-demo-tabs" role="group" aria-label="指示器配色">{tones.map((item) => <button key={item.value} type="button" disabled={status !== 'normal'} aria-pressed={tone === item.value} onClick={() => setTone(item.value)}>{item.label}</button>)}</div>
      <div className="breath-demo-tempo"><span>节奏</span>
        <Select.Root disabled={status === 'failed'} value={String(duration)} onValueChange={(value) => setDuration(Number(value))}>
          <Select.Trigger className="breath-demo-select" aria-label="呼吸节奏"><Select.Value /><Select.Icon asChild><ChevronDown size={14} /></Select.Icon></Select.Trigger>
          <Select.Portal>
            <Select.Content className="breath-demo-select-menu" position="popper" sideOffset={6} collisionPadding={12}>
              <Select.Viewport>
                {[['8000', '舒缓'], ['6000', '自然'], ['4000', '轻快']].map(([value, label]) => <Select.Item className="breath-demo-select-option" key={value} value={value}>
                  <Select.ItemText>{label}</Select.ItemText><Select.ItemIndicator><Check size={13} /></Select.ItemIndicator>
                </Select.Item>)}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>
      <Button size="sm" variant="outline" disabled={status === 'failed'} onClick={() => setPaused(!paused)}>{status === 'failed' ? '已停止' : paused ? '继续呼吸' : '暂停动效'}</Button>
    </div>
    <div className="breath-demo-inline"><span>放进日常界面</span>{concepts.map((concept) => <BreathingIndicator key={concept.variant} variant={concept.variant} size="sm" label={`${concept.name} · ${currentState.label}`} status={status} tone={tone} duration={duration} paused={paused} />)}</div>
  </div>;
}
