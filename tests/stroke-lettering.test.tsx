import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { growthLettering, StrokeLettering } from '../src';
import { HandLetteringStudy } from '../demo/HandLetteringStudy';

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

test('multiple drawings have independent masks and one accessible label per artwork', () => {
  const ref = createRef<SVGSVGElement>();
  const { container, rerender } = render(<><StrokeLettering artwork={growthLettering} ref={ref} progress={0} /><StrokeLettering artwork={growthLettering} /></>);
  expect(screen.getAllByRole('img', { name: '生长' })).toHaveLength(2);
  expect(ref.current?.querySelectorAll('g[visibility="hidden"]').length).toBe(growthLettering.strokes.length);
  const masks = Array.from(container.querySelectorAll('mask')).map(mask => mask.id);
  expect(new Set(masks).size).toBe(masks.length);
  for (const path of container.querySelectorAll('path[mask]')) {
    expect(masks).toContain(path.getAttribute('mask')!.slice(5, -1));
  }
  rerender(<StrokeLettering artwork={growthLettering} progress={NaN} aria-label="完整手绘字稿" />);
  expect(screen.getByRole('img', { name: '完整手绘字稿' }).querySelectorAll('g[visibility="hidden"]')).toHaveLength(0);
});

test('reduced motion shows the complete drawing but permits manual timeline inspection and copying', async () => {
  vi.stubGlobal('matchMedia', () => ({ matches: true }));
  const user = userEvent.setup();
  const write = vi.spyOn(navigator.clipboard, 'writeText');
  render(<HandLetteringStudy />);
  const slider = screen.getByRole('slider', { name: '笔画进度' }) as HTMLInputElement;
  expect(slider.value).toBe('100');
  expect((screen.getByRole('button', { name: '播放笔画动画' }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.change(slider, { target: { value: '42' } });
  expect(slider.value).toBe('42');
  await user.click(screen.getByRole('button', { name: '复制当前画面代码' }));
  expect(write.mock.calls[0][0]).toContain('progress={0.42}');
  expect(write.mock.calls[0][0]).toContain('artwork={growthLettering}');
});

test('pause, seek, speed change and replay preserve a continuous drawing timeline', async () => {
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ top: 0, bottom: 300 } as DOMRect);
  let id = 0;
  let time = 0;
  const frames = new Map<number, FrameRequestCallback>();
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { frames.set(++id, callback); return id; });
  vi.stubGlobal('cancelAnimationFrame', (frame: number) => frames.delete(frame));
  function step(count: number) {
    act(() => { for (let i = 0; i < count; i++) { time += 50; const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback(time)); } });
  }
  const user = userEvent.setup();
  const { unmount } = render(<HandLetteringStudy />);
  const slider = screen.getByRole('slider', { name: '笔画进度' }) as HTMLInputElement;
  step(21);
  expect(Number(slider.value)).toBeGreaterThan(0);
  await user.click(screen.getByRole('button', { name: '暂停笔画动画' }));
  const paused = slider.value;
  step(10);
  expect(slider.value).toBe(paused);
  fireEvent.change(slider, { target: { value: '60' } });
  await user.click(screen.getByRole('button', { name: '快一点' }));
  expect(slider.value).toBe('60');
  await user.click(screen.getByRole('button', { name: '播放笔画动画' }));
  step(11);
  expect(Number(slider.value)).toBeGreaterThan(60);
  await user.click(screen.getByRole('button', { name: '重新绘制' }));
  expect(slider.value).toBe('0');
  step(120);
  expect(slider.value).toBe('100');
  expect(screen.getByRole('button', { name: '播放笔画动画' })).toBeTruthy();
  unmount();
  expect(frames.size).toBe(0);
});
