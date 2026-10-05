import { useId, useState } from 'react';
import { CompareSlider, SegmentedControl } from '../src';
import './new-components-demo.css';

function Landscape({ sketch = false }: { sketch?: boolean }) {
  const id = useId();
  return <svg viewBox="0 0 720 440" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id={`${id}-sky`} x2="0" y2="1"><stop stopColor="#d0dbd4" /><stop offset="1" stopColor="#f4d6ae" /></linearGradient>
      <linearGradient id={`${id}-water`} x2="0" y2="1"><stop stopColor="#709389" /><stop offset="1" stopColor="#233e39" /></linearGradient>
      <pattern id={`${id}-grid`} width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0v24" fill="none" stroke="#c7c9be" strokeWidth=".6" /></pattern></defs>
    <rect width="720" height="440" fill={sketch ? '#eeece2' : `url(#${id}-sky)`} />
    {sketch && <rect width="720" height="440" fill={`url(#${id}-grid)`} />}
    <circle cx="465" cy="115" r="49" fill={sketch ? '#e5e3d9' : '#ed9465'} stroke={sketch ? '#7b8274' : 'none'} />
    <g fill="none" stroke={sketch ? '#9b9d90' : '#fff5e0'} strokeWidth="1" opacity=".7"><path d="M52 107h172m-144 7h90m335 45h132m-97 7h135" /><circle cx="465" cy="115" r="60" strokeDasharray="2 6" /></g>
    <path d="M0 250 122 135 249 248 348 154 464 266 593 144 720 238V440H0Z" fill={sketch ? '#e2e1d5' : '#94a79a'} stroke={sketch ? '#7b8274' : 'none'} />
    <path d="m0 279 116-82 75 93 180-63 108 75 136-86 105 63v161H0Z" fill={sketch ? '#d2d4c5' : '#597f74'} stroke={sketch ? '#7b8274' : 'none'} />
    <path d="M0 317q175-62 352 1t368-5v127H0Z" fill={sketch ? '#eae9dc' : `url(#${id}-water)`} stroke={sketch ? '#7b8274' : 'none'} />
    <g stroke={sketch ? '#969f8e' : '#abc0a8'} strokeWidth="1" opacity=".55"><path d="M242 347h252m-226 14h160m-34 16h185m-290 20h195m-80 14h215m-60-77h129" /></g>
    <path d="M0 340q72-18 149 39l72 61H0Zm720-12q-52 16-157 112h157Z" fill={sketch ? '#b8bfae' : '#294d42'} stroke={sketch ? '#7b8274' : 'none'} />
    <g fill={sketch ? '#8c9986' : '#183b32'}>{[40, 78, 116, 638, 680].map((x, i) => <path key={x} d={`M${x} ${243 + i * 7}l-26 75h14l-24 47h31v42h10v-42h30l-24-47h14Z`} />)}</g>
    <text x="30" y="408" fill={sketch ? '#6c7867' : '#dae4d4'} fontFamily="monospace" fontSize="11" letterSpacing="3">SILENT VALLEY / 036</text>
    {sketch && <g stroke="#7b8274" strokeWidth=".8"><path d="M345 40v16m-8-8h16M345 390v16m-8-8h16" /><path d="M465 42v146m-73-73h146" strokeDasharray="3 5" opacity=".5" /></g>}
  </svg>;
}

export function CompareSliderDemo({ expanded = false }: { expanded?: boolean }) {
  const [value, setValue] = useState(46);
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  return <div className={`compare-demo${expanded ? ' new-demo--expanded' : ''}`}>
    {expanded && <div className="new-demo-heading"><div><small>01 / A CHANGE OF SCENERY</small><h3>同一片山谷，两种风景。</h3></div><span className="new-demo-index">↔</span></div>}
    <CompareSlider before={<Landscape sketch />} after={<Landscape />} beforeLabel="原始线稿" afterLabel="暮色上色"
      label="山谷插画前后对比" value={value} onValueChange={setValue} orientation={orientation} />
    {expanded && <div className="compare-demo__footer"><div><strong>{String(value).padStart(2, '0')}<small> / 100</small></strong><span>拖动分界，发现变化</span></div>
      <SegmentedControl aria-label="对比方向" size="sm" options={[{ value: 'horizontal', label: '左右' }, { value: 'vertical', label: '上下' }]} value={orientation} onValueChange={(next) => setOrientation(next as typeof orientation)} />
    </div>}
  </div>;
}
