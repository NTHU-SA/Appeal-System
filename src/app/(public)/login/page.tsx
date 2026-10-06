import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, LogOut, RefreshCw } from "lucide-react";

import { getCurrentStaff, getSignedInEmail } from "@/lib/auth";
import { signInWithGoogle, signOut } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.94l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.96 10.96 0 0 0 12 1 11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

export default async function LoginPage() {
  // Signed-in staff go straight to the dashboard.
  if (await getCurrentStaff()) {
    redirect("/dashboard");
  }

  const userEmail = await getSignedInEmail();

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="flex w-full max-w-100 flex-col rounded-lg border bg-surface">
        <div className="flex flex-col gap-4 border-b p-6">
          <Image
            src="/logo-square.png"
            alt=""
            width={40}
            height={40}
            className="size-10 rounded-sm"
          />
          <div className="flex flex-col gap-1">
            <h1 className="text-title-lg text-text-primary">幹部後台登入</h1>
            <p className="text-label-md text-text-tertiary">清華大學學生申訴協力系統</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-6">
          {userEmail ? (
            <>
              <Notice tone="danger" title="這個帳號尚未開通後台權限">
                <p>
                  目前登入：<span className="font-medium break-all text-text-primary">{userEmail}</span>
                </p>
                <p>請聯絡學權部部長，將這個 Google 帳號加入成員名單後再重新檢查。</p>
              </Notice>

              <div className="flex flex-col gap-2">
                <Button asChild className="w-full">
                  <Link href="/dashboard">
                    <RefreshCw />
                    重新檢查權限
                  </Link>
                </Button>
                <form action={signOut} className="w-full">
                  <input type="hidden" name="redirectTo" value="/login" />
                  <Button variant="secondary" className="w-full">
                    <LogOut />
                    改用其他 Google 帳號
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <>
              <p className="text-body-md text-text-secondary">
                僅限學權部成員使用。請以已加入成員名單的 Google 帳號登入。
              </p>
              <form action={signInWithGoogle}>
                <Button variant="secondary" className="w-full text-text-primary">
                  <GoogleMark />
                  使用 Google 帳號登入
                </Button>
              </form>
            </>
          )}
        </div>

        <div className="border-t px-6 py-3">
          <Button asChild variant="ghost" className="-ml-3">
            <Link href="/">
              <ArrowLeft />
              返回申訴首頁
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
