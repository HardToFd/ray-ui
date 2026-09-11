import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { BreathingIndicator } from '../src';
import { drawBreath } from '../src/components/breathing-renderer';

vi.mock('../src/components/breathing-renderer', () => ({ drawBreath: vi.fn() }));
let frames: Map<number, FrameRequestCallback>;
let sequence: number;
let reduced: boolean;
let onMotion: () => void;
let onIntersection: (entries: { isIntersecting: boolean }[]) => void;
const disconnect = vi.fn();
beforeEach(() => {
  frames = new Map(); sequence = 0; reduced = false;
  vi.mocked(drawBreath).mockClear();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ setTransform: vi.fn() } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: 88, height: 88 } as DOMRect);
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => { frames.set(++sequence, cb); return sequence; });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect = disconnect; });
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: typeof onIntersection) { onIntersection = callback; }
    observe() {} disconnect = disconnect;
  });
  vi.stubGlobal('matchMedia', () => ({ get matches() { return reduced; }, addEventListener: (_: string, cb: () => void) => { onMotion = cb; }, removeEventListener: vi.fn() }));
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
function advance(now: number) {
  act(() => { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach((cb) => cb(now)); });
}

test('preserves the animation phase across pause/resume and cancels work on unmount', () => {
  const { rerender, unmount } = render(<BreathingIndicator label="正在同步" variant="orbit" />);
  advance(100); advance(150);
  const phase = vi.mocked(drawBreath).mock.lastCall![3];
  expect(phase).toBeGreaterThan(0);
  rerender(<BreathingIndicator label="正在同步" variant="orbit" paused />);
  expect(frames.size).toBe(0);
  expect(vi.mocked(drawBreath).mock.lastCall![3]).toBe(phase);
  rerender(<BreathingIndicator label="正在同步" variant="orbit" />);
  advance(5000);
  expect(vi.mocked(drawBreath).mock.lastCall![3]).toBe(phase);
  advance(5050);
  expect(vi.mocked(drawBreath).mock.lastCall![3]).toBeGreaterThan(phase);
  unmount(); expect(frames.size).toBe(0);
});

test('reduced motion and offscreen states stop scheduling while retaining a labeled static visual', () => {
  reduced = true;
  const { unmount } = render(<BreathingIndicator variant="wave" label="系统运行中" hideLabel />);
  expect(screen.getByRole('status').textContent).toBe('系统运行中');
  expect(drawBreath).toHaveBeenCalled(); expect(frames.size).toBe(0);
  act(() => { reduced = false; onMotion(); });
  expect(frames.size).toBe(1);
  act(() => onIntersection([{ isIntersecting: false }]));
  expect(frames.size).toBe(0);
  act(() => onIntersection([{ isIntersecting: true }]));
  expect(frames.size).toBe(1);
  unmount(); expect(frames.size).toBe(0);
});

test('failure stops animation and recovery restores it with accurate state labels', () => {
  const { rerender, unmount } = render(<BreathingIndicator status="degraded" />);
  expect(screen.getByRole('status').textContent).toBe('系统部分出错');
  expect(frames.size).toBe(1);
  rerender(<BreathingIndicator status="failed" />);
  expect(screen.getByRole('status').textContent).toBe('系统完全瘫痪');
  expect(frames.size).toBe(0);
  expect(vi.mocked(drawBreath).mock.lastCall![7]).toBe('failed');
  rerender(<BreathingIndicator status="normal" />);
  expect(screen.getByRole('status').textContent).toBe('正常运行');
  expect(frames.size).toBe(1);
  unmount();
});
