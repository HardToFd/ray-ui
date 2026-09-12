import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { Carousel } from '../src';

const items = ['山', '海', '森林'].map((label) => ({ id: label, label, content: <a href={`#${label}`}>{label}</a> }));
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

test('arrows loop, dots navigate, and hidden slides cannot be focused', () => {
  render(<Carousel items={items} />);
  fireEvent.click(screen.getByRole('button', { name: '上一张' }));
  expect(screen.getByRole('link').textContent).toBe('森林');
  fireEvent.click(screen.getByRole('button', { name: '下一张' }));
  expect(screen.getByRole('link').textContent).toBe('山');
  fireEvent.click(screen.getByRole('button', { name: '跳转到第 2 张：海' }));
  expect(screen.getByRole('link').textContent).toBe('海');
  expect(screen.getByText('山').parentElement?.hasAttribute('inert')).toBe(true);
});

test('keyboard respects boundaries and does not intercept nested controls', () => {
  render(<Carousel items={items} loop={false} />);
  const region = screen.getByRole('region');
  expect((screen.getByRole('button', { name: '上一张' }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.keyDown(region, { key: 'End' });
  expect((screen.getByRole('button', { name: '下一张' }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.keyDown(screen.getByRole('link'), { key: 'Home' });
  expect(screen.getByRole('link').textContent).toBe('森林');
  fireEvent.keyDown(region, { key: 'Home' });
  fireEvent.keyDown(region, { key: 'ArrowRight' });
  expect(screen.getByRole('link').textContent).toBe('海');
});

test('controlled selection waits for parent; list shrink and empty state stay valid', () => {
  const change = vi.fn();
  const { rerender } = render(<Carousel items={items} value={0} onValueChange={change} />);
  fireEvent.click(screen.getByRole('button', { name: '下一张' }));
  expect(change).toHaveBeenCalledWith(1);
  expect(screen.getByRole('link').textContent).toBe('山');
  rerender(<Carousel items={items.slice(0, 1)} value={2} />);
  expect(screen.getByRole('link').textContent).toBe('山');
  expect(screen.queryByRole('button')).toBeNull();
  rerender(<Carousel items={[]} />);
  expect(screen.queryByRole('link')).toBeNull();
});

test('autoplay pauses for hover, focus, and explicit pause', () => {
  vi.useFakeTimers();
  render(<Carousel items={items} autoPlay interval={1000} />);
  const region = screen.getByRole('region');
  act(() => { vi.advanceTimersByTime(1000); });
  expect(screen.getByRole('link').textContent).toBe('海');
  fireEvent.mouseEnter(region);
  act(() => { vi.advanceTimersByTime(2000); });
  expect(screen.getByRole('link').textContent).toBe('海');
  fireEvent.mouseLeave(region);
  fireEvent.focus(region);
  act(() => { vi.advanceTimersByTime(2000); });
  expect(screen.getByRole('link').textContent).toBe('海');
  fireEvent.blur(region);
  fireEvent.click(screen.getByRole('button', { name: '暂停自动播放' }));
  act(() => { vi.advanceTimersByTime(2000); });
  expect(screen.getByRole('link').textContent).toBe('海');
  fireEvent.click(screen.getByRole('button', { name: '继续自动播放' }));
  act(() => { vi.advanceTimersByTime(1000); });
  expect(screen.getByRole('link').textContent).toBe('森林');
});

test('reduced motion prevents autoplay and horizontal swipes navigate', () => {
  vi.useFakeTimers();
  vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
  const { container } = render(<Carousel items={items} autoPlay interval={1000} />);
  act(() => { vi.advanceTimersByTime(3000); });
  expect(screen.getByRole('link').textContent).toBe('山');
  const viewport = container.querySelector('.ray-carousel__viewport')!;
  fireEvent.touchStart(viewport, { touches: [{ clientX: 200, clientY: 50 }] });
  fireEvent.touchEnd(viewport, { changedTouches: [{ clientX: 100, clientY: 60 }] });
  expect(screen.getByRole('link').textContent).toBe('海');
});
