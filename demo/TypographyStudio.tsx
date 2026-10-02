import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowDown, ArrowUpRight, Check, Code2, Copy, RotateCcw, Search, Type } from 'lucide-react';
import { ArtText, Button, Input, Slider, Switch, type ArtTextVariant } from '../src';
import { artTextFinishes as finishes } from './art-text-presets';
import { HandLetteringStudy } from './HandLetteringStudy';
import './typography.css';

export function ArtTextDemo({ expanded = false }: { expanded?: boolean }) {
  return <HandLetteringStudy compact={!expanded} />;
}

export function TypographyStudio() {
  const [selectedVariant, setVariant] = useState<ArtTextVariant>('moon-silver');
  const [text, setText] = useState('月色入字');
  const [fontSize, setFontSize] = useState(96);
  const [tracking, setTracking] = useState(.08);
  const [colors, setColors] = useState<[string, string]>([...finishes[0].colors]);
  const [background, setBackground] = useState(finishes[0].dark ? 'dark' : 'light');
  const [animated, setAnimated] = useState(true);
  const [query, setQuery] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'done' | 'error'>('idle');
  const studioRef = useRef<HTMLElement>(null);
  const drawingRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const finish = finishes.find(item => item.id === selectedVariant) ?? finishes[0];
  const variant = finish.id;
  const canAnimate = Boolean(finish.motion);
  const earlierFinishes = finishes.slice(1);
  const visibleFinishes = earlierFinishes.filter(item =>
    `${item.name} ${item.english} ${item.id} ${item.sample} ${item.sources.flatMap(source => [source, ...source.originals]).map(source => `${source.id} ${source.name}`).join(' ')}`.toLowerCase().includes(query.toLowerCase().trim()));
  const code = `import { ArtText } from '@ray-ui/react';\nimport '@ray-ui/react/styles.css';\n\n<ArtText\n  variant="${variant}"\n  fontSize={${fontSize}}\n  letterSpacing="${tracking.toFixed(2)}em"\n  color="${colors[0]}"\n  secondaryColor="${colors[1]}"${animated && canAnimate ? '\n  animated' : ''}\n>\n  {${JSON.stringify(text)}}\n</ArtText>`;

  useEffect(() => {
    if (copyState === 'idle') return;
    const timer = window.setTimeout(() => setCopyState('idle'), 2600);
    return () => window.clearTimeout(timer);
  }, [copyState]);

  function openStudio() {
    studioRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    inputRef.current?.focus({ preventScroll: true });
  }

  function chooseStyle(id: ArtTextVariant) {
    const next = finishes.find(item => item.id === id)!;
    setVariant(id);
    setColors([...next.colors]);
    setBackground(next.dark ? 'dark' : 'light');
    setCopyState('idle');
  }

  function reset() {
    chooseStyle('moon-silver');
    setText('月色入字');
    setFontSize(96);
    setTracking(.08);
    setAnimated(true);
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopyState('done');
    } catch {
      setCopyState('error');
      setShowCode(true);
    }
  }

  return <div className="type-page">
    <header className="type-intro">
      <div>
        <div className="eyebrow"><span className="orange-dot" /> THE TYPOGRAPHY ATELIER</div>
        <h1>文字，也有<span>自己的表情</span><i>。</i></h1>
        <p>从一根线开始，慢慢画成一个字。</p>
      </div>
      <div className="type-intro__aside">
        <span className="type-monogram" aria-hidden="true">Aa<span>✳</span></span>
        <button type="button" className="text-button" onClick={() => drawingRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })}>看它成字 <ArrowDown size={14} /></button>
      </div>
    </header>

    <div ref={drawingRef} className="type-drawing"><HandLetteringStudy /></div>
    <details className="type-material-archive">
    <summary>早期材质实验 <span>4 款 · 展开查看</span></summary>
    <section className="type-silver-study" aria-label="月白银设计作品">
      <button type="button" className="type-silver-cover art-scene--moon-silver" aria-label="使用月白银"
        aria-pressed={variant === 'moon-silver'} onClick={() => { chooseStyle('moon-silver'); openStudio(); }}>
        <span className="type-silver-cover__top"><span>RAY ATELIER — TYPE STUDY</span><span>No. 01 / SILVER</span></span>
        <span className="type-silver-cover__center">
          <span className="type-silver-cover__english">MOONLIT SILVER</span>
          <ArtText variant="moon-silver">月白银</ArtText>
          <span className="type-silver-cover__verse">月色，落在字里。</span>
        </span>
        <span className="type-silver-cover__bottom"><span>宋体的骨骼 · 银的温度</span><span>用我的文字试试 <ArrowUpRight size={15} /></span></span>
      </button>
      <div className="type-silver-study__caption"><strong>月白银 <span>MOONLIT SILVER</span></strong><p>细看有光，远看有形。适合书封、展览与品牌标题。</p></div>
    </section>

    <details className="type-archive">
    <summary>早期字效实验 <span>{earlierFinishes.length} 款 · 展开查看</span></summary>
    <section aria-labelledby="type-collection-title" className="type-collection">
      <div className="type-section-heading">
        <h2 id="type-collection-title">风格陈列室 <span>EARLIER STUDIES / {earlierFinishes.length}</span></h2>
        <label className="type-search"><Search size={13} /><input type="search" aria-label="搜索艺术字风格" placeholder="搜索字效…" value={query} onChange={event => setQuery(event.target.value)} /></label>
      </div>
      <div className="type-collection-toolbar">
        <span className="type-collection-note">保留此前的材质实验</span>
        <span className="type-result-count" role="status" aria-label="风格筛选结果">{visibleFinishes.length} / {earlierFinishes.length} 款</span>
      </div>
      <div className="type-gallery">
        {visibleFinishes.map(item => <button
          type="button" key={item.id} className={`type-specimen ${variant === item.id ? 'type-specimen--selected' : ''}`}
          aria-label={`使用${item.name}`} aria-pressed={variant === item.id}
          onClick={() => { chooseStyle(item.id); openStudio(); }}>
          <span className={`type-specimen__art art-scene art-scene--${item.id}`}>
            <span className="type-specimen__edition">{item.english}<span>{String(earlierFinishes.indexOf(item) + 1).padStart(2, '0')}</span></span>
            <ArtText variant={item.id}>{item.sample}</ArtText>
            <span className="type-specimen__foot">SIX ORIGINS. ONE EXPRESSION.<span aria-hidden="true">✳</span></span>
          </span>
          <span className="type-specimen__caption">
            <span><strong>{item.name}</strong><span className="type-pair">{item.sources.map(source => source.name).join(' × ')}</span><small>{item.note}</small></span>
            <span className="type-specimen__select">{variant === item.id ? <Check size={16} /> : <ArrowUpRight size={17} />}</span>
          </span>
        </button>)}
      </div>
      {!visibleFinishes.length && <div className="type-no-results"><Search size={22} /><p>还没有找到这个字效。</p><button type="button" className="text-button" onClick={() => setQuery('')}>清除搜索 <RotateCcw size={12} /></button></div>}
      <p className="type-collection__hint">选一种表达，写下你的版本。</p>
    </section>
    </details>

    <section ref={studioRef} className="type-studio" aria-labelledby="type-studio-title">
      <div className="type-section-heading">
        <h2 id="type-studio-title">你的文字，你的风格 <span>MAKE IT YOURS</span></h2>
        <button className="text-button" type="button" onClick={reset}><RotateCcw size={13} />恢复默认</button>
      </div>
      <div className="type-workbench">
        <div className="type-canvas" data-background={background} data-finish={variant}>
          <div className="type-canvas__top"><span><span className="type-live-dot" />实时预览</span><span>{finish.sources.length ? finish.sources.map(source => source.name).join(' × ') : 'MOONLIT SILVER / 月白银'}</span></div>
          <div className="type-canvas__art" role="region" aria-label="艺术字实时预览">
            {text ? <ArtText variant={variant} color={colors[0]} secondaryColor={colors[1]}
              fontSize={fontSize} letterSpacing={`${tracking}em`} animated={animated && canAnimate}>{text}</ArtText>
              : <span className="type-canvas__empty">写下几个字，看看会发生什么。</span>}
          </div>
          <div className="type-canvas__bottom">
            <span>{finish.name} <span className="type-canvas__divider">/</span> {fontSize} PX</span>
            <div role="group" aria-label="预览画布背景" className="type-backgrounds">
              {[['light', '浅色'], ['dark', '深色'], ['grid', '网格']].map(([value, label]) =>
                <button type="button" key={value} aria-label={`${label}画布`} aria-pressed={background === value}
                  onClick={() => setBackground(value)}><span data-color={value} />{label}</button>)}
            </div>
          </div>
        </div>
        <div className="type-controls">
          <div className="type-controls__title"><Type size={15} /><strong>字形调音台</strong><span>PLAYGROUND</span></div>
          <Input ref={inputRef} label="预览文字" value={text} maxLength={40} placeholder="写下你的灵感…" onChange={event => setText(event.target.value)} />
          <div className="type-style-picker" role="group" aria-label="切换艺术字样式">
            {finishes.map(item => <button key={item.id} type="button" aria-pressed={variant === item.id}
              onClick={() => chooseStyle(item.id)}>{item.name}</button>)}
          </div>
          <Slider label="字号" value={fontSize} min={32} max={144} onValueChange={setFontSize} formatValue={value => `${value} px`} />
          <Slider label="字距" value={tracking} min={-.08} max={.16} step={.01} onValueChange={setTracking} formatValue={value => `${value.toFixed(2)} em`} />
          <div className="type-colors">
            <label>主色<input type="color" aria-label="艺术字主色" value={colors[0]} onChange={event => setColors([event.target.value, colors[1]])} /><code>{colors[0]}</code></label>
            <label>辅色<input type="color" aria-label="艺术字辅色" value={colors[1]} onChange={event => setColors([colors[0], event.target.value])} /><code>{colors[1]}</code></label>
          </div>
          <div className="type-motion"><span>{finish.motion ?? '静态字形效果'}</span><Switch aria-label="启用字效动画" checked={animated && canAnimate} disabled={!canAnimate} onCheckedChange={setAnimated} /></div>
          <Button className="type-copy" onClick={copyCode}>{copyState === 'done' ? <Check size={14} /> : <Copy size={14} />}{copyState === 'done' ? '已复制 React 代码' : '复制 React 代码'}<ArrowUpRight size={14} /></Button>
          <span className="sr-only" role="status" aria-label="代码复制状态">{copyState === 'done' ? '代码已复制' : copyState === 'error' ? '复制失败，请在下方选中代码并手动复制。' : ''}</span>
        </div>
      </div>
      {finish.sources.length > 0 && <details className="type-lineage">
        <summary>查看「{finish.name}」的融合来源</summary>
        <div className="type-lineage__grid">{finish.sources.map(source => <div key={source.id}>
          <strong>{source.name}</strong><span>{source.originals.map(origin => origin.name).join(' × ')}</span>
        </div>)}</div>
      </details>}
      <div className="type-code">
        <button type="button" aria-expanded={showCode} aria-controls="art-text-code" onClick={() => setShowCode(!showCode)}><Code2 size={15} />查看当前代码<span>{showCode ? '收起 −' : '展开 +'}</span></button>
        {showCode && <div id="art-text-code">
          {copyState === 'error' && <p>复制失败，请选中下方代码，使用 Ctrl / Cmd + C 手动复制。</p>}
          <pre tabIndex={0} aria-label="当前艺术字 React 代码"><code>{code}</code></pre>
        </div>}
      </div>
      <div className="type-studio__note"><span>字效可直接带入标题、海报和品牌页面。字体按本机可用字体回退。</span><a href="#component/ArtText">查看 ArtText API <ArrowUpRight size={13} /></a></div>
    </section>
    </details>
    <div className="type-signoff"><span aria-hidden="true" style={{ '--type-turn': '-8deg' } as CSSProperties}>Aa</span><p>写得慢一点，留一点自己的痕迹。<small>EVERY LINE HAS ITS OWN PACE.</small></p><span aria-hidden="true">✳</span></div>
  </div>;
}
