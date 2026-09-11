import { forwardRef, type ReactNode } from 'react';
import { Button, type ButtonProps } from './primitives';

export type DownloadButtonProps = Omit<ButtonProps, 'onError'> & {
  filename: string;
  icon?: ReactNode;
  /** Called after requesting the browser download, not after saving the file. */
  onDownload?: () => void;
  onError?: (error: unknown) => void;
} & ({ data: string | Blob; mimeType?: string; href?: never } | { href: string; data?: never; mimeType?: never });

export const DownloadButton = forwardRef<HTMLButtonElement, DownloadButtonProps>(
  function DownloadButton({ filename, data, href, mimeType = 'text/plain;charset=utf-8', icon, children = '下载文件', onClick, onDownload, onError, ...props }, ref) {
    return <Button {...props} ref={ref} onClick={(event) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      let objectUrl: string | undefined;
      let link: HTMLAnchorElement | undefined;
      try {
        const url = href ?? (objectUrl = URL.createObjectURL(data instanceof Blob ? data : new Blob([data ?? ''], { type: mimeType })));
        link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.append(link);
        link.click();
      } catch (error) {
        onError?.(error);
        return;
      } finally {
        link?.remove();
        if (objectUrl) {
          const disposableUrl = objectUrl;
          window.setTimeout(() => URL.revokeObjectURL(disposableUrl), 1000);
        }
      }
      onDownload?.();
    }}>{icon}{children}</Button>;
  },
);
