# Ray UI

属于你的 React + TypeScript 组件库。把通用 UI、视觉动效和业务组件放在同一个可持续扩展的项目中，配有中文交互文档、代码示例、API 参考和浅色 / 深色主题。

当前为 **0.1.0 首版**，包名暂用 `@ray-ui/react`，尚未发布到 npm；示例项目数据为固定演示数据，创建项目表单只演示本地交互。

## 本地启动

开发环境使用 Node.js 24.14.1、npm 11.11.0，消费端需要 React 19 / React DOM 19。

```sh
git clone https://github.com/HardToFd/ray-ui.git
cd ray-ui
npm ci
npm run dev
```

打开 http://127.0.0.1:5173 。支持搜索、Ctrl / Cmd + K 聚焦搜索、组件分类、预览 / 代码切换、代码复制、独立组件链接、浏览器前进 / 后退和主题切换。

## 组件清单

| 分类 | 组件 |
| --- | --- |
| 通用 UI · 10 | Button、Input、DatePicker、Textarea、Switch、Badge、Card、Separator、Dialog、Tabs |
| 视觉动效 · 3 | SpotlightCard、Reveal、AnimatedNumber |
| 业务组件 · 2 | DataTable、FilterBar |

Dialog 和 Tabs 使用 Radix Primitives 提供焦点管理与键盘交互。输入组件支持标签、错误提示、原生表单属性与 ref。动效尊重 `prefers-reduced-motion`；DataTable 提供客户端搜索、排序、分页与空状态，适合小型数据集。

全部组件及 Props / Column / Option 类型由主入口导出。打开工作台的组件详情可查看当前 API；完整声明随包发布。

### 日期选择器

`DatePicker` 支持中文日历、年月切换、今天 / 清除、键盘选日、浅色 / 深色主题及最早 / 最晚日期限制。年月菜单使用统一主题样式，最高 248px，支持滚动、选中项定位和键盘操作。日历弹层基于 Radix Popover，年月菜单基于 Radix Select，日期与键盘交互基于 React DayPicker。

```tsx
import { useState } from 'react';
import { DatePicker } from '@ray-ui/react';

export function ProjectDate() {
  const [date, setDate] = useState<Date | undefined>();
  return (
    <DatePicker
      label="项目启动日期"
      name="startDate"
      value={date}
      onValueChange={setDate}
      minDate={new Date(2026, 8, 1)}
      maxDate={new Date(2026, 11, 31)}
      hint="请选择 2026 年 9–12 月的日期。"
    />
  );
}
```

使用 `defaultValue` 可启用非受控模式；`clearable={false}` 隐藏清除操作。日期按本地日历日解释，`minDate` / `maxDate` 包含边界且忽略时分秒；传入 `name` 后，原生表单通过隐藏字段提交 `YYYY-MM-DD`，不会经过 UTC 转换。`new Date(年, 月索引, 日)` 的月份从 **0** 开始；避免用 `new Date('YYYY-MM-DD')` 解析本地日期。

未指定边界时，年月导航默认显示当前年份前后 100 年，并会扩展以包含传入的日期值或边界。非受控表单重置恢复挂载时的 `defaultValue`。无效 `Date` 值按空处理；无效边界会被忽略，最早日期晚于最晚日期时禁用选日并显示说明。

## 在其他 React 项目中使用

先在本仓库生成真实安装包：

```sh
npm pack
```

在目标 React 项目中安装它。下面假设目标项目与 `ray-ui` 位于同一个父目录；也可以替换为安装包的实际路径：

```sh
npm install ../ray-ui/ray-ui-react-0.1.0.tgz
```

在应用入口引入一次 CSS，再按需导入组件：

```tsx
import { Button, Card, Input } from '@ray-ui/react';
import '@ray-ui/react/styles.css';

export default function App() {
  return (
    <Card style={{ maxWidth: 420, padding: 24 }}>
      <h1>我的下一个作品</h1>
      <Input label="项目名称" placeholder="给灵感一个名字" />
      <Button style={{ marginTop: 16 }} onClick={() => alert('开始创造！')}>
        开始创造
      </Button>
    </Card>
  );
}
```

包输出为 ESM，React / React DOM 是 peer dependencies，Radix 是运行时依赖，不将 React 打进组件包。CSS 单独导出；`sideEffects` 保留 CSS，消费者可对 JS 进行 tree shaking。所有组件样式使用 `ray-` 前缀，不包含文档站的全局样式与字体。

## 自定义主题

在 Ray UI 样式之后覆盖变量即可。为了让弹窗 Portal 一起换肤，将主题属性设在 `html` 或 `body` 上：

```html
<html data-ray-theme="dark">
```

```css
:root {
  --ray-accent: #526d4e;
  --ray-accent-contrast: #ffffff;
  --ray-ring: #526d4e;
  --ray-radius: 8px;
}

/* 需要时分别覆盖深色主题 */
[data-ray-theme='dark'] {
  --ray-accent: #a8be91;
  --ray-accent-contrast: #1b2316;
}
```

其他变量：`--ray-bg`、`--ray-surface`、`--ray-surface-raised`、`--ray-text`、`--ray-muted`、`--ray-border`。文档站「设计变量」页提供实时色板和变量复制。

## 项目结构

```text
src/
  index.ts                公共组件与类型入口
  bundle.ts               构建入口，将 CSS 输出为单独文件
  components/primitives.tsx
  motion/index.tsx
  business/index.tsx
  styles.css              主题变量与组件样式入口
  styles/                 按组件类别分开的样式
demo/
  App.tsx                 中文组件工作台
  catalog.ts              组件分类、示例与 API 说明
  styles.css              仅文档站使用的样式
tests/                    关键交互回归测试
dist/                     组件包 JS、CSS 与类型声明
site-dist/                可静态托管的文档站
```

添加组件时，在对应类别实现并导出，更新 `demo/catalog.ts` 和 `ComponentPreview`，让代码、预览与文档一起落地。涉及键盘行为或数据处理时，补充有意义的回归测试。

## 开发命令

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动交互文档工作台 |
| `npm run typecheck` | TypeScript 严格检查 |
| `npm test` | 运行关键交互测试 |
| `npm run build` | 生成组件包及类型声明 |
| `npm run build:docs` | 生成静态文档站到 `site-dist/` |
| `npm run preview` | 本地预览构建后的文档站 |
| `npm run check` | 类型、测试、组件包和文档站完整检查 |
| `npm pack` | 检查类型、构建并生成 `.tgz` 安装包 |

正式发布到 npm 前需要确定 npm scope / 包名、许可协议及发布账号；当前仅公开 GitHub 源码，尚未发布 npm 包。

## 验证方式与首版边界

- 交互测试覆盖焦点管理、标签页键盘导航、开关原生表单行为、输入错误关联以及表格搜索 / 排序 / 分页边界。
- 使用 `npm pack` 在独立消费项目中安装，验证公开导出、严格 TypeScript 类型、CSS 子路径和服务端渲染导入。
- 文档站实际浏览器检查搜索、分类、代码复制、弹窗、表格、主题和手机布局。
- 当前未包含服务端分页、虚拟滚动、复杂表单引擎或拖拽编辑器；它们可以在这个基础上继续扩展。
- Dialog 自定义触发器应渲染可交互元素，并透传 ref 与事件。所有组件仍需要使用者提供合适的可访问名称和业务文案。

实现参考：[Vite Library Mode](https://vite.dev/guide/build.html#library-mode)、[Radix Dialog](https://www.radix-ui.com/primitives/docs/components/dialog)、[Radix Tabs](https://www.radix-ui.com/primitives/docs/components/tabs)。
