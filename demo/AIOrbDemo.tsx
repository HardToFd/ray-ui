import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, AudioLines, Check, Mic, Pause, Play, RotateCcw, Sparkles, Square } from 'lucide-react';
import { AIOrb, Button, Slider, type AIOrbState } from '../src';
import './ai-orb-demo.css';

const modes: { value: AIOrbState; label: string; caption: string }[] = [
  { value: 'idle', label: '待机', caption: '有什么，想聊一聊？' },
  { value: 'listening', label: '聆听', caption: '我在听，慢慢说。' },
  { value: 'thinking', label: '思考', caption: '让我想一想。' },
  { value: 'speaking', label: '回应', caption: '一点灵感，正在发生。' },
  { value: 'error', label: '断开', caption: '连接断开了，稍后再试。' },
];

export function AIOrbDemo({ expanded = false }: { expanded?: boolean }) {
  const [state, setState] = useState<AIOrbState>('idle');
  const [paused, setPaused] = useState(false);
  const [level, setLevel] = useState(48);
  const [demo, setDemo] = useState(false);
  const [demoLevel, setDemoLevel] = useState(0);
  const [finished, setFinished] = useState(false);
  const elapsed = useRef(0);
  useEffect(() => {
    if (!demo || paused) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      elapsed.current += 80;
      const time = elapsed.current;
      const next = time < 2400 ? 'listening' : time < 4500 ? 'thinking' : time < 8800 ? 'speaking' : 'idle';
      setState(next);
      setDemoLevel(next === 'thinking' || next === 'idle' ? 0 : Math.pow(Math.sin(time / 230), 2) * 0.6 + Math.pow(Math.sin(time / 87), 2) * 0.3);
      if (next === 'idle') { setDemo(false); setFinished(true); }
    }, 80);
    return () => window.clearInterval(timer);
  }, [demo, paused]);
  function select(next: AIOrbState) { setDemo(false); setFinished(false); setState(next); }
  const current = modes.find((mode) => mode.value === state)!;
  const energy = demo ? demoLevel : level / 100;
  const stateButtons = <div className="orb-demo__states" role="group" aria-label="AI 对话状态">{modes.map((mode) => <button type="button" key={mode.value} aria-pressed={state === mode.value} onClick={() => select(mode.value)}>{mode.label}</button>)}</div>;

  if (!expanded) return <div className="orb-demo-compact"><AIOrb state={state} audioLevel={energy} size={132} hideLabel />{stateButtons}</div>;

  return <div className="orb-demo">
    <div className="orb-demo__experience">
      <div className="orb-demo__topline"><span><span className="orb-demo__signal" /> RAY INTELLIGENCE</span><span>交互演示</span></div>
      <div className="orb-demo__hero">
        <span className="orb-demo__eyebrow">A LITTLE PRESENCE, A REAL CONNECTION</span>
        <h3>{current.caption}</h3>
        <p>让每一次对话，都有温度。</p>
        <div className="orb-demo__stage"><AIOrb state={state} audioLevel={energy} paused={paused} size={340} hideLabel /></div>
        <div className="orb-demo__status"><span data-state={state} />{paused ? '动效已暂停' : finished ? '这一段对话，完成了' : `${current.label}中`}</div>
        <div className="orb-demo__transcript" aria-live="polite">
          {demo && state === 'listening' ? '“帮我为周末找一点灵感。”' : demo && state === 'thinking' ? '正在整理几个轻松的小点子…' : demo && state === 'speaking' ? '去逛一家独立书店，再找个有阳光的窗边坐坐。' : finished ? '带上好奇心，就可以出发。' : '点击下方按钮，体验一段模拟对话。'}
        </div>
        <div className="orb-demo__actions">
          <Button className="orb-demo__talk" onClick={() => {
            if (demo) { setDemo(false); setState('idle'); return; }
            elapsed.current = 0; setPaused(false); setFinished(false); setState('listening'); setDemoLevel(0); setDemo(true);
          }}>{demo ? <Square size={15} /> : finished ? <RotateCcw size={16} /> : <Mic size={17} />}{demo ? '结束演示' : finished ? '再聊一次' : '开始模拟对话'}</Button>
          <button type="button" className="orb-demo__pause" aria-label={paused ? '继续动效' : '暂停动效'} onClick={() => setPaused(!paused)}>{paused ? <Play size={16} /> : <Pause size={16} />}</button>
        </div>
        <span className="orb-demo__note">模拟状态与音量 · 未启用麦克风</span>
      </div>
      <div className="orb-demo__bottomline"><span><Sparkles size={12} /> 光随声动</span><span>AI ORB <ArrowUpRight size={12} /></span></div>
    </div>
    <div className="orb-demo__settings">
      <div className="orb-demo__setting"><span className="orb-demo__setting-label">对话状态</span>{stateButtons}</div>
      <div className="orb-demo__setting"><Slider label="模拟音量" value={Math.round(energy * 100)} onValueChange={setLevel} disabled={demo || (state !== 'listening' && state !== 'speaking')} formatValue={(value) => `${value}%`} /></div>
      <div className="orb-demo__hint"><AudioLines size={15} /><span>切到聆听或回应，调节音量感受光流变化。</span></div>
    </div>
    <div className="orb-demo__sizes"><div><AIOrb size="sm" label="小巧入口" /></div><div><AIOrb size={100} state="listening" label="对话陪伴" /></div><span><Check size={14} /> 支持浅色与深色主题</span></div>
  </div>;
}
