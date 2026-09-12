import { useState } from 'react';
import { Carousel, Switch } from '../src';
import './carousel.css';

const scenes = [
  { id: 'hills', label: '山间的清晨', subtitle: '让视线，走得远一点。', sky: '#dbe8e1', sun: '#f5dfaa', back: '#9eb7a3', front: '#526b58' },
  { id: 'dunes', label: '落日与沙丘', subtitle: '把一天，交给温柔的落日。', sky: '#efddcd', sun: '#eaa774', back: '#c8a48a', front: '#8a624c' },
  { id: 'coast', label: '海边的片刻', subtitle: '听一听，风经过的声音。', sky: '#d9e4eb', sun: '#f7eacb', back: '#9db7c4', front: '#506f80' },
];

export function CarouselDemo({ expanded = false }: { expanded?: boolean }) {
  const [autoPlay, setAutoPlay] = useState(false);
  return <div className={`carousel-demo${expanded ? ' carousel-demo--expanded' : ''}`}>
    {expanded && <div className="carousel-demo__intro"><span>POSTCARDS / 日常之外</span><h3>去看一点，不一样的风景。</h3><p>三张风景明信片，留一刻给自己。</p></div>}
    <Carousel aria-label="风景明信片" autoPlay={autoPlay} items={scenes.map((scene, index) => ({
      id: scene.id, label: scene.label,
      content: <div className="carousel-demo__scene">
        <svg viewBox="0 0 800 480" role="img" aria-label={scene.label}>
          <rect width="800" height="480" fill={scene.sky} />
          <circle cx={580 - index * 100} cy="135" r="52" fill={scene.sun} />
          <path d="M0 305 Q130 120 290 270 T580 245 T800 230 V480 H0Z" fill={scene.back} />
          <path d="M0 350 Q200 220 390 355 T800 295 V480 H0Z" fill={scene.front} />
        </svg>
        <div className="carousel-demo__caption"><span>0{index + 1} / SLOW MOMENTS</span><h4>{scene.label}</h4><p>{scene.subtitle}</p></div>
      </div>,
    }))} />
    {expanded && <div className="carousel-demo__footer"><span>← → 键盘切换 · 支持触摸滑动</span><Switch label="自动播放" checked={autoPlay} onCheckedChange={setAutoPlay} /></div>}
  </div>;
}
