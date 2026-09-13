import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { createRef } from 'react';
import { PageNavigation } from '../src';

function makeTarget(top = 300) {
  const target = document.createElement('div');
  Object.defineProperties(target, {
    scrollTop: { value: top, writable: true, configurable: true },
    scrollHeight: { value: 1000, writable: true, configurable: true },
    clientHeight: { value: 400, writable: true, configurable: true },
    scrollTo: { value: vi.fn(), configurable: true },
  });
  return target;
}
function frame() { act(() => { vi.advanceTimersByTime(20); }); }

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => window.setTimeout(() => callback(0), 16));
  vi.stubGlobal('cancelAnimationFrame', (id: number) => window.clearTimeout(id));
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });

test('default history actions work, do not submit a form, and can be canceled during capture', () => {
  const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
  const forward = vi.spyOn(window.history, 'forward').mockImplementation(() => {});
  const submit = vi.fn((event) => event.preventDefault());
  const { rerender } = render(<form onSubmit={submit}><PageNavigation /></form>);
  fireEvent.click(screen.getByRole('button', { name: '后退' }));
  fireEvent.click(screen.getByRole('button', { name: '前进' }));
  expect(back).toHaveBeenCalledTimes(1);
  expect(forward).toHaveBeenCalledTimes(1);
  expect(submit).not.toHaveBeenCalled();
  rerender(<PageNavigation onClickCapture={(event) => event.preventDefault()} />);
  fireEvent.click(screen.getByRole('button', { name: '后退' }));
  expect(back).toHaveBeenCalledTimes(1);
});

test('custom routing replaces browser history and respects directional and global disabled states', () => {
  const browserBack = vi.spyOn(window.history, 'back');
  const back = vi.fn();
  const forward = vi.fn();
  const { rerender } = render(<PageNavigation onBack={back} onForward={forward} canGoForward={false} />);
  fireEvent.click(screen.getByRole('button', { name: '后退' }));
  fireEvent.click(screen.getByRole('button', { name: '前进' }));
  expect(back).toHaveBeenCalledTimes(1);
  expect(browserBack).not.toHaveBeenCalled();
  expect(forward).not.toHaveBeenCalled();
  rerender(<PageNavigation onBack={back} onForward={forward} disabled />);
  expect(screen.getAllByRole('button').every((button) => (button as HTMLButtonElement).disabled)).toBe(true);
});

test('container scroll progress drives the ring, accessible description and top threshold', () => {
  const target = makeTarget();
  const { container } = render(<PageNavigation scrollTarget={target} />);
  frame();
  const top = screen.getByRole('button', { name: '回到顶部' }) as HTMLButtonElement;
  expect(top.disabled).toBe(false);
  expect(document.getElementById(top.getAttribute('aria-describedby')!)?.textContent).toBe('已阅读 50%');
  expect(container.querySelector('.ray-page-navigation__fill')?.getAttribute('stroke-dashoffset')).toBe('50');
  fireEvent.click(top);
  expect(target.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  target.scrollTop = 32;
  fireEvent.scroll(target);
  frame();
  expect(top.disabled).toBe(true);
  target.scrollTop = 900;
  fireEvent.scroll(target);
  frame();
  expect(top.title).toBe('回到顶部 · 已阅读 100%');
});

test('reduced motion forces instant scrolling even with smooth requested; callbacks can cancel', () => {
  vi.stubGlobal('matchMedia', () => ({ matches: true }));
  const target = makeTarget();
  const onTop = vi.fn();
  const { rerender } = render(<PageNavigation scrollTarget={target} onBackToTop={onTop} behavior="smooth" />);
  frame();
  fireEvent.click(screen.getByRole('button', { name: '回到顶部' }));
  expect(onTop).toHaveBeenCalledTimes(1);
  expect(target.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'instant' });
  rerender(<PageNavigation scrollTarget={target} onBackToTop={(event) => event.preventDefault()} />);
  fireEvent.click(screen.getByRole('button', { name: '回到顶部' }));
  expect(target.scrollTo).toHaveBeenCalledTimes(1);
});

test('null waits for a target, replacement detaches the old target, and unmount cancels frames', () => {
  const target = makeTarget();
  const other = makeTarget(600);
  const detach = vi.spyOn(target, 'removeEventListener');
  const cancel = vi.spyOn(window, 'cancelAnimationFrame');
  const { rerender, unmount } = render(<PageNavigation scrollTarget={null} />);
  frame();
  expect((screen.getByRole('button', { name: '回到顶部' }) as HTMLButtonElement).disabled).toBe(true);
  rerender(<PageNavigation scrollTarget={target} />);
  frame();
  expect(screen.getByText('已阅读 50%')).toBeTruthy();
  rerender(<PageNavigation scrollTarget={other} />);
  frame();
  expect(detach).toHaveBeenCalledWith('scroll', expect.any(Function));
  target.scrollTop = 0;
  fireEvent.scroll(target);
  frame();
  expect(screen.getByText('已阅读 100%')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: '回到顶部' }));
  expect(other.scrollTo).toHaveBeenCalledTimes(1);
  expect(target.scrollTo).not.toHaveBeenCalled();
  fireEvent.scroll(other);
  unmount();
  expect(cancel).toHaveBeenCalled();
});

test('content resize and insertion update progress without another scroll and release observers', async () => {
  let resize: ResizeObserverCallback = () => {};
  const observe = vi.fn();
  const disconnect = vi.fn();
  vi.stubGlobal('ResizeObserver', class {
    constructor(callback: ResizeObserverCallback) { resize = callback; }
    observe = observe;
    disconnect = disconnect;
  });
  const target = makeTarget();
  const { unmount } = render(<PageNavigation scrollTarget={target} />);
  frame();
  Object.defineProperty(target, 'scrollHeight', { value: 1600 });
  act(() => resize([], {} as ResizeObserver));
  frame();
  expect(screen.getByText('已阅读 25%')).toBeTruthy();
  const article = document.createElement('article');
  await act(async () => { target.append(article); });
  expect(observe).toHaveBeenCalledWith(article);
  unmount();
  expect(disconnect).toHaveBeenCalled();
});

test('window mode reads document scrolling metrics and requests a window scroll', () => {
  vi.spyOn(document.documentElement, 'scrollTop', 'get').mockReturnValue(200);
  vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(1200);
  vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(400);
  const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  render(<PageNavigation />);
  frame();
  expect(screen.getByText('已阅读 25%')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: '回到顶部' }));
  expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
});

test('zero threshold allows small scrolls, negative overscroll and short content stay finite', () => {
  const target = makeTarget(12);
  const { rerender } = render(<PageNavigation scrollTarget={target} topThreshold={0} />);
  frame();
  expect((screen.getByRole('button', { name: '回到顶部' }) as HTMLButtonElement).disabled).toBe(false);
  rerender(<PageNavigation scrollTarget={target} topThreshold={NaN} />);
  expect((screen.getByRole('button', { name: '回到顶部' }) as HTMLButtonElement).disabled).toBe(true);
  target.scrollTop = -20;
  Object.defineProperty(target, 'scrollHeight', { value: 200 });
  fireEvent.scroll(target);
  frame();
  expect(screen.getByText('已阅读 0%')).toBeTruthy();
});

test('labels, grouping, forwarded ref and multiple progress descriptions stay independent', () => {
  const ref = createRef<HTMLDivElement>();
  render(<><PageNavigation ref={ref} aria-label="文章导航" backLabel="上一篇" forwardLabel="下一篇" topLabel="返回文章开头" showLabels /><PageNavigation aria-label="侧边导航" showProgress={false} /></>);
  expect(ref.current).toBe(screen.getByRole('group', { name: '文章导航' }));
  expect(within(ref.current!).getByRole('button', { name: '上一篇' })).toBeTruthy();
  expect(within(screen.getByRole('group', { name: '侧边导航' })).getByRole('button', { name: '回到顶部' }).hasAttribute('aria-describedby')).toBe(false);
});

test('Tab skips unavailable history and keyboard activation invokes the available action', async () => {
  vi.useRealTimers();
  const user = userEvent.setup();
  const forward = vi.fn();
  const target = makeTarget();
  render(<PageNavigation scrollTarget={target} canGoBack={false} onForward={forward} />);
  await waitFor(() => expect((screen.getByRole('button', { name: '回到顶部' }) as HTMLButtonElement).disabled).toBe(false));
  await user.tab();
  expect(document.activeElement).toBe(screen.getByRole('button', { name: '前进' }));
  await user.keyboard('{Enter}');
  expect(forward).toHaveBeenCalledTimes(1);
  await user.tab();
  expect(document.activeElement).toBe(screen.getByRole('button', { name: '回到顶部' }));
  await user.keyboard(' ');
  expect(target.scrollTo).toHaveBeenCalledTimes(1);
});
