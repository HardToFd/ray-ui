import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { expect, test } from 'vitest';
import { Slider } from '../src';

test('controlled slider updates formatted value and preserves native range attributes', () => {
  function Demo() {
    const [value, setValue] = useState(40);
    return <Slider label="音量" name="volume" min={10} max={90} step={5} value={value} onValueChange={setValue} formatValue={(n) => `${n}%`} />;
  }
  const { rerender } = render(<Demo />);
  const input = screen.getByRole('slider', { name: '音量' }) as HTMLInputElement;
  fireEvent.change(input, { target: { value: '65' } });
  expect(input.value).toBe('65');
  expect(input.getAttribute('aria-valuetext')).toBe('65%');
  expect([input.min, input.max, input.step, input.name]).toEqual(['10', '90', '5', 'volume']);
  rerender(<Slider label="锁定" value={200} disabled />);
  expect((screen.getByRole('slider') as HTMLInputElement).disabled).toBe(true);
  expect((screen.getByRole('slider') as HTMLInputElement).value).toBe('100');
});
