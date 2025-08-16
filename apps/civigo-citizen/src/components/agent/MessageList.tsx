"use client";

export default function MessageList({
  items,
}: {
  items: Array<{ role: "user" | "assistant"; text: string }>;
}) {
  return (
    <div className="space-y-2">
      {items.map((m, i) => (
        <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
          <div
            className={`inline-block px-3 py-2 rounded ${
              m.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100"
            }`}
          >
            {m.text}
          </div>
        </div>
      ))}
    </div>
  );
}
