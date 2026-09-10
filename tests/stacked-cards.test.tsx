import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { Input, StackedCards, type StackedCardItem } from '../src';

const items: StackedCardItem[] = [
  { id: 'design', title: '设计', content: <Input label="项目名称" /> },
  { id: 'trip', title: '出游', content: <button>确认出发</button> },
  { id: 'reading', title: '阅读', content: <p>阅读清单</p> },
];

it('expands one list item, preserves hidden fields and supports keyboard navigation', async () => {
  const user = userEvent.setup();
  const changed = vi.fn();
  render(<StackedCards items={items} onValueChange={changed} />);
  expect(screen.getAllByRole('listitem')).toHaveLength(3);
  expect(screen.getAllByRole('region')).toHaveLength(1);
  const input = screen.getByRole('textbox', { name: '项目名称' });
  await user.type(input, '保留的灵感');
  const design = screen.getByRole('button', { name: '设计' });
  const trip = screen.getByRole('button', { name: '出游' });
  const reading = screen.getByRole('button', { name: '阅读' });
  await user.click(trip);
  expect(design.getAttribute('aria-expanded')).toBe('false');
  expect(input.closest('[role="region"]')?.hasAttribute('inert')).toBe(true);
  expect(screen.queryByRole('textbox')).toBeNull();
  expect(changed).toHaveBeenLastCalledWith('trip');
  await user.keyboard('{ArrowDown}');
  expect(document.activeElement).toBe(reading);
  expect(trip.getAttribute('aria-expanded')).toBe('true');
  await user.keyboard('{ArrowDown}');
  expect(document.activeElement).toBe(design);
  await user.keyboard('{ArrowUp}');
  expect(document.activeElement).toBe(reading);
  await user.keyboard('{Home}{Enter}');
  expect(document.activeElement).toBe(design);
  expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('保留的灵感');
  await user.keyboard('{End} ');
  expect(reading.getAttribute('aria-expanded')).toBe('true');
  await user.keyboard(' ');
  expect(screen.queryByRole('region')).toBeNull();
  expect(changed).toHaveBeenLastCalledWith(null);
  expect(screen.queryByRole('button', { name: '确认出发' })).toBeNull();
});

it('honors controlled selection, keeps IDs through reordering, and handles removal and empty lists', async () => {
  const user = userEvent.setup();
  const changed = vi.fn();
  const { rerender } = render(<StackedCards items={items} value="trip" onValueChange={changed} />);
  await user.click(screen.getByRole('button', { name: '设计' }));
  expect(changed).toHaveBeenLastCalledWith('design');
  expect(screen.getByRole('region', { name: '出游' })).toBeDefined();
  rerender(<StackedCards items={[...items].reverse()} value="trip" />);
  expect(screen.getByRole('region', { name: '出游' })).toBeDefined();
  rerender(<StackedCards items={items.filter((item) => item.id !== 'trip')} value="trip" />);
  expect(screen.queryByRole('region')).toBeNull();
  rerender(<StackedCards items={[]} value="trip" />);
  expect(screen.queryByRole('listitem')).toBeNull();
  rerender(<StackedCards key="collapsed" items={items} defaultValue={null} />);
  expect(screen.queryByRole('region')).toBeNull();
});
