import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RegisterForm } from "@/components/RegisterForm";

export default async function RegisterPage() {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/decks");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-void px-6 py-12">
      <RegisterForm />
    </main>
  );
}
