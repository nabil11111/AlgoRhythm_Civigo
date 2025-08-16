"use client";

import { useState, useCallback } from "react";
import ChatButton from "./ChatButton";
import ChatDrawer from "./ChatDrawer";

export default function AgentMount() {
  const [open, setOpen] = useState(false);
  const onOpen = useCallback(() => setOpen(true), []);
  const onClose = useCallback(() => setOpen(false), []);
  return (
    <>
      <ChatButton onOpen={onOpen} />
      <ChatDrawer open={open} onClose={onClose} />
    </>
  );
}
