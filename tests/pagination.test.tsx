import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { Pagination } from '../src';
import { PaginationDemo } from '../demo/PaginationDemo';

afterEach(() => { vi.restoreAllMocks(); });
const current = (container: HTMLElement) => container.querySelector('[aria-current="page"]')?.textContent;

test('uncontrolled page buttons navigate once, preserve boundaries and forward the nav ref', () => {
  const change = vi.fn();
  const ref = createRef<HTMLElement>();
  const { container } = render(<Pagination ref={ref} total={95} onPageChange={change} showTotal aria-label="文章分页" />);
  expect(ref.current).toBe(screen.getByRole('navigation', { name: '文章分页' }));
  expect(screen.getByRole<HTMLButtonElement>('button', { name: '上一页' }).disabled).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: '下一页' }));
  expect(current(container)).toBe('2');
  expect(change).toHaveBeenLastCalledWith(2, 10);
  fireEvent.click(screen.getByRole('button', { name: '第 2 页' }));
  expect(change).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: '第 10 页' }));
  expect(current(container)).toBe('10');
  expect(screen.getByRole<HTMLButtonElement>('button', { name: '下一页' }).disabled).toBe(true);
  expect(container.textContent).toContain('第 91–95 条，共 95 条');
});

test('controlled pages wait for the parent, external values clamp without callback', () => {
  const change = vi.fn();
  const { container, rerender } = render(<Pagination total={100} page={4} onPageChange={change} />);
  fireEvent.click(screen.getByRole('button', { name: '下一页' }));
  expect(change).toHaveBeenLastCalledWith(5, 10);
  expect(current(container)).toBe('4');
  rerender(<Pagination total={100} page={5} onPageChange={change} />);
  expect(current(container)).toBe('5');
  rerender(<Pagination total={12} page={5} onPageChange={change} />);
  expect(current(container)).toBe('2');
  expect(change).toHaveBeenCalledTimes(1);
});

test('shrinking then growing data does not resurrect an invalid uncontrolled page', () => {
  const change = vi.fn();
  const { container, rerender } = render(<Pagination total={100} defaultPage={8} onPageChange={change} />);
  rerender(<Pagination total={15} defaultPage={8} onPageChange={change} />);
  expect(current(container)).toBe('2');
  rerender(<Pagination total={100} defaultPage={8} onPageChange={change} />);
  expect(current(container)).toBe('2');
  expect(change).not.toHaveBeenCalled();
});

test('middle windows include the selected page and both ends with a bounded number of buttons', () => {
  const { container, rerender } = render(<Pagination total={1000} defaultPage={50} />);
  expect(screen.getAllByRole('button').map((button) => button.getAttribute('aria-label'))).toEqual(['上一页', '第 1 页', '第 49 页', '第 50 页', '第 51 页', '第 100 页', '下一页']);
  expect(container.querySelectorAll('.ray-pagination__ellipsis')).toHaveLength(2);
  rerender(<Pagination total={Number.MAX_SAFE_INTEGER} pageSize={1} page={500000} />);
  expect(screen.getAllByRole('button').length).toBeLessThanOrEqual(9);
  expect(current(container)).toBe('500000');
});

test('empty, single-page and non-finite values have no impossible navigation', () => {
  const { container, rerender } = render(<Pagination total={0} showQuickJumper showTotal />);
  expect(container.textContent).toContain('共 0 条');
  expect(container.textContent).toContain('暂无分页数据');
  expect(screen.getAllByRole<HTMLButtonElement>('button').every((button) => button.disabled)).toBe(true);
  expect(screen.getByRole<HTMLInputElement>('textbox', { name: '跳转页码' }).disabled).toBe(true);
  rerender(<Pagination total={NaN} page={Infinity} pageSize={NaN} />);
  expect(current(container)).toBeUndefined();
  rerender(<Pagination total={1.9} page={-5} pageSize={0} />);
  expect(current(container)).toBe('1');
  expect(screen.getByRole<HTMLButtonElement>('button', { name: '下一页' }).disabled).toBe(true);
});

test('quick jumper validates integers, reports errors, and Enter does not submit its surrounding form', () => {
  const change = vi.fn();
  const submit = vi.fn((event) => event.preventDefault());
  const { container } = render(<form onSubmit={submit}><Pagination total={100} onPageChange={change} showQuickJumper /></form>);
  const input = screen.getByRole('textbox', { name: '跳转页码' });
  for (const value of ['0', '-1', '11', '2.5', '1e1', 'abc']) {
    fireEvent.change(input, { target: { value } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByRole('alert').textContent).toBe('请输入 1–10 之间的整数页码');
    expect(input.getAttribute('aria-describedby')).toBe(screen.getByRole('alert').id);
  }
  expect(change).not.toHaveBeenCalled();
  fireEvent.change(input, { target: { value: '8' } });
  fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
  expect(change).not.toHaveBeenCalled();
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(current(container)).toBe('8');
  expect(change).toHaveBeenLastCalledWith(8, 10);
  expect(screen.queryByRole('alert')).toBeNull();
  expect(submit).not.toHaveBeenCalled();
  fireEvent.change(input, { target: { value: '3' } });
  fireEvent.click(screen.getByRole('button', { name: '跳转', exact: true }));
  expect(current(container)).toBe('3');
});

test('disabled and capture-canceled interactions do not change pages', () => {
  const change = vi.fn();
  const { rerender } = render(<Pagination total={80} defaultPage={3} disabled showSizeChanger showQuickJumper onPageChange={change} />);
  fireEvent.click(screen.getByRole('button', { name: '下一页' }));
  expect(screen.getByRole<HTMLButtonElement>('combobox').disabled).toBe(true);
  expect(screen.getAllByRole<HTMLButtonElement>('button').every((button) => button.disabled)).toBe(true);
  expect(change).not.toHaveBeenCalled();
  rerender(<Pagination total={80} onPageChange={change} onClickCapture={(event) => event.preventDefault()} />);
  fireEvent.click(screen.getByRole('button', { name: '下一页' }));
  expect(change).not.toHaveBeenCalled();
});

test('page size selection filters invalid options and resets uncontrolled pagination to one', async () => {
  const user = userEvent.setup();
  // jsdom does not implement scrolling focused options into view.
  const original = Element.prototype.scrollIntoView;
  Element.prototype.scrollIntoView = vi.fn();
  try {
    const change = vi.fn();
    const sizeChange = vi.fn();
    const { container } = render(<Pagination total={120} defaultPage={6} defaultPageSize={6} pageSizeOptions={[10, 10, 20, 0, -1, NaN, 2.5]} onPageChange={change} onPageSizeChange={sizeChange} showSizeChanger />);
    const trigger = screen.getByRole('combobox', { name: '每页条数' });
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getAllByRole('option').map((option) => option.textContent?.replace('✓', ''))).toEqual(['6 条 / 页', '10 条 / 页', '20 条 / 页']);
    await user.click(screen.getByRole('option', { name: '20 条 / 页' }));
    expect(current(container)).toBe('1');
    expect(trigger.textContent).toBe('20 条 / 页');
    expect(sizeChange).toHaveBeenCalledExactlyOnceWith(20);
    expect(change).toHaveBeenCalledExactlyOnceWith(1, 20);
  } finally { Element.prototype.scrollIntoView = original; }
});

test('controlled page size waits for parent updates and requests both new size and first page', async () => {
  const user = userEvent.setup();
  const original = Element.prototype.scrollIntoView;
  Element.prototype.scrollIntoView = vi.fn();
  try {
    const change = vi.fn();
    const { container, rerender } = render(<Pagination total={100} page={3} pageSize={10} showSizeChanger onPageChange={change} />);
    screen.getByRole<HTMLElement>('combobox').focus();
    await user.keyboard('{ArrowDown}');
    await user.click(screen.getByRole('option', { name: '20 条 / 页' }));
    expect(current(container)).toBe('3');
    expect(screen.getByRole('combobox').textContent).toBe('10 条 / 页');
    expect(change).toHaveBeenCalledExactlyOnceWith(1, 20);
    rerender(<Pagination total={100} page={1} pageSize={20} showSizeChanger onPageChange={change} />);
    expect(current(container)).toBe('1');
    expect(screen.getByRole('combobox').textContent).toBe('20 条 / 页');
  } finally { Element.prototype.scrollIntoView = original; }
});

test('keyboard activates page buttons and demo slices content and resets when filtered', async () => {
  const user = userEvent.setup();
  render(<PaginationDemo expanded />);
  const nav = within(screen.getByRole('navigation', { name: '灵感档案分页' }));
  const region = screen.getByRole('region', { name: '当前页笔记' });
  expect(within(region).getByText('19')).toBeTruthy();
  nav.getByRole<HTMLButtonElement>('button', { name: '下一页' }).focus();
  await user.keyboard(' ');
  expect(within(region).getByText('25')).toBeTruthy();
  await user.click(within(screen.getByRole('group', { name: '笔记分类' })).getByRole('button', { name: '设计', exact: true }));
  expect(nav.getByRole<HTMLButtonElement>('button', { name: '上一页' }).disabled).toBe(true);
  expect(within(region).getByText('01')).toBeTruthy();
});
