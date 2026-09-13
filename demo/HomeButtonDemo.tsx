import { useEffect, useRef, useState } from 'react';
import { HomeButton, Switch, type HomeButtonProps } from '../src';
import './home-button.css';

const variants = [{ value: 'surface', label: '浅底胶囊' }, { value: 'solid', label: '强调色' }, { value: 'ghost', label: '轻量文字' }] as const;

export function HomeButtonDemo({ expanded = false }: { expanded?: boolean }) {
  const [atHome, setAtHome] = useState(false);
  const [variant, setVariant] = useState<HomeButtonProps['variant']>('surface');
  const [iconOnly, setIconOnly] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousPage = useRef(atHome);
  useEffect(() => {
    if (previousPage.current === atHome) return;
    previousPage.current = atHome;
    headingRef.current?.focus({ preventScroll: true });
  }, [atHome]);
  const returnHome = () => setAtHome(true);
  if (!expanded) return <div className="home-button-demo home-button-demo--compact">
    <span className="home-button-demo__eyebrow">THERE'S NO PLACE LIKE HOME</span>
    <HomeButton href="#components/all" onNavigate={() => setAtHome(true)} />
    <span className="home-button-demo__compact-status" role="status">{atHome ? '已回到首页 · 欢迎回来' : '无论走多远，一键回到起点。'}</span>
    {atHome && <button type="button" className="home-button-demo__reset" onClick={() => setAtHome(false)}>再试一次</button>}
  </div>;

  return <div className="home-button-demo home-button-demo--expanded">
    <div className="home-button-demo__intro"><span className="home-button-demo__eyebrow">A WAY BACK / 回到熟悉的地方</span><h3>首页，一直在这里。</h3><p>一扇小小的门，把你带回所有故事的起点。</p></div>
    <div className="home-button-demo__settings">
      <div className="home-button-demo__segmented" role="group" aria-label="首页按钮样式">{variants.map((item) => <button key={item.value} type="button" aria-pressed={variant === item.value} onClick={() => setVariant(item.value)}>{item.label}</button>)}</div>
      <Switch label="仅显示图标" checked={iconOnly} onCheckedChange={setIconOnly} />
    </div>
    <div className={`home-button-demo__scene${atHome ? ' home-button-demo__scene--home' : ''}`}>
      <div className="home-button-demo__bar"><span><i /><i /><i /></span><span>随行工作室 <b>/</b> {atHome ? '首页' : '灵感笔记'}</span><span>DEMO</span></div>
      <div className="home-button-demo__content">
        <div className="home-button-demo__drawing" aria-hidden="true">
          <div className="home-button-demo__orbit" /><div className="home-button-demo__orbit home-button-demo__orbit--outer" />
          <svg viewBox="0 0 160 130" fill="none"><path className="home-button-demo__path" d="M24 102c16 0 17-20 35-20" strokeDasharray="3 5" /><path className="home-button-demo__house" d="m57 59 35-28 35 28v42H57Z" /><path className="home-button-demo__roof" d="m48 63 44-35 44 35" /><path className="home-button-demo__door" d="M84 101V76h17v25" /><path className="home-button-demo__window" d="M68 66h9v9h-9Z" /><path className="home-button-demo__ground" d="M43 102h96" /><circle className="home-button-demo__sun" cx="132" cy="26" r="6" /></svg>
        </div>
        <span className="home-button-demo__location">{atHome ? 'HOME, SWEET HOME' : 'NOTES / 灵感存档'}</span>
        <h4 ref={headingRef} tabIndex={-1}>{atHome ? '欢迎回来。' : '读完这一页，回家看看。'}</h4>
        <p>{atHome ? '项目、笔记与新的灵感，都在这里等你。' : '回到首页，继续寻找下一个好想法。'}</p>
        <div className="home-button-demo__action">{atHome
          ? <button type="button" className="home-button-demo__continue" onClick={() => setAtHome(false)}>继续探索 <span aria-hidden="true">↗</span></button>
          : <HomeButton href="#components/all" onNavigate={returnHome} variant={variant} iconOnly={iconOnly} size="lg" />}
        </div>
      </div>
      <div className="home-button-demo__scene-footer"><span><i /> {atHome ? '已回到首页' : '你的位置，始终有迹可循'}</span><span>{atHome ? '01 / HOME' : '02 / EXPLORE'}</span></div>
    </div>
    <p className="home-button-demo__note">点击按钮体验回到首页；演示仅切换面板内容。</p>
    <div className="home-button-demo__examples">
      <div><span>01 / TOOLBAR</span><div className="home-button-demo__toolbar"><HomeButton href="#components/all" iconOnly size="sm" onNavigate={returnHome} aria-label="工具栏：回到首页" /><span>工作空间 <b>/</b> 我的笔记</span></div><p>放在工具栏，留一个熟悉的入口。</p></div>
      <div><span>02 / STATES</span><div className="home-button-demo__states"><HomeButton loading size="sm" /><HomeButton disabled iconOnly size="sm" label="首页暂不可用" /></div><p>正在返回与暂不可用，各有反馈。</p></div>
    </div>
    <div className="home-button-demo__real-link"><span>试试真实的首页链接</span><HomeButton href="#components/all" variant="ghost" size="sm" label="返回组件总览" /></div>
  </div>;
}
