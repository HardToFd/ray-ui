import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { expect, test, vi } from 'vitest';
import { HomeButton } from '../src';
import { HomeButtonDemo } from '../demo/HomeButtonDemo';

test('home destination is a real link, supports custom paths and forwards its anchor ref', () => {
  const ref = createRef<HTMLAnchorElement>();
  const { rerender } = render(<HomeButton ref={ref} />);
  expect(ref.current).toBe(screen.getByRole('link', { name: '回到首页' }));
  expect(ref.current?.getAttribute('href')).toBe('/');
  rerender(<HomeButton href="/app/" label="返回工作台" />);
  expect(screen.getByRole('link', { name: '返回工作台' }).getAttribute('href')).toBe('/app/');
});

test('ordinary clicks invoke the router once and prevent native navigation', () => {
  const navigate = vi.fn();
  const onClick = vi.fn();
  render(<HomeButton href="/workspace" onNavigate={navigate} onClick={onClick} />);
  expect(fireEvent.click(screen.getByRole('link'))).toBe(false);
  expect(onClick).toHaveBeenCalledTimes(1);
  expect(navigate).toHaveBeenCalledExactlyOnceWith('/workspace');
});

test('caller and capture cancellation prevent custom routing', () => {
  const navigate = vi.fn();
  const { rerender } = render(<HomeButton onNavigate={navigate} onClick={(event) => event.preventDefault()} />);
  fireEvent.click(screen.getByRole('link'));
  expect(navigate).not.toHaveBeenCalled();
  rerender(<HomeButton onNavigate={navigate} onClickCapture={(event) => event.preventDefault()} />);
  fireEvent.click(screen.getByRole('link'));
  expect(navigate).not.toHaveBeenCalled();
});

test('modified clicks, auxiliary clicks, downloads and external targets retain native behavior', () => {
  const navigate = vi.fn();
  const nativeClicks: boolean[] = [];
  const wrap = (props: { target?: string; download?: string | boolean } = {}) => <div
    onClick={(event) => { nativeClicks.push(!event.defaultPrevented); event.preventDefault(); }}
    onAuxClick={(event) => { nativeClicks.push(!event.defaultPrevented); event.preventDefault(); }}>
    <HomeButton href="/app/" onNavigate={navigate} {...props} />
  </div>;
  const { rerender } = render(wrap());
  for (const modifier of ['ctrlKey', 'metaKey', 'shiftKey', 'altKey']) fireEvent.click(screen.getByRole('link'), { [modifier]: true });
  fireEvent(screen.getByRole('link'), new MouseEvent('auxclick', { button: 1, bubbles: true, cancelable: true }));
  rerender(wrap({ target: '_blank' }));
  fireEvent.click(screen.getByRole('link'));
  rerender(wrap({ target: 'workspace' }));
  fireEvent.click(screen.getByRole('link'));
  rerender(wrap({ download: '' }));
  fireEvent.click(screen.getByRole('link'));
  expect(nativeClicks).toEqual(Array(8).fill(true));
  expect(navigate).not.toHaveBeenCalled();
  rerender(wrap({ target: '_self', download: false }));
  fireEvent.click(screen.getByRole('link'));
  expect(navigate).toHaveBeenCalledExactlyOnceWith('/app/');
});

test('disabled and loading links cannot navigate, activate callbacks or retain an actionable href', () => {
  const navigate = vi.fn();
  const onClick = vi.fn();
  const onAuxClick = vi.fn();
  const { rerender } = render(<HomeButton disabled onNavigate={navigate} onClick={onClick} onAuxClick={onAuxClick} tabIndex={0} />);
  const link = screen.getByRole('link');
  expect(link.hasAttribute('href')).toBe(false);
  expect(link.getAttribute('aria-disabled')).toBe('true');
  expect(link.tabIndex).toBe(-1);
  expect(fireEvent.click(link)).toBe(false);
  expect(fireEvent(link, new MouseEvent('auxclick', { button: 1, bubbles: true, cancelable: true }))).toBe(false);
  expect(onClick).not.toHaveBeenCalled();
  expect(onAuxClick).not.toHaveBeenCalled();
  expect(navigate).not.toHaveBeenCalled();
  rerender(<HomeButton loading loadingLabel="正在打开工作台" onNavigate={navigate} />);
  expect(screen.getByRole('link', { name: '正在打开工作台' }).getAttribute('aria-busy')).toBe('true');
  fireEvent.click(screen.getByRole('link'));
  expect(navigate).not.toHaveBeenCalled();
  rerender(<HomeButton href="/app/" onNavigate={navigate} />);
  expect(screen.getByRole('link').getAttribute('href')).toBe('/app/');
  expect(screen.getByRole('link').hasAttribute('aria-disabled')).toBe(false);
});

test('icon-only keeps an accessible name and blank targets preserve rel while adding noopener', () => {
  const { container } = render(<HomeButton iconOnly aria-label="返回个人首页" target="_blank" rel="nofollow noreferrer" />);
  const link = screen.getByRole('link', { name: '返回个人首页' });
  expect(link.getAttribute('title')).toBe('返回个人首页');
  expect(container.querySelector('.ray-home-button__label')).toBeNull();
  expect(link.getAttribute('rel')?.split(' ')).toEqual(['nofollow', 'noreferrer', 'noopener']);
});

test('keyboard skips disabled links and Enter navigates without submitting an enclosing form', async () => {
  const user = userEvent.setup();
  const navigate = vi.fn();
  const submit = vi.fn((event) => event.preventDefault());
  render(<form onSubmit={submit}><HomeButton disabled /><HomeButton href="/app/" label="打开首页" onNavigate={navigate} /></form>);
  await user.tab();
  expect(document.activeElement).toBe(screen.getByRole('link', { name: '打开首页' }));
  await user.keyboard('{Enter}');
  expect(navigate).toHaveBeenCalledExactlyOnceWith('/app/');
  expect(submit).not.toHaveBeenCalled();
});

test('demo navigation reaches home, focuses the destination heading, and can restart', async () => {
  const user = userEvent.setup();
  render(<HomeButtonDemo expanded />);
  await user.click(screen.getByRole('link', { name: '回到首页', exact: true }));
  expect(document.activeElement).toBe(screen.getByRole('heading', { name: '欢迎回来。' }));
  await user.click(screen.getByRole('button', { name: '继续探索' }));
  expect(document.activeElement).toBe(screen.getByRole('heading', { name: '读完这一页，回家看看。' }));
  expect(screen.getByRole('link', { name: '返回组件总览' }).getAttribute('href')).toBe('#components/all');
});
