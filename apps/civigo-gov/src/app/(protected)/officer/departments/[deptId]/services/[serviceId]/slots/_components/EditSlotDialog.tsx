"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { z } from "zod";
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
import { Input } from "@/components/ui/input";
import { updateSlot } from "../_actions";

const UpdateSchema = z.object({
  id: z.string().uuid(),
  serviceId: z.string().uuid(),
  slot_at: z.string().min(1),
  duration_minutes: z.coerce.number().int().min(5).max(240),
  capacity: z.coerce.number().int().min(1).max(100),
});

export default function EditSlotDialog({
  serviceId,
  slot,
}: {
  serviceId: string;
  slot: {
    id: string;
    slot_at: string;
    duration_minutes: number;
    capacity: number;
  };
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    slot_at: slot.slot_at,
    duration_minutes: slot.duration_minutes,
    capacity: slot.capacity,
  });

  function onSubmit() {
    startTransition(async () => {
      const parsed = UpdateSchema.safeParse({
        id: slot.id,
        serviceId,
        ...form,
      });
      if (!parsed.success) {
        toast.error("Invalid inputs");
        return;
      }
      const res = await updateSlot(parsed.data);
      if (res.ok) {
        toast.success("Slot updated");
        setOpen(false);
      } else {
        toast.error(res.message || "Failed to update slot");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Slot</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <label className="text-sm">When (ISO)</label>
          <Input
            value={form.slot_at}
            onChange={(e) =>
              setForm((f) => ({ ...f, slot_at: e.target.value }))
            }
          />
          <label className="text-sm">Duration (minutes)</label>
          <Input
            type="number"
            value={form.duration_minutes}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                duration_minutes: Number(e.target.value),
              }))
            }
            min={5}
            max={240}
          />
          <label className="text-sm">Capacity</label>
          <Input
            type="number"
            value={form.capacity}
            onChange={(e) =>
              setForm((f) => ({ ...f, capacity: Number(e.target.value) }))
            }
            min={1}
            max={100}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={onSubmit} disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
