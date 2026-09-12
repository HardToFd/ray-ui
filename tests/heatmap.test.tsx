import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { Heatmap } from '../src';

const cell = (date: string) => screen.getByRole('gridcell', { name: new RegExp(`^${date}，`) });
const dates = (container: HTMLElement) => Array.from(container.querySelectorAll<HTMLButtonElement>('button[data-date]'));

test('builds a complete inclusive leap-year calendar and handles sparse or malformed records without mutating data', () => {
  const data = Object.freeze([
    { date: '2024-02-28', value: 3 },
    { date: '2024-02-29', value: 9 },
    { date: '2024-02-29', value: 5 },
    { date: '2024-02-30', value: 99 },
    { date: '2024-03-01', value: -4 },
    { date: '2024-03-02', value: Infinity },
    { date: '2024-03-03', value: NaN },
    { date: '2025-01-01', value: 200 },
  ]);
  const { container } = render(<Heatmap data={data} startDate="2024-01-01" endDate="2024-12-31" />);
  expect(dates(container)).toHaveLength(366);
  expect(cell('2024-02-29').getAttribute('aria-label')).toBe('2024-02-29，5 次活动');
  expect(cell('2024-02-29').getAttribute('data-level')).toBe('4');
  ['2024-02-27', '2024-03-01', '2024-03-02', '2024-03-03'].forEach((date) => {
    expect(cell(date).getAttribute('data-level')).toBe('0');
  });
  expect(new Set(dates(container).map((day) => day.dataset.date)).size).toBe(366);
  expect(data[2].value).toBe(5);
  expect(screen.getByText('2 个活跃日')).toBeTruthy();
});

test('maps the fixed scale to five levels, caps colors without capping values, and falls back from invalid maxValue', () => {
  const data = [0, 1, 4, 5, 8, 9, 12, 13, 100].map((value, index) => ({ date: `2026-09-${String(index + 1).padStart(2, '0')}`, value }));
  const { rerender } = render(<Heatmap data={data} startDate="2026-09-01" endDate="2026-09-09" maxValue={16} formatValue={(value) => `${value} 分钟`} />);
  expect(data.map((day) => cell(day.date).getAttribute('data-level'))).toEqual(['0', '1', '1', '2', '2', '3', '3', '4', '4']);
  expect(cell('2026-09-09').getAttribute('aria-label')).toBe('2026-09-09，100 分钟');
  rerender(<Heatmap data={data} startDate="2026-09-01" endDate="2026-09-09" maxValue={NaN} />);
  expect(cell('2026-09-08').getAttribute('data-level')).toBe('1');
  expect(cell('2026-09-09').getAttribute('data-level')).toBe('4');
});

test('moves one Tab stop in the visual grid, respects row edges, and supports activation with the keyboard', async () => {
  const user = userEvent.setup();
  const changed = vi.fn();
  const { container } = render(<><Heatmap data={[]} startDate="2026-09-01" endDate="2026-09-30" onValueChange={changed} /><button>图表之后</button></>);
  await user.tab();
  expect(document.activeElement).toBe(cell('2026-09-01'));
  await user.keyboard('{ArrowRight}{ArrowDown}');
  expect(document.activeElement).toBe(cell('2026-09-09'));
  await user.keyboard('{Home}');
  expect(document.activeElement).toBe(cell('2026-09-02'));
  await user.keyboard('{End}');
  expect(document.activeElement).toBe(cell('2026-09-30'));
  await user.keyboard('{ArrowRight}');
  expect(document.activeElement).toBe(cell('2026-09-30'));
  await user.keyboard('{Control>}{Home}{/Control}{ArrowUp}');
  expect(document.activeElement).toBe(cell('2026-09-01'));
  await user.keyboard('{Control>}{End}{/Control}{Enter}');
  expect(changed).toHaveBeenLastCalledWith('2026-09-30', { date: '2026-09-30', value: 0 });
  expect(cell('2026-09-30').getAttribute('aria-selected')).toBe('true');
  expect(dates(container).filter((day) => day.tabIndex === 0)).toHaveLength(1);
  await user.tab();
  expect(document.activeElement).toBe(screen.getByRole('button', { name: '图表之后' }));
  expect(screen.queryByRole('tooltip')).toBeNull();
});

test('keeps Sunday and Monday starts spatially aligned across the year boundary', async () => {
  const user = userEvent.setup();
  const { rerender } = render(<Heatmap data={[]} startDate="2025-12-28" endDate="2026-01-06" weekStartsOn={0} />);
  expect(cell('2025-12-28').parentElement?.getAttribute('aria-rowindex')).toBe('1');
  expect(cell('2026-01-01').parentElement?.getAttribute('aria-rowindex')).toBe('5');
  await user.tab();
  await user.keyboard('{ArrowUp}');
  expect(document.activeElement).toBe(cell('2025-12-28'));
  await user.keyboard('{ArrowRight}{ArrowUp}');
  expect(document.activeElement).toBe(cell('2026-01-04'));
  rerender(<Heatmap data={[]} startDate="2025-12-28" endDate="2026-01-06" weekStartsOn={1} />);
  expect(cell('2025-12-28').parentElement?.getAttribute('aria-rowindex')).toBe('7');
  cell('2025-12-28').focus();
  await user.keyboard('{ArrowDown}');
  expect(document.activeElement).toBe(cell('2025-12-28'));
});

test('respects controlled selection, reports normalized data, and restores a Tab entry when the range changes', async () => {
  const user = userEvent.setup();
  const changed = vi.fn();
  const props = { data: [{ date: '2026-09-02', value: 8 }], startDate: '2026-09-01', endDate: '2026-09-07', onValueChange: changed };
  const { container, rerender } = render(<Heatmap {...props} value="2026-09-01" />);
  await user.click(cell('2026-09-02'));
  expect(changed).toHaveBeenLastCalledWith('2026-09-02', { date: '2026-09-02', value: 8 });
  expect(cell('2026-09-01').getAttribute('aria-selected')).toBe('true');
  expect(cell('2026-09-02').getAttribute('aria-selected')).toBe('false');
  rerender(<Heatmap {...props} value="2026-09-02" />);
  expect(screen.getByRole('status').textContent).toBe('2026-09-02，8 次活动');
  rerender(<Heatmap {...props} value={null} />);
  expect(dates(container).every((day) => day.getAttribute('aria-selected') === 'false')).toBe(true);
  rerender(<Heatmap {...props} startDate="2026-09-04" value="2026-09-02" />);
  expect(dates(container).filter((day) => day.tabIndex === 0).map((day) => day.dataset.date)).toEqual(['2026-09-04']);
  expect(screen.queryByRole('tooltip')).toBeNull();
});

test('opens accessible tooltips for hover and focus, updates their values, and dismisses with Escape', async () => {
  const user = userEvent.setup();
  const props = { startDate: '2026-09-01', endDate: '2026-09-02', defaultValue: '2026-09-02' };
  const { rerender } = render(<Heatmap {...props} data={[{ date: '2026-09-01', value: 3 }]} />);
  fireEvent.pointerEnter(cell('2026-09-01'));
  expect(screen.getByRole('tooltip').textContent).toBe('3 次活动2026-09-01');
  expect(cell('2026-09-01').getAttribute('aria-describedby')).toBe(screen.getByRole('tooltip').id);
  rerender(<Heatmap {...props} data={[{ date: '2026-09-01', value: 7 }]} />);
  expect(screen.getByRole('tooltip').textContent).toBe('7 次活动2026-09-01');
  fireEvent.pointerLeave(screen.getByRole('region', { name: '活动热力图' }));
  expect(screen.queryByRole('tooltip')).toBeNull();
  await user.tab();
  expect(document.activeElement).toBe(cell('2026-09-02'));
  expect(screen.getByRole('tooltip')).toBeTruthy();
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('tooltip')).toBeNull();
  expect(document.activeElement).toBe(cell('2026-09-02'));
  expect(cell('2026-09-02').hasAttribute('aria-describedby')).toBe(false);
});

test('shows all-zero data, single-day ranges and invalid ranges without rendering an unbounded grid', () => {
  const { container, rerender } = render(<Heatmap data={[]} startDate="2026-09-01" endDate="2026-09-01" emptyMessage="还没有记录" showLegend={false} />);
  expect(screen.getByText('还没有记录')).toBeTruthy();
  expect(dates(container)).toHaveLength(1);
  expect(cell('2026-09-01').tabIndex).toBe(0);
  expect(screen.queryByRole('group')).toBeNull();
  for (const [startDate, endDate] of [['2026-02-29', '2026-03-01'], ['2026-09-02', '2026-09-01'], ['2026-1-1', '2026-12-31'], ['2025-01-01', '2026-12-31']]) {
    rerender(<Heatmap data={[]} startDate={startDate} endDate={endDate} />);
    expect(screen.queryByRole('grid')).toBeNull();
    expect(screen.getByRole('status').textContent).toContain('请选择有效日期范围');
  }
});

test('keeps adjacent month labels when a recent range starts in the middle of a month', () => {
  render(<Heatmap data={[]} startDate="2026-06-15" endDate="2026-09-12" />);
  ['6月', '7月', '8月', '9月'].forEach((month) => expect(screen.getByText(month)).toBeTruthy());
});
