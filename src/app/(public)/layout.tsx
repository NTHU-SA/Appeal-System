import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

// Public and content pages carry the footer; staff tool pages do not.
export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SiteHeader
        items={[
          { href: "/#process", label: "處理流程" },
          { href: "/#faq", label: "常見問題" },
          { href: "/login", label: "幹部登入", match: "/login" },
        ]}
        cta={
          <Button asChild>
            <Link href="/#case-form">送出申訴</Link>
          </Button>
        }
      />
      {children}
      <SiteFooter />
    </>
  );
}
