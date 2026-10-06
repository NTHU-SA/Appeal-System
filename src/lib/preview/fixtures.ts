import type {
  CaseAttachment,
  CaseMessage,
  CaseRecord,
  CaseStatus,
  DraftReply,
  ReviewRequest,
  StaffMember,
} from "@/lib/types";
import { previewCaseId } from "@/lib/preview/config";
import { previewEmails } from "@/lib/preview/state";

// Fictional sample data for the UI preview. Dates are relative to now so the
// period filters always have something to show.

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function ago(ms: number) {
  return new Date(Date.now() - ms).toISOString();
}

type CaseSeed = {
  status: CaseStatus;
  category: string;
  subject: string;
  desired: string;
  name: string;
  grade: string;
  daysAgo: number;
  assigned?: boolean;
};

const seeds: CaseSeed[] = [
  {
    status: "pending",
    category: "課務與教學",
    subject: "期中考成績公布延遲近四週，且課程沒有說明複查管道",
    desired: "希望協助確認成績公布時程，並了解成績複查的申請方式。",
    name: "王小明",
    grade: "大三",
    daysAgo: 3,
    assigned: true,
  },
  {
    status: "in_progress",
    category: "宿舍與生活",
    subject: "宿舍熱水供應時段過短，晚上十點後經常沒有熱水",
    desired: "希望宿舍延長熱水供應時段，或公告設備檢修進度。",
    name: "陳怡君",
    grade: "大二",
    daysAgo: 4,
    assigned: true,
  },
  {
    status: "pending",
    category: "行政程序",
    subject: "獎學金申請文件遺失，承辦單位要求重新送件但已過截止日",
    desired: "希望承辦單位補收文件，或說明遺失責任與後續處理方式。",
    name: "林冠宇",
    grade: "碩士",
    daysAgo: 2,
  },
  {
    status: "closed",
    category: "校園安全",
    subject: "夜間校園步道照明不足，宿舍區到圖書館之間多處路燈故障",
    desired: "希望總務處盡快修復路燈，並定期巡檢夜間照明。",
    name: "張書豪",
    grade: "大四",
    daysAgo: 12,
    assigned: true,
  },
  {
    status: "in_progress",
    category: "課務與教學",
    subject: "必修課開學後臨時改為全英文授課，選課時沒有任何公告",
    desired: "希望系上說明授課語言變更的程序，並提供中文輔助教材。",
    name: "黃品妍",
    grade: "大一",
    daysAgo: 6,
    assigned: true,
  },
  {
    status: "rejected",
    category: "其他",
    subject: "希望學生餐廳延長平日營業時間到晚上九點",
    desired: "希望學生會向校方反映延長營業時間的需求。",
    name: "吳承恩",
    grade: "大二",
    daysAgo: 20,
  },
  {
    status: "pending",
    category: "宿舍與生活",
    subject: "宿舍網路每天晚上頻繁斷線，影響線上課程與作業繳交",
    desired: "希望計通中心檢查宿舍網路設備，並提供斷線時的聯絡窗口。",
    name: "李佳穎",
    grade: "大一",
    daysAgo: 0.2,
  },
  {
    status: "closed",
    category: "行政程序",
    subject: "選課系統加簽流程不透明，不同系所的處理方式不一致",
    desired: "希望教務處統一加簽流程並公開審核標準。",
    name: "周子晴",
    grade: "大三",
    daysAgo: 25,
    assigned: true,
  },
  {
    status: "in_progress",
    category: "校園安全",
    subject: "實驗室滅火器與緊急沖眼器過期未更換",
    desired: "希望環安中心盡快更換設備，並公告定期檢查紀錄。",
    name: "許志明",
    grade: "博士",
    daysAgo: 8,
    assigned: true,
  },
  {
    status: "pending",
    category: "課務與教學",
    subject: "教授要求購買指定自編教材，價格明顯高於一般教科書",
    desired: "希望系上確認指定教材的必要性，並提供借閱或二手管道。",
    name: "鄭雅文",
    grade: "大二",
    daysAgo: 1.5,
  },
  {
    status: "closed",
    category: "宿舍與生活",
    subject: "宿舍洗衣機故障超過兩週仍未修復",
    desired: "希望住宿組公告維修時程。",
    name: "謝宗翰",
    grade: "大一",
    daysAgo: 40,
    assigned: true,
  },
  {
    status: "rejected",
    category: "課務與教學",
    subject: "對期末報告的評分標準有疑義，希望重新評分",
    desired: "希望授課教師公開評分標準並重新評分。",
    name: "蔡欣怡",
    grade: "碩士",
    daysAgo: 60,
  },
  {
    status: "in_progress",
    category: "行政程序",
    subject: "辦理休學後的學雜費退費金額計算有誤",
    desired: "希望出納組重新計算退費金額並說明計算方式。",
    name: "劉家豪",
    grade: "大四",
    daysAgo: 15,
    assigned: true,
  },
  {
    status: "pending",
    category: "其他",
    subject: "社團活動場地借用規則在不同場館之間不一致",
    desired: "希望課外組整理並公開統一的場地借用規則。",
    name: "楊淑芬",
    grade: "大三",
    daysAgo: 5,
  },
];

export const previewCases: CaseRecord[] = seeds.map((seed, index) => {
  const number = String(142 - index).padStart(4, "0");
  const createdAt = ago(seed.daysAgo * DAY);
  return {
    id: previewCaseId(index + 1),
    public_id: `CV-2026-${number}`,
    status: seed.status,
    student_email: `s11${index + 10}${number}@example.edu.tw`,
    student_department: seed.grade,
    student_name: seed.name,
    category: seed.category,
    subject: seed.subject,
    desired_outcome: seed.desired,
    assigned_to: seed.assigned ? previewEmails.member : null,
    created_at: createdAt,
    updated_at: createdAt,
    last_student_message_at: null,
    last_staff_message_at: null,
    closed_at: seed.status === "closed" ? ago((seed.daysAgo - 2) * DAY) : null,
  };
});

const demoCase = previewCases[0];

const demoMessages: CaseMessage[] = [
  {
    id: "msg-1",
    case_id: demoCase.id,
    author_id: previewEmails.member,
    author_type: "member",
    body_text: null,
    body_html:
      "<p>同學你好，我們已經收到你的申訴。</p><p>想先跟你確認兩件事：</p><ol><li>課程大綱中是否有寫明成績公布的時間？</li><li>你是否已經寄信詢問過授課教師或助教？</li></ol><p>如果有相關的信件往來截圖，歡迎透過下方的「留言與補件」上傳。</p>",
    created_at: ago(2 * DAY + 5 * HOUR),
  },
  {
    id: "msg-2",
    case_id: demoCase.id,
    author_id: null,
    author_type: "student",
    body_text:
      "大綱上寫期中考後兩週內公布，但現在已經過了快四週。\n我上週有寄信給助教，目前還沒有回覆，信件截圖和課程大綱都附在附件。",
    body_html: null,
    created_at: ago(1 * DAY + 2 * HOUR),
  },
  {
    id: "msg-3",
    case_id: demoCase.id,
    author_id: previewEmails.minister,
    author_type: "minister",
    body_text: null,
    body_html:
      "<p>謝謝補充，資料我們都收到了。</p><p>我們會以學生會名義聯繫開課系所，<strong>請系辦協助確認成績公布時程與複查方式</strong>，有進一步消息會再通知你。</p>",
    created_at: ago(3 * HOUR),
  },
];

const demoAttachments: CaseAttachment[] = [
  ["att-1", null, "成績查詢系統畫面.png", "image/png", 284_000, 3 * DAY],
  ["att-2", "msg-2", "助教信件往來截圖.png", "image/png", 512_000, 1 * DAY],
  ["att-3", "msg-2", "113-1 微積分課程大綱.pdf", "application/pdf", 1_240_000, 1 * DAY],
].map(([id, messageId, name, type, size, age]) => ({
  id: id as string,
  case_id: demoCase.id,
  message_id: messageId as string | null,
  drive_file_id: id as string,
  drive_url: "https://drive.google.com/",
  file_name: name as string,
  file_type: type as string,
  file_size: size as number,
  uploaded_by_type: "student",
  created_at: ago(age as number),
}));

const staffReplies: Record<string, string> = {
  [previewCaseId(2)]:
    "<p>同學你好，我們已將熱水供應的問題轉達住宿組，對方表示鍋爐正在排程檢修，預計兩週內完成。</p>",
  [previewCaseId(5)]:
    "<p>我們已向系辦詢問授課語言變更的程序，系上回覆會在下週系務會議討論輔助教材。</p>",
  [previewCaseId(9)]:
    "<p>環安中心已確認會更換過期設備，我們會持續追蹤並在完成後通知你。</p>",
  [previewCaseId(13)]:
    "<p>出納組請我們提供休學申請日期，方便的話請在下方補上休學核准文件。</p>",
};

export function previewCaseMessages(caseId: string): CaseMessage[] {
  if (caseId === demoCase.id) return demoMessages;
  const html = staffReplies[caseId];
  if (!html) return [];
  return [
    {
      id: `${caseId}-msg-1`,
      case_id: caseId,
      author_id: previewEmails.member,
      author_type: "member",
      body_text: null,
      body_html: html,
      created_at: ago(1 * DAY),
    },
  ];
}

export function previewCaseAttachments(caseId: string): CaseAttachment[] {
  return caseId === demoCase.id ? demoAttachments : [];
}

export function previewDrafts(caseId: string): DraftReply[] {
  if (caseId !== demoCase.id) return [];
  return [
    {
      id: "draft-1",
      case_id: caseId,
      author_id: previewEmails.minister,
      author_email: previewEmails.minister,
      body_html:
        "<p>同學你好，系辦已經回覆：期中考成績會在<strong>本週五前</strong>公布，成績公布後一週內可以向助教提出複查。</p>",
      body_json: null,
      created_at: ago(2 * HOUR),
      updated_at: ago(2 * HOUR),
    },
  ];
}

export function previewReviews(caseId: string): ReviewRequest[] {
  const base = {
    case_id: caseId,
    requested_by: previewEmails.member,
    requested_by_email: previewEmails.member,
    body_json: null,
  };
  if (caseId === demoCase.id) {
    return [
      {
        ...base,
        id: "review-1",
        reviewed_by: null,
        reviewed_by_email: null,
        decision: "accepted",
        status: "pending",
        body_html:
          "<p>同學你好，學生會已受理你的申訴，會協助向開課系所確認成績公布時程與複查方式。</p>",
        created_at: ago(1 * DAY),
        reviewed_at: null,
      },
    ];
  }
  if (caseId === previewCaseId(2) || caseId === previewCaseId(4)) {
    return [
      {
        ...base,
        id: `${caseId}-review-1`,
        reviewed_by: previewEmails.minister,
        reviewed_by_email: previewEmails.minister,
        decision: "accepted",
        status: "approved",
        body_html: "<p>同學你好，學生會已受理你的申訴，後續處理進度會再通知你。</p>",
        created_at: ago(3 * DAY),
        reviewed_at: ago(2 * DAY),
      },
    ];
  }
  return [];
}

export const previewMembers: StaffMember[] = [
  [previewEmails.minister, "minister", 300],
  ["huang.yc@example.edu.tw", "minister", 280],
  [previewEmails.member, "member", 120],
  ["wang.sy@example.edu.tw", "member", 90],
  ["lee.hj@example.edu.tw", "member", 45],
  ["chang.pc@example.edu.tw", "member", 7],
].map(([email, role, days], index) => ({
  id: `member-${index + 1}`,
  email: email as string,
  role: role as StaffMember["role"],
  created_at: ago((days as number) * DAY),
  updated_at: ago((days as number) * DAY),
}));

// Student case links in the preview: /case/<token>.
export const previewTokens: Record<string, string> = {
  demo: demoCase.id,
  new: previewCaseId(7),
  closed: previewCaseId(4),
};
