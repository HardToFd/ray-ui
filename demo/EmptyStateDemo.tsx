import { Inbox, Plus, SearchX } from 'lucide-react';
import { Button, EmptyState } from '../src';

export function EmptyStateDemo({ expanded = false }: { expanded?: boolean }) {
  return <div style={{ width: expanded ? 440 : 320, maxWidth: '100%' }}>
    <EmptyState icon={expanded ? <SearchX size={20} /> : <Inbox size={20} />} title={expanded ? '没有匹配的灵感' : '收件箱是空的'} description={expanded ? '换个关键词试试，或者清除筛选条件。' : '新的消息会出现在这里。'} tone={expanded ? 'accent' : 'neutral'} size={expanded ? 'md' : 'sm'} action={expanded && <Button size="sm"><Plus size={14} /> 新建灵感</Button>} />
  </div>;
}
