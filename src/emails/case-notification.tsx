import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from "@react-email/components";

type CaseNotificationEmailProps = {
  title: string;
  preview: string;
  body: string;
  link: string;
  caseId: string;
};

export default function CaseNotificationEmail({
  title,
  preview,
  body,
  link,
  caseId,
}: CaseNotificationEmailProps) {
  return (
    <Html lang="zh-Hant">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.kicker}>清華大學學生申訴協力系統</Text>
          <Heading style={styles.heading}>{title}</Heading>
          <Text style={styles.caseId}>案件編號：{caseId}</Text>
          <Text style={styles.text}>{body}</Text>
          <Button href={link} style={styles.button}>
            查看案件最新狀態
          </Button>
          <Hr style={styles.hr} />
          <Text style={styles.privacy}>
            隱私聲明：本系統僅將您提供的申訴內容與附件用於學生權益申訴協助、
            案件追蹤與必要聯繫。未經同意不會向非案件處理必要人員揭露個資。
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: "#faf7fb",
    color: "#18181b",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  container: {
    margin: "0 auto",
    padding: "32px 20px",
    maxWidth: "560px",
  },
  kicker: {
    color: "#8a4b94",
    fontSize: "13px",
    fontWeight: 700,
  },
  heading: {
    color: "#18181b",
    fontSize: "24px",
    lineHeight: "32px",
  },
  caseId: {
    color: "#71717a",
    fontSize: "14px",
  },
  text: {
    color: "#27272a",
    fontSize: "16px",
    lineHeight: "26px",
    whiteSpace: "pre-wrap" as const,
  },
  button: {
    backgroundColor: "#E2A6EB",
    borderRadius: "8px",
    color: "#35183b",
    fontSize: "15px",
    fontWeight: 700,
    padding: "12px 18px",
  },
  hr: {
    borderColor: "#eadbed",
    margin: "28px 0 18px",
  },
  privacy: {
    color: "#71717a",
    fontSize: "12px",
    lineHeight: "20px",
  },
};
