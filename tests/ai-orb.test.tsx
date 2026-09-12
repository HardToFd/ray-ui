import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { AIOrb } from '../src';
import { createOrbRenderer } from '../src/components/ai-orb-renderer';

vi.mock('../src/components/ai-orb-renderer', () => ({ createOrbRenderer: vi.fn() }));
const draw = vi.fn();
const dispose = vi.fn();
let frames: Map<number, FrameRequestCallback>;
let sequence: number;
let reduced: boolean;
let hidden: boolean;
let motionChanged: () => void;
let intersectionChanged: (entries: { isIntersecting: boolean }[]) => void;

beforeEach(() => {
  frames = new Map(); sequence = 0; reduced = false; hidden = false;
  draw.mockClear(); dispose.mockClear();
  vi.mocked(createOrbRenderer).mockReset().mockReturnValue({ draw, dispose });
  vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden);
  vi.spyOn(HTMLCanvasElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: 144, height: 144 } as DOMRect);
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { frames.set(++sequence, callback); return sequence; });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: typeof intersectionChanged) { intersectionChanged = callback; }
    observe() {} disconnect() {}
  });
  vi.stubGlobal('matchMedia', () => ({ get matches() { return reduced; }, addEventListener: (_: string, callback: () => void) => { motionChanged = callback; }, removeEventListener() {} }));
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
function advance(now: number) {
  act(() => { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach((callback) => callback(now)); });
}

test('state labels update without rebuilding the renderer, and audio levels are normalized', () => {
  const { rerender, unmount } = render(<AIOrb state="listening" audioLevel={99} hideLabel />);
  advance(100); advance(150);
  expect(screen.getByRole('status').textContent).toBe('正在聆听');
  expect(draw.mock.lastCall![0].energy).toBeGreaterThan(0);
  expect(draw.mock.lastCall![0].energy).toBeLessThanOrEqual(1);
  rerender(<AIOrb state="speaking" audioLevel={NaN} label="你好" />);
  advance(200);
  expect(Number.isFinite(draw.mock.lastCall![0].energy)).toBe(true);
  expect(screen.getByRole('status').textContent).toBe('你好');
  expect(createOrbRenderer).toHaveBeenCalledTimes(1);
  unmount(); expect(frames.size).toBe(0); expect(dispose).toHaveBeenCalledTimes(1);
});

test('pause and resume preserve the flow phase without catching up elapsed wall time', () => {
  const { rerender, unmount } = render(<AIOrb />);
  advance(100); advance(150);
  const phase = draw.mock.lastCall![0].time;
  expect(phase).toBeGreaterThan(0);
  rerender(<AIOrb paused />);
  expect(frames.size).toBe(0);
  expect(draw.mock.lastCall![0].time).toBe(phase);
  rerender(<AIOrb />);
  advance(9000);
  expect(draw.mock.lastCall![0].time).toBe(phase);
  advance(9050);
  expect(draw.mock.lastCall![0].time).toBeGreaterThan(phase);
  unmount();
});

test('reduced motion, offscreen, and background pages stop scheduling', () => {
  reduced = true;
  const { unmount } = render(<AIOrb state="thinking" />);
  expect(draw).toHaveBeenCalled(); expect(frames.size).toBe(0);
  act(() => { reduced = false; motionChanged(); });
  expect(frames.size).toBe(1);
  act(() => intersectionChanged([{ isIntersecting: false }]));
  expect(frames.size).toBe(0);
  act(() => intersectionChanged([{ isIntersecting: true }]));
  expect(frames.size).toBe(1);
  act(() => { hidden = true; document.dispatchEvent(new Event('visibilitychange')); });
  expect(frames.size).toBe(0);
  act(() => { hidden = false; document.dispatchEvent(new Event('visibilitychange')); });
  expect(frames.size).toBe(1);
  unmount();
});

test('WebGL absence retains a labeled fallback; context loss can recover', () => {
  vi.mocked(createOrbRenderer).mockReturnValueOnce(null);
  const { container, rerender, unmount } = render(<AIOrb state="error" />);
  expect(screen.getByRole('status').textContent).toBe('连接中断');
  expect(container.querySelector('[data-rendered="false"]')).not.toBeNull();
  expect(frames.size).toBe(0);
  const canvas = container.querySelector('canvas')!;
  act(() => { canvas.dispatchEvent(new Event('webglcontextrestored')); });
  expect(frames.size).toBe(1);
  act(() => { canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true })); });
  expect(frames.size).toBe(0);
  expect(dispose).toHaveBeenCalledTimes(1);
  act(() => { canvas.dispatchEvent(new Event('webglcontextrestored')); });
  rerender(<AIOrb state="idle" />);
  expect(container.querySelector('[data-rendered="true"]')).not.toBeNull();
  expect(screen.getByRole('status').textContent).toBe('随时倾听');
  unmount(); expect(dispose).toHaveBeenCalledTimes(2);
});
