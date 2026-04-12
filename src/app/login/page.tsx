import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/decks");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-void px-6 py-12">
      <LoginForm />
    </main>
  );
}
