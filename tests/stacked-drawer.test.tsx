import { useState } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { Button, Input, StackedDrawer } from '../src';

it('stacks three cards, traps focus, dismisses one layer at a time and retains the parent input', async () => {
  const user = userEvent.setup();
  render(
    <StackedDrawer trigger={<Button>打开项目</Button>} title="项目">
      <Input label="作品名称" />
      <StackedDrawer trigger={<Button>查看设计</Button>} title="设计" description="设计说明">
        <StackedDrawer trigger={<Button>查看清单</Button>} title="清单"><Button>确认清单</Button></StackedDrawer>
      </StackedDrawer>
    </StackedDrawer>,
  );
  const rootTrigger = screen.getByRole('button', { name: '打开项目' });
  await user.click(rootTrigger);
  const root = screen.getByRole('dialog', { name: '项目' });
  const name = screen.getByRole('textbox', { name: '作品名称' });
  await user.type(name, '保留这个名字');
  const designTrigger = screen.getByRole('button', { name: '查看设计' });
  await user.click(designTrigger);
  const design = screen.getByRole('dialog', { name: '设计' });
  expect(root.hasAttribute('inert')).toBe(true);
  expect(root.style.getPropertyValue('--ray-drawer-depth')).toBe('1');
  expect(screen.getAllByRole('dialog')).toHaveLength(1);
  expect(design.getAttribute('aria-describedby')).toBeTruthy();
  const checklistTrigger = screen.getByRole('button', { name: '查看清单' });
  await user.click(checklistTrigger);
  const checklist = screen.getByRole('dialog', { name: '清单' });
  expect(root.style.getPropertyValue('--ray-drawer-depth')).toBe('2');
  expect(design.hasAttribute('inert')).toBe(true);
  await waitFor(() => expect(document.activeElement).toBe(within(checklist).getByRole('heading', { name: '清单' })));
  await user.click(screen.getByRole('button', { name: '确认清单' }));
  await user.tab();
  expect(document.activeElement).toBe(within(checklist).getByRole('button', { name: '返回上一层' }));
  await user.keyboard('{Escape}');
  await waitFor(() => expect(document.activeElement).toBe(checklistTrigger));
  expect(screen.getByRole('dialog', { name: '设计' })).toBe(design);
  expect(root.style.getPropertyValue('--ray-drawer-depth')).toBe('1');
  await user.click(screen.getByRole('button', { name: '返回上一层' }));
  await waitFor(() => expect(document.activeElement).toBe(designTrigger));
  expect(root.hasAttribute('inert')).toBe(false);
  expect((name as HTMLInputElement).value).toBe('保留这个名字');
  await user.click(screen.getByRole('button', { name: '关闭当前抽屉' }));
  await waitFor(() => expect(document.activeElement).toBe(rootTrigger));
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('supports controlled dismissal, defaultOpen and independent sibling drawers', async () => {
  const user = userEvent.setup();
  const changed = vi.fn();
  function Example() {
    const [open, setOpen] = useState(true);
    return <StackedDrawer trigger="打开" title="项目" open={open} onOpenChange={(next) => { setOpen(next); changed(next); }}>
      <StackedDrawer trigger="设计" title="设计" defaultOpen><p>设计详情</p></StackedDrawer>
      <StackedDrawer trigger="设置" title="设置"><p>设置详情</p></StackedDrawer>
    </StackedDrawer>;
  }
  render(<Example />);
  const root = document.querySelector<HTMLElement>('.ray-stacked-drawer')!;
  expect(screen.getByRole('dialog', { name: '设计' })).toBeDefined();
  await user.pointer({ target: document.querySelector('.ray-stacked-drawer__overlay[data-nested="true"]')!, keys: '[MouseLeft]' });
  await waitFor(() => expect(screen.getByRole('dialog', { name: '项目' })).toBeDefined());
  expect(root.style.getPropertyValue('--ray-drawer-depth')).toBe('0');
  await user.click(screen.getByRole('button', { name: '设置', exact: true }));
  expect(screen.getByRole('dialog', { name: '设置' })).toBeDefined();
  expect(root.style.getPropertyValue('--ray-drawer-depth')).toBe('1');
  await user.keyboard('{Escape}');
  await waitFor(() => expect(root.hasAttribute('inert')).toBe(false));
  await user.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(changed).toHaveBeenLastCalledWith(false);
});
