import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button, DataTable, Dialog, Input, Switch, Tabs, type DataTableColumn } from '../src';

describe('Dialog keyboard access', () => {
  it('focuses the first field when opened and keeps Tab navigation inside the dialog', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Dialog trigger={<Button>Edit profile</Button>} title="Edit profile" description="Update your details.">
          <Input label="Display name" />
          <Button>Save profile</Button>
        </Dialog>
        <Button>Outside the dialog</Button>
      </>,
    );

    await user.click(screen.getByRole('button', { name: 'Edit profile' }));
    const dialog = screen.getByRole('dialog', { name: 'Edit profile' });
    const field = within(dialog).getByRole('textbox', { name: 'Display name' });
    const close = within(dialog).getByRole('button', { name: '关闭对话框' });

    await waitFor(() => expect(document.activeElement).toBe(field));
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(close);
    await user.tab();
    expect(document.activeElement).toBe(field);
    await user.tab();
    expect(document.activeElement).toBe(within(dialog).getByRole('button', { name: 'Save profile' }));
    await user.tab();
    expect(document.activeElement).toBe(close);
    await user.tab();
    expect(document.activeElement).toBe(field);
  });

  it('closes with Escape and returns focus to its trigger', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Dialog trigger={<Button>Open preferences</Button>} title="Preferences" onOpenChange={onOpenChange}>
        <Input label="Project name" />
      </Dialog>,
    );
    const trigger = screen.getByRole('button', { name: 'Open preferences' });

    await user.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Preferences' })).toBeDefined();
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(trigger));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });
});

it('navigates Tabs with arrow keys, skips disabled tabs and wraps around', async () => {
  const user = userEvent.setup();
  render(
    <Tabs
      aria-label="Account settings"
      items={[
        { value: 'profile', label: 'Profile', content: 'Profile settings' },
        { value: 'billing', label: 'Billing', content: 'Billing settings', disabled: true },
        { value: 'security', label: 'Security', content: 'Security settings' },
      ]}
    />,
  );
  const profile = screen.getByRole('tab', { name: 'Profile' });
  const security = screen.getByRole('tab', { name: 'Security' });

  await user.tab();
  expect(document.activeElement).toBe(profile);
  await user.keyboard('{ArrowRight}');
  await waitFor(() => expect(document.activeElement).toBe(security));
  expect(security.getAttribute('aria-selected')).toBe('true');
  expect(screen.getByRole('tabpanel', { name: 'Security' }).textContent).toBe('Security settings');
  await user.keyboard('{ArrowRight}');
  await waitFor(() => expect(document.activeElement).toBe(profile));
  expect(profile.getAttribute('aria-selected')).toBe('true');
  await user.keyboard('{ArrowLeft}');
  await waitFor(() => expect(document.activeElement).toBe(security));
});

interface Person {
  id: string;
  name: string;
  team: string;
  points: number;
}

const people: Person[] = [
  { id: 'a', name: 'Ada', team: 'Alpha', points: 42 },
  { id: 'b', name: 'Bea', team: 'Alpha', points: 7 },
  { id: 'c', name: 'Chen', team: 'Beta', points: 18 },
  { id: 'd', name: 'Devi', team: 'Alpha', points: 7 },
  { id: 'e', name: 'Eli', team: 'Alpha', points: 30 },
  { id: 'f', name: 'Finn', team: 'Beta', points: 3 },
];

const columns: DataTableColumn<Person>[] = [
  { key: 'name', header: 'Name' },
  { key: 'team', header: 'Team' },
  { key: 'points', header: 'Points', sortable: true },
];

function visibleNames() {
  const table = screen.getByRole('table', { name: 'People' });
  return within(table).getAllByRole('row').slice(1).map((row) => within(row).getAllByRole('cell')[0].textContent);
}

describe('DataTable interactions', () => {
  it('searches the full data set and returns to page one even if the previous page is still valid', async () => {
    const user = userEvent.setup();
    render(<DataTable data={people} columns={columns} pageSize={2} caption="People" />);
    await user.click(screen.getByRole('button', { name: '下一页' }));
    expect(visibleNames()).toEqual(['Chen', 'Devi']);

    await user.type(screen.getByRole('searchbox', { name: '搜索People' }), 'Alpha');

    expect(visibleNames()).toEqual(['Ada', 'Bea']);
    expect(screen.getByRole('status').textContent).toBe('4 条结果');
    expect(screen.getByRole<HTMLButtonElement>('button', { name: '上一页' }).disabled).toBe(true);
    await user.click(screen.getByRole('button', { name: '下一页' }));
    expect(visibleNames()).toEqual(['Devi', 'Eli']);
  });

  it('sorts numerically in both directions without changing the supplied data', async () => {
    const user = userEvent.setup();
    const data = people.map((person) => ({ ...person }));
    const original = data.map((person) => ({ ...person }));
    data.forEach(Object.freeze);
    Object.freeze(data);
    render(<DataTable data={data} columns={columns} pageSize={10} caption="People" />);

    await user.click(screen.getByRole('button', { name: '按Points升序排列' }));
    expect(visibleNames()).toEqual(['Finn', 'Bea', 'Devi', 'Chen', 'Eli', 'Ada']);
    expect(screen.getByRole('columnheader', { name: /Points/ }).getAttribute('aria-sort')).toBe('ascending');
    await user.click(screen.getByRole('button', { name: '按Points降序排列' }));
    expect(visibleNames()).toEqual(['Ada', 'Eli', 'Chen', 'Bea', 'Devi', 'Finn']);
    expect(screen.getByRole('columnheader', { name: /Points/ }).getAttribute('aria-sort')).toBe('descending');
    expect(data).toEqual(original);
  });

  it('offers a working clear action after an empty search and restores the first page', async () => {
    const user = userEvent.setup();
    render(<DataTable data={people} columns={columns} pageSize={2} caption="People" />);
    await user.click(screen.getByRole('button', { name: '下一页' }));
    const search = screen.getByRole<HTMLInputElement>('searchbox', { name: '搜索People' });
    await user.type(search, 'no-such-person');

    expect(screen.getByText('没有匹配结果')).toBeDefined();
    expect(screen.getByRole('status').textContent).toBe('0 条结果');
    expect(screen.getByRole<HTMLButtonElement>('button', { name: '下一页' }).disabled).toBe(true);
    await user.click(screen.getByRole('button', { name: '清除搜索' }));

    expect(search.value).toBe('');
    expect(visibleNames()).toEqual(['Ada', 'Bea']);
    expect(screen.getByRole('status').textContent).toBe('6 条结果');
    expect(screen.queryByText('没有匹配结果')).toBeNull();
    expect(screen.getByRole<HTMLButtonElement>('button', { name: '下一页' }).disabled).toBe(false);
  });

  it('recovers when updated data no longer contains the current page and handles an empty data set', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<DataTable data={people} columns={columns} pageSize={2} caption="People" />);
    await user.click(screen.getByRole('button', { name: '下一页' }));
    await user.click(screen.getByRole('button', { name: '下一页' }));
    expect(visibleNames()).toEqual(['Eli', 'Finn']);

    rerender(<DataTable data={people.slice(0, 3)} columns={columns} pageSize={2} caption="People" />);
    expect(visibleNames()).toEqual(['Ada', 'Bea']);
    expect(screen.getByRole<HTMLButtonElement>('button', { name: '上一页' }).disabled).toBe(true);
    await user.click(screen.getByRole('button', { name: '下一页' }));
    expect(visibleNames()).toEqual(['Chen']);

    rerender(<DataTable data={[]} columns={columns} pageSize={2} caption="People" />);
    expect(screen.getByText('暂无数据')).toBeDefined();
    expect(screen.getByRole('status').textContent).toBe('0 条结果');
    expect(screen.getByRole<HTMLButtonElement>('button', { name: '上一页' }).disabled).toBe(true);
    expect(screen.getByRole<HTMLButtonElement>('button', { name: '下一页' }).disabled).toBe(true);
  });
});

it('preserves native Switch form submission, reset, disabled and keyboard behavior', async () => {
  const user = userEvent.setup();
  const onCheckedChange = vi.fn();
  const submitted: FormData[] = [];
  render(
    <form aria-label="Notification preferences" onSubmit={(event) => {
      event.preventDefault();
      submitted.push(new FormData(event.currentTarget));
    }}>
      <Switch label="Email notifications" name="email" value="enabled" defaultChecked onCheckedChange={onCheckedChange} />
      <Switch label="Disabled notifications" name="disabled" value="enabled" defaultChecked disabled />
      <Button type="submit">Save preferences</Button>
      <Button type="reset">Reset preferences</Button>
    </form>,
  );
  const email = screen.getByRole<HTMLInputElement>('switch', { name: 'Email notifications' });
  const disabled = screen.getByRole<HTMLInputElement>('switch', { name: 'Disabled notifications' });

  await user.click(screen.getByRole('button', { name: 'Save preferences' }));
  expect(submitted.at(-1)?.get('email')).toBe('enabled');
  expect(submitted.at(-1)?.has('disabled')).toBe(false);
  await user.click(email);
  expect(email.checked).toBe(false);
  expect(onCheckedChange).toHaveBeenLastCalledWith(false);
  await user.click(screen.getByRole('button', { name: 'Save preferences' }));
  expect(submitted.at(-1)?.has('email')).toBe(false);
  await user.click(screen.getByRole('button', { name: 'Reset preferences' }));
  expect(email.checked).toBe(true);
  await user.click(disabled);
  expect(disabled.checked).toBe(true);
  email.focus();
  await user.keyboard(' ');
  expect(email.checked).toBe(false);
});

it('gives Input an automatic label and preserves external, hint and error descriptions', async () => {
  const user = userEvent.setup();
  const { rerender } = render(
    <>
      <p id="email-policy">Only work email addresses are allowed.</p>
      <Input label="Work email" hint="Use your company account." error="Enter a valid email." aria-describedby="email-policy" />
      <Input label="Backup email" />
    </>,
  );
  const input = screen.getByRole<HTMLInputElement>('textbox', { name: 'Work email' });
  const backup = screen.getByRole<HTMLInputElement>('textbox', { name: 'Backup email' });
  const hint = screen.getByText('Use your company account.');
  const error = screen.getByText('Enter a valid email.');

  expect(input.id).not.toBe('');
  expect(input.id).not.toBe(backup.id);
  await user.click(screen.getByText('Work email', { selector: 'label' }));
  expect(document.activeElement).toBe(input);
  expect(input.getAttribute('aria-invalid')).toBe('true');
  expect(input.getAttribute('aria-describedby')?.split(/\s+/)).toEqual(['email-policy', hint.id, error.id]);

  rerender(
    <>
      <p id="email-policy">Only work email addresses are allowed.</p>
      <Input label="Work email" hint="Use your company account." aria-describedby="email-policy" />
      <Input label="Backup email" />
    </>,
  );
  expect(input.getAttribute('aria-invalid')).not.toBe('true');
  expect(input.getAttribute('aria-describedby')?.split(/\s+/)).toEqual(['email-policy', hint.id]);
  expect(document.getElementById(error.id)).toBeNull();
});
