import { useState } from 'react';
import { ArrowDownRight, Layers3, Timer } from 'lucide-react';
import { Button, FlameGraph, type FlameGraphNode } from '../src';
import './flame-graph.css';

const baseline: FlameGraphNode[] = [{ id: 'main', name: 'app.bootstrap()', value: 1200, children: [
  { id: 'init', name: 'initialize()', value: 140, children: [
    { id: 'config', name: 'readConfig()', value: 35 },
    { id: 'modules', name: 'loadModules()', value: 90, children: [
      { id: 'parse-module', name: 'parseModule()', value: 54 }, { id: 'registry', name: 'initRegistry()', value: 26 },
    ] },
  ] },
  { id: 'render', name: 'renderApp()', value: 720, children: [
    { id: 'fetch', name: 'fetchDashboard()', value: 420, children: [
      { id: 'http', name: 'httpRequest()', value: 180 },
      { id: 'decode', name: 'decodeResponse()', value: 200, children: [
        { id: 'json', name: 'JSON.parse()', value: 165 }, { id: 'normalize', name: 'normalizeData()', value: 28 },
      ] },
    ] },
    { id: 'reconcile', name: 'reconcileChildren()', value: 210, children: [
      { id: 'tree', name: 'buildTree()', value: 110 }, { id: 'diff', name: 'diffProps()', value: 75 },
    ] },
    { id: 'commit', name: 'commitDOM()', value: 65, children: [
      { id: 'layout', name: 'layout()', value: 38 }, { id: 'paint', name: 'paint()', value: 22 },
    ] },
  ] },
  { id: 'hydrate', name: 'hydrate()', value: 240, children: [
    { id: 'listeners', name: 'attachListeners()', value: 70 },
    { id: 'bindings', name: 'resolveBindings()', value: 130, children: [
      { id: 'walk', name: 'walkDOM()', value: 92 }, { id: 'bind', name: 'bindState()', value: 28 },
    ] },
  ] },
  { id: 'cleanup', name: 'cleanup()', value: 60, children: [
    { id: 'effects', name: 'flushEffects()', value: 42 }, { id: 'idle', name: 'scheduleIdle()', value: 12 },
  ] },
] }];
const improvedValues: Record<string, number> = {
  main: 820, init: 100, config: 25, modules: 65, 'parse-module': 38, registry: 18,
  render: 460, fetch: 240, http: 150, decode: 65, json: 38, normalize: 20,
  reconcile: 140, tree: 70, diff: 50, commit: 50, layout: 28, paint: 18,
  hydrate: 180, listeners: 55, bindings: 95, walk: 65, bind: 22,
  cleanup: 45, effects: 30, idle: 9,
};
const optimize = (node: FlameGraphNode): FlameGraphNode => ({ ...node, value: improvedValues[node.id], children: node.children?.map(optimize) });
const optimized = baseline.map(optimize);

export function FlameGraphDemo({ expanded = false }: { expanded?: boolean }) {
  const [improved, setImproved] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [zoom, setZoom] = useState<string | null>(null);
  const data = empty ? [] : improved ? optimized : baseline;
  return <div className={`flame-graph-demo${expanded ? ' flame-graph-demo--expanded' : ''}`}>
    {expanded && <>
      <div className="flame-graph-demo__intro"><div><span>PROFILE / CALL STACK</span><h3>看看时间，花在了哪里。</h3><p>从宽处开始，逐层找到值得优化的调用。</p></div><span className="flame-graph-demo__sample">模拟耗时数据</span></div>
      <div className="flame-graph-demo__stats">
        <div><span><Timer size={13} />总耗时</span><strong>{empty ? '0' : improved ? '820' : '1,200'}<small>ms</small></strong></div>
        <div><span><Layers3 size={13} />调用深度</span><strong>{empty ? '0' : '5'}<small>层</small></strong></div>
        <div><span><ArrowDownRight size={13} />较原始样本减少</span><strong>{empty || !improved ? '—' : '31.7'}<small>{empty || !improved ? '' : '%'}</small></strong></div>
      </div>
      <div className="flame-graph-demo__controls" role="group" aria-label="性能样本">
        <button type="button" aria-pressed={!improved} onClick={() => { setImproved(false); setZoom(null); setEmpty(false); }}>原始样本</button>
        <button type="button" aria-pressed={improved} onClick={() => { setImproved(true); setZoom(null); setEmpty(false); }}>优化后</button>
        <span>页面启动 · 聚合调用栈</span>
      </div>
    </>}
    <FlameGraph data={data} title={expanded ? '页面启动分析' : '调用栈耗时'} value={zoom} onValueChange={setZoom} showSearch={expanded} showDetails={expanded} />
    {expanded && <div className="flame-graph-demo__footer"><span>悬停查看详情 · 点击条块下钻 · Esc 返回上层</span><Button variant="ghost" size="sm" onClick={() => { setEmpty(!empty); setZoom(null); }}>{empty ? '恢复样本' : '查看空状态'}</Button></div>}
  </div>;
}
