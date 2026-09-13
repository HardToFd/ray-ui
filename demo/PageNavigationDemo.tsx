import { useEffect, useState } from 'react';
import { PageNavigation, Switch } from '../src';
import './page-navigation.css';

const notes = [
  { title: '走进山间', tag: 'THE QUIET TRAIL', color: 'sage', subtitle: '把步子放慢，风景就在身边。', paragraphs: ['清晨出发的时候，山路上还留着昨夜的雨。树叶间的光落下来，一小片一小片，像路途中的标记。', '不必每一步都奔向目的地。偶尔停下来，看远处的轮廓慢慢清晰，听风经过松树的声音。', '带上一本轻薄的笔记，记下遇见的颜色、气味和那些突然想到的小事。留一点空白，给下一次出发。'] },
  { title: '在日常里漫游', tag: 'A LITTLE WANDER', color: 'clay', subtitle: '向前探索，也随时可以回望。', paragraphs: ['熟悉的街道，也藏着还没发现的小路。转过一个街角，走进一间常常路过的书店，给今天留下一点不同。', '那些值得记住的片刻，往往不需要很远的旅程。一杯刚好的咖啡，一束落在桌面的阳光，一段读到一半的故事。', '走得再远，也可以轻轻一点，回到最初的地方。方向始终在手边，而注意力，留给眼前的内容。'] },
  { title: '等一场海风', tag: 'BY THE WATER', color: 'blue', subtitle: '这一页的尽头，是下一次出发。', paragraphs: ['午后的海面很安静，浅浅的蓝一直延伸到天边。坐在岸边，什么也不做，让时间顺着潮汐慢慢流动。', '翻到最后一页，不一定意味着结束。往回看一看，也许会发现刚才没留意的句子和不一样的风景。', '把喜欢的片刻收好。下次想起这阵风的时候，重新打开这一页，让故事从这里继续。'] },
];

export function PageNavigationDemo({ expanded = false }: { expanded?: boolean }) {
  const [page, setPage] = useState(1);
  const [scrollTarget, setScrollTarget] = useState<HTMLDivElement | null>(null);
  const [vertical, setVertical] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const note = notes[page];
  useEffect(() => { scrollTarget?.scrollTo({ top: 0, behavior: 'instant' }); }, [page, scrollTarget]);
  const navigation = {
    scrollTarget, canGoBack: page > 0, canGoForward: page < notes.length - 1,
    onBack: () => setPage((value) => Math.max(0, value - 1)),
    onForward: () => setPage((value) => Math.min(notes.length - 1, value + 1)),
  };

  if (!expanded) return <div className="page-navigation-demo page-navigation-demo--compact">
    <div className="page-navigation-demo__mini" ref={setScrollTarget} tabIndex={0} role="region" aria-label="随行笔记预览">
      <div><span>随行笔记 <b>0{page + 1} / 03</b></span><strong aria-live="polite">{note.title}</strong><p>{note.subtitle}</p><p>{note.paragraphs[0]}</p></div>
    </div>
    <PageNavigation {...navigation} size="sm" />
    <span className="page-navigation-demo__hint">前后翻页 · 滚动笔记后回顶</span>
  </div>;

  return <div className="page-navigation-demo page-navigation-demo--expanded">
    <div className="page-navigation-demo__intro"><span>ALWAYS WITHIN REACH / 随行导航</span><h3>走到哪里，都有方向。</h3><p>前进一步，回看一页，或回到故事的开头。</p></div>
    <div className="page-navigation-demo__settings">
      <div className="page-navigation-demo__segmented" role="group" aria-label="导航排列">
        <button type="button" aria-pressed={!vertical} onClick={() => setVertical(false)}>横向胶囊</button>
        <button type="button" aria-pressed={vertical} onClick={() => setVertical(true)}>纵向浮条</button>
      </div>
      <Switch label="显示文字" checked={showLabels} onCheckedChange={setShowLabels} />
    </div>
    <div className={`page-navigation-demo__reader page-navigation-demo__reader--${note.color}${vertical ? ' page-navigation-demo__reader--vertical' : ''}${showLabels ? ' page-navigation-demo__reader--labeled' : ''}`}>
      <div className="page-navigation-demo__reader-bar"><span><i /> 随行笔记</span><span aria-live="polite">0{page + 1}<em> / 03</em></span></div>
      <div className="page-navigation-demo__viewport ray-scrollbar" ref={setScrollTarget} tabIndex={0} role="region" aria-label="随行笔记阅读区域">
        <article className="page-navigation-demo__article">
          <span className="page-navigation-demo__tag">{note.tag}</span>
          <h4>{note.title}</h4><p className="page-navigation-demo__subtitle">{note.subtitle}</p>
          <div className="page-navigation-demo__landscape" aria-hidden="true"><span /><i /><b /></div>
          {note.paragraphs.map((paragraph, index) => <section key={index}><span>0{index + 1}</span><p>{paragraph}</p></section>)}
          <div className="page-navigation-demo__end">这一页，读完了。<span>回看上一页，或回到顶部再读一遍。</span></div>
        </article>
      </div>
      <div className="page-navigation-demo__dock"><PageNavigation {...navigation} orientation={vertical ? 'vertical' : 'horizontal'} showLabels={showLabels} /></div>
    </div>
    <div className="page-navigation-demo__footer"><span><i /> 在笔记内向下滚动，查看回顶进度环</span><span>前后按钮切换 3 篇笔记</span></div>
    <div className="page-navigation-demo__variants">
      <div><span>01 / COMPACT</span><PageNavigation {...navigation} size="sm" aria-label="紧凑导航示例" /><p>紧凑尺寸，放进工具栏。</p></div>
      <div><span>02 / WITH LABELS</span><PageNavigation {...navigation} showLabels size="sm" aria-label="文字导航示例" /><p>加上文字，方向更清楚。</p></div>
    </div>
  </div>;
}
