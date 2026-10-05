import { forwardRef, useId, useRef, useState, type DragEvent, type HTMLAttributes, type ReactNode } from 'react';

export type FileRejectionCode = 'file-type' | 'file-size' | 'file-count' | 'duplicate';
export interface FileRejection { file: File; code: FileRejectionCode; message: string }
export interface FileDropzoneProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title' | 'defaultValue' | 'onChange'> {
  value?: readonly File[];
  defaultValue?: readonly File[];
  onValueChange?: (files: File[]) => void;
  onReject?: (rejections: FileRejection[]) => void;
  /** Comma-separated extensions, MIME types or MIME wildcards, like image/*,.pdf. */
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  /** Per-file limit in bytes. */
  maxSize?: number;
  disabled?: boolean;
  title?: ReactNode;
  description?: ReactNode;
  browseLabel?: string;
  size?: 'sm' | 'md';
}

function bytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
function accepts(file: File, accept: string) {
  const rules = accept.split(',').map((rule) => rule.trim().toLowerCase()).filter(Boolean);
  const type = file.type.toLowerCase();
  return !rules.length || rules.some((rule) => rule.startsWith('.') ? file.name.toLowerCase().endsWith(rule)
    : rule.endsWith('/*') ? type.startsWith(rule.slice(0, -1)) : type === rule);
}
const sameFile = (a: File, b: File) => a.name === b.name && a.size === b.size && a.lastModified === b.lastModified && a.type === b.type;
const isFileDrag = (event: DragEvent) => Array.from(event.dataTransfer.types).includes('Files') || event.dataTransfer.files.length > 0;

export const FileDropzone = forwardRef<HTMLDivElement, FileDropzoneProps>(function FileDropzone({
  value, defaultValue = [], onValueChange, onReject, accept = '', multiple = true, maxFiles = 5,
  maxSize = 10 * 1024 * 1024, disabled = false, title = '把文件放在这里', description,
  browseLabel = '选择文件', size = 'md', className = '', ...props
}, ref) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const browse = useRef<HTMLButtonElement>(null);
  const depth = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [local, setLocal] = useState<readonly File[]>(defaultValue);
  const [rejections, setRejections] = useState<FileRejection[]>([]);
  const [announcement, setAnnouncement] = useState('');
  const files = value ?? local;
  const countLimit = multiple ? (Number.isFinite(maxFiles) ? Math.max(1, Math.floor(maxFiles)) : 5) : 1;
  const sizeLimit = Number.isFinite(maxSize) ? Math.max(0, maxSize) : 10 * 1024 * 1024;
  const update = (next: File[]) => {
    if (value === undefined) setLocal(next);
    onValueChange?.(next);
  };
  const select = (incoming: File[]) => {
    if (disabled || !incoming.length) return;
    const next = multiple ? [...files] : [];
    const rejected: FileRejection[] = [];
    let added = 0;
    for (const file of incoming) {
      let code: FileRejectionCode | undefined;
      let message = '';
      if (!accepts(file, accept)) { code = 'file-type'; message = '文件格式不符合要求'; }
      else if (file.size > sizeLimit) { code = 'file-size'; message = `文件超过 ${bytes(sizeLimit)}`; }
      else if (next.some((entry) => sameFile(entry, file))) { code = 'duplicate'; message = '已选择此文件'; }
      else if (next.length >= countLimit) { code = 'file-count'; message = `最多选择 ${countLimit} 个文件`; }
      if (code) rejected.push({ file, code, message });
      else { next.push(file); added++; }
    }
    setRejections(rejected);
    setAnnouncement(`已接收 ${added} 个文件${rejected.length ? `，${rejected.length} 个文件未接收` : ''}`);
    if (added) update(next);
    if (rejected.length) onReject?.(rejected);
  };
  return <div {...props} ref={ref} className={`ray-file-dropzone ${className}`} data-size={size} data-disabled={disabled || undefined}>
    <div className="ray-file-dropzone__zone" data-dragging={!disabled && dragging || undefined}
      onDragEnter={(event) => {
        if (!isFileDrag(event)) return;
        event.preventDefault();
        if (!disabled) { depth.current++; setDragging(true); }
      }}
      onDragOver={(event) => {
        if (!isFileDrag(event)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = disabled ? 'none' : 'copy';
      }}
      onDragLeave={() => {
        depth.current = Math.max(0, depth.current - 1);
        if (!depth.current) setDragging(false);
      }}
      onDrop={(event) => {
        if (!isFileDrag(event)) return;
        event.preventDefault();
        depth.current = 0;
        setDragging(false);
        select(Array.from(event.dataTransfer.files));
      }}>
      <div className="ray-file-dropzone__art" aria-hidden="true"><span /><span /><span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 16V5m-4 4 4-4 4 4M5 15v4a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4" /></svg>
      </span></div>
      <strong className="ray-file-dropzone__title">{dragging && !disabled ? '松开，接住你的文件' : title}</strong>
      <div className="ray-file-dropzone__description" id={`${id}-description`}>{description ?? `最多 ${countLimit} 个文件 · 每个不超过 ${bytes(sizeLimit)}${accept ? ` · ${accept}` : ''}`}</div>
      <input ref={input} type="file" hidden accept={accept} multiple={multiple} disabled={disabled} aria-label={browseLabel}
        onChange={(event) => { select(Array.from(event.currentTarget.files ?? [])); event.currentTarget.value = ''; }} />
      <button ref={browse} type="button" className="ray-file-dropzone__browse" disabled={disabled} aria-describedby={`${id}-description`} onClick={() => input.current?.click()}>{browseLabel}<span aria-hidden="true">↗</span></button>
    </div>
    {files.length > 0 && <ul className="ray-file-dropzone__files" aria-label="已选择的文件">{files.map((file, index) => <li key={`${file.name}-${file.size}-${file.lastModified}-${index}`}>
      <span className="ray-file-dropzone__file-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 3H6v18h12V7l-4-4Zm0 0v5h4M9 12h6m-6 4h4" /></svg></span>
      <span className="ray-file-dropzone__file-info"><strong title={file.name}>{file.name}</strong><small>{bytes(file.size)}</small></span>
      <button type="button" disabled={disabled} aria-label={`移除 ${file.name}`} onClick={(event) => {
        if (disabled) return;
        const row = event.currentTarget.closest('li');
        const nextButton = (row?.nextElementSibling ?? row?.previousElementSibling)?.querySelector('button');
        (nextButton ?? browse.current)?.focus();
        update(files.filter((_, fileIndex) => index !== fileIndex));
        setRejections([]);
        setAnnouncement(`已移除 ${file.name}`);
      }}>×</button>
    </li>)}</ul>}
    {rejections.length > 0 && <ul className="ray-file-dropzone__errors" aria-label="文件选择错误">{rejections.map((rejection, index) => <li key={index}>{rejection.file.name}：{rejection.message}</li>)}</ul>}
    <span className="ray-file-dropzone__announcement" role="status">{announcement}</span>
  </div>;
});
