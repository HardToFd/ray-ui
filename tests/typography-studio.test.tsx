import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { TypographyStudio } from '../demo/TypographyStudio';
import { artTextFinishes } from '../demo/art-text-presets';

beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => vi.unstubAllGlobals());

function renderMaterialStudio() {
  render(<TypographyStudio />);
  fireEvent.click(screen.getByText('早期材质实验'));
}

test('switching to a layered finish preserves the edited text and size and focuses the editor', async () => {
  const user = userEvent.setup();
  renderMaterialStudio();
  const input = screen.getByRole('textbox', { name: '预览文字' });
  await user.clear(input);
  await user.type(input, 'Ray & 字体');
  fireEvent.change(screen.getByRole('slider', { name: '字号' }), { target: { value: '112' } });
  await user.click(screen.getByText('早期字效实验'));
  await user.click(screen.getByRole('button', { name: '使用像素糖影' }));
  expect(document.activeElement).toBe(input);
  const preview = screen.getByRole('region', { name: '艺术字实时预览' });
  const readable = within(preview).getAllByText('Ray & 字体').filter(element => !element.closest('[aria-hidden="true"]'));
  expect(readable).toHaveLength(1);
  expect((screen.getByRole('slider', { name: '字号' }) as HTMLInputElement).value).toBe('112');
  expect(screen.getByRole('button', { name: '浅色画布' }).getAttribute('aria-pressed')).toBe('true');
  expect((screen.getByRole('switch', { name: '启用字效动画' }) as HTMLInputElement).disabled).toBe(true);
  expect((screen.getByLabelText('艺术字辅色') as HTMLInputElement).disabled).toBe(false);
});

test('exports current settings with escaped JSX text and handles an intentionally empty preview', async () => {
  const user = userEvent.setup();
  const writeText = vi.spyOn(navigator.clipboard, 'writeText');
  renderMaterialStudio();
  const value = '你好 "Ray" <>& {text}';
  fireEvent.change(screen.getByRole('textbox', { name: '预览文字' }), { target: { value } });
  fireEvent.change(screen.getByRole('slider', { name: '字距' }), { target: { value: '.12' } });
  fireEvent.change(screen.getByLabelText('艺术字主色'), { target: { value: '#ff8800' } });
  await user.click(screen.getByRole('switch', { name: '启用字效动画' }));
  await user.click(screen.getByRole('button', { name: '复制 React 代码' }));
  const code = writeText.mock.calls[0][0];
  expect(code).toContain('{' + JSON.stringify(value) + '}');
  expect(code).toContain('letterSpacing="0.12em"');
  expect(code).toContain('color="#ff8800"');
  expect(code).not.toContain('\n  animated');
  expect(screen.getByRole('status', { name: '代码复制状态' }).textContent).toBe('代码已复制');
  await user.clear(screen.getByRole('textbox', { name: '预览文字' }));
  expect(screen.getByRole('region', { name: '艺术字实时预览' }).textContent).toContain('写下几个字');
  await user.click(screen.getByRole('button', { name: /查看当前代码/ }));
  expect(screen.getByLabelText('当前艺术字 React 代码').textContent).toContain('{""}');
});

test('clipboard denial reveals selectable code and explains manual copy', async () => {
  const user = userEvent.setup();
  vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('Denied'));
  renderMaterialStudio();
  await user.click(screen.getByRole('button', { name: '复制 React 代码' }));
  await waitFor(() => expect(screen.getByRole('status', { name: '代码复制状态' }).textContent).toContain('复制失败'));
  expect(screen.getByLabelText('当前艺术字 React 代码').tabIndex).toBe(0);
  expect(screen.getByText('复制失败，请选中下方代码，使用 Ctrl / Cmd + C 手动复制。')).toBeTruthy();
});

test('the archived silver editor still resets its complete design', async () => {
  const user = userEvent.setup();
  renderMaterialStudio();
  expect(screen.getByText('早期字效实验').closest('details')?.open).toBe(false);
  expect(screen.getByRole('button', { name: '使用月白银' }).getAttribute('aria-pressed')).toBe('true');
  expect(within(screen.getByRole('group', { name: '切换艺术字样式' })).getAllByRole('button')).toHaveLength(4);
  await user.click(screen.getByRole('button', { name: '墨版长影', exact: true }));
  await user.clear(screen.getByRole('textbox', { name: '预览文字' }));
  fireEvent.change(screen.getByRole('slider', { name: '字号' }), { target: { value: '144' } });
  await user.click(screen.getByRole('button', { name: '恢复默认' }));
  const preview = screen.getByRole('region', { name: '艺术字实时预览' });
  expect(within(preview).getAllByText('月色入字').filter(el => !el.closest('[aria-hidden="true"]'))).toHaveLength(1);
  expect((screen.getByRole('slider', { name: '字号' }) as HTMLInputElement).value).toBe('96');
  expect((screen.getByRole('slider', { name: '字距' }) as HTMLInputElement).value).toBe('0.08');
  expect((screen.getByRole('switch', { name: '启用字效动画' }) as HTMLInputElement).checked).toBe(true);
  expect(screen.getByRole('button', { name: '深色画布' }).getAttribute('aria-pressed')).toBe('true');
  expect(screen.getByRole('button', { name: '使用月白银' }).getAttribute('aria-pressed')).toBe('true');
  expect(screen.queryByText('查看「月白银」的融合来源')).toBeNull();
});

test('search finds both generations of sources and lineage expands without changing the current design', async () => {
  const user = userEvent.setup();
  renderMaterialStudio();
  await user.click(screen.getByText('早期字效实验'));
  await user.click(screen.getByRole('button', { name: '使用像素糖影' }));
  const summary = screen.getByText('查看「像素糖影」的融合来源');
  await user.click(summary);
  expect(summary.closest('details')?.open).toBe(true);
  expect(screen.getByText('像素点阵 × 信号故障')).toBeTruthy();
  const search = screen.getByRole('searchbox', { name: '搜索艺术字风格' });
  for (const query of ['鎏金液铬', '液态铬', 'CHROME']) {
    await user.clear(search);
    await user.type(search, query);
    expect(screen.getByRole('button', { name: '使用幻金流焰' })).toBeTruthy();
    expect(screen.getByRole('status', { name: '风格筛选结果' }).textContent).toBe('1 / 3 款');
  }
  await user.clear(search);
  await user.type(search, 'no such style');
  expect(screen.getByRole('status', { name: '风格筛选结果' }).textContent).toBe('0 / 3 款');
  expect(screen.getByRole('button', { name: '像素糖影', exact: true }).getAttribute('aria-pressed')).toBe('true');
  await user.click(screen.getByRole('button', { name: '清除搜索' }));
  expect(screen.getByRole('status', { name: '风格筛选结果' }).textContent).toBe('3 / 3 款');
});

test('silver and radiant finishes export motion, while static finishes export their text once', async () => {
  const user = userEvent.setup();
  const writeText = vi.spyOn(navigator.clipboard, 'writeText');
  renderMaterialStudio();
  await user.click(screen.getByRole('button', { name: '复制 React 代码' }));
  expect(writeText.mock.calls[0][0]).toContain('variant="moon-silver"');
  expect(writeText.mock.calls[0][0]).toContain('\n  animated');
  for (const [index, [name, variant]] of [['墨版长影', 'ink-relief'], ['像素糖影', 'sugar-echo']].entries()) {
    await user.click(screen.getByRole('button', { name, exact: true }));
    await user.click(screen.getByRole('button', { name: '复制 React 代码' }));
    const code = writeText.mock.calls[index + 1][0];
    expect(code).toContain('variant="' + variant + '"');
    expect(code).not.toContain('\n  animated');
    expect(code.match(/月色入字/g)).toHaveLength(1);
  }
  await user.click(screen.getByRole('button', { name: '幻金流焰', exact: true }));
  await user.click(screen.getByRole('button', { name: '复制 React 代码' }));
  expect(writeText.mock.calls[3][0]).toContain('variant="radiant-alloy"');
  expect(writeText.mock.calls[3][0]).toContain('\n  animated');
});

test('the silver study is independent and earlier experiments retain their provenance', () => {
  const priorIds = ['gradient-prism', 'chrome-foil', 'outline-echo', 'retro-shadow',
    'neon-fire', 'editorial-ink', 'emboss-halftone', 'pixel-glitch', 'candy-stencil'];
  const originalIds = ['gradient', 'chrome', 'outline', 'retro', 'neon', 'editorial',
    'long-shadow', 'emboss', 'pixel', 'glitch', 'echo', 'prism',
    'foil', 'halftone', 'stencil', 'candy', 'fire', 'ink'];
  expect(artTextFinishes).toHaveLength(4);
  expect(new Set(artTextFinishes.map(finish => finish.id)).size).toBe(4);
  expect(artTextFinishes[0].id).toBe('moon-silver');
  expect(artTextFinishes[0].sources).toEqual([]);
  expect(artTextFinishes.slice(1).every(finish => finish.sources.length === 3)).toBe(true);
  const prior = artTextFinishes.flatMap(finish => finish.sources);
  expect(prior.map(source => source.id).sort()).toEqual(priorIds.sort());
  expect(prior.every(source => source.originals.length === 2)).toBe(true);
  expect(prior.flatMap(source => source.originals.map(origin => origin.id)).sort()).toEqual(originalIds.sort());
});
