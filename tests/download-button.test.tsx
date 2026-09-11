import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { DownloadButton } from '../src';

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });

test('downloads generated content with a filename and releases its temporary URL', () => {
  vi.useFakeTimers();
  const create = vi.fn(() => 'blob:example');
  const revoke = vi.fn();
  vi.stubGlobal('URL', { createObjectURL: create, revokeObjectURL: revoke });
  let savedName = '';
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) { savedName = this.download; });
  const requested = vi.fn();
  render(<DownloadButton filename="notes.txt" data="hello" onDownload={requested} />);
  fireEvent.click(screen.getByRole('button', { name: '下载文件' }));
  expect(savedName).toBe('notes.txt');
  expect(create.mock.calls.length).toBe(1);
  expect(requested).toHaveBeenCalledOnce();
  expect(document.querySelector('a[download]')).toBeNull();
  vi.runAllTimers();
  expect(revoke).toHaveBeenCalledWith('blob:example');
});

test('respects cancellation and disabled state, and downloads existing URLs', () => {
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  const { rerender } = render(<DownloadButton filename="guide.pdf" href="/guide.pdf" onClick={(event) => event.preventDefault()} />);
  fireEvent.click(screen.getByRole('button'));
  expect(click).not.toHaveBeenCalled();
  rerender(<DownloadButton filename="guide.pdf" href="/guide.pdf" disabled />);
  fireEvent.click(screen.getByRole('button'));
  expect(click).not.toHaveBeenCalled();
  rerender(<DownloadButton filename="guide.pdf" href="/guide.pdf" />);
  fireEvent.click(screen.getByRole('button'));
  expect(click).toHaveBeenCalledOnce();
});
