import { QueryProvider } from "@/providers/QueryProvider";

export default function DecksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <QueryProvider>{children}</QueryProvider>;
}
