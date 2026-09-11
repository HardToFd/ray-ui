import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Leaderboard } from '../src';

test('sorts scores without mutating input, computes leader-relative bars and updates ranks', () => {
  const items = [{ id: 'a', name: '甲', value: 75, tone: 'blue' as const }, { id: 'b', name: '乙', value: 100, change: -2 }];
  const { rerender } = render(<Leaderboard items={items} />);
  expect(screen.getAllByRole('listitem')[0].textContent).toContain('乙');
  expect(screen.getByRole('meter', { name: '甲，相对榜首' }).getAttribute('aria-valuenow')).toBe('75');
  expect(screen.getByLabelText('下降 2 名')).toBeTruthy();
  expect(items[0].id).toBe('a');
  rerender(<Leaderboard items={[{ ...items[0], value: 125 }, items[1]]} />);
  expect(screen.getAllByRole('listitem')[0].getAttribute('data-tone')).toBe('blue');
  expect(screen.getByRole('meter', { name: '乙，相对榜首' }).getAttribute('aria-valuenow')).toBe('80');
});

test('handles zero, negative, nonfinite values, equal scores and empty data', () => {
  const { rerender } = render(<Leaderboard items={[{ id: 'a', name: '甲', value: 0 }, { id: 'b', name: '乙', value: -1 }, { id: 'c', name: '丙', value: NaN }]} />);
  expect(screen.getAllByRole('meter').map((meter) => meter.getAttribute('aria-valuenow'))).toEqual(['0', '0', '0']);
  expect(screen.getAllByRole('listitem')[0].textContent).toContain('甲');
  rerender(<Leaderboard items={[]} emptyMessage="尚未开赛" />);
  expect(screen.getByRole('status').textContent).toBe('尚未开赛');
  expect(screen.queryByRole('list')).toBeNull();
});

test('broken decorative avatar falls back to initial and custom formatter is accessible', () => {
  const { container } = render(<Leaderboard items={[{ id: 'a', name: '林予安', value: 12, avatar: '/missing.png' }]} valueLabel="公里" formatValue={(value) => value.toFixed(1)} />);
  const avatar = container.querySelector('img')!;
  fireEvent.error(avatar);
  expect(avatar.style.display).toBe('none');
  expect(screen.getByText('林')).toBeTruthy();
  expect(screen.getByLabelText('12.0 公里')).toBeTruthy();
});
