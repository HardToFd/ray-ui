import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, Code2, Copy, Pause, Play, RotateCcw } from 'lucide-react';
import { growthLettering, Slider, StrokeLettering } from '../src';
import './hand-lettering.css';

const DRAW_SECONDS = 7.1;

export function HandLetteringStudy({ compact = false }: { compact?: boolean }) {
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'done' | 'error'>('idle');
  const [showCode, setShowCode] = useState(false);
  const progressRef = useRef(0);
  const panelRef = useRef<HTMLElement>(null);
  const code = `import { StrokeLettering, growthLettering } from '@ray-ui/react';\nimport '@ray-ui/react/styles.css';\n\n<StrokeLettering\n  artwork={growthLettering}\n  progress={${progress.toFixed(2)}}\n  color="#343c36"\n/>`;

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setReducedMotion(media.matches);
      if (media.matches) { progressRef.current = 1; setProgress(1); setPlaying(false); }
    };
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    if (!playing || reducedMotion) return;
    let frame = 0;
    let previous: number | undefined;
    const tick = (now: number) => {
      const visible = panelRef.current?.getBoundingClientRect();
      const onScreen = visible && visible.bottom > 0 && visible.top < window.innerHeight;
      if (previous !== undefined && !document.hidden && onScreen) {
        progressRef.current = Math.min(1, progressRef.current + Math.min(now - previous, 64) / (DRAW_SECONDS * 1000) * speed);
        setProgress(progressRef.current);
      }
      previous = now;
      if (progressRef.current >= 1) setPlaying(false);
      else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, speed, reducedMotion]);

  useEffect(() => {
    if (copyState === 'idle') return;
    const timeout = window.setTimeout(() => setCopyState('idle'), 2600);
    return () => window.clearTimeout(timeout);
  }, [copyState]);

  function seek(value: number) {
    progressRef.current = value;
    setProgress(value);
    setPlaying(false);
  }
  function replay() {
    if (reducedMotion) return;
    progressRef.current = 0;
    setProgress(0);
    setPlaying(true);
  }
  function togglePlay() {
    if (progressRef.current >= 1) replay();
    else setPlaying(value => !value);
  }
  async function copy() {
    try { await navigator.clipboard.writeText(code); setCopyState('done'); }
    catch { setCopyState('error'); setShowCode(true); }
  }

  return <section ref={panelRef} className={`hand-study ${compact ? 'hand-study--compact' : ''}`} aria-label="手作线条字动画">
    {!compact && <div className="hand-study__heading"><div><span>DRAWN, NOT TYPED</span><h2>一笔一画，生长。</h2></div><p>把落笔、停顿和收锋，留在字里。</p></div>}
    <div className="hand-paper">
      <div className="hand-paper__meta"><span>手作字稿 / 001</span><span>生长 · 九笔</span></div>
      <div className="hand-paper__drawing"><StrokeLettering artwork={growthLettering} progress={progress} color="#343c36" /></div>
      <div className="hand-paper__foot"><span>让线条自己说话。</span><span>GROW, STROKE BY STROKE</span></div>
    </div>
    <div className="hand-transport">
      <div className="hand-transport__buttons">
        <button type="button" className="hand-play" aria-label={playing ? '暂停笔画动画' : '播放笔画动画'} disabled={reducedMotion} onClick={togglePlay}>{playing ? <Pause size={15} /> : <Play size={15} />}<span>{playing ? '暂停' : progress >= 1 ? '再看一遍' : '播放'}</span></button>
        <button type="button" aria-label="重新绘制" disabled={reducedMotion} onClick={replay}><RotateCcw size={15} /></button>
      </div>
      <Slider label="笔画进度" value={Math.round(progress * 100)} min={0} max={100} onValueChange={value => seek(value / 100)} formatValue={value => `${value}%`} />
      <div role="group" aria-label="绘制速度" className="hand-speed">{[[.65, '慢一点'], [1, '自然'], [1.5, '快一点']].map(([rate, label]) => <button type="button" key={rate} aria-pressed={speed === rate} onClick={() => setSpeed(Number(rate))}>{label}</button>)}</div>
    </div>
    {reducedMotion && <p className="hand-study__motion-note">已遵循系统的减少动态效果设置。可以拖动进度查看每一笔。</p>}
    {!compact && <>
      <div className="hand-study__caption"><p>「生长」是单独绘制的字稿。笔画有粗细，也有不那么规整的转折。</p><button type="button" onClick={copy}>{copyState === 'done' ? <Check size={13} /> : <Copy size={13} />}{copyState === 'done' ? '已复制' : '复制当前画面代码'}</button></div>
      <div className="type-code hand-code"><button type="button" aria-expanded={showCode} aria-controls="stroke-lettering-code" onClick={() => setShowCode(!showCode)}><Code2 size={14} />笔画组件代码<span>{showCode ? '收起 −' : '展开 +'}</span></button>
        {showCode && <div id="stroke-lettering-code">{copyState === 'error' && <p>复制失败，请选中下方代码手动复制。</p>}<p>progress 从 0 到 1 对应逐笔绘制的全过程，可由动画时间轴驱动。此字稿固定为「生长」；其他文字需要单独绘制笔画。</p><pre tabIndex={0} aria-label="笔画动画 React 代码"><code>{code}</code></pre></div>}
      </div>
      <span className="sr-only" role="status" aria-label="笔画代码复制状态">{copyState === 'done' ? '笔画代码已复制' : copyState === 'error' ? '复制失败，请在下方手动复制代码。' : ''}</span>
    </>}
    {compact && <a className="hand-study__link" href="#typography">进入手作字动画 <ArrowUpRight size={12} /></a>}
  </section>;
}
