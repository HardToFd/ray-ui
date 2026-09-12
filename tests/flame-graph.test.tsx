import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { FlameGraph, type FlameGraphNode } from '../src';

const data: FlameGraphNode[] = [{ id: 'root', name: 'main()', value: 100, children: [
  { id: 'fetch', name: 'fetch()', value: 60, children: [{ id: 'parse', name: 'JSON.parse()', value: 30 }] },
  { id: 'render', name: 'render()', value: 30 },
] }, { id: 'worker', name: 'worker()', value: 40 }];
const frame = (name: string) => screen.getByRole('button', { name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}，`) });
const blocks = () => within(screen.getByRole('group', { name: '调用栈条块' })).getAllByRole('button');

test('lays out inclusive widths without double counting, keeps siblings aligned and reports self time', () => {
  const original = JSON.stringify(data);
  render(<FlameGraph data={data} />);
  expect(parseFloat(frame('main()').style.width)).toBeCloseTo(100 / 140 * 100);
  expect(parseFloat(frame('worker()').style.left)).toBeCloseTo(100 / 140 * 100);
  expect(parseFloat(frame('render()').style.left)).toBeCloseTo(60 / 140 * 100);
  expect(frame('main()').getAttribute('aria-label')).toContain('自身耗时 10 ms');
  expect(frame('fetch()').getAttribute('aria-label')).toContain('自身耗时 30 ms');
  expect(frame('JSON.parse()').getAttribute('aria-label')).toContain('自身耗时 30 ms');
  expect(screen.getByText('140 ms', { exact: false })).toBeTruthy();
  expect(JSON.stringify(data)).toBe(original);
});

test('zooms into descendants, recomputes widths, preserves total percentages, and returns through ancestors', async () => {
  const user = userEvent.setup();
  render(<FlameGraph data={data} />);
  await user.click(frame('fetch()'));
  expect(blocks()).toHaveLength(2);
  expect(frame('fetch()').style.width).toBe('100%');
  expect(frame('JSON.parse()').style.width).toBe('50%');
  expect(frame('JSON.parse()').style.left).toBe('0%');
  expect(frame('fetch()').getAttribute('aria-label')).toContain('占全部 42.9%');
  expect(document.activeElement).toBe(frame('fetch()'));
  await user.keyboard('{Escape}');
  expect(blocks()).toHaveLength(4);
  expect(document.activeElement).toBe(frame('main()'));
  expect(frame('main()').style.width).toBe('100%');
  await user.keyboard('{Escape}');
  expect(blocks()).toHaveLength(5);
  expect(screen.getByRole('button', { name: '全部调用' }).hasAttribute('disabled')).toBe(true);
  await user.click(frame('JSON.parse()'));
  await user.click(screen.getByRole('button', { name: '返回上层' }));
  expect(frame('fetch()').getAttribute('aria-pressed')).toBe('true');
  await user.click(screen.getByRole('button', { name: '全部调用' }));
  expect(blocks()).toHaveLength(5);
});

test('respects controlled zoom and falls back to all data if the focused subtree disappears', async () => {
  const user = userEvent.setup();
  const changed = vi.fn();
  const { rerender } = render(<FlameGraph data={data} value={null} onValueChange={changed} />);
  await user.click(frame('fetch()'));
  expect(changed).toHaveBeenLastCalledWith('fetch');
  expect(blocks()).toHaveLength(5);
  rerender(<FlameGraph data={data} value="fetch" onValueChange={changed} />);
  expect(blocks()).toHaveLength(2);
  expect(document.activeElement).toBe(frame('fetch()'));
  rerender(<FlameGraph data={[data[1]]} value="fetch" onValueChange={changed} />);
  expect(blocks()).toHaveLength(1);
  expect(frame('worker()').tabIndex).toBe(0);
  expect(frame('worker()').style.width).toBe('100%');
});

test('uses a single Tab entry, spatial arrows, Home/End and Space activation', async () => {
  const user = userEvent.setup();
  render(<><FlameGraph data={data} showSearch={false} /><button>图表之后</button></>);
  await user.tab();
  expect(document.activeElement).toBe(frame('main()'));
  await user.keyboard('{ArrowRight}');
  expect(document.activeElement).toBe(frame('worker()'));
  await user.keyboard('{ArrowRight}{Home}{ArrowUp}');
  expect(document.activeElement).toBe(frame('fetch()'));
  await user.keyboard('{End}');
  expect(document.activeElement).toBe(frame('render()'));
  await user.keyboard('{ArrowDown}{ArrowUp}{ArrowUp}');
  expect(document.activeElement).toBe(frame('JSON.parse()'));
  await user.keyboard(' ');
  expect(blocks()).toHaveLength(1);
  expect(frame('JSON.parse()').getAttribute('aria-pressed')).toBe('true');
  expect(document.activeElement).toBe(frame('JSON.parse()'));
  expect(blocks().filter((button) => button.tabIndex === 0)).toHaveLength(1);
  await user.tab();
  expect(document.activeElement).toBe(screen.getByRole('button', { name: '图表之后' }));
});

test('search highlights case-insensitively without changing geometry and handles no matches or hidden search', async () => {
  const user = userEvent.setup();
  const { rerender } = render(<FlameGraph data={data} />);
  const width = frame('JSON.parse()').style.width;
  await user.type(screen.getByRole('searchbox', { name: '搜索调用函数' }), 'JSON');
  expect(screen.getByRole('status').textContent).toBe('1 个匹配调用');
  expect(frame('JSON.parse()').getAttribute('data-match')).toBe('true');
  expect(frame('fetch()').getAttribute('data-match')).toBe('false');
  expect(frame('JSON.parse()').style.width).toBe(width);
  await user.clear(screen.getByRole('searchbox'));
  await user.type(screen.getByRole('searchbox'), 'unknown');
  expect(screen.getByRole('status').textContent).toBe('0 个匹配调用');
  rerender(<FlameGraph data={data} showSearch={false} />);
  expect(screen.queryByRole('searchbox')).toBeNull();
  expect(blocks().every((button) => button.getAttribute('data-match') === 'true')).toBe(true);
});

test('updates hover details and custom units when data changes', () => {
  const formatValue = (value: number) => `${value} samples`;
  const { rerender } = render(<FlameGraph data={data} formatValue={formatValue} />);
  fireEvent.pointerEnter(frame('fetch()'));
  let details = screen.getByRole('group', { name: '调用详情' });
  expect(within(details).getByText('60 samples')).toBeTruthy();
  expect(within(details).getByText('30 samples')).toBeTruthy();
  const updated = [{ ...data[0], children: [{ ...data[0].children![0], value: 80 }, data[0].children![1]] }];
  rerender(<FlameGraph data={updated} formatValue={formatValue} />);
  details = screen.getByRole('group', { name: '调用详情' });
  expect(within(details).getByText('80 samples')).toBeTruthy();
  expect(within(details).getByText('50 samples')).toBeTruthy();
  expect(frame('main()').getAttribute('aria-label')).toContain('总耗时 110 samples');
});

test('normalizes missing, negative and nonfinite values and handles all-zero or empty profiles', () => {
  const { rerender } = render(<FlameGraph data={[{ id: 'p', name: 'parent', value: -1, children: [
    { id: 'a', name: 'child', value: 7 }, { id: 'b', name: 'bad', value: Infinity }, { id: 'c', name: 'nan', value: NaN },
  ] }]} />);
  expect(blocks()).toHaveLength(2);
  expect(frame('parent').getAttribute('aria-label')).toContain('总耗时 7 ms，自身耗时 0 ms');
  rerender(<FlameGraph data={[{ id: 'zero', name: 'zero' }]} emptyMessage="还没有采样" />);
  expect(screen.getByRole('status').textContent).toBe('还没有采样');
  expect(screen.queryByRole('group', { name: '调用栈条块' })).toBeNull();
  rerender(<FlameGraph data={[]} />);
  expect(screen.getByRole('status').textContent).toBe('暂无调用数据');
});

test('reports duplicate IDs, cycles, excessive depth and overflow instead of displaying invalid geometry', () => {
  const duplicate = [{ id: 'x', name: 'a', value: 2 }, { id: 'x', name: 'b', value: 3 }];
  const { rerender } = render(<FlameGraph data={duplicate} />);
  expect(screen.getByRole('status').textContent).toContain('唯一的 id');
  const cyclic: FlameGraphNode = { id: 'cycle', name: 'cycle', value: 1 };
  cyclic.children = [cyclic];
  rerender(<FlameGraph data={[cyclic]} />);
  expect(screen.getByRole('status').textContent).toContain('唯一的 id');
  let deep: FlameGraphNode = { id: 'leaf', name: 'leaf', value: 1 };
  for (let i = 0; i < 100; i++) deep = { id: `depth-${i}`, name: 'deep', children: [deep] };
  rerender(<FlameGraph data={[deep]} />);
  expect(screen.getByRole('status').textContent).toContain('100 层');
  rerender(<FlameGraph data={[{ id: 'a', name: 'a', value: Number.MAX_VALUE }, { id: 'b', name: 'b', value: Number.MAX_VALUE }]} />);
  expect(screen.getByRole('status').textContent).toContain('超出有效数值范围');
});
