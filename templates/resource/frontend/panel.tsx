// apps/web/components/__resource__/__resource__-panel.tsx
"use client";

import { use__Resource__ } from "@/hooks/use-__resource__";

export function __Resource__Panel() {
  const { data, isLoading, error, create, remove } = use__Resource__();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">Something went wrong.</div>;
  if (!data || data.length === 0) {
    return (
      <div>
        <p className="opacity-70">No __resource__ yet.</p>
        <button
          className="mt-3 underline"
          onClick={() => create({ name: "My first __resource__" })}
        >
          Create one
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.id} className="border rounded p-3 flex justify-between">
          <div>{item.name}</div>
          <button className="underline" onClick={() => remove(item.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
