import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { KeyRound, LogOut, RefreshCw, ShieldAlert } from "lucide-react";

import { auth } from "@/auth";
import { getCurrentStaff } from "@/lib/auth";
import { signInWithGoogle, signOut } from "@/lib/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default async function LoginPage() {
  const session = await auth();
  const staff = await getCurrentStaff();

  // If already logged in and recognized as staff, go to dashboard
  if (staff) {
    redirect("/dashboard");
  }

  const userEmail = session?.user?.email;

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md gap-6 py-6">
        <CardHeader className="gap-4 px-6">
          <Image
            src="/logo-square.png"
            alt=""
            width={40}
            height={40}
            className="size-10 rounded-sm"
          />
          <div className="flex flex-col gap-1">
            <h1 className="text-title-lg text-text-primary">清華大學學生申訴協力系統</h1>
            <p className="text-body-md text-text-tertiary">管理員／幹部後台登入</p>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-6">
          {userEmail ? (
            <>
              <Alert variant="destructive">
                <ShieldAlert />
                <AlertTitle>尚未開通後台權限</AlertTitle>
                <AlertDescription>
                  <p>
                    目前登入帳號：
                    <span className="block font-medium break-all text-text-primary">
                      {userEmail}
                    </span>
                  </p>
                  <p>
                    此 Google 帳號尚未被加入後台成員名單。請聯絡學權部部長或管理員將您的帳號加入 Google Sheets 的 <span className="font-medium text-text-primary">Members</span> 工作表。
                  </p>
                </AlertDescription>
              </Alert>

              <div className="flex flex-col gap-2">
                <Button asChild className="w-full">
                  <Link href="/dashboard">
                    <RefreshCw />
                    已加入名單？重新檢查權限
                  </Link>
                </Button>
                <form action={signOut} className="w-full">
                  <input type="hidden" name="redirectTo" value="/login" />
                  <Button variant="secondary" className="w-full">
                    <LogOut />
                    登出 / 切換其他 Google 帳號
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <form action={signInWithGoogle}>
              <Button className="w-full">
                <KeyRound />
                使用 Google 登入
              </Button>
            </form>
          )}

          <Button asChild variant="ghost" className="w-full">
            <Link href="/">返回申訴表單</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
