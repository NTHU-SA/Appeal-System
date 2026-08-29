import Link from "next/link";
import { KeyRound, ShieldCheck } from "lucide-react";

import { signInWithGoogle } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <CardTitle>清華大學學生申訴協力系統</CardTitle>
          <CardDescription>管理員／幹部後台登入</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={signInWithGoogle}>
            <Button className="w-full">
              <KeyRound className="h-4 w-4" />
              使用 Google 登入
            </Button>
          </form>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/">返回申訴表單</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
