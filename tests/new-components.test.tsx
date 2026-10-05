import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { CommandPalette, CompareSlider, FileDropzone, MetricCard, SplitButton, Timeline } from '../src';

test.afterEach(() => cleanup());

test('CompareSlider exposes a keyboard slider and clamps its value', () => {
  const change = vi.fn();
  render(<CompareSlider before={<span>before</span>} after={<span>after</span>} defaultValue={150} onValueChange={change} />);
  const slider = screen.getByRole('slider', { name: '前后对比' });
  expect(slider.getAttribute('aria-valuenow')).toBe('100');
  fireEvent.keyDown(slider, { key: 'Home' });
  expect(change).toHaveBeenCalledWith(0);
  fireEvent.keyDown(slider, { key: 'PageUp' });
  expect(change).toHaveBeenLastCalledWith(10);
});

test('CompareSlider supports uncontrolled movement and disabled state', () => {
  render(<CompareSlider before="a" after="b" defaultValue={40} disabled />);
  const slider = screen.getByRole('slider');
  expect(slider.getAttribute('aria-disabled')).toBe('true');
  expect(slider.getAttribute('tabindex')).toBe('-1');
});

function file(name: string, type: string, size: number) {
  return new File([new Uint8Array(size)], name, { type, lastModified: 1 });
}

test('FileDropzone accepts matching files and reports invalid files', () => {
  const change = vi.fn();
  const reject = vi.fn();
  render(<FileDropzone accept="image/*" maxFiles={1} maxSize={10} onValueChange={change} onReject={reject} />);
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [file('ok.png', 'image/png', 8)] } });
  expect(change).toHaveBeenCalledWith([expect.objectContaining({ name: 'ok.png' })]);
  fireEvent.change(input, { target: { files: [file('bad.txt', 'text/plain', 8), file('large.png', 'image/png', 20)] } });
  expect(reject).toHaveBeenCalled();
  expect(screen.getByRole('list', { name: '文件选择错误' }).textContent).toContain('文件格式不符合要求');
});

test('FileDropzone removes a selected file', () => {
  render(<FileDropzone defaultValue={[file('draft.png', 'image/png', 4)]} />);
  fireEvent.click(screen.getByRole('button', { name: '移除 draft.png' }));
  expect(screen.queryByText('draft.png')).toBeNull();
});

test('Timeline renders statuses, current step and empty message', () => {
  render(<Timeline items={[{ id: 'a', title: '已完成', status: 'complete' }, { id: 'b', title: '进行中', status: 'current' }, { id: 'c', title: '错误', status: 'error' }]} />);
  expect(screen.getByRole('list', { name: '时间线' })).toBeTruthy();
  expect(screen.getAllByRole('listitem')[1].getAttribute('aria-current')).toBe('step');
  expect(screen.getAllByRole('listitem')).toHaveLength(3);
  cleanup();
  render(<Timeline items={[]} emptyMessage="还没有事件" />);
  expect(screen.getByText('还没有事件')).toBeTruthy();
});

test('CommandPalette filters commands and selects with the keyboard', () => {
  const select = vi.fn();
  render(<CommandPalette open onSelect={select} groups={[{ heading: '操作', items: [
    { id: 'new', label: '新建项目', description: '从空白开始', keywords: ['create'] },
    { id: 'archive', label: '归档项目', disabled: true },
  ] }]} />);
  const search = screen.getByRole('searchbox');
  fireEvent.change(search, { target: { value: '新建' } });
  expect(screen.getByRole('option', { name: /新建项目/ })).toBeTruthy();
  fireEvent.keyDown(search, { key: 'Enter' });
  expect(select).toHaveBeenCalledWith(expect.objectContaining({ id: 'new' }));
});

test('CommandPalette opens from the default keyboard shortcut', () => {
  const onOpenChange = vi.fn();
  render(<CommandPalette hotkey="k" onOpenChange={onOpenChange} groups={[{ items: [{ id: 'one', label: '一个命令' }] }]} />);
  fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
  expect(onOpenChange).toHaveBeenCalledWith(true);
});

test('MetricCard keeps its trend semantics and ignores invalid chart values', () => {
  render(<MetricCard label="活跃项目" value="24" delta="+4" trend="up" trendLabel="本月" data={[1, Number.NaN, 3]} />);
  expect(screen.getByRole('article').textContent).toContain('活跃项目');
  expect(screen.getByRole('article').textContent).toContain('+4');
  expect(document.querySelector('.ray-metric-card__chart polyline')).toBeTruthy();
});

test('SplitButton opens an action menu and selects an action', () => {
  const action = vi.fn();
  render(<SplitButton actions={[{ id: 'copy', label: '复制链接', onSelect: action }]}>导出作品</SplitButton>);
  fireEvent.click(screen.getByRole('button', { name: '打开更多操作' }));
  expect(screen.getByRole('menu')).toBeTruthy();
  fireEvent.click(screen.getByRole('menuitem', { name: '复制链接' }));
  expect(action).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole('menu')).toBeNull();
});
