import { useEffect, useRef, useState, type ReactNode } from "react";
import { DatePickerDemo } from './DatePickerDemo';
import { StackedDrawerDemo } from './StackedDrawerDemo';
import { StackedCardsDemo } from './StackedCardsDemo';
import { LeaderboardDemo } from './LeaderboardDemo';
import { DownloadButtonDemo } from './DownloadButtonDemo';
import { BreathingIndicatorDemo } from './BreathingIndicatorDemo';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Asterisk,
  BookOpen,
  Box,
  Check,
  ChevronRight,
  Code2,
  Copy,
  FileCode2,
  Grid2X2,
  Layers,
  Menu,
  Moon,
  Palette,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Sun,
  X,
  Zap,
} from "lucide-react";
import {
  AnimatedNumber,
  Badge,
  Button,
  Card,
  DataTable,
  Dialog,
  FilterBar,
  Input,
  Reveal,
  Separator,
  SpotlightCard,
  Switch,
  Slider,
  ScrollArea,
  Tabs,
  Textarea,
} from "../src";
import {
  catalog,
  categories,
  type Category,
  type ComponentDoc,
} from "./catalog";

type Page = "components" | "start" | "tokens";
const categoryIcons = {
  all: Grid2X2,
  ui: Layers,
  motion: Sparkles,
  business: SlidersHorizontal,
};

function CopyButton({
  text,
  label = "复制代码",
}: {
  text: string;
  label?: string;
}) {
  const [state, setState] = useState<"idle" | "done" | "error">("idle");
  useEffect(() => {
    if (state === "idle") return;
    const timer = window.setTimeout(() => setState("idle"), 2200);
    return () => window.clearTimeout(timer);
  }, [state]);
  return (
    <button
      className="copy-button"
      aria-label={state === "done" ? "已复制" : label}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setState("done");
        } catch {
          setState("error");
        }
      }}
    >
      {state === "done" ? <Check size={14} /> : <Copy size={14} />}
      <span role="status">
        {state === "done" ? "已复制" : state === "error" ? "请手动复制" : label}
      </span>
    </button>
  );
}

function CodeBlock({
  code,
  title = "example.tsx",
}: {
  code: string;
  title?: string;
}) {
  return (
    <div className="code-block">
      <div className="code-block-header">
        <span>
          <FileCode2 size={14} />
          {title}
        </span>
        <CopyButton text={code} />
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

const projects = [
  { id: "1", name: "个人设计系统", status: "进行中", date: "2026-09-09" },
  { id: "2", name: "灵感收藏夹", status: "已完成", date: "2026-09-08" },
  { id: "3", name: "周末小计划", status: "待开始", date: "2026-09-06" },
  { id: "4", name: "摄影作品集", status: "进行中", date: "2026-09-05" },
  { id: "5", name: "我的个人主页", status: "已完成", date: "2026-09-03" },
  { id: "6", name: "日常阅读清单", status: "待开始", date: "2026-09-01" },
];

function ComponentPreview({
  name,
  expanded = false,
}: {
  name: string;
  expanded?: boolean;
}) {
  const [enabled, setEnabled] = useState(true);
  const [volume, setVolume] = useState(64);
  const [count, setCount] = useState(1280);
  const [filter, setFilter] = useState("all");
  const [replay, setReplay] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectError, setProjectError] = useState("");
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timeout.current) clearTimeout(timeout.current);
    },
    [],
  );
  const save = () => {
    setLoading(true);
    setSaved(false);
    timeout.current = setTimeout(() => {
      setLoading(false);
      setSaved(true);
    }, 800);
  };

  switch (name) {
    case "BreathingIndicator":
      return <BreathingIndicatorDemo expanded={expanded} />;
    case "DownloadButton":
      return <DownloadButtonDemo expanded={expanded} />;
    case "Leaderboard":
      return <LeaderboardDemo expanded={expanded} />;
    case "ScrollArea":
      return <ScrollArea aria-label="灵感清单" style={{ height: expanded ? 300 : 170, width: 360, maxWidth: '100%', padding: '0 20px' }}>
        {['收集一点灵感', '挑选喜欢的配色', '画下第一个草图', '打磨小小的细节', '留一些呼吸空间', '试试不同的组合', '让交互自然发生', '完成今天的创作'].map((title, index) =>
          <div key={title} style={{ padding: '20px 0', borderBottom: '1px solid var(--ray-border)', display: 'flex', gap: 16, alignItems: 'center' }}>
            <span style={{ color: 'var(--ray-accent)', fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>{String(index + 1).padStart(2, '0')}</span>
            <span style={{ color: 'var(--ray-text)', fontSize: 14 }}>{title}</span>
          </div>)}
      </ScrollArea>;
    case "Slider":
      return <div style={{ width: expanded ? 380 : 260, maxWidth: '100%', display: 'grid', gap: 28 }}>
        <Slider label="播放音量" value={volume} onValueChange={setVolume} formatValue={(value) => `${value}%`} />
        {expanded && <Slider label="默认音量 · 已锁定" value={40} disabled formatValue={(value) => `${value}%`} />}
      </div>;
    case "Button":
      return (
        <div className="preview-stack">
          <div className="preview-row">
            <Button onClick={save} loading={loading}>
              {saved ? <Check size={14} /> : <Plus size={14} />}
              {saved ? "已准备好" : "开始构建"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSaved(false);
                setLoading(false);
                if (timeout.current) clearTimeout(timeout.current);
              }}
            >
              重置示例
              <ArrowUpRight size={14} />
            </Button>
          </div>
          <div className="preview-row">
            <Button variant="secondary" size="sm" disabled>
              暂不可用
            </Button>
            <Button variant="ghost" size="sm" onClick={save}>
              试一试
              <ArrowRight size={13} />
            </Button>
          </div>
          <span className="sr-only" role="status">
            {saved ? "按钮演示操作已完成" : ""}
          </span>
        </div>
      );
    case "DatePicker":
      return <DatePickerDemo expanded={expanded} />;
    case "StackedDrawer":
      return <StackedDrawerDemo expanded={expanded} />;
    case "StackedCards":
      return <StackedCardsDemo expanded={expanded} />;
    case "Input":
      return (
        <div className="preview-field">
          <Input
            label="邮箱地址"
            type="email"
            placeholder="you@example.com"
            hint="每一个好想法，值得被连接。"
          />
        </div>
      );
    case "Switch":
      return (
        <div className="switch-demo">
          <div>
            <span>
              <strong>接收更新通知</strong>
              <small>{enabled ? "不错过每一份新灵感" : "已暂停更新通知"}</small>
            </span>
            <Switch
              checked={enabled}
              onCheckedChange={setEnabled}
              aria-label="接收更新通知"
            />
          </div>
          <div>
            <span>
              <strong>每周灵感周刊</strong>
              <small>给忙碌的日常充充电</small>
            </span>
            <Switch defaultChecked={false} aria-label="每周灵感周刊" />
          </div>
        </div>
      );
    case "SpotlightCard":
      return (
        <SpotlightCard className="spotlight-demo">
          <span className="spotlight-orb">
            <Asterisk size={46} strokeWidth={1.5} />
          </span>
          <strong>让灵感发光。</strong>
          <span>
            移动指针，发现一点小惊喜 <ArrowUpRight size={12} />
          </span>
        </SpotlightCard>
      );
    case "Badge":
      return (
        <div className="preview-stack badge-demo">
          <div className="preview-row">
            <Badge variant="success">
              <span className="status-dot" />
              已完成
            </Badge>
            <Badge variant="warning">
              <span className="status-dot" />
              进行中
            </Badge>
            <Badge variant="neutral">草稿</Badge>
          </div>
          <div className="preview-row">
            <Badge variant="info">
              <Sparkles size={11} />
              新功能
            </Badge>
            <Badge variant="danger">需关注</Badge>
            <Badge>v0.1.0</Badge>
          </div>
        </div>
      );
    case "AnimatedNumber":
      return (
        <div className="number-demo">
          <span className="tiny-label">每一份灵感，都在增长</span>
          <div>
            <AnimatedNumber value={count} />
            <span className="growth">
              <ArrowUpRight size={13} />
              {count === 1280 ? "起点" : `+${count - 1280}`}
            </span>
          </div>
          <button onClick={() => setCount(count + 128)} className="text-button">
            <Plus size={12} />
            增加一点灵感
          </button>
        </div>
      );
    case "Tabs":
      return (
        <Tabs
          className="tabs-demo"
          aria-label="项目示例"
          items={[
            {
              value: "overview",
              label: "概览",
              content: (
                <div className="tab-example">
                  <Box size={21} />
                  <strong>每个项目，都有无限可能。</strong>
                  <span>给新想法一个开始的地方。</span>
                </div>
              ),
            },
            {
              value: "activity",
              label: "动态",
              content: (
                <div className="tab-example">
                  <Zap size={21} />
                  <strong>今天，也向前了一小步。</strong>
                  <span>你刚刚探索了 Ray UI 的标签页。</span>
                </div>
              ),
            },
            {
              value: "settings",
              label: "设置",
              content: (
                <div className="tab-example">
                  <Switch defaultChecked label="公开项目预览" />
                </div>
              ),
            },
          ]}
        />
      );
    case "Dialog":
      return (
        <div className="dialog-demo">
          <div className="dialog-miniature" aria-hidden="true">
            <span />
            <span />
            <i />
            <b />
          </div>
          <Dialog
            open={dialog}
            onOpenChange={setDialog}
            trigger={
              <Button variant="outline">
                <Plus size={14} />
                创建项目
              </Button>
            }
            title="给新想法一个名字"
            description="这是本地交互演示，项目不会上传或保存到服务器。"
          >
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (!projectName.trim()) {
                  setProjectError("请填写项目名称");
                  return;
                }
                setSaved(true);
                setDialog(false);
                setProjectError("");
              }}
            >
              <Input
                label="项目名称"
                value={projectName}
                onChange={(event) => {
                  setProjectName(event.target.value);
                  setProjectError("");
                }}
                error={projectError}
                placeholder="我的下一个好点子"
              />
              <div className="dialog-actions">
                <Button variant="ghost" onClick={() => setDialog(false)}>
                  取消
                </Button>
                <Button type="submit">
                  创建演示项目
                  <ArrowRight size={14} />
                </Button>
              </div>
            </form>
          </Dialog>
          <span role="status" className="demo-status">
            {saved
              ? `已创建演示项目「${projectName}」`
              : "一个专注的空间，只为重要的事。"}
          </span>
        </div>
      );
    case "DataTable":
      return (
        <div className="table-demo">
          <DataTable
            data={projects}
            pageSize={expanded ? 4 : 2}
            caption="演示项目"
            searchPlaceholder="搜索项目…"
            columns={[
              { key: "name", header: "项目名称", sortable: true },
              {
                key: "status",
                header: "状态",
                render: (value) => (
                  <Badge
                    variant={
                      value === "已完成"
                        ? "success"
                        : value === "进行中"
                          ? "warning"
                          : "neutral"
                    }
                  >
                    {value}
                  </Badge>
                ),
              },
              ...(expanded
                ? [{ key: "date" as const, header: "更新日期", sortable: true }]
                : []),
            ]}
          />
        </div>
      );
    case "Card":
      return (
        <Card className="card-demo">
          <span className="card-demo-icon">
            <Layers size={22} />
          </span>
          <div>
            <strong>下一个好点子</strong>
            <p>从一颗种子，到一片自己的花园。</p>
          </div>
          <Separator />
          <span className="card-demo-bottom">
            <Badge variant="success">灵感进行时</Badge>
            <ArrowUpRight size={16} />
          </span>
        </Card>
      );
    case "FilterBar":
      return (
        <div className="filter-demo">
          <FilterBar
            aria-label="演示项目状态筛选"
            value={filter}
            onValueChange={setFilter}
            options={[
              { label: "全部", value: "all", count: 6 },
              { label: "进行中", value: "进行中", count: 2 },
              { label: "已完成", value: "已完成", count: 2 },
            ]}
          />
          <div className="filter-results" aria-live="polite">
            {projects
              .filter(
                (project) => filter === "all" || project.status === filter,
              )
              .slice(0, 3)
              .map((project) => (
                <span key={project.id}>
                  <span className="filter-result-dot" />
                  {project.name}
                  <ArrowUpRight size={12} />
                </span>
              ))}
          </div>
        </div>
      );
    case "Reveal":
      return (
        <div className="reveal-demo">
          <div key={replay} className="reveal-tiles">
            {[Layers, Sparkles, Box].map((Icon, i) => (
              <Reveal delay={i * 160} key={i}>
                <Icon size={23} />
              </Reveal>
            ))}
          </div>
          <button className="text-button" onClick={() => setReplay(replay + 1)}>
            <RotateCcw size={12} />
            再看一次
          </button>
        </div>
      );
    case "Textarea":
      return (
        <div className="preview-field">
          <Textarea
            label="写下你的想法"
            rows={3}
            placeholder="如果可以做任何东西，你想做什么？"
          />
        </div>
      );
    case "Separator":
      return (
        <div className="separator-demo">
          <span>
            <span>账户设置</span>
            <ChevronRight size={14} />
          </span>
          <Separator />
          <span>
            <span>通知偏好</span>
            <ChevronRight size={14} />
          </span>
          <Separator />
          <span>
            <span>工作空间</span>
            <ChevronRight size={14} />
          </span>
        </div>
      );
    default:
      return null;
  }
}

function PreviewCard({
  item,
  onOpen,
}: {
  item: ComponentDoc;
  onOpen: () => void;
}) {
  const [code, setCode] = useState(false);
  return (
    <article className={`component-card component-card--${item.name}`}>
      <div className="component-card-top">
        <span className="category-caption">
          {item.category === "ui"
            ? "INTERFACE"
            : item.category === "motion"
              ? "MOTION"
              : "WORKFLOW"}
        </span>
        <div className="view-switch">
          <button
            aria-label={`${item.name} 预览`}
            aria-pressed={!code}
            onClick={() => setCode(false)}
          >
            <Grid2X2 size={12} />
          </button>
          <button
            aria-label={`${item.name} 代码`}
            aria-pressed={code}
            onClick={() => setCode(true)}
          >
            <Code2 size={14} />
          </button>
        </div>
      </div>
      <div className={`component-stage ${code ? "component-stage--code" : ""}`}>
        {code ? (
          <CodeBlock code={item.code} />
        ) : (
          <ComponentPreview name={item.name} />
        )}
      </div>
      <button className="component-caption" onClick={onOpen}>
        <span>
          <strong>
            {item.name}
            <span>{item.chinese}</span>
          </strong>
          <small>{item.description}</small>
        </span>
        <ArrowUpRight size={17} />
      </button>
    </article>
  );
}

function QuickStart() {
  return (
    <div className="article-page">
      <span className="eyebrow">GETTING STARTED</span>
      <h1>从这里，开始创造。</h1>
      <p className="page-description">
        几步接入你的项目，然后专注于真正重要的想法。
      </p>
      <div className="notice">
        <BookOpen size={18} />
        <span>
          Ray UI 当前是本地开发版本，尚未发布到
          npm。以下使用本地安装包接入，适用于 React 19 + TypeScript 项目。
        </span>
      </div>
      <section>
        <h2>
          <span className="step-number">01</span>启动组件工作台
        </h2>
        <p>在 Ray UI 目录安装依赖，启动这份可交互的文档。</p>
        <CodeBlock title="terminal" code={"npm install\nnpm run dev"} />
      </section>
      <section>
        <h2>
          <span className="step-number">02</span>打包并接入你的项目
        </h2>
        <p>在组件库目录生成安装包，然后在你的 React 项目中安装生成的文件。</p>
        <CodeBlock
          title="组件库目录"
          code={"npm pack\n# 生成 ray-ui-react-0.1.0.tgz"}
        />
        <CodeBlock
          title="你的 React 项目目录"
          code={"npm install /path/to/ray-ui-react-0.1.0.tgz"}
        />
      </section>
      <section>
        <h2>
          <span className="step-number">03</span>写下第一个组件
        </h2>
        <p>在应用入口引入一次样式，按需导入组件。</p>
        <CodeBlock
          title="App.tsx"
          code={`import { Button, Card } from '@ray-ui/react';\nimport '@ray-ui/react/styles.css';\n\nexport default function App() {\n  return (\n    <Card style={{ padding: 24 }}>\n      <h1>你好，新的灵感。</h1>\n      <Button onClick={() => alert('开始创造！')}>\n        开始创造\n      </Button>\n    </Card>\n  );\n}`}
        />
      </section>
      <section>
        <h2>
          <span className="step-number">04</span>换上你的颜色
        </h2>
        <p>
          通过 CSS 变量定制你的品牌色。设置根元素的 data-ray-theme 为 dark
          即可启用深色主题。
        </p>
        <CodeBlock
          title="your-theme.css"
          code={
            ":root {\n  --ray-accent: #526d4e;\n  --ray-accent-contrast: #ffffff;\n  --ray-ring: #526d4e;\n  --ray-radius: 8px;\n}"
          }
        />
      </section>
    </div>
  );
}

function Tokens() {
  const tokens = [
    ["--ray-bg", "页面背景"],
    ["--ray-surface", "组件表面"],
    ["--ray-surface-raised", "次级表面"],
    ["--ray-text", "主要文本"],
    ["--ray-muted", "次要文本"],
    ["--ray-border", "边框"],
    ["--ray-accent", "品牌强调"],
    ["--ray-accent-contrast", "强调色上的文本"],
    ["--ray-ring", "焦点轮廓"],
  ];
  return (
    <div className="article-page tokens-page">
      <span className="eyebrow">DESIGN FOUNDATIONS</span>
      <h1>你自己的，设计语言。</h1>
      <p className="page-description">
        统一的颜色、间距与圆角，为每一个组件打好基础。切换右上角主题，看看变量如何变化。
      </p>
      <h2>色彩 Color</h2>
      <div className="token-grid">
        {tokens.map(([token, label]) => (
          <div className="token-card" key={token}>
            <div
              className="token-swatch"
              style={{ background: `var(${token})` }}
            />
            <div>
              <strong>{label}</strong>
              <code>{token}</code>
              <CopyButton text={token} label="复制变量" />
            </div>
          </div>
        ))}
      </div>
      <h2>形状 Shape</h2>
      <div className="shape-demo">
        {[4, 8, 12, 16].map((radius) => (
          <div key={radius}>
            <span style={{ borderRadius: radius }} />
            <code>{radius}px</code>
            {radius === 8 && <Badge>默认</Badge>}
          </div>
        ))}
      </div>
      <h2>间距 Spacing</h2>
      <div className="spacing-demo">
        {[4, 8, 12, 16, 24, 32, 48].map((space) => (
          <div key={space}>
            <span style={{ width: space }} />
            <code>{space}</code>
          </div>
        ))}
      </div>
      <CodeBlock
        title="theme.css"
        code={
          ':root {\n  --ray-accent: #df5a31;\n  --ray-radius: 8px;\n}\n\n/* 全局启用深色主题 */\n/* <html data-ray-theme="dark"> */'
        }
      />
    </div>
  );
}

function readLocation(): {
  page: Page;
  category: Category;
  selected: string | null;
} {
  const hash = window.location.hash.slice(1);
  if (hash === "start" || hash === "tokens")
    return { page: hash, category: "all", selected: null };
  const [section, value] = hash.split("/");
  if (section === "component" && catalog.some((item) => item.name === value))
    return { page: "components", category: "all", selected: value };
  return {
    page: "components",
    category: categories.some((category) => category.value === value)
      ? (value as Category)
      : "all",
    selected: null,
  };
}

export function App() {
  const [location, setLocation] = useState(readLocation);
  const { page, category, selected } = location;
  const [query, setQuery] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 700px)').matches);
  const menuRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem("ray-ui-theme");
      return saved
        ? saved === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 700px)');
    const update = () => { setIsMobile(media.matches); setMobileNav(false); };
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!mobileNav || !isMobile) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sidebarRef.current?.querySelector('button')?.focus();
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileNav(false);
        menuRef.current?.focus();
      }
      if (event.key !== 'Tab') return;
      const buttons = sidebarRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
      if (!buttons?.length) return;
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', trapFocus);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', trapFocus); };
  }, [mobileNav, isMobile]);
  useEffect(() => {
    document.documentElement.dataset.rayTheme = dark ? "dark" : "light";
    try {
      localStorage.setItem("ray-ui-theme", dark ? "dark" : "light");
    } catch {
      /* Theme still works without persistence. */
    }
  }, [dark]);
  useEffect(() => {
    const onHash = () => {
      setLocation(readLocation());
      setMobileNav(false);
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("hashchange", onHash);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("keydown", onKey);
    };
  }, []);
  function navigate(hash: string) {
    setQuery("");
    setMobileNav(false);
    window.location.hash = hash;
    setLocation(readLocation());
    if (isMobile && mobileNav) document.getElementById('main-content')?.focus();
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  const currentDoc = catalog.find((item) => item.name === selected);
  const visible = catalog.filter(
    (item) =>
      (category === "all" || category === item.category) &&
      `${item.name} ${item.chinese} ${item.description}`
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
  );
  let content: ReactNode;
  if (page === "start") content = <QuickStart />;
  else if (page === "tokens") content = <Tokens />;
  else if (currentDoc)
    content = (
      <div className="detail-page">
        <button
          className="text-button back-button"
          onClick={() => navigate(`components/${currentDoc.category}`)}
        >
          <ArrowLeft size={14} />
          返回组件列表
        </button>
        <span className="eyebrow">
          {categories.find((item) => item.value === currentDoc.category)?.label}
        </span>
        <h1>
          {currentDoc.name}
          <span>{currentDoc.chinese}</span>
        </h1>
        <p className="page-description">{currentDoc.description}</p>
        <div className="detail-preview">
          <div className="detail-preview-label">
            <span>
              <Grid2X2 size={14} />
              交互预览
            </span>
            <Badge>LIVE</Badge>
          </div>
          <div className="detail-stage">
            <ComponentPreview name={currentDoc.name} expanded />
          </div>
        </div>
        <h2>使用示例</h2>
        <CodeBlock code={currentDoc.code} />
        <h2>API 参考</h2>
        <div className="api-scroll">
          <table className="api-table">
            <thead>
              <tr>
                <th>属性</th>
                <th>类型 / 说明</th>
                <th>默认值</th>
              </tr>
            </thead>
            <tbody>
              {currentDoc.props.map(([prop, type, value]) => (
                <tr key={prop}>
                  <td>
                    <code>{prop}</code>
                  </td>
                  <td>{type}</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {currentDoc.category === "motion" && (
          <div className="notice">
            <Sparkles size={18} />
            <span>尊重系统的「减少动态效果」偏好。开启时减少或跳过动画。</span>
          </div>
        )}
        {currentDoc.name === "DataTable" && (
          <div className="notice">
            <BookOpen size={18} />
            <span>
              当前为客户端数据表格，适合小型数据集。示例使用固定演示数据。
            </span>
          </div>
        )}
      </div>
    );
  else
    content = (
      <>
        <section className="welcome">
          <div className="welcome-copy">
            <div className="eyebrow">
              <span className="orange-dot" />A LITTLE RAY OF POSSIBILITY
            </div>
            <h1>
              把想法，搭成作品<span className="orange-period">。</span>
            </h1>
            <p>
              好用的基础，细腻的动效，实用的业务组件。
              <br />
              在这里，构建属于你的界面语言。
            </p>
            <div className="welcome-actions">
              <Button size="sm" onClick={() => navigate("start")}>
                快速开始
                <ArrowUpRight size={14} />
              </Button>
              <button
                className="text-button"
                onClick={() => navigate("tokens")}
              >
                探索设计变量
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
          <div className="welcome-art" aria-hidden="true">
            <div className="art-grid" />
            <div className="ray-sculpture">
              {Array.from({ length: 12 }, (_, i) => (
                <i
                  key={i}
                  style={{
                    transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
                  }}
                />
              ))}
              <span />
            </div>
            <span className="art-note">
              SMALL PIECES. ENDLESS POSSIBILITIES.
            </span>
            <span className="art-coordinate">R / 001</span>
          </div>
        </section>
        <div className="library-meta">
          <span>
            <Box size={14} />
            <strong>{catalog.length}</strong> 个精心构建的组件
          </span>
          <span>
            <Layers size={14} />
            <strong>3</strong> 类创作积木
          </span>
          <span>
            <FileCode2 size={14} />
            TypeScript 原生支持
          </span>
          <span className="meta-end">
            从小处开始，慢慢生长 <span>↗</span>
          </span>
        </div>
        <section className="catalog-section">
          <div className="catalog-heading">
            <h2>
              挑一块积木，开始创造<span>THE COLLECTION</span>
            </h2>
            <span className="result-total" role="status">
              {visible.length} 个组件
            </span>
          </div>
          <div className="catalog-toolbar">
            <div className="category-tabs" role="group" aria-label="组件分类">
              {categories.map((item) => {
                const Icon = categoryIcons[item.value];
                const total = catalog.filter(
                  (component) =>
                    item.value === "all" || component.category === item.value,
                ).length;
                return (
                  <button
                    key={item.value}
                    aria-pressed={category === item.value}
                    onClick={() => navigate(`components/${item.value}`)}
                  >
                    <Icon size={14} />
                    {item.label}
                    <span>{total}</span>
                  </button>
                );
              })}
            </div>
            <span className="interactive-note">
              <span />
              可交互预览
            </span>
          </div>
          {visible.length ? (
            <div className="component-grid">
              {visible.map((item) => (
                <PreviewCard
                  key={item.name}
                  item={item}
                  onOpen={() => navigate(`component/${item.name}`)}
                />
              ))}
            </div>
          ) : (
            <div className="empty-search">
              <Search size={30} />
              <h3>暂时没有找到这个组件</h3>
              <p>试试 “Button”、“卡片” 或其他关键词。</p>
              <Button
                variant="outline"
                onClick={() => {
                  setQuery("");
                  navigate("components/all");
                }}
              >
                重置搜索和分类
              </Button>
            </div>
          )}
        </section>
        <div className="end-note">
          <Asterisk size={25} />
          <div>
            <strong>这只是开始。</strong>
            <p>每一个新的想法，都会让你的组件库多一份可能。</p>
          </div>
          <button className="text-button" onClick={() => navigate("start")}>
            让它成为你的
            <ArrowUpRight size={15} />
          </button>
        </div>
      </>
    );

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link" onClick={(event) => { event.preventDefault(); document.getElementById('main-content')?.focus(); }}>
        跳到主要内容
      </a>
      {mobileNav && (
        <button
          aria-label="关闭导航遮罩"
          className="nav-scrim"
          onClick={() => { setMobileNav(false); menuRef.current?.focus(); }}
        />
      )}
      <aside
        ref={sidebarRef}
        id="library-navigation"
        inert={isMobile && !mobileNav}
        className={`sidebar ${mobileNav ? "sidebar--open" : ""}`}
        aria-label="组件库导航"
      >
        <button
          className="brand"
          onClick={() => navigate("components/all")}
          aria-label="Ray UI 首页"
        >
          <Asterisk size={34} strokeWidth={2.7} />
          <span>
            ray<span className="brand-dot">.</span>ui
          </span>
          <span className="brand-beta">LAB</span>
        </button>
        <div className="workspace-caption">YOUR CREATIVE TOOLKIT</div>
        <nav className="ray-scrollbar">
          <span className="nav-section-label">开始探索</span>
          <button
            className={`nav-item ${page === "components" && !selected && category === "all" ? "active" : ""}`}
            onClick={() => navigate("components/all")}
          >
            <Grid2X2 size={17} />
            组件总览<span className="nav-count">{catalog.length}</span>
          </button>
          <button
            className={`nav-item ${page === "start" ? "active" : ""}`}
            onClick={() => navigate("start")}
          >
            <BookOpen size={17} />
            快速开始
            <ArrowUpRight size={13} className="nav-tail" />
          </button>
          <button
            className={`nav-item ${page === "tokens" ? "active" : ""}`}
            onClick={() => navigate("tokens")}
          >
            <Palette size={17} />
            设计变量
          </button>
          <div className="nav-divider" />
          <span className="nav-section-label">组件 COMPONENTS</span>
          {categories
            .filter((item) => item.value !== "all")
            .map((item) => {
              const Icon = categoryIcons[item.value];
              return (
                <div className="nav-group" key={item.value}>
                  <button
                    className={`nav-item group-title ${page === "components" && category === item.value && !selected ? "active" : ""}`}
                    onClick={() => navigate(`components/${item.value}`)}
                  >
                    <Icon size={16} />
                    {item.label}
                    <span className="nav-count">
                      {
                        catalog.filter(
                          (component) => component.category === item.value,
                        ).length
                      }
                    </span>
                  </button>
                  <div className="nav-children">
                    {catalog
                      .filter((component) => component.category === item.value)
                      .map((component) => (
                        <button
                          key={component.name}
                          className={
                            selected === component.name ? "selected" : ""
                          }
                          onClick={() =>
                            navigate(`component/${component.name}`)
                          }
                        >
                          {component.name}
                          {component.name === "SpotlightCard" && (
                            <span className="new-dot" />
                          )}
                        </button>
                      ))}
                  </div>
                </div>
              );
            })}
        </nav>
        <div className="sidebar-bottom">
          <span className="sidebar-seed">
            <Asterisk size={19} />
          </span>
          <div>
            <strong>留一点空间给灵感</strong>
            <span>Built by you. Made for more.</span>
          </div>
          <span className="sidebar-version">v0.1</span>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <button
            ref={menuRef}
            className="icon-button mobile-menu"
            onClick={() => setMobileNav(!mobileNav)}
            aria-label={mobileNav ? "关闭导航" : "打开导航"}
            aria-expanded={mobileNav}
            aria-controls="library-navigation"
          >
            {mobileNav ? <X size={19} /> : <Menu size={19} />}
          </button>
          <div className="breadcrumb">
            <span>工作台</span>
            <ChevronRight size={13} />
            <strong>
              {currentDoc?.name ??
                (page === "start"
                  ? "快速开始"
                  : page === "tokens"
                    ? "设计变量"
                    : "组件总览")}
            </strong>
          </div>
          <div className="header-tools">
            <div className="global-search">
              <Search size={15} />
              <input
                ref={searchRef}
                type="search"
                value={query}
                placeholder="寻找一点灵感…"
                aria-label="搜索组件"
                onChange={(event) => {
                  const next = event.target.value;
                  if (page !== "components" || selected)
                    navigate("components/all");
                  setQuery(next);
                }}
              />
              <kbd>⌃ K</kbd>
            </div>
            <span className="header-divider" />
            <button
              className="icon-button theme-toggle"
              aria-label={dark ? "切换浅色主题" : "切换深色主题"}
              onClick={() => setDark(!dark)}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <span className="version-pill">v0.1.0</span>
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>
          {content}
          <footer>
            <span>
              用心构建，慢慢生长。<span className="footer-sun">✳</span>Ray UI
            </span>
            <span>
              React + TypeScript <span className="footer-dot">·</span>{" "}
              你的个人组件实验室
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
