import { Activity, ArrowUpRight, Cloud, Users } from 'lucide-react';
import { MetricCard } from '../src';
import './new-components-demo.css';

export function MetricCardDemo({ expanded = false }: { expanded?: boolean }) {
  return <div className={`metric-demo${expanded ? ' new-demo--expanded' : ''}`}>
    {expanded && <div className="new-demo-heading"><div><small>05 / A LITTLE SIGNAL</small><h3>数字，也可以有呼吸。</h3></div><span className="new-demo-index">↗</span></div>}
    <div className="metric-demo__grid">
      <MetricCard label="本周灵感" value="1,280" delta="+18.4%" trend="up" trendLabel="较上周" icon={<ArrowUpRight size={15} />} data={[22, 30, 27, 42, 38, 52, 61]} tone="accent" footer="持续收集，慢慢变多" />
      <MetricCard label="活跃项目" value="24" delta="+4" trend="up" trendLabel="本月新增" icon={<Activity size={15} />} data={[18, 19, 17, 21, 20, 22, 24]} tone="sage" />
      {expanded && <MetricCard label="协作成员" value="86%" delta="-2.1%" trend="down" trendLabel="响应率" icon={<Users size={15} />} data={[82, 85, 88, 86, 89, 87, 86]} tone="amber" footer={<><Cloud size={12} /> 数据刚刚更新</>} />}
    </div>
    {expanded && <div className="metric-demo__caption">迷你折线只负责讲趋势；精确数值和业务语义仍由你的内容决定。</div>}
  </div>;
}

