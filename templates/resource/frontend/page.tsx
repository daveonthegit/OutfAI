// apps/web/app/__ROUTE__/page.tsx
import { __Resource__Panel } from "@/components/__resource__/__resource__-panel";

export default function __Resource__Page() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">__Resource__</h1>
      <p className="text-sm opacity-70 mt-1">Manage your __resource__.</p>
      <div className="mt-6">
        <__Resource__Panel />
      </div>
    </main>
  );
}
