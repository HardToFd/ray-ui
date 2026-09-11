import { useState } from 'react';
import { Download } from 'lucide-react';
import { DownloadButton } from '../src';

export function DownloadButtonDemo({ expanded = false }: { expanded?: boolean }) {
  const [status, setStatus] = useState('保存一份灵感，随时继续。');
  return <div style={{ display: 'grid', justifyItems: 'center', gap: 16 }}>
    <DownloadButton filename="ray-ui-notes.txt" data="Ray UI 灵感笔记\r\n\r\n从一个小想法，开始下一次创作。\r\n" icon={<Download size={16} />} onDownload={() => setStatus('已请求下载，请查看浏览器下载记录。')} onError={() => setStatus('下载未能启动，请重试。')}>下载文件</DownloadButton>
    {expanded && <div className="preview-row">
      <DownloadButton filename="ray-ui-example.json" data={JSON.stringify({ name: 'Ray UI', type: 'demo' }, null, 2)} mimeType="application/json" variant="outline" icon={<Download size={15} />}>下载 JSON</DownloadButton>
      <DownloadButton filename="unavailable.txt" data="" disabled variant="secondary">暂无文件</DownloadButton>
    </div>}
    <span role="status" style={{ fontSize: 12, color: 'var(--ray-muted)', textAlign: 'center' }}>{status}</span>
  </div>;
}
