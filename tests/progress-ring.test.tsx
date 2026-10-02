import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { expect, test } from 'vitest';
import { ProgressRing } from '../src';

test('exposes determinate progress semantics and clamps invalid values', () => {
  const ref = createRef<HTMLDivElement>();
  render(<ProgressRing ref={ref} value={140} max={120} label="上传进度" />);
  const ring = screen.getByRole('progressbar', { name: '上传进度' });
  expect(ref.current).toBe(ring);
  expect(ring.getAttribute('aria-valuenow')).toBe('120');
  expect(ring.getAttribute('aria-valuemax')).toBe('120');
  expect(screen.getByText('100%')).toBeTruthy();
});

test('supports custom formatting and indeterminate state', () => {
  const { rerender } = render(<ProgressRing value={12} max={20} formatValue={(value, max) => `${value}/${max}`} showValue />);
  expect(screen.getByText('12/20')).toBeTruthy();
  rerender(<ProgressRing value={null} label="分析中" />);
  const ring = screen.getByRole('progressbar', { name: '分析中' });
  expect(ring.getAttribute('data-indeterminate')).toBe('true');
  expect(ring.hasAttribute('aria-valuenow')).toBe(false);
  expect(screen.getByText('…')).toBeTruthy();
});
