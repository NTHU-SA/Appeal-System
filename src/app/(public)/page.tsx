import Link from "next/link";
import { ArrowDown, FileText, Mail, MessagesSquare, ShieldCheck } from "lucide-react";

import { getCaseFormUrl } from "@/lib/env";
import { getPreviewState } from "@/lib/preview/state";
import { EmbeddedCaseForm } from "@/components/cases/embedded-case-form";
import { HeroShapes } from "@/components/marketing/hero-shapes";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";

const steps = [
  {
    icon: FileText,
    title: "填寫申訴表單",
    body: "描述遇到的狀況與希望的處理方式，可以附上佐證檔案。",
  },
  {
    icon: Mail,
    title: "收到案件連結",
    body: "系統把案件編號與專屬查詢連結寄到你的 email。",
  },
  {
    icon: MessagesSquare,
    title: "學權幹部處理",
    body: "幹部撰寫回覆並經部長審核後寄給你；過程中可以用連結補充說明與檔案。",
  },
  {
    icon: ShieldCheck,
    title: "結案",
    body: "案件處理完成後會標示為已結案。",
  },
];

const faqs = [
  {
    question: "送出後會收到什麼？",
    answer:
      "系統會寄出確認信，裡面有案件編號與專屬查詢連結。學權幹部的回覆也會寄到你填寫的 email，並顯示在案件頁的對話紀錄中。",
  },
  {
    question: "送出後還能補充資料嗎？",
    answer:
      "可以。開啟 email 中的專屬連結，在「留言與補件」填寫補充說明，每次最多上傳 3 個檔案，每個檔案 8MB 以內。",
  },
  {
    question: "可以上傳哪些檔案？",
    answer: "支援 PDF、Word、PNG 與 JPG。送件時最多 10 個檔案，每個檔案上限 8MB。",
  },
  {
    question: "誰會看到我的申訴內容？",
    answer:
      "只有學權組織的幹部可以在後台查看案件，附件存放在學權組織的 Google Drive。請不要轉傳你的專屬查詢連結。",
  },
];

// Content block: 48px top and bottom, 40px sides (24px on narrow screens).
// Two columns: title and description (≤ 400px) beside the content
// (≤ 680px); one centred column at ≤ 768px.
function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-(--header-height) border-t">
      <div className="flex flex-col gap-8 px-6 py-12 md:flex-row md:justify-between md:gap-10 lg:px-10">
        <div className="flex flex-col gap-3 md:max-w-100">
          <h2 id={`${id}-heading`} className="text-headline-lg text-text-primary">
            {title}
          </h2>
          <p className="hidden text-body-lg text-text-secondary md:block">{description}</p>
        </div>
        <div className="w-full min-w-0 md:max-w-170">{children}</div>
      </div>
    </section>
  );
}

export default async function Home() {
  // The UI preview embeds the local copy of the Apps Script form.
  const formUrl = (await getPreviewState()) ? "/preview/form" : getCaseFormUrl();

  return (
    <main className="flex-1">
      {/* The hero stays light in both themes so the shapes keep their
          contrast with the dark headline. */}
      <section
        data-theme="light"
        aria-labelledby="hero-heading"
        className="relative isolate flex min-h-[calc(100svh-var(--header-height))] flex-col justify-end overflow-hidden bg-background text-text-primary"
      >
        <HeroShapes className="-z-1" />
        <div className="flex max-w-170 flex-col gap-6 p-6 lg:p-12">
          <p className="text-label-md text-text-secondary">國立清華大學學生會</p>
          <h1
            id="hero-heading"
            className="title-features text-[2rem] leading-[1.1] font-semibold md:text-display"
          >
            遇到校園問題，
            <br />
            讓學生會陪你處理。
          </h1>
          <p className="max-w-125 bg-background text-body-lg text-text-secondary">
            填寫申訴表單後，你會收到案件編號與專屬查詢連結。學權幹部會在系統上回覆，你也可以隨時補充說明與檔案。
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href="#case-form">
                開始填寫申訴
                <ArrowDown />
              </Link>
            </Button>
            <Button asChild variant="secondary" className="bg-background">
              <Link href="#process">了解處理流程</Link>
            </Button>
          </div>
        </div>
      </section>

      <Section
        id="case-form"
        title="申訴送件"
        description="填寫越具體，學權幹部越能快速判斷如何協助。送出前請確認 email 正確，案件連結會寄到該信箱。"
      >
        {/* The Apps Script form runs inside Google's sandboxed frames and
            cannot follow the page theme, so this panel is always light. */}
        <div data-theme="light" className="rounded-lg border bg-surface p-4 text-text-primary sm:p-6">
          {formUrl ? (
            <EmbeddedCaseForm src={formUrl} />
          ) : (
            <Notice tone="danger" title="申訴表單目前無法載入">
              請稍後重新整理頁面再試一次。
            </Notice>
          )}
        </div>
      </Section>

      <Section
        id="process"
        title="處理流程"
        description="從送出到結案，幹部的正式回覆都會先經過部長審核，再寄送給你。"
      >
        <ol className="flex flex-col">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-4 border-b py-4 first:pt-0 last:border-b-0 last:pb-0">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-label-md text-text-secondary tabular-nums">
                {index + 1}
              </span>
              <div className="flex flex-col gap-1 pt-1.5">
                <h3 className="flex items-center gap-2 text-title-sm text-text-primary">
                  <step.icon aria-hidden="true" className="size-4 text-text-tertiary" />
                  {step.title}
                </h3>
                <p className="text-body-md text-text-secondary">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="faq" title="常見問題" description="送件前後最常被問到的幾件事。">
        <Accordion type="single" collapsible defaultValue={faqs[0].question}>
          {faqs.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question}>
              <AccordionTrigger>
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>
                <p>{faq.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>
    </main>
  );
}
