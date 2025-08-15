"use client";

import { TipTapEditor } from "@/components/richtext/TipTapEditor";

export default function EditorBridgeClient({
  value,
  inputId = "json-input",
  onChange,
}: {
  value: unknown;
  inputId?: string;
  onChange?: (json: any) => void;
}) {
  return (
    <TipTapEditor
      value={value}
      onChange={(json) => {
        const input = document.getElementById(inputId) as HTMLInputElement | null;
        if (input) input.value = JSON.stringify(json);
        if (onChange) onChange(json);
      }}
    />
  );
}


