import { createRef } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { DatePicker } from '../src';

// jsdom has no pointer capture or layout scrolling. Keep only these missing
// browser methods local to this suite; the Select interaction itself stays real.
const browserMethodShims = {
  hasPointerCapture: () => false,
  scrollIntoView: () => {},
};
const originalBrowserMethods = new Map<string, PropertyDescriptor | undefined>();

beforeAll(() => {
  for (const [name, value] of Object.entries(browserMethodShims)) {
    if (typeof (Element.prototype as unknown as Record<string, unknown>)[name] === 'function') continue;
    originalBrowserMethods.set(name, Object.getOwnPropertyDescriptor(Element.prototype, name));
    Object.defineProperty(Element.prototype, name, { configurable: true, writable: true, value });
  }
});

afterAll(() => {
  for (const [name, descriptor] of originalBrowserMethods) {
    if (descriptor) Object.defineProperty(Element.prototype, name, descriptor);
    else Reflect.deleteProperty(Element.prototype, name);
  }
});

function dateButton(date: string) {
  return screen.getByRole<HTMLButtonElement>('button', { name: new RegExp(`^${date}`) });
}

function formValue(name = 'date') {
  return new FormData(screen.getByRole<HTMLFormElement>('form', { name: '日期表单' })).get(name);
}

describe('DatePicker interactions', () => {
  it('selects a leap day, submits its local calendar date and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <form aria-label="日期表单">
        <DatePicker label="预约日期" name="date" defaultValue={new Date(2024, 1, 28, 23, 45)} onValueChange={onValueChange} />
      </form>,
    );
    const trigger = screen.getByRole('button', { name: /预约日期/ });
    expect(formValue()).toBe('2024-02-28');

    await user.click(trigger);
    expect(screen.getByRole('dialog', { name: '预约日期日期选择器' })).toBeDefined();
    await user.click(dateButton('2024年2月29日'));

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2024, 1, 29));
    expect(formValue()).toBe('2024-02-29');
    expect(trigger.textContent).toContain('2024-02-29');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it('supports arrow-key date selection, Enter and Escape without trapping focus', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<DatePicker label="交付日期" defaultValue={new Date(2024, 1, 28)} onValueChange={onValueChange} />);
    const trigger = screen.getByRole('button', { name: /交付日期/ });

    trigger.focus();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(document.activeElement).toBe(dateButton('2024年2月28日')));
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(dateButton('2024年2月29日'));
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2024, 1, 29));
    await waitFor(() => expect(document.activeElement).toBe(trigger));

    await user.keyboard('{Enter}');
    expect(screen.getByRole('dialog')).toBeDefined();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(trigger));
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it('navigates years and months through the Chinese dropdowns', async () => {
    const user = userEvent.setup();
    render(<DatePicker label="纪念日期" defaultValue={new Date(2024, 1, 29)} />);
    await user.click(screen.getByRole('button', { name: /纪念日期/ }));

    await user.click(screen.getByRole('combobox', { name: '选择年份' }));
    await user.click(screen.getByRole('option', { name: '2028年', exact: true }));
    expect(screen.getByRole('grid', { name: '2028年2月' })).toBeDefined();
    expect(dateButton('2028年2月29日').disabled).toBe(false);
    await user.click(screen.getByRole('combobox', { name: '选择月份' }));
    await user.click(screen.getByRole('option', { name: '3月', exact: true }));
    expect(screen.getByRole('grid', { name: '2028年3月' })).toBeDefined();
    await user.click(dateButton('2028年3月15日'));

    expect(screen.getByRole('button', { name: /纪念日期/ }).textContent).toContain('2028-03-15');
  });

  it('focuses the current year on opening and lets Escape close only the year list', async () => {
    const user = userEvent.setup();
    render(<DatePicker label="年份选择" defaultValue={new Date(2024, 1, 28)} />);
    const trigger = screen.getByRole('button', { name: /年份选择/ });
    await user.click(trigger);
    const yearTrigger = screen.getByRole('combobox', { name: '选择年份' });
    await user.click(yearTrigger);
    expect(screen.getByRole('listbox')).toBeDefined();
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('option', { name: '2024年', exact: true })));

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    expect(screen.getByRole('dialog', { name: '年份选择日期选择器' })).toBeDefined();
    await waitFor(() => expect(document.activeElement).toBe(yearTrigger));
    expect(screen.getByRole('grid', { name: '2024年2月' })).toBeDefined();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it('changes the year with arrow keys and Enter before selecting a date in the new year', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<DatePicker label="键盘年份" defaultValue={new Date(2024, 1, 28)} onValueChange={onValueChange} />);
    await user.click(screen.getByRole('button', { name: /键盘年份/ }));
    const yearTrigger = screen.getByRole('combobox', { name: '选择年份' });
    yearTrigger.focus();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('option', { name: '2024年', exact: true })));
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('option', { name: '2025年', exact: true })));
    await user.keyboard('{Enter}');

    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    expect(screen.getByRole('grid', { name: '2025年2月' })).toBeDefined();
    expect(onValueChange).not.toHaveBeenCalled();
    await user.click(dateButton('2025年2月28日'));
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2025, 1, 28));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('keeps months outside the date limits disabled in the custom month list', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        label="月份边界"
        defaultValue={new Date(2024, 4, 15)}
        minDate={new Date(2024, 3, 15)}
        maxDate={new Date(2024, 5, 20)}
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole('button', { name: /月份边界/ }));
    await user.click(screen.getByRole('combobox', { name: '选择月份' }));
    const beforeMinimum = screen.getByRole('option', { name: '3月', exact: true });
    const afterMaximum = screen.getByRole('option', { name: '7月', exact: true });
    expect(beforeMinimum.getAttribute('aria-disabled')).toBe('true');
    expect(afterMaximum.getAttribute('aria-disabled')).toBe('true');
    await user.click(beforeMinimum);
    expect(screen.getByRole('listbox')).toBeDefined();
    await user.click(afterMaximum);
    expect(screen.getByRole('listbox')).toBeDefined();
    expect(onValueChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole('option', { name: '6月', exact: true }));
    expect(screen.getByRole('grid', { name: '2024年6月' })).toBeDefined();
    expect(dateButton('2024年6月20日').disabled).toBe(false);
    expect(dateButton('2024年6月21日').disabled).toBe(true);
    await user.click(dateButton('2024年6月20日'));
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2024, 5, 20));
  });

  it('includes both local-date limits regardless of their time of day and blocks dates outside them', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(
      <DatePicker
        label="可选日期"
        defaultValue={new Date(2024, 1, 28)}
        minDate={new Date(2024, 1, 28, 23, 59, 59)}
        maxDate={new Date(2024, 1, 29, 0, 0, 1)}
        onValueChange={onValueChange}
      />,
    );
    const trigger = screen.getByRole('button', { name: /可选日期/ });
    await user.click(trigger);

    expect(dateButton('2024年2月27日').disabled).toBe(true);
    expect(dateButton('2024年2月28日').disabled).toBe(false);
    expect(dateButton('2024年2月29日').disabled).toBe(false);
    // The navigation bounds hide dates in the following month entirely.
    expect(screen.queryByRole('button', { name: /^2024年3月1日/ })).toBeNull();
    expect(screen.getByRole('button', { name: '下个月' }).getAttribute('aria-disabled')).toBe('true');
    expect(screen.getByRole<HTMLButtonElement>('button', { name: '今天', exact: true }).disabled).toBe(true);
    await user.click(dateButton('2024年2月27日'));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeDefined();
    await user.click(dateButton('2024年2月28日'));
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2024, 1, 28));
    await user.click(trigger);
    await user.click(dateButton('2024年2月29日'));
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2024, 1, 29));

    rerender(<DatePicker label="可选日期" minDate={new Date(2024, 1, 27)} maxDate={new Date(2024, 1, 28, 23, 59)} onValueChange={onValueChange} />);
    await user.click(trigger);
    expect(dateButton('2024年2月28日').disabled).toBe(false);
    expect(dateButton('2024年2月29日').disabled).toBe(true);
    await user.click(dateButton('2024年2月29日'));
    expect(onValueChange).toHaveBeenCalledTimes(2);
  });

  it('keeps explicit undefined controlled, and applies selection or clearing only after the parent updates value', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const view = (value: Date | undefined) => (
      <form aria-label="日期表单">
        <DatePicker label="受控日期" name="date" placeholder="待定" value={value} defaultValue={new Date(2024, 1, 28)} onValueChange={onValueChange} />
      </form>
    );
    const { rerender } = render(view(undefined));
    const trigger = screen.getByRole('button', { name: /受控日期/ });
    expect(trigger.textContent).toContain('待定');
    expect(formValue()).toBe('');

    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: '今天', exact: true }));
    const today = new Date();
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
    expect(trigger.textContent).toContain('待定');
    expect(formValue()).toBe('');

    rerender(view(new Date(2024, 1, 29, 0, 15)));
    expect(trigger.textContent).toContain('2024-02-29');
    expect(formValue()).toBe('2024-02-29');
    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: '清除', exact: true }));
    expect(onValueChange).toHaveBeenLastCalledWith(undefined);
    expect(formValue()).toBe('2024-02-29');
    rerender(view(undefined));
    expect(formValue()).toBe('');
    expect(trigger.textContent).toContain('待定');
  });

  it('clears an uncontrolled selection and hides the clear action when clearable is false', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(
      <form aria-label="日期表单">
        <DatePicker label="开始日期" name="date" defaultValue={new Date(2024, 1, 29)} onValueChange={onValueChange} />
      </form>,
    );
    const trigger = screen.getByRole('button', { name: /开始日期/ });
    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: '清除', exact: true }));
    expect(onValueChange).toHaveBeenLastCalledWith(undefined);
    expect(formValue()).toBe('');
    await waitFor(() => expect(document.activeElement).toBe(trigger));

    rerender(<DatePicker label="开始日期" defaultValue={new Date(2024, 1, 29)} clearable={false} />);
    await user.click(screen.getByRole('button', { name: /开始日期/ }));
    expect(within(screen.getByRole('dialog')).queryByRole('button', { name: '清除', exact: true })).toBeNull();
  });

  it('omits disabled values from native form data and forwards a ref to the disabled trigger', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLButtonElement>();
    const onValueChange = vi.fn();
    render(
      <form aria-label="日期表单">
        <DatePicker ref={ref} label="锁定日期" name="date" defaultValue={new Date(2024, 1, 29)} disabled onValueChange={onValueChange} />
      </form>,
    );
    const trigger = screen.getByRole<HTMLButtonElement>('button', { name: /锁定日期/ });
    expect(ref.current).toBe(trigger);
    expect(trigger.disabled).toBe(true);
    expect(formValue()).toBeNull();
    await user.click(trigger);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('restores the initial uncontrolled date on a native form reset without emitting a selection change', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <form aria-label="日期表单">
        <DatePicker label="重置日期" name="date" defaultValue={new Date(2024, 1, 28)} onValueChange={onValueChange} />
        <button type="reset">重置表单</button>
      </form>,
    );
    const trigger = screen.getByRole('button', { name: /重置日期/ });
    await user.click(trigger);
    await user.click(dateButton('2024年2月29日'));
    expect(formValue()).toBe('2024-02-29');

    await user.click(screen.getByRole('button', { name: '重置表单' }));
    await waitFor(() => expect(formValue()).toBe('2024-02-28'));
    expect(trigger.textContent).toContain('2024-02-28');
    expect(onValueChange).toHaveBeenCalledTimes(1);
    await user.click(trigger);
    await waitFor(() => expect(document.activeElement).toBe(dateButton('2024年2月28日')));
  });

  it('associates its label, hint and validation error with the trigger', async () => {
    const user = userEvent.setup();
    render(<DatePicker id="deadline" label="截止日期" hint="请选择工作日" error="日期不在有效范围内" />);
    const trigger = screen.getByRole('button', { name: /截止日期/ });
    expect(trigger.id).toBe('deadline');
    expect(trigger.getAttribute('aria-invalid')).toBe('true');
    const descriptionIds = trigger.getAttribute('aria-describedby')?.split(/\s+/) ?? [];
    expect(descriptionIds).toContain(screen.getByText('请选择工作日').id);
    expect(descriptionIds).toContain(screen.getByText('日期不在有效范围内').id);
    await user.click(screen.getByText('截止日期', { selector: 'label' }));
    expect(screen.getByRole('dialog')).toBeDefined();
  });

  it('treats invalid dates as empty and blocks selection when the bounds are reversed', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(
      <form aria-label="日期表单">
        <DatePicker label="异常日期" name="date" placeholder="尚未选择" value={new Date(Number.NaN)} minDate={new Date(Number.NaN)} onValueChange={onValueChange} />
      </form>,
    );
    const trigger = screen.getByRole('button', { name: /异常日期/ });
    expect(trigger.textContent).toContain('尚未选择');
    expect(formValue()).toBe('');
    await user.click(trigger);
    expect(screen.getByRole<HTMLButtonElement>('button', { name: '今天', exact: true }).disabled).toBe(false);
    await user.keyboard('{Escape}');

    rerender(<DatePicker label="异常日期" defaultValue={new Date(2024, 1, 29)} minDate={new Date(2024, 2, 1)} maxDate={new Date(2024, 1, 28)} onValueChange={onValueChange} />);
    await user.click(screen.getByRole('button', { name: /异常日期/ }));
    expect(screen.getByText('日期范围无效，请检查最早和最晚日期。')).toBeDefined();
    expect(screen.getByRole<HTMLButtonElement>('button', { name: '今天', exact: true }).disabled).toBe(true);
    const days = within(screen.getByRole('grid')).getAllByRole<HTMLButtonElement>('button');
    expect(days.length).toBeGreaterThan(0);
    expect(days.every((day) => day.disabled)).toBe(true);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
