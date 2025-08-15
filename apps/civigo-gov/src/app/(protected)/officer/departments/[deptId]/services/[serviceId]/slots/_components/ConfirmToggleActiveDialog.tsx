"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toggleSlotActive } from "../_actions";

export default function ConfirmToggleActiveDialog({
  serviceId,
  slot,
}: {
  serviceId: string;
  slot: { id: string; active: boolean };
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const nextValue = !slot.active;

  function onConfirm() {
    startTransition(async () => {
      const res = await toggleSlotActive({
        id: slot.id,
        serviceId,
        active: nextValue,
      });
      if (res.ok) {
        toast.success(nextValue ? "Slot activated" : "Slot deactivated");
        setOpen(false);
      } else {
        toast.error(res.message || "Failed to toggle slot");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          {slot.active ? "Deactivate" : "Activate"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {slot.active ? "Deactivate slot" : "Activate slot"}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Are you sure?</p>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={onConfirm} disabled={isPending}>
            {isPending ? "Saving..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
