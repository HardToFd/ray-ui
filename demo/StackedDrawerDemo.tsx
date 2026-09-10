import { useState } from 'react';
import { ArrowDownLeft, ArrowRight, Asterisk, Check, ChevronRight, FileCheck2, Layers, Palette } from 'lucide-react';
import { Badge, Button, Input, StackedDrawer, Switch } from '../src';
import './stacked-drawer.css';

export function StackedDrawerDemo({ expanded = false }: { expanded?: boolean }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('下一个好点子');
  const [notify, setNotify] = useState(true);
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className={`drawer-demo${expanded ? ' drawer-demo--expanded' : ''}`}>
      <div className="drawer-demo__deck" aria-hidden="true">
        <div className="drawer-demo__sample drawer-demo__sample--back"><span>03</span><FileCheck2 size={14} /></div>
        <div className="drawer-demo__sample drawer-demo__sample--middle"><span>02</span><Palette size={14} /></div>
        <div className="drawer-demo__sample drawer-demo__sample--front">
          <div><span className="drawer-demo__symbol"><Asterisk size={25} /></span><span className="drawer-demo__sample-number">01 / 03</span></div>
          <strong>好想法，层层展开。</strong>
          <span className="drawer-demo__sample-line" />
          <span className="drawer-demo__sample-line drawer-demo__sample-line--short" />
          <span className="drawer-demo__sample-bottom">从一个小小的开始<ArrowDownLeft size={15} /></span>
        </div>
      </div>
      <div className="drawer-demo__intro">
        {expanded && <><span className="drawer-demo__eyebrow">A LITTLE MORE TO DISCOVER</span><h3>深入一层，<br />灵感不必离场。</h3><p>让新内容轻轻叠上来。<br />保留来时的线索，随时回到上一层。</p></>}
        <StackedDrawer
          open={open}
          onOpenChange={setOpen}
          trigger={<Button variant={expanded ? 'primary' : 'outline'}><Layers size={15} />打开卡片抽屉<ArrowRight size={14} /></Button>}
          title="下一个好点子"
          description="每一个值得实现的想法，都从这里开始。"
          footer={<div className="drawer-demo__footer"><span><span className="status-dot" />本地交互演示</span><Button variant="outline" onClick={() => setOpen(false)}>完成浏览<Check size={14} /></Button></div>}
        >
          <div className="drawer-demo__project">
            <span className="drawer-demo__project-icon"><Asterisk size={42} strokeWidth={1.4} /></span>
            <Badge variant="success">灵感进行时</Badge>
            <h3>把日常里的小灵感，<br />搭成喜欢的样子。</h3>
            <p>一个属于自己的设计空间。<br />从命名到细节，慢慢打磨下一份作品。</p>
          </div>
          <div className="drawer-demo__section-label"><span>继续探索</span><span>01 → 02</span></div>
          <StackedDrawer
            trigger={<button type="button" className="drawer-demo__link"><span className="drawer-demo__link-icon"><Palette size={20} /></span><span><strong>设计细节</strong><small>给灵感一个名字，设定你的偏好</small></span><ChevronRight size={17} /></button>}
            title="让细节，更像你"
            description="新卡片叠在上方，项目概览仍然留在身后。"
            footer={<span className="drawer-demo__footnote">修改会在本次演示中保留，无需急着决定。</span>}
          >
            <div className="drawer-demo__fields">
              <Input label="作品名称" value={name} onChange={(event) => { setName(event.target.value); setConfirmed(false); }} maxLength={60} hint="一个好名字，是作品的第一句话。" />
              <div className="drawer-demo__preference"><div><strong>接收灵感提醒</strong><p>不错过每一次好点子的到来</p></div><Switch checked={notify} onCheckedChange={(next) => { setNotify(next); setConfirmed(false); }} aria-label="接收灵感提醒" /></div>
              <div className="drawer-demo__palette" aria-label="演示配色：陶土橙、奶油白、鼠尾草绿"><span /><span /><span /><div><strong>温暖，自有分寸。</strong><small>陶土 · 奶油 · 鼠尾草</small></div></div>
            </div>
            <div className="drawer-demo__section-label"><span>准备好下一步</span><span>02 → 03</span></div>
            <StackedDrawer
              trigger={<button type="button" className="drawer-demo__link"><span className="drawer-demo__link-icon"><FileCheck2 size={20} /></span><span><strong>查看准备清单</strong><small>再深入一层，看看一切是否就绪</small></span><ChevronRight size={17} /></button>}
              title="一切就绪，可以出发"
              description="三张卡片，一个连贯的过程。随时返回，想法依然在。"
              footer={<Button className="drawer-demo__confirm" onClick={() => setConfirmed(true)} disabled={confirmed}><Check size={15} />{confirmed ? '已确认，准备开始' : '确认这份灵感'}</Button>}
            >
              <div className="drawer-demo__ready-icon"><Check size={32} strokeWidth={1.5} /></div>
              <div className="drawer-demo__checklist">
                <div><Check size={16} /><span>作品名称<strong>{name.trim() || '尚未命名'}</strong></span></div>
                <div><Check size={16} /><span>灵感提醒<strong>{notify ? '已开启' : '已关闭'}</strong></span></div>
                <div><Check size={16} /><span>你的设计空间<strong>准备就绪</strong></span></div>
              </div>
              <p className="drawer-demo__confirmation" role="status">{confirmed ? '这份灵感已在当前页面确认。返回上一层，还能继续完善。' : '不必一次想好所有细节。先开始，再慢慢让它变好。'}</p>
            </StackedDrawer>
          </StackedDrawer>
        </StackedDrawer>
        {expanded && <span className="drawer-demo__hint"><kbd>Esc</kbd> 逐层返回<span>·</span>点击遮罩收起当前层</span>}
      </div>
    </div>
  );
}
