export type Category = "all" | "ui" | "motion" | "business";
export interface ComponentDoc {
  name: string;
  chinese: string;
  category: Exclude<Category, "all">;
  description: string;
  code: string;
  props: [string, string, string][];
}

export const categories = [
  { value: "all", label: "全部组件" },
  { value: "ui", label: "通用 UI" },
  { value: "motion", label: "视觉动效" },
  { value: "business", label: "业务组件" },
] as const;

export const catalog: ComponentDoc[] = [
  {
    name: "Button",
    chinese: "按钮",
    category: "ui",
    description: "每一次行动，都从一个清晰的按钮开始。",
    code: `import { Button } from '@ray-ui/react';\n\n<Button onClick={() => alert('开始构建！')}>\n  开始构建\n</Button>\n<Button variant="outline">了解更多</Button>\n<Button loading>正在保存</Button>`,
    props: [
      ["variant", "primary | secondary | outline | ghost | danger", "primary"],
      ["size", "sm | md | lg", "md"],
      ["loading", "boolean", "false"],
      ["disabled / onClick / ref", "原生 button 属性", "—"],
    ],
  },
  {
    name: "Input",
    chinese: "输入框",
    category: "ui",
    description: "标签、提示、校验反馈，照顾每一个输入。",
    code: `import { Input } from '@ray-ui/react';\n\n<Input label="邮箱地址" type="email"\n  placeholder="you@example.com"\n  hint="我们会好好保管你的邮箱。" />\n<Input label="项目名称" error="请填写项目名称" />`,
    props: [
      ["label", "string", "—"],
      ["hint / error", "string", "—"],
      ["value / onChange / ref", "原生 input 属性", "—"],
    ],
  },
  {
    name: "DatePicker",
    chinese: "日期选择器",
    category: "ui",
    description: "给下一次出发，选一个刚刚好的日子。",
    code: `import { useState } from 'react';\nimport { DatePicker } from '@ray-ui/react';\n\nexport function ProjectDate() {\n  const [date, setDate] = useState<Date | undefined>();\n  return (\n    <DatePicker\n      label="项目启动日期"\n      name="startDate"\n      value={date}\n      onValueChange={setDate}\n      minDate={new Date(2026, 8, 1)}\n      maxDate={new Date(2026, 11, 31)}\n      hint="请选择 2026 年 9–12 月的日期。"\n    />\n  );\n}`,
    props: [
      ["value / defaultValue", "Date | undefined，受控值 / 非受控初值", "—"],
      ["onValueChange", "(date: Date | undefined) => void，清除时传 undefined", "—"],
      ["minDate / maxDate", "Date，按本地日限制，含边界、忽略时分秒", "—"],
      ["label / placeholder", "string，标签 / 未选择时的提示", "— / 选择日期"],
      ["hint / error", "string，提示或错误信息", "—"],
      ["clearable / disabled", "boolean，允许清除 / 禁用整个控件", "true / false"],
      ["name", "string，表单提交为本地 YYYY-MM-DD", "—"],
      ["id / className / ref", "string / string / Ref<HTMLButtonElement>", "—"],
    ],
  },
  {
    name: "Switch",
    chinese: "开关",
    category: "ui",
    description: "一个小小的切换，让偏好即刻生效。",
    code: `import { useState } from 'react';\nimport { Switch } from '@ray-ui/react';\n\nexport function Preferences() {\n  const [enabled, setEnabled] = useState(true);\n  return <Switch label="接收更新通知"\n    checked={enabled} onCheckedChange={setEnabled} />;\n}`,
    props: [
      ["checked / defaultChecked", "boolean", "false"],
      ["onCheckedChange", "(checked: boolean) => void", "—"],
      ["label / disabled / name", "标签与原生 input 属性", "—"],
    ],
  },
  {
    name: "SpotlightCard",
    chinese: "聚光卡片",
    category: "motion",
    description: "光随指尖而动，为内容添一点灵感。",
    code: `import { SpotlightCard } from '@ray-ui/react';\n\n<SpotlightCard style={{ padding: 32 }}>\n  <h3>让灵感发光。</h3>\n  <p>移动指针，探索属于你的光。</p>\n</SpotlightCard>`,
    props: [
      ["children", "ReactNode", "—"],
      ["className / style / ref", "原生 div 属性", "—"],
    ],
  },
  {
    name: "Badge",
    chinese: "徽标",
    category: "ui",
    description: "轻巧的状态表达，让信息一目了然。",
    code: `import { Badge } from '@ray-ui/react';\n\n<Badge variant="success">已完成</Badge>\n<Badge variant="warning">进行中</Badge>\n<Badge variant="info">新功能</Badge>`,
    props: [
      ["variant", "neutral | success | warning | danger | info", "neutral"],
      ["children / className / ref", "原生 span 属性", "—"],
    ],
  },
  {
    name: "AnimatedNumber",
    chinese: "数字动画",
    category: "motion",
    description: "让每一份增长，都有恰到好处的仪式感。",
    code: `import { useState } from 'react';\nimport { AnimatedNumber, Button } from '@ray-ui/react';\n\nexport function Counter() {\n  const [value, setValue] = useState(1280);\n  return <>\n    <AnimatedNumber value={value} prefix="¥" duration={900} />\n    <Button onClick={() => setValue(value + 100)}>增加</Button>\n  </>;\n}`,
    props: [
      ["value", "number", "必填"],
      ["duration", "number，单位 ms", "900"],
      ["prefix / suffix / className", "string", "—"],
    ],
  },
  {
    name: "Tabs",
    chinese: "标签页",
    category: "ui",
    description: "切换视角，让相关内容井然有序。",
    code: `import { Tabs } from '@ray-ui/react';\n\n<Tabs aria-label="项目视图" items={[\n  { value: 'overview', label: '概览', content: <p>项目概览</p> },\n  { value: 'activity', label: '动态', content: <p>最近动态</p> },\n]} />`,
    props: [
      ["items", "{ value, label, content, disabled? }[]", "必填"],
      ["value / defaultValue", "string", "首个可用项"],
      ["onValueChange", "(value: string) => void", "—"],
    ],
  },
  {
    name: "Dialog",
    chinese: "对话框",
    category: "ui",
    description: "留一点专注空间，完成重要的事情。",
    code: `import { Dialog, Button, Input } from '@ray-ui/react';\n\n<Dialog trigger={<Button>创建项目</Button>}\n  title="创建新项目" description="给你的下一个想法起个名字。">\n  <Input label="项目名称" placeholder="我的新项目" />\n</Dialog>`,
    props: [
      ["trigger", "可接收 ref 与事件的元素，或文本", "必填"],
      ["title / description", "string", "标题必填"],
      ["open / onOpenChange", "boolean / (open: boolean) => void", "非受控"],
      ["children / className", "ReactNode / string", "—"],
    ],
  },
  {
    name: "DataTable",
    chinese: "数据表格",
    category: "business",
    description: "搜索、排序与分页，把复杂数据变清晰。",
    code: `import { DataTable } from '@ray-ui/react';\n\nconst data = [\n  { id: '1', name: '设计系统', status: '进行中' },\n  { id: '2', name: '个人主页', status: '已完成' },\n];\n\n<DataTable data={data} caption="我的项目" pageSize={5}\n  columns={[\n    { key: 'name', header: '项目', sortable: true },\n    { key: 'status', header: '状态' },\n  ]} />`,
    props: [
      ["data", "T[]，每行必须有唯一 id: string", "必填"],
      ["columns", "{ key, header, sortable?, render? }[]", "必填"],
      ["pageSize", "number", "5"],
      ["caption / searchPlaceholder", "string", "数据列表 / 搜索数据…"],
    ],
  },
  {
    name: "Card",
    chinese: "卡片",
    category: "ui",
    description: "给每一组内容，一个舒服的容器。",
    code: `import { Card, Badge } from '@ray-ui/react';\n\n<Card style={{ padding: 24 }}>\n  <Badge variant="success">灵感进行时</Badge>\n  <h3>下一个好点子</h3>\n  <p>从这里开始，把想法慢慢变成现实。</p>\n</Card>`,
    props: [["children / className / style / ref", "原生 div 属性", "—"]],
  },
  {
    name: "FilterBar",
    chinese: "筛选栏",
    category: "business",
    description: "少一点寻找，快一点到达想要的结果。",
    code: `import { useState } from 'react';\nimport { FilterBar } from '@ray-ui/react';\n\nexport function Filters() {\n  const [value, setValue] = useState('all');\n  return <FilterBar value={value} onValueChange={setValue}\n    options={[\n      { label: '全部', value: 'all', count: 12 },\n      { label: '进行中', value: 'active', count: 5 },\n      { label: '已完成', value: 'done', count: 7 },\n    ]} />;\n}`,
    props: [
      ["options", "{ label, value, count? }[]", "必填"],
      ["value / onValueChange", "string / (value: string) => void", "必填"],
      ["aria-label", "string", "筛选条件"],
    ],
  },
  {
    name: "Reveal",
    chinese: "入场动画",
    category: "motion",
    description: "随滚动轻轻出现，让浏览多一点节奏。",
    code: `import { Reveal } from '@ray-ui/react';\n\n<Reveal delay={100}>\n  <h3>你好，新的灵感。</h3>\n</Reveal>\n<Reveal delay={200} once={false}>\n  <p>进入视口时轻轻出现。</p>\n</Reveal>`,
    props: [
      ["delay", "number，单位 ms", "0"],
      ["once", "boolean", "true"],
      ["children / className / style / ref", "原生 div 属性", "—"],
    ],
  },
  {
    name: "Textarea",
    chinese: "文本域",
    category: "ui",
    description: "为长一点的想法，留出更多表达空间。",
    code: `import { Textarea } from '@ray-ui/react';\n\n<Textarea label="项目介绍" rows={3}\n  placeholder="写下你的想法…"\n  hint="描述一下你想打造的作品。" />`,
    props: [
      ["label / hint / error", "string", "—"],
      ["rows / value / onChange / ref", "原生 textarea 属性", "—"],
    ],
  },
  {
    name: "Separator",
    chinese: "分隔线",
    category: "ui",
    description: "一点留白，一条细线，让内容呼吸。",
    code: `import { Separator } from '@ray-ui/react';\n\n<div>账户设置</div>\n<Separator style={{ margin: '16px 0' }} />\n<div>通知偏好</div>`,
    props: [["className / style / ref", "原生 div 属性", "—"]],
  },
];
