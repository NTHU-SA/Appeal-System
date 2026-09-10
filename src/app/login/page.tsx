import Link from "next/link";
import { redirect } from "next/navigation";
import { KeyRound, LogOut, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";

import { auth } from "@/auth";
import { getCurrentStaff } from "@/lib/auth";
import { signInWithGoogle, signOut } from "@/lib/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LoginPage() {
  const session = await auth();
  const staff = await getCurrentStaff();

  // If already logged in and recognized as staff, go to dashboard
  if (staff) {
    redirect("/dashboard");
  }

  const userEmail = session?.user?.email;

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div
            className={`mb-2 flex h-10 w-10 items-center justify-center rounded-md ${
              userEmail
                ? "bg-destructive text-destructive-foreground"
                : "bg-primary text-primary-foreground"
            }`}
          >
            {userEmail ? (
              <ShieldAlert className="h-5 w-5" />
            ) : (
              <ShieldCheck className="h-5 w-5" />
            )}
          </div>
          <CardTitle>清華大學學生申訴協力系統</CardTitle>
          <CardDescription>管理員／幹部後台登入</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {userEmail ? (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertTitle className="font-semibold">尚未開通後台權限</AlertTitle>
                <AlertDescription className="mt-1.5 space-y-2 text-xs leading-relaxed">
                  <p>
                    目前登入帳號：
                    <span className="block font-mono font-medium text-foreground">
                      {userEmail}
                    </span>
                  </p>
                  <p>
                    此 Google 帳號尚未被加入後台成員名單。請聯絡學權部部長或管理員將您的帳號加入 Google Sheets 的 <span className="font-mono">Members</span> 工作表。
                  </p>
                </AlertDescription>
              </Alert>

              <div className="flex flex-col gap-2">
                <Button asChild className="w-full">
                  <Link href="/dashboard">
                    <RefreshCw className="h-4 w-4" />
                    已加入名單？重新檢查權限
                  </Link>
                </Button>
                <form action={signOut} className="w-full">
                  <input type="hidden" name="redirectTo" value="/login" />
                  <Button variant="outline" className="w-full">
                    <LogOut className="h-4 w-4" />
                    登出 / 切換其他 Google 帳號
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <form action={signInWithGoogle}>
              <Button className="w-full">
                <KeyRound className="h-4 w-4" />
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
