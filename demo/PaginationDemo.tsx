import { useState } from 'react';
import { Pagination, Switch } from '../src';
import './pagination.css';

const titles = ['留一点空间给灵感', '收集城市里的颜色', '一次安静的界面探索', '把日常写成一页笔记', '周末，去看新的风景', '从一个小小的想法开始', '让细节慢慢成形', '给下次出发留个位置'];
const categories = ['设计', '生活', '随笔'];
const records = Array.from({ length: 96 }, (_, index) => ({ id: index + 1, title: titles[index % titles.length], category: categories[index % categories.length], date: `09.${String(28 - Math.floor(index / 4)).padStart(2, '0')}` }));

export function PaginationDemo({ expanded = false }: { expanded?: boolean }) {
  const [page, setPage] = useState(expanded ? 4 : 2);
  const [pageSize, setPageSize] = useState(6);
  const [filter, setFilter] = useState('全部');
  const [compact, setCompact] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const filtered = filter === '全部' ? records : records.filter((item) => item.category === filter);
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const changePage = (next: number, nextSize: number) => { setPage(next); setPageSize(nextSize); };

  if (!expanded) return <div className="pagination-demo pagination-demo--compact">
    <div className="pagination-demo__mini-title"><span>灵感档案</span><span>96 NOTES</span></div>
    <div className="pagination-demo__mini-list">{visible.slice(0, 2).map((item) => <div key={item.id}><span>{String(item.id).padStart(2, '0')}</span><span>{item.title}</span><i /></div>)}</div>
    <Pagination total={96} page={page} pageSize={6} onPageChange={setPage} size="sm" aria-label="档案预览分页" />
  </div>;

  return <div className="pagination-demo pagination-demo--expanded">
    <div className="pagination-demo__intro"><span>ONE PAGE AT A TIME / 慢慢翻阅</span><h3>好内容，值得一页页看。</h3><p>在一组页码之间，找到下一份灵感。</p></div>
    <div className="pagination-demo__settings"><div className="pagination-demo__segmented" role="group" aria-label="分页样式">
      <button type="button" aria-pressed={!compact} onClick={() => setCompact(false)}>完整页码</button>
      <button type="button" aria-pressed={compact} onClick={() => setCompact(true)}>紧凑模式</button>
    </div><Switch label="禁用分页" checked={disabled} onCheckedChange={setDisabled} /></div>
    <div className="pagination-demo__archive">
      <div className="pagination-demo__archive-heading"><div><span>THE NOTEBOOK</span><h4>灵感档案<span>{filtered.length}</span></h4></div><span className="pagination-demo__issue">VOL. 09 / 2026</span></div>
      <div className="pagination-demo__filters" role="group" aria-label="笔记分类">{['全部', ...categories].map((item) => <button type="button" key={item} aria-pressed={filter === item} onClick={() => { setFilter(item); setPage(1); }}>{item}</button>)}</div>
      <div className="pagination-demo__list" role="region" aria-label="当前页笔记" tabIndex={0}>
        {visible.map((item) => <article key={item.id}><span className="pagination-demo__number">{String(item.id).padStart(2, '0')}</span><div><h5>{item.title}</h5><span>{item.category} · 灵感笔记</span></div><span className="pagination-demo__date">{item.date}</span><span className="pagination-demo__arrow" aria-hidden="true">↗</span></article>)}
      </div>
      <div className="pagination-demo__pagination"><Pagination total={filtered.length} page={page} pageSize={pageSize} onPageChange={changePage} pageSizeOptions={[6, 12, 24]} showTotal showSizeChanger showQuickJumper variant={compact ? 'compact' : 'default'} disabled={disabled} aria-label="灵感档案分页" /></div>
    </div>
    <div className="pagination-demo__footer"><span><i /> 点击页码翻阅，或输入页数直接前往</span><span>96 条本地演示笔记</span></div>
    <div className="pagination-demo__examples">
      <div><span>01 / COMPACT</span><Pagination total={filtered.length} page={page} pageSize={pageSize} onPageChange={changePage} variant="compact" size="sm" disabled={disabled} aria-label="紧凑分页示例" /><p>收起页码，让小空间也好翻阅。</p></div>
      <div><span>02 / EMPTY</span><Pagination total={0} size="sm" showTotal aria-label="空数据分页示例" /><p>没有数据时，清楚地停在这里。</p></div>
    </div>
  </div>;
}
