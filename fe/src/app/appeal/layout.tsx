export default function AppealLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-[calc(100vh-3.5rem)] overflow-hidden">
      <main className="h-full overflow-y-auto bg-white">{children}</main>
    </div>
  );
}
