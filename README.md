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

界面约定：可见的下拉选择使用自定义弹层组件（如 Radix Select），统一选项、选中态、焦点态和深浅色主题，不使用浏览器原生 `<select>` 菜单。用于表单提交的隐藏原生控件不受此限制。

| 分类 | 组件 |
| --- | --- |
| 通用 UI · 15 | Button、DownloadButton、Input、DatePicker、Textarea、Switch、Badge、Card、StackedCards、Separator、Dialog、StackedDrawer、Tabs、Slider、ScrollArea |
| 视觉动效 · 4 | SpotlightCard、Reveal、AnimatedNumber、BreathingIndicator |
| 业务组件 · 3 | DataTable、FilterBar、Leaderboard |

Dialog 和 Tabs 使用 Radix Primitives 提供焦点管理与键盘交互。输入组件支持标签、错误提示、原生表单属性与 ref。动效尊重 `prefers-reduced-motion`；DataTable 提供客户端搜索、排序、分页与空状态，适合小型数据集。

全部组件及 Props / Column / Option 类型由主入口导出。打开工作台的组件详情可查看当前 API；完整声明随包发布。

### 呼吸指示器

`status` 可选 `normal`（正常运行）、`degraded`（系统部分出错）和 `failed`（系统完全瘫痪）。异常状态覆盖装饰配色：部分出错使用琥珀色与迟滞节奏；完全瘫痪使用红色、静态下沉云团 / 断环 / 压平光带，停止动画调度。恢复正常后继续运动。未传 `label` 时自动展示对应状态文字；自定义 `label` 时由调用方保持文字与状态一致。

`BreathingIndicator` 提供三种动态形态：`variant="glow"` 浮光（叠层柔光缓慢变形）、`variant="orbit"` 游环（起伏曲线与游走亮点）、`variant="wave"` 潮息（错峰移动的丝带）。支持 `label`、`description`、`hideLabel`、四色 `tone`、三档 `size` 和基础节奏 `duration`（默认 6000ms，最小 1600ms）。`paused` 冻结当前阶段，恢复时继续，不改变业务状态文字。视觉通过 Canvas 绘制，文字保持原生 DOM；无需图片资源或额外动画依赖。

工作台 `#component/BreathingIndicator` 并排展示三种形态，可统一切换配色、节奏与暂停，并展示小尺寸用法；总览卡片提供三种样式切换。重绘限制为每秒最多 30 次，离屏、页面隐藏、暂停或系统要求减少动态效果时停止动画；卸载时释放监听器与动画帧。新版尺寸包含完整光效留白，不再沿用旧版小圆点的几何尺寸。

### 下载按钮

`DownloadButton` 是独立组件，接收 `filename` 及二选一的 `data`（字符串或 Blob）或 `href`（文件 URL）。支持 Button 的尺寸、样式、禁用和加载状态，可通过 `icon` 传入图标。`onDownload` 表示已请求浏览器下载，不代表文件保存完成；跨域 URL 的下载行为取决于浏览器与服务端响应。工作台 `#component/DownloadButton` 提供文本、JSON 与禁用状态演示。

### 排行榜

`Leaderboard` 使用橙、蓝、紫、青绿四色区分条目，包含名次、可选头像、分数、相对榜首的进度条与排名变化。传入 `items`（唯一 `id`、`name`、`value`，可选 `avatar`、`tone`、`change`）；按分数降序展示，同分保持输入顺序。正数 `change` 表示上升，负数表示下降。显式设置 `tone` 可在数据重排后保留条目颜色。负数与非有限分数按 0 展示，全零数据的比例为 0%。支持空状态、头像失败时的姓名首字、窄容器、深色主题及减少动态效果。

工作台 `#component/Leaderboard` 提供分数更新和空状态演示。分数变化后自动重排，条长随榜首数值重新计算；演示数据仅在当前页面有效。`formatValue`、`valueLabel` 和 `renderChange` 可定制分数格式、单位及变化图标，基础组件不依赖图标库。

### 堆叠卡片列表

`StackedCards` 将列表项在页面内纵向错位叠放，每项始终露出标题，点击展开该项并收起其他项，再次点击可收起。接收 `items`（唯一 `id`、`title`、`content`，以及可选的 `icon`、`meta`、`tone`），支持 `value` / `defaultValue` 和 `onValueChange`；`null` 表示全部收起。上下方向键、Home / End 移动标题焦点，Enter / Space 展开；收起内容不接收焦点，内容本身保持挂载。删除展开项后收起全部，重排通过 id 保持选择。支持自适应内容高度、浅色 / 深色主题及减少动态效果。

工作台的 `#component/StackedCards` 提供灵感清单演示，可切换卡片、全部收起和标记完成，修改仅在当前页面有效。

### 堆叠卡片抽屉

`StackedDrawer` 是带圆角、浮动留白的卡片抽屉，在 `children` 中嵌套同名组件即可逐层展开。前层进入时，后层缩小并向上错开，最多露出两层后卡；关闭按钮、遮罩和 Esc 都只关闭当前层，返回后保留上一层的输入与滚动位置。支持受控 / 非受控状态、固定底部操作区、独立正文滚动、浅色 / 深色主题和减少动态效果。焦点限制与恢复使用 Radix Dialog，未加入拖拽手势。

工作台的 `#component/StackedDrawer` 提供三层交互预览、嵌套示例和 API 参考；预览中的修改与确认仅保留在当前页面。

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
