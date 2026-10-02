import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { expect, test, vi } from 'vitest';
import { Button, EmptyState } from '../src';

test('groups title, description and action with accessible region semantics', () => {
  const ref = createRef<HTMLDivElement>();
  const click = vi.fn();
  render(<EmptyState ref={ref} title="没有内容" description="换个关键词试试" icon={<span>i</span>} action={<Button onClick={click}>清除筛选</Button>} />);
  const region = screen.getByRole('region', { name: '没有内容' });
  expect(ref.current).toBe(region);
  expect(screen.getByText('换个关键词试试')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: '清除筛选' }));
  expect(click).toHaveBeenCalledOnce();
  expect(screen.getByText('i').parentElement?.getAttribute('aria-hidden')).toBe('true');
});

test('supports compact accent presentation', () => {
  render(<EmptyState title="空" size="sm" tone="accent" />);
  const region = screen.getByRole('region', { name: '空' });
  expect(region.getAttribute('data-size')).toBe('sm');
  expect(region.getAttribute('data-tone')).toBe('accent');
});
