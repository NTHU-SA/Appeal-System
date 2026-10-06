"use client";

import { useState } from "react";
import { Bold, Inbox, Italic, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { DataTone, StatusTone } from "@/lib/case-display";
import { cn } from "@/lib/utils";
import { BarList, ChartLegend, StackedBar, type ChartSegment } from "@/components/charts/stacked-bar";
import { TrendChart } from "@/components/charts/trend-chart";
import { ToggleButton } from "@/components/editor/toggle-button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge, NewBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, FieldError, FieldHint } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Notice } from "@/components/ui/notice";
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control";
import { Select, SelectContent, SelectItem, SelectLabel, SelectGroup, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { InlineStatus, StatusLine } from "@/components/ui/status";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function Section({ id, title, description, children }: { id: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="flex scroll-mt-6 flex-col gap-4 border-t py-8 first:border-t-0 first:pt-0">
      <div className="flex flex-col gap-1">
        <h2 id={`${id}-title`} className="text-title-md text-text-primary">{title}</h2>
        {description ? <p className="max-w-170 text-body-sm text-text-tertiary">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Swatch({ name, className, note }: { name: string; className: string; note?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className={cn("h-12 rounded-lg border", className)} />
      <div className="flex flex-col">
        <code className="font-mono text-caption text-text-primary">{name}</code>
        {note ? <span className="text-caption text-text-tertiary">{note}</span> : null}
      </div>
    </div>
  );
}

const dataTones = [1, 2, 3, 4, 5, 6, 7, 8] as const;
const dataNames = ["薰衣草紫", "珊瑚紅", "薄荷綠", "芥末黃", "天空藍", "莓果粉", "草綠", "駝色"];
const dataFill = ["bg-data-1", "bg-data-2", "bg-data-3", "bg-data-4", "bg-data-5", "bg-data-6", "bg-data-7", "bg-data-8"];
const dataText = ["text-data-1-text", "text-data-2-text", "text-data-3-text", "text-data-4-text", "text-data-5-text", "text-data-6-text", "text-data-7-text", "text-data-8-text"];
const dataTint = ["bg-data-1-tint", "bg-data-2-tint", "bg-data-3-tint", "bg-data-4-tint", "bg-data-5-tint", "bg-data-6-tint", "bg-data-7-tint", "bg-data-8-tint"];

const typeScale = [
  ["display", "text-display", "48 / 600"],
  ["headline-lg", "text-headline-lg", "32 / 500"],
  ["headline-md", "text-headline-md title-features", "24 / 660"],
  ["wordmark", "text-wordmark title-features", "24 / 580"],
  ["title-lg", "text-title-lg title-features", "20 / 580"],
  ["title-md", "text-title-md", "18 / 500"],
  ["title-sm", "text-title-sm title-features", "16 / 660"],
  ["body-lg", "text-body-lg", "16 / 400"],
  ["body-md", "text-body-md", "14 / 400"],
  ["body-sm", "text-body-sm", "13 / 400"],
  ["label-md", "text-label-md", "14 / 500"],
  ["control", "text-control", "13 / 500"],
  ["caption", "text-caption", "12 / 400"],
  ["overline", "text-overline uppercase", "11 / 600"],
] as const;

const statusSegments: ChartSegment[] = [
  { key: "pending", label: "待處理", value: 5, fill: "bg-warning" },
  { key: "in_progress", label: "處理中", value: 4, fill: "bg-info" },
  { key: "closed", label: "已結案", value: 2, fill: "bg-success" },
  { key: "rejected", label: "已拒絕", value: 1, fill: "bg-danger" },
];

const trend = [3, 1, 4, 2, 2, 5, 3, 6, 4, 2, 5, 7].map((value, index) => ({ label: `10/${index + 1}`, value }));

const schedule = [
  { title: "微積分", time: "08:00", tone: 0 },
  { title: "普通物理", time: "10:10", tone: 1 },
  { title: "程式設計", time: "13:20", tone: 2 },
  { title: "社團", time: "18:30", tone: 3 },
];

// Every token and component state in one page (UI preview only).
export function ComponentGallery() {
  const [segment, setSegment] = useState("list");
  const [checked, setChecked] = useState(true);
  const [bold, setBold] = useState(true);

  const nav = [
    ["colors", "顏色"],
    ["type", "字級"],
    ["buttons", "按鈕"],
    ["forms", "表單"],
    ["badges", "標籤與狀態"],
    ["feedback", "回饋"],
    ["overlays", "浮層"],
    ["navigation", "分頁與手風琴"],
    ["data", "資料視覺化"],
    ["states", "載入與空狀態"],
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      <nav aria-label="元件分類" className="shrink-0 border-b px-6 py-3 lg:sticky lg:top-(--header-height) lg:h-[calc(100dvh-var(--header-height))] lg:w-60 lg:border-r lg:border-b-0 lg:py-6">
        <ul className="flex gap-1 overflow-x-auto lg:flex-col">
          {nav.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} className="flex h-(--control-height) items-center rounded-sm px-3 text-control whitespace-nowrap text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="min-w-0 flex-1 px-6 py-8 lg:px-10">
        <div className="mx-auto flex max-w-5xl flex-col">
          <div className="flex flex-col gap-2 pb-8">
            <h1 className="text-headline-md text-text-primary">元件總覽</h1>
            <p className="max-w-170 text-body-md text-text-secondary">
              DESIGN.md 的 token 與元件狀態。用導覽列右側的主題按鈕切換淺色與深色。
            </p>
          </div>

          <Section id="colors" title="顏色" description="唯一強調色、紫調灰表面、四階中性文字；狀態色只用在圓點、圖示與短文字。">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
              <Swatch name="primary" className="bg-primary" />
              <Swatch name="primary-hover" className="bg-primary-hover" />
              <Swatch name="primary-active" className="bg-primary-active" />
              <Swatch name="surface" className="bg-surface" />
              <Swatch name="surface-sunken" className="bg-surface-sunken" />
              <Swatch name="surface-active" className="bg-surface-active" />
              <Swatch name="text-primary" className="bg-text-primary" />
              <Swatch name="text-secondary" className="bg-text-secondary" />
              <Swatch name="text-tertiary" className="bg-text-tertiary" />
              <Swatch name="text-muted" className="bg-text-muted" note="不承載資訊" />
              <Swatch name="border" className="bg-border" note="12% 深紫灰" />
              <Swatch name="danger-solid" className="bg-danger-solid" note="危險按鈕底" />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              {(["success", "warning", "danger", "info"] as StatusTone[]).map((tone) => (
                <div key={tone} className="flex flex-col gap-2 rounded-lg border p-3">
                  <InlineStatus tone={tone} label={tone} />
                  <code className="font-mono text-caption text-text-tertiary">{tone} / {tone}-text</code>
                </div>
              ))}
              <div className="flex flex-col gap-2 rounded-lg border p-3">
                <span className="flex items-center gap-2 text-body-sm text-highlight-text">highlight <NewBadge /></span>
                <code className="font-mono text-caption text-text-tertiary">只用於 NEW</code>
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-body-sm">
                <thead className="bg-surface-sunken text-caption text-text-tertiary">
                  <tr>
                    <th className="h-8 px-3 text-left font-medium">分類色</th>
                    <th className="px-3 text-left font-medium">原色</th>
                    <th className="px-3 text-left font-medium">文字階</th>
                    <th className="px-3 text-left font-medium">淡底（Badge）</th>
                    <th className="px-3 text-left font-medium">色塊上的文字</th>
                  </tr>
                </thead>
                <tbody>
                  {dataTones.map((tone, index) => (
                    <tr key={tone} className="border-t">
                      <td className="px-3 py-2 text-text-secondary">
                        <code className="font-mono text-caption">data-{tone}</code> {dataNames[index]}
                      </td>
                      <td className="px-3 py-2"><span className={cn("block h-5 w-16 rounded-sm", dataFill[index])} /></td>
                      <td className={cn("px-3 py-2 font-medium", dataText[index])}>文字 Aa</td>
                      <td className="px-3 py-2"><span className={cn("rounded-sm px-2 py-0.5", dataTint[index], dataText[index])}>標籤</span></td>
                      <td className="px-3 py-2"><span className={cn("rounded-sm px-1.5 py-1 text-caption font-semibold text-on-data", dataFill[index])}>on-data</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="type" title="字級" description="層級先靠文字顏色與字重，再靠字級。">
            <ul className="flex flex-col divide-y rounded-lg border">
              {typeScale.map(([name, className, spec]) => (
                <li key={name} className="flex items-baseline gap-4 px-4 py-3">
                  <code className="w-28 shrink-0 font-mono text-caption text-text-tertiary">{name}</code>
                  <span className={cn("min-w-0 flex-1 truncate text-text-primary", className)}>學生申訴 Campus Voice</span>
                  <span className="shrink-0 text-caption text-text-tertiary tabular-nums">{spec}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="buttons" title="按鈕" description="所有控制項 32px 高（觸控裝置 44px），每個區域最多一個 primary。">
            <div className="flex flex-wrap items-center gap-2">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="tertiary">Tertiary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger"><Trash2 />Danger</Button>
              <Button variant="danger-secondary">Danger secondary</Button>
              <Button variant="link">Link</Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button disabled>Disabled</Button>
              <Button variant="secondary" disabled>Disabled</Button>
              <Button disabled><Spinner />送出中…</Button>
              <Button><Plus />圖示與文字</Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary" size="icon" aria-label="更多"><MoreHorizontal /></Button>
                </TooltipTrigger>
                <TooltipContent>Icon button + tooltip</TooltipContent>
              </Tooltip>
              <ToggleButton pressed={bold} label="粗體（已按下）" onClick={() => setBold((value) => !value)}><Bold /></ToggleButton>
              <ToggleButton pressed={false} label="斜體" onClick={() => {}}><Italic /></ToggleButton>
            </div>
          </Section>

          <Section id="forms" title="表單" description="focus 只把外框改成 primary；錯誤時外框與說明改用危險色的文字階。">
            <div className="grid gap-6 md:grid-cols-2">
              <Field>
                <Label htmlFor="g-email">學校信箱</Label>
                <Input id="g-email" placeholder="name@gapp.nthu.edu.tw" />
                <FieldHint>案件連結會寄到這個信箱。</FieldHint>
              </Field>
              <Field>
                <Label htmlFor="g-email-error">學校信箱（錯誤）</Label>
                <Input id="g-email-error" defaultValue="student@school" aria-invalid />
                <FieldError>缺少網域結尾，例如 .edu.tw</FieldError>
              </Field>
              <Field>
                <Label>申訴種類</Label>
                <Select>
                  <SelectTrigger aria-label="申訴種類"><SelectValue placeholder="請選擇" /></SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>校園生活</SelectLabel>
                      <SelectItem value="a">課務與教學</SelectItem>
                      <SelectItem value="b">宿舍與生活</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>行政</SelectLabel>
                      <SelectItem value="c">行政程序</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <Label>搜尋</Label>
                <InputGroup>
                  <InputGroupAddon><Search /></InputGroupAddon>
                  <InputGroupInput placeholder="搜尋編號、姓名或內容" aria-label="搜尋" />
                </InputGroup>
              </Field>
              <Field className="md:col-span-2">
                <Label htmlFor="g-text">補充說明</Label>
                <Textarea id="g-text" placeholder="補充案件資訊…" />
              </Field>
              <div className="flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2 text-body-md text-text-secondary">
                  <Checkbox checked={checked} onCheckedChange={(value) => setChecked(value === true)} />
                  已勾選
                </label>
                <label className="flex items-center gap-2 text-body-md text-text-secondary">
                  <Checkbox />
                  未勾選
                </label>
              </div>
              <SegmentedControl value={segment} onValueChange={setSegment} aria-label="檢視">
                <SegmentedControlItem value="list">清單</SegmentedControlItem>
                <SegmentedControlItem value="board">看板</SegmentedControlItem>
                <SegmentedControlItem value="calendar">行事曆</SegmentedControlItem>
              </SegmentedControl>
            </div>
          </Section>

          <Section id="badges" title="標籤與狀態" description="Badge 只有一種樣式（淡底 + 文字階），用於分類與標籤；狀態一律用行內狀態。">
            <div className="flex flex-wrap gap-2">
              <Badge>neutral</Badge>
              {dataTones.map((tone, index) => (
                <Badge key={tone} tone={`data-${tone}` as DataTone}>{dataNames[index]}</Badge>
              ))}
              <NewBadge />
            </div>
            <div className="flex flex-wrap gap-6">
              <InlineStatus tone="success" label="已結案" />
              <InlineStatus tone="warning" label="快滿" count="78/80" />
              <InlineStatus tone="danger" label="額滿" />
              <InlineStatus tone="info" label="候補" count="12 人" />
              <span className="text-body-sm font-[660] text-warning-text">B+</span>
            </div>
            <ul className="flex flex-col gap-2">
              <StatusLine tone="success">申訴系統正常</StatusLine>
              <StatusLine tone="warning">Apps Script 回應較慢</StatusLine>
              <StatusLine tone="info">附件上傳排定維護</StatusLine>
            </ul>
          </Section>

          <Section id="feedback" title="回饋" description="中性公告列與 Toast；不使用淡色底加同色外框的提示框。">
            <div className="flex flex-col gap-2">
              <Notice tone="info">系統將於 10/18（六）02:00–04:00 維護，期間無法送出申訴。</Notice>
              <Notice tone="success">已寄出案件確認信。</Notice>
              <Notice tone="warning" title="即將截止">補件期限：10/20（一）23:59。</Notice>
              <Notice tone="danger" title="補充內容尚未送出">案件服務暫時無法回應，請稍後再試一次。</Notice>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => toast.success("已送出補充內容與 2 個檔案")}>Success toast</Button>
              <Button variant="secondary" onClick={() => toast.success("已移除 lee.hj@example.edu.tw", { action: { label: "復原", onClick: () => {} } })}>Toast + 復原</Button>
              <Button variant="secondary" onClick={() => toast.error("回覆尚未送出，請稍後再試一次")}>Error toast</Button>
              <Button variant="secondary" onClick={() => toast.info("部長已核准你的回覆")}>Info toast</Button>
            </div>
          </Section>

          <Section id="overlays" title="浮層" description="只有浮層有陰影；對話框 512px、遮罩用霧面白而非黑色半透明。">
            <div className="flex flex-wrap gap-2">
              <Dialog>
                <DialogTrigger asChild><Button variant="secondary">Dialog</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>新增成員</DialogTitle>
                    <DialogDescription>成員以 Google 帳號登入後台。</DialogDescription>
                  </DialogHeader>
                  <DialogBody>
                    <Field>
                      <Label htmlFor="g-dialog">Google 帳號 email</Label>
                      <Input id="g-dialog" placeholder="name@gapp.nthu.edu.tw" />
                    </Field>
                  </DialogBody>
                  <DialogFooter>
                    <DialogClose asChild><Button variant="secondary">取消</Button></DialogClose>
                    <DialogClose asChild><Button>加入成員</Button></DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="danger-secondary">確認對話框</Button></AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>移除成員</AlertDialogTitle>
                    <AlertDialogDescription>lee.hj@example.edu.tw</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogBody>
                    <Notice tone="warning">移除後這個帳號將無法登入後台。</Notice>
                  </AlertDialogBody>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogCancel asChild><Button variant="danger"><Trash2 />移除成員</Button></AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="secondary">Menu</Button></DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>案件</DropdownMenuLabel>
                  <DropdownMenuItem>複製案件編號</DropdownMenuItem>
                  <DropdownMenuItem>複製學生 email</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive"><Trash2 />移除</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild><Button variant="secondary">Tooltip</Button></TooltipTrigger>
                <TooltipContent>顯示延遲約 50ms</TooltipContent>
              </Tooltip>
            </div>
          </Section>

          <Section id="navigation" title="分頁與手風琴" description="分頁選取線是一條獨立的 2px 線，切換時滑動到新的分頁。">
            <Tabs defaultValue="reply" className="gap-0">
              <div className="-mb-px flex border-b">
                <TabsList variant="line">
                  <TabsTrigger value="reply">回覆</TabsTrigger>
                  <TabsTrigger value="messages">對話紀錄 <span className="text-caption text-text-tertiary">3</span></TabsTrigger>
                  <TabsTrigger value="details">案件資料</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="reply" className="py-4 text-text-secondary">回覆分頁內容</TabsContent>
              <TabsContent value="messages" className="py-4 text-text-secondary">對話紀錄分頁內容</TabsContent>
              <TabsContent value="details" className="py-4 text-text-secondary">案件資料分頁內容</TabsContent>
            </Tabs>
            <Tabs defaultValue="7">
              <TabsList>
                <TabsTrigger value="7">7 日</TabsTrigger>
                <TabsTrigger value="30">30 日</TabsTrigger>
                <TabsTrigger value="90">90 日</TabsTrigger>
              </TabsList>
            </Tabs>
            <Accordion type="single" collapsible defaultValue="a" className="max-w-170">
              <AccordionItem value="a">
                <AccordionTrigger>送出後會收到什麼？</AccordionTrigger>
                <AccordionContent><p>確認信與專屬查詢連結，<a href="#navigation">回覆也會寄到 email</a>。</p></AccordionContent>
              </AccordionItem>
              <AccordionItem value="b">
                <AccordionTrigger>送出後還能補充資料嗎？</AccordionTrigger>
                <AccordionContent><p>可以，透過專屬連結的「留言與補件」。</p></AccordionContent>
              </AccordionItem>
            </Accordion>
          </Section>

          <Section id="data" title="資料視覺化" description="圖表與色塊依序使用 data-1 → data-8；數值放在圖例，不放在色段上。">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="flex flex-col gap-4 rounded-lg border p-4">
                <StackedBar segments={statusSegments} />
                <ChartLegend segments={statusSegments} showShare />
              </div>
              <div className="rounded-lg border p-4">
                <BarList
                  segments={dataTones.slice(0, 5).map((tone, index) => ({
                    key: String(tone),
                    label: dataNames[index],
                    value: [6, 3, 4, 2, 5][index],
                    fill: dataFill[index],
                  }))}
                />
              </div>
              <div className="rounded-lg border p-4 lg:col-span-2">
                <TrendChart points={trend} />
              </div>
              <div className="flex flex-col gap-2 rounded-lg border p-4 lg:col-span-2">
                <span className="text-label-md text-text-primary">課表色塊（calendar-event）</span>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {schedule.map((event) => (
                    <div key={event.title} className={cn("flex flex-col gap-0.5 rounded-sm px-1.5 py-1 text-on-data", dataFill[event.tone])}>
                      <span className="text-caption font-semibold">{event.title}</span>
                      <span className="font-mono text-[10px] opacity-80">{event.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Section id="states" title="載入與空狀態">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex flex-col gap-3 rounded-lg border p-4">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
              <div className="flex items-center justify-center gap-4 rounded-lg border p-4 text-text-tertiary">
                <Spinner />
                <Spinner size="lg" />
              </div>
              <div className="rounded-lg border">
                <EmptyState icon={Inbox} title="沒有符合條件的案件" description="調整期間、狀態或關鍵字後再試一次。" action={<Button variant="secondary">清除條件</Button>} />
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
