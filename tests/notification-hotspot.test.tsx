import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { NotificationHotspot } from '../src';

test('caps visual count while preserving full accessible count and child interaction', () => {
  const click = vi.fn();
  render(<NotificationHotspot count={128} announce><button onClick={click}>消息</button></NotificationHotspot>);
  expect(screen.getByText('99+').getAttribute('aria-hidden')).toBe('true');
  expect(screen.getByRole('status').textContent).toBe('128 条未读通知');
  fireEvent.click(screen.getByRole('button', { name: '消息' }));
  expect(click).toHaveBeenCalledTimes(1);
});

test('handles zero, invalid values, hidden state and dot mode', () => {
  const { rerender, container } = render(<NotificationHotspot count={0} />);
  const marker = () => container.querySelector('.ray-notification-hotspot__marker');
  expect(marker()).toBeNull();
  for (const count of [-2, NaN, Infinity]) {
    rerender(<NotificationHotspot count={count} />);
    expect(marker()).toBeNull();
  }
  rerender(<NotificationHotspot count={0} showZero />);
  expect(marker()?.textContent).toBe('0');
  rerender(<NotificationHotspot count={4} active={false} announce><button>消息</button></NotificationHotspot>);
  expect(marker()).toBeNull();
  expect(screen.getByRole('status').textContent).toBe('');
  expect(screen.getByRole('button')).toBeTruthy();
  rerender(<NotificationHotspot pulse label="有更新" />);
  expect(marker()?.hasAttribute('data-dot')).toBe(true);
  expect(marker()?.hasAttribute('data-pulse')).toBe(true);
  expect(screen.getByText('有更新')).toBeTruthy();
});

test('normalizes limits and forwards wrapper attributes and ref', () => {
  const ref = createRef<HTMLSpanElement>();
  const { rerender } = render(<NotificationHotspot ref={ref} count={8.9} max={0} placement="bottom-left" className="custom" />);
  expect(screen.getByText('1+')).toBeTruthy();
  expect(ref.current?.dataset.placement).toBe('bottom-left');
  expect(ref.current?.classList.contains('custom')).toBe(true);
  rerender(<NotificationHotspot count={108} max={NaN} />);
  expect(screen.getByText('99+')).toBeTruthy();
});
