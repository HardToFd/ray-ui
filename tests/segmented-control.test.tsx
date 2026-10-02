import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef, useState } from 'react';
import { expect, test, vi } from 'vitest';
import { SegmentedControl } from '../src';

const options = [
  { value: 'one', label: '一' },
  { value: 'two', label: '二' },
  { value: 'three', label: '三', disabled: true },
  { value: 'four', label: '四' },
];

test('renders radiogroup, selects options and forwards its ref', () => {
  const ref = createRef<HTMLDivElement>();
  const change = vi.fn();
  render(<SegmentedControl ref={ref} aria-label="视图" options={options} defaultValue="one" onValueChange={change} />);
  const group = screen.getByRole('radiogroup', { name: '视图' });
  expect(ref.current).toBe(group);
  expect(screen.getByRole('radio', { name: '一' }).getAttribute('aria-checked')).toBe('true');
  fireEvent.click(screen.getByRole('radio', { name: '二' }));
  expect(change).toHaveBeenCalledWith('two');
  expect(screen.getByRole('radio', { name: '二' }).getAttribute('aria-checked')).toBe('true');
});

test('arrow keys skip disabled options and wrap, Home and End jump', () => {
  const change = vi.fn();
  render(<SegmentedControl aria-label="视图" options={options} defaultValue="one" onValueChange={change} />);
  const one = screen.getByRole('radio', { name: '一' });
  one.focus();
  fireEvent.keyDown(one, { key: 'ArrowRight' });
  expect(document.activeElement).toBe(screen.getByRole('radio', { name: '二' }));
  fireEvent.keyDown(screen.getByRole('radio', { name: '二' }), { key: 'ArrowRight' });
  expect(document.activeElement).toBe(screen.getByRole('radio', { name: '四' }));
  fireEvent.keyDown(screen.getByRole('radio', { name: '四' }), { key: 'End' });
  expect(change).toHaveBeenLastCalledWith('four');
  fireEvent.keyDown(screen.getByRole('radio', { name: '四' }), { key: 'ArrowRight' });
  expect(document.activeElement).toBe(screen.getByRole('radio', { name: '一' }));
});

test('controlled values wait for the parent and whole-group disabled blocks changes', () => {
  function Harness() {
    const [value, setValue] = useState('one');
    return <SegmentedControl aria-label="视图" value={value} onValueChange={setValue} options={options} />;
  }
  render(<Harness />);
  fireEvent.click(screen.getByRole('radio', { name: '二' }));
  expect(screen.getByRole('radio', { name: '二' }).getAttribute('aria-checked')).toBe('true');
  cleanup();
  const change = vi.fn();
  render(<SegmentedControl aria-label="禁用视图" disabled options={options} onValueChange={change} />);
  fireEvent.click(screen.getByRole('radio', { name: '一' }));
  expect(change).not.toHaveBeenCalled();
});
