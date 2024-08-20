import { Button } from "@/components/ui/button";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <main className="relative h-screen w-full">
        <div className="absolute inset-0 bg-green-100"></div>
        {children}
      </main>
    </>
  );
}
