"use client";

interface PageBreadcrumbProps {
  router: { push: (path: string) => void };
  isConnected: boolean;
}

export function PageBreadcrumb({ router, isConnected }: PageBreadcrumbProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background/50 backdrop-blur-xl p-4 rounded-2xl border border-border shadow-sm sticky top-0 z-10">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => router.push("/admin")}
          className="hover:text-primary font-bold transition-colors"
        >
          לוحة التحكم
        </button>
        <span className="text-muted-foreground/40">/</span>
        <span className="font-black text-foreground">إدارة المستخدمين</span>
      </nav>
      {isConnected ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 text-success px-3 py-1 text-xs font-black shadow-sm ring-1 ring-success/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
          </span>
          مباشر
        </span>
      ) : null}
    </div>
  );
}