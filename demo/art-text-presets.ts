import type { ArtTextVariant } from '../src';

interface ArtTextOrigin { id: string; name: string }
interface ArtTextSource extends ArtTextOrigin { originals: [ArtTextOrigin, ArtTextOrigin] }
interface ArtTextFinish {
  id: ArtTextVariant;
  name: string;
  english: string;
  sample: string;
  note: string;
  colors: [string, string];
  sources: ArtTextSource[];
  dark?: boolean;
  motion?: string;
}

const prior: Record<string, ArtTextSource> = {
  light: { id: 'gradient-prism', name: '流光棱镜', originals: [{ id: 'gradient', name: '流光渐变' }, { id: 'prism', name: '棱镜虹彩' }] },
  metal: { id: 'chrome-foil', name: '鎏金液铬', originals: [{ id: 'chrome', name: '液态铬' }, { id: 'foil', name: '鎏金箔面' }] },
  glow: { id: 'neon-fire', name: '焰色霓虹', originals: [{ id: 'neon', name: '霓虹灯管' }, { id: 'fire', name: '余烬微光' }] },
  shadow: { id: 'retro-shadow', name: '复古长影', originals: [{ id: 'retro', name: '复古叠印' }, { id: 'long-shadow', name: '几何长影' }] },
  ink: { id: 'editorial-ink', name: '墨韵衬线', originals: [{ id: 'editorial', name: '典雅衬线' }, { id: 'ink', name: '东方墨韵' }] },
  print: { id: 'emboss-halftone', name: '网点压印', originals: [{ id: 'emboss', name: '纸张压印' }, { id: 'halftone', name: '半调网点' }] },
  outline: { id: 'outline-echo', name: '空心回响', originals: [{ id: 'outline', name: '空心描边' }, { id: 'echo', name: '轮廓回声' }] },
  pixel: { id: 'pixel-glitch', name: '故障像素', originals: [{ id: 'pixel', name: '像素点阵' }, { id: 'glitch', name: '信号故障' }] },
  candy: { id: 'candy-stencil', name: '糖纸模板', originals: [{ id: 'stencil', name: '工业模板' }, { id: 'candy', name: '糖果软糖' }] },
};

/** An independent silver study, followed by three earlier fusion experiments. */
export const artTextFinishes: ArtTextFinish[] = [
  {
    id: 'moon-silver', name: '月白银', english: 'MOONLIT SILVER', sample: '月白银',
    note: '舒展的宋体，温润的银色。让光沿着笔画，安静地流动。',
    colors: ['#f2eee7', '#8996a5'], dark: true, motion: '银面柔光缓缓掠过', sources: [],
  },
  {
    id: 'radiant-alloy', name: '幻金流焰', english: 'RADIANT ALLOY', sample: '流光熔金',
    note: '棱镜切面与鎏金镜面相融，边缘留一圈温热的霓虹。', colors: ['#ebd1ac', '#c07d9f'],
    dark: true, motion: '让金属折光缓缓流动', sources: [prior.light, prior.metal, prior.glow],
  },
  {
    id: 'ink-relief', name: '墨版长影', english: 'INK IMPRESSION', sample: '墨有回声',
    note: '厚实墨字压入网点纸面，拖出复古叠印的长影。', colors: ['#455448', '#b6a384'],
    sources: [prior.shadow, prior.ink, prior.print],
  },
  {
    id: 'sugar-echo', name: '像素糖影', english: 'SUGAR SIGNAL', sample: 'SUGAR',
    note: '糖果切面穿过像素色带，空心轮廓在身后轻轻回响。', colors: ['#f1c5df', '#986197'],
    sources: [prior.outline, prior.pixel, prior.candy],
  },
];
