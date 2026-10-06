import { SiteFooter } from "@/components/layout/site-footer";

// Public and content pages carry the footer; staff tool pages do not.
export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <SiteFooter />
    </>
  );
}
