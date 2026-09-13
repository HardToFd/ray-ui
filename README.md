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
| 通用 UI · 19 | Button、DownloadButton、HomeButton、Input、DatePicker、Textarea、Switch、Badge、Card、StackedCards、Separator、Dialog、StackedDrawer、Tabs、Slider、ScrollArea、PageNavigation、Pagination、Carousel |
| 视觉动效 · 5 | SpotlightCard、Reveal、AnimatedNumber、BreathingIndicator、AIOrb |
| 业务组件 · 5 | DataTable、FilterBar、Leaderboard、Heatmap、FlameGraph |

Dialog 和 Tabs 使用 Radix Primitives 提供焦点管理与键盘交互。输入组件支持标签、错误提示、原生表单属性与 ref。动效尊重 `prefers-reduced-motion`；DataTable 提供客户端搜索、排序、分页与空状态，适合小型数据集。

全部组件及 Props / Column / Option 类型由主入口导出。打开工作台的组件详情可查看当前 API；完整声明随包发布。

### 分页

`Pagination` 是独立分页控件，包含上一页 / 下一页、当前页高亮、首尾页码和省略号。页码最多渲染 7 项，记录量较大时也不会生成整份页码数组。提供 `default` / `compact` 两种形式和 `sm` / `md` 尺寸；容器宽度不超过 420px 时自动收起页码，保留上一页、当前页 / 总页数和下一页。

```tsx
import { useState } from 'react';
import { Pagination } from '@ray-ui/react';
import '@ray-ui/react/styles.css';

export function Archive() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  return <Pagination total={96} page={page} pageSize={pageSize}
    onPageChange={(next, size) => { setPage(next); setPageSize(size); }}
    showTotal showSizeChanger showQuickJumper />;
}
```

`total` 是总记录数，页码从 1 开始，总页数为 `Math.ceil(total / pageSize)`。`page` / `pageSize` 为受控属性，不传时分别使用 `defaultPage`（1）和 `defaultPageSize`（10）管理内部状态。受控模式下由调用方更新属性；数据获取、列表切片、滚动和路由焦点由应用负责。筛选或外部数据减少时，页码显示限制到有效范围，内部页码同步收敛，不自动触发业务回调；调用方展示的内容也应使用相同的规范化页码。

`showTotal` 展示当前条目范围。`showSizeChanger` 使用 Radix 自定义选择器，支持键盘与深浅主题；`pageSizeOptions` 默认 `[10, 20, 50, 100]`，无效 / 重复选项剔除，当前条数始终保留。修改条数时依次触发 `onPageSizeChange(size)` 和 `onPageChange(1, size)`；可以只使用后者统一更新页码和条数。`showQuickJumper` 支持输入整数页码，Enter 或点击“跳转”确认，无效输入给出关联错误提示，不提交外层表单。

`total=0` 时保留 `0 / 0`，禁用翻页和跳页；`disabled` 禁用所有分页交互。非有限总数按 0，非有限页码按 1，非有限条数按 10，数值向下取整并限制在安全整数范围。原生按钮支持 Tab、Enter、Space，当前页使用 `aria-current="page"`，切页后播报位置；省略号仅作分隔，不参与 Tab 顺序。

工作台 `#component/Pagination` 提供 96 条本地模拟笔记，可体验分类筛选、页码切换、每页条数、快速跳页、紧凑 / 禁用状态和空数据。已有 `DataTable` 的内置简洁分页继续保留。

### 回到首页

`HomeButton` 是独立的首页导航链接：小屋图标、圆角胶囊与归家箭头，悬停 / 聚焦时门框点亮、箭头轻移。提供 `surface`（浅底）、`solid`（强调色）、`ghost`（轻量）三种样式，`sm` / `md` / `lg` 三档尺寸与 `iconOnly` 纯图标模式，支持深浅色主题和减少动态效果。

```tsx
import { HomeButton } from '@ray-ui/react';
import '@ray-ui/react/styles.css';

<HomeButton href="/" />
<HomeButton href="/workspace" label="返回工作台" variant="solid" />
<HomeButton href="/" iconOnly position="bottom-left" />

// navigate 由应用路由提供，接收完整首页地址。
<HomeButton href="/" onNavigate={(href) => navigate(href)} />
```

`href` 默认 `/`，部署在子路径的应用应传入实际首页路径。组件渲染原生 `<a>`，支持 Tab 聚焦和 Enter 激活；Ctrl / Cmd 点击、辅助点击、指定新窗口或下载时保留浏览器原生行为。`onNavigate(href)` 仅接管无修饰键的普通同页点击；`onClick` 可调用 `preventDefault()` 取消导航。传入 `target="_blank"` 时补充 `rel="noopener"` 并保留已有 rel 值。

`disabled` 或 `loading` 时移除链接地址、从 Tab 顺序中移出并阻止点击回调。加载状态由调用方管理，显示 `loadingLabel`（默认“正在返回”）和 `aria-busy`；纯图标模式仍保留完整可访问名称与悬停提示。路由完成后的焦点管理由应用负责。

`position="bottom-left"` / `"bottom-right"` 固定在页面下方，可通过 `--ray-home-offset`（默认 24px）和 `--ray-home-z-index`（默认 40）调整边距与层级。工作台 `#component/HomeButton` 展示局部首页切换、样式切换、工具栏入口、禁用 / 加载状态，并提供真实跳转到组件总览的链接。

### 前进、后退与回到顶部

`PageNavigation` 将后退、前进和回到顶部组合成导航胶囊。支持横向 / 纵向、紧凑 / 标准尺寸、可见文字、页面左下 / 右下悬浮，沿用组件库深浅色主题。回顶按钮的细环根据实际滚动距离显示阅读进度，悬停与读屏可获取百分比；滚动到顶部附近时禁用回顶。

```tsx
import { PageNavigation } from '@ray-ui/react';
import '@ray-ui/react/styles.css';

<PageNavigation position="bottom-right" orientation="vertical" />

// 接入应用路由时，传入导航动作与历史边界。
<PageNavigation
  onBack={() => navigate(-1)} onForward={() => navigate(1)}
  canGoBack={canGoBack} canGoForward={canGoForward}
  showLabels
/>
```

默认调用 `window.history.back()` / `forward()`。组件不会修改或接管应用的历史记录；浏览器没有提供可通用读取的当前历史索引，因此两个历史按钮默认可用，无记录时浏览器不跳转。准确的禁用状态由调用方通过 `canGoBack` / `canGoForward` 提供。

省略 `scrollTarget` 时滚动窗口。独立容器可用 `const [target, setTarget] = useState<HTMLDivElement | null>(null)`，将 `setTarget` 传给容器的回调 `ref`，再将 `target` 传给 `scrollTarget`。`null` 表示等待挂载，不会回退到滚动窗口；更换目标时清理旧监听并重新测量。组件监听滚动、窗口与内容尺寸变化，滚动测量按动画帧合并，卸载时释放资源。

`topThreshold` 默认 32px，距离顶部不超过该值时禁用回顶，设为 0 可滚动最后几个像素。`behavior` 默认 `smooth`；系统减少动态效果时使用 `instant`，避免宿主页面的平滑滚动样式继续产生动画。`onBackToTop` 在请求滚动前触发，可通过事件的 `preventDefault()` 取消。回顶保留当前键盘焦点，不主动移动到文章标题；原生按钮支持 Tab、Enter、Space，并且不会提交外层表单。

工作台 `#component/PageNavigation` 提供三篇模拟笔记，可前后翻页、滚动回顶、切换排列和文字。演示中的导航控制笔记面板；实际页面悬浮使用 `position="bottom-right"` 或 `"bottom-left"`，边距和层级可通过 `--ray-navigation-offset` 与 `--ray-navigation-z-index` 调整。

### 呼吸指示器

`status` 可选 `normal`（正常运行）、`degraded`（系统部分出错）和 `failed`（系统完全瘫痪）。异常状态覆盖装饰配色：部分出错使用琥珀色与迟滞节奏；完全瘫痪使用红色、静态下沉云团 / 断环 / 压平光带，停止动画调度。恢复正常后继续运动。未传 `label` 时自动展示对应状态文字；自定义 `label` 时由调用方保持文字与状态一致。

`BreathingIndicator` 提供三种动态形态：`variant="glow"` 浮光（叠层柔光缓慢变形）、`variant="orbit"` 游环（起伏曲线与游走亮点）、`variant="wave"` 潮息（错峰移动的丝带）。支持 `label`、`description`、`hideLabel`、四色 `tone`、三档 `size` 和基础节奏 `duration`（默认 6000ms，最小 1600ms）。`paused` 冻结当前阶段，恢复时继续，不改变业务状态文字。视觉通过 Canvas 绘制，文字保持原生 DOM；无需图片资源或额外动画依赖。

工作台 `#component/BreathingIndicator` 并排展示三种形态，可统一切换配色、节奏与暂停，并展示小尺寸用法；总览卡片提供三种样式切换。重绘限制为每秒最多 30 次，离屏、页面隐藏、暂停或系统要求减少动态效果时停止动画；卸载时释放监听器与动画帧。新版尺寸包含完整光效留白，不再沿用旧版小圆点的几何尺寸。

### 下载按钮

`DownloadButton` 是独立组件，接收 `filename` 及二选一的 `data`（字符串或 Blob）或 `href`（文件 URL）。支持 Button 的尺寸、样式、禁用和加载状态，可通过 `icon` 传入图标。`onDownload` 表示已请求浏览器下载，不代表文件保存完成；跨域 URL 的下载行为取决于浏览器与服务端响应。工作台 `#component/DownloadButton` 提供文本、JSON 与禁用状态演示。

### 火焰图

`FlameGraph` 展示聚合后的调用栈：底部是入口，向上逐层展开，条块宽度代表包含子调用的总耗时。横向位置按输入顺序排列，不表示实际发生时间；颜色按函数名称稳定分配，用于区分条块。图形语义参考 [Brendan Gregg 的 Flame Graphs 说明](https://www.brendangregg.com/flamegraphs.html)。

```tsx
import { FlameGraph } from '@ray-ui/react';
import '@ray-ui/react/styles.css';

<FlameGraph data={[{
  id: 'app', name: 'app.bootstrap()', value: 1000,
  children: [
    { id: 'fetch', name: 'fetchData()', value: 650, children: [
      { id: 'parse', name: 'JSON.parse()', value: 240 },
    ] },
    { id: 'render', name: 'render()', value: 280 },
  ],
}]} />
```

`data` 为调用树数组，每个节点有全树唯一 `id`、`name`、可选 `value` 与 `children`。`value` 包含子节点耗时，不能把父子值再次相加作为总体耗时；自身耗时等于节点值减去直属子节点总和，图上为子调用右侧的留白。父值省略、负数或非有限时按 0 起算；如果小于子调用总和，则提升到子调用总和，详情展示规范化后的值。数据不会被修改。重复或空 id、循环、数值溢出、超过 100 层或 5000 节点时显示具体说明。空数组与全零数据展示 `emptyMessage`。

点击条块将该子树放大至全宽，支持“返回上层”和“全部调用”；`value` / `defaultValue` 为下钻节点 id，`null` 表示全部，`onValueChange(id)` 通知视图变化。受控时由调用方更新 `value`，失效或零值 id 回到全部视图。悬停和键盘聚焦会更新下方详情：函数路径、总耗时、自身耗时与占全部数据的百分比，下钻时该百分比仍相对于整个输入数据。

搜索函数名称时高亮匹配条块并显示匹配数量，不改变布局；`showSearch={false}` 隐藏搜索，`showDetails={false}` 隐藏详情。所有条块仍保留完整可访问名称和原生悬停提示。Tab 进入图表后，左右键移动同层，上键进入子调用，下键返回父调用，Home / End 移到同层首尾（配合 Ctrl 为全图首尾），Enter / Space 下钻，Esc 返回上层；下钻后将焦点移到当前子树入口。

`formatValue` 默认格式化为毫秒，可统一改成秒或采样次数；所有节点必须采用相同单位。`--ray-flame-row-height` 默认 31px，用来调整条块行高。支持深浅主题和减少动态效果，小条块省略可见文字，可通过下钻查看完整名称。组件使用原生 DOM，不增加图表依赖，也不负责录制或导入浏览器性能文件。

工作台 `#component/FlameGraph` 提供原始样本 / 优化后、函数搜索、交互下钻和空状态演示，均使用模拟数据。已有的日历热力图继续保留在 `#component/Heatmap`。

### 热力图

`Heatmap` 是按天展示的活动日历，适合贡献记录、习惯打卡和阅读时长。支持绿色、橙色、蓝色、紫色四套五级色阶，浅色 / 深色主题、月份与星期标签、图例、悬停 / 聚焦提示和日期选择。

```tsx
import { Heatmap } from '@ray-ui/react';
import '@ray-ui/react/styles.css';

<Heatmap
  startDate="2026-06-15"
  endDate="2026-09-12"
  data={[
    { date: '2026-09-10', value: 4 },
    { date: '2026-09-11', value: 9 },
    { date: '2026-09-12', value: 6 },
  ]}
  tone="green"
  formatValue={(value) => `${value} 次贡献`}
  onValueChange={(date, day) => console.log(date, day.value)}
/>
```

`startDate` / `endDate` 使用严格的 `YYYY-MM-DD`，包含首尾，最多 366 天；支持跨年和闰日，按日历日期计算，不受时区或夏令时影响。非法或倒置范围显示说明。`data` 中缺失日期补 0，同日最后一条生效，范围外及无效日期忽略，负数与非有限数值按 0 处理。空数组保留全零日历，`emptyMessage` 自定义全零状态文字。

默认相对当前范围最大值均分四档正值色阶，0 独立为最浅色。可用正数 `maxValue` 固定色阶上限，适合多个图表之间比较；超过上限只封顶颜色，保留实际数值。`formatValue` 同时用于格子的可访问名称、提示、选日反馈和图例名称。`showLegend={false}` 隐藏图例；每格始终提供完整日期与数值，不仅靠颜色表达。

`value` / `defaultValue` 接受选中日期或 `null`，`onValueChange(date, day)` 返回日期及规范化后的数据。受控时由调用方更新 `value`；范围外的选中值不展示选择。默认周一开始，`weekStartsOn={0}` 改为周日。Tab 进入日历，左右方向键移动一周，上下移动同一列内的一天，Home / End 移至当前行首尾，Ctrl + Home / End 移至整个范围首尾；Enter / Space 选择，Esc 关闭提示，再按 Tab 离开。

窄容器横向滚动；可用 CSS 变量 `--ray-heatmap-cell-size`（默认 11px）、`--ray-heatmap-gap`（3px）调整密度，`--ray-heatmap-color` 自定义主色。动画只用于颜色与悬停反馈，尊重减少动态效果偏好。组件无新增依赖。工作台 `#component/Heatmap` 提供过去一年 / 最近 90 天、配色切换、贡献统计及空状态演示；数据为固定示例。

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

## AIOrb AI 对话球

具有玻璃质感的动态彩色光球，内部光流随对话状态自然变化，可用于语音助手、对话入口和 AI 回复状态。采用 WebGL 实时渲染，无需图片或额外依赖。

```tsx
import { AIOrb } from '@ray-ui/react';
import '@ray-ui/react/styles.css';

<AIOrb state="idle" size="lg" />
<AIOrb state="listening" audioLevel={0.45} />
<AIOrb state="thinking" />
<AIOrb state="speaking" audioLevel={0.8} label="正在为你解答" />
```

- `state`：`idle` 缓慢流动、`listening` 聆听、`thinking` 加速思考、`speaking` 音量脉动、`error` 暖红色中断状态。默认 `idle`，状态变化平滑过渡。
- `audioLevel`：归一化音量 `0–1`，仅聆听和回应状态生效。由应用传入，组件本身不申请麦克风权限、不识别或合成语音。演示页面的对话和音量均为模拟数据。
- `size`：`sm` / `md` / `lg`（64 / 144 / 256px），或 32–512px 数字，包含周围柔光；容器较窄时自动缩小。
- `paused` 冻结动画，恢复时延续原相位。系统减少动态效果、离屏或页面进入后台时停止帧调度。绘制上限约 30fps，像素密度上限 2。
- `label` 自定义状态文本；`hideLabel` 仅隐藏可见文字，保留读屏播报。组件为状态呈现，交互入口应由应用使用按钮承载。
- 支持原生 `span` 属性与 `ref`。WebGL 不可用时显示静态渐变球，图形上下文丢失后自动尝试恢复。

## Carousel 轮播图

```tsx
import { Carousel } from '@ray-ui/react';
import '@ray-ui/react/styles.css';

<Carousel aria-label="旅行相册" items={[
  { id: 'mountain', label: '山间清晨', content: <img src="/mountain.jpg" alt="晨光中的山峦" /> },
  { id: 'sea', label: '海边日落', content: <img src="/sea.jpg" alt="夕阳下的海岸" /> },
]} />
```

`items` 接受唯一 `id`、可访问名称 `label` 与任意 React `content`。`value` / `defaultValue` 为从 0 开始的索引，`onValueChange` 通知切换；越界索引会限制到有效范围。默认首尾循环，设置 `loop={false}` 可关闭。空列表显示空状态，单张隐藏导航。

支持箭头按钮、圆点导航和触摸滑动。Tab 聚焦轮播区域后，可使用左右方向键、Home / End；非当前幻灯片隐藏且不可聚焦。图片尺寸由内容决定，建议提供相同宽高比以保持布局稳定。

自动播放默认关闭，使用 `autoPlay` 开启，`interval` 默认 5000 毫秒、最小 1000 毫秒。提供暂停按钮，悬停或焦点位于内部时暂停；后台页面不切换，系统开启减少动态效果时禁用自动播放与切换动画。文档站包含三张本地矢量风景示例和自动播放开关。

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
