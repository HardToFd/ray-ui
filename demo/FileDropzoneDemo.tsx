import { useState } from 'react';
import { Button, FileDropzone, Switch } from '../src';
import './new-components-demo.css';

export function FileDropzoneDemo({ expanded = false }: { expanded?: boolean }) {
  const [files, setFiles] = useState<File[]>([]);
  const [disabled, setDisabled] = useState(false);
  return <div className={`dropzone-demo${expanded ? ' new-demo--expanded' : ''}`}>
    {expanded && <div className="new-demo-heading"><div><small>02 / ROOM FOR YOUR IDEAS</small><h3>灵感，轻轻放进来。</h3></div><span className="new-demo-index">↗</span></div>}
    <FileDropzone value={files} onValueChange={setFiles} disabled={disabled} accept="image/*,.pdf" maxFiles={3} maxSize={5 * 1024 * 1024}
      size={expanded ? 'md' : 'sm'} title="放下你的下一份灵感" description={expanded ? '图片或 PDF · 最多 3 个 · 每个不超过 5 MB' : '图片 / PDF · 拖入或选择'} />
    {expanded && <><div className="dropzone-demo__toolbar"><Button size="sm" variant="ghost" disabled={disabled} onClick={() => {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80" fill="#df5a31"/><circle cx="60" cy="40" r="24" fill="#fff0d5"/></svg>';
      setFiles([new File([svg], 'moodboard.svg', { type: 'image/svg+xml', lastModified: 0 }), new File([svg.replace('#df5a31', '#597f74')], 'palette.svg', { type: 'image/svg+xml', lastModified: 0 })]);
    }}>试用示例文件</Button><Switch label="禁用选择" checked={disabled} onCheckedChange={setDisabled} /></div>
      <p className="new-demo-note">文件只保留在当前页面，刷新即清空。此示例不会上传文件。</p></>}
  </div>;
}
