import {
  previewCaseId,
  previewToken,
  type PreviewDataSet,
  type PreviewPersona,
} from "@/lib/preview/config";

export type PreviewPage = {
  title: string;
  description: string;
  href: string;
  persona?: PreviewPersona;
  data?: PreviewDataSet;
};

export type PreviewGroup = { title: string; description: string; pages: PreviewPage[] };

// Every screen (and notable state) the UI preview can open.
export const previewGroups: PreviewGroup[] = [
  {
    title: "公開頁面",
    description: "學生看到的首頁、送件表單與幹部登入。",
    pages: [
      { title: "首頁與送件表單", description: "Hero、處理流程、內嵌表單、常見問題與頁尾", href: "/", persona: "guest" },
      { title: "送件表單（Apps Script）", description: "獨立開啟的 Index.html", href: "/preview/form" },
      { title: "送件表單：送出中", description: "載入遮罩", href: "/preview/form?state=loading" },
      { title: "送件表單：送出成功", description: "成功對話框與案件編號", href: "/preview/form?state=success" },
      { title: "送件表單：驗證錯誤", description: "欄位錯誤與送件失敗公告", href: "/preview/form?state=error" },
      { title: "幹部登入", description: "尚未登入", href: "/login", persona: "guest" },
      { title: "幹部登入：帳號未授權", description: "已登入但不在成員名單", href: "/login", persona: "outsider" },
    ],
  },
  {
    title: "學生案件頁",
    description: "email 專屬連結開啟的案件進度、對話與補件。",
    pages: [
      { title: "案件進度", description: "有來回對話與附件", href: `/case/${previewToken("demo")}` },
      { title: "新案件", description: "尚無幹部回覆", href: `/case/${previewToken("new")}` },
      { title: "已結案", description: "結案狀態", href: `/case/${previewToken("closed")}` },
      { title: "資料載入中", description: "Apps Script 延遲 5 秒", href: `/case/${previewToken("slow")}` },
      { title: "載入失敗", description: "錯誤頁", href: `/case/${previewToken("error")}` },
      { title: "找不到案件", description: "連結無效的 404", href: `/case/${previewToken("missing")}` },
    ],
  },
  {
    title: "幹部後台",
    description: "儀表板、案件 Master–Detail 與成員管理。",
    pages: [
      { title: "儀表板", description: "指標、狀態分佈、種類、趨勢與待處理案件", href: "/dashboard", persona: "minister", data: "full" },
      { title: "儀表板：空資料", description: "沒有任何案件時", href: "/dashboard", persona: "minister", data: "empty" },
      { title: "案件列表", description: "篩選欄、清單欄與未選取的詳細區", href: "/cases", persona: "minister", data: "full" },
      { title: "案件詳細：部長", description: "回覆編輯器與待核准的審核請求", href: `/cases/${previewCaseId(1)}`, persona: "minister", data: "full" },
      { title: "案件詳細：部員", description: "部員視角，審核內容唯讀", href: `/cases/${previewCaseId(1)}`, persona: "member", data: "full" },
      { title: "案件詳細：無對話", description: "新案件，沒有對話與附件", href: `/cases/${previewCaseId(3)}`, persona: "minister", data: "full" },
      { title: "案件列表：空資料", description: "清單空狀態", href: "/cases", persona: "minister", data: "empty" },
      { title: "成員管理", description: "成員表格、新增對話框與列操作選單", href: "/admin/members", persona: "minister", data: "full" },
      { title: "成員管理：空資料", description: "尚未建立成員", href: "/admin/members", persona: "minister", data: "empty" },
    ],
  },
  {
    title: "其他",
    description: "共用狀態與元件。",
    pages: [
      { title: "元件總覽", description: "Design tokens 與所有元件狀態", href: "/preview/components" },
      { title: "404 頁面", description: "不存在的網址", href: "/this-page-does-not-exist" },
    ],
  },
];
