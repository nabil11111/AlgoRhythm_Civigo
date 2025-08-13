"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { officerServices } from "@/lib/strings/officer-services";
import { deleteService } from "../_actions";

function mapError(code?: string): string {
  if (code === "unique_violation") return officerServices.errors.unique;
  if (code === "foreign_key_violation") return officerServices.errors.conflict;
  if (code === "insufficient_privilege")
    return officerServices.errors.notAllowed;
  return officerServices.errors.unknown;
}

export default function ConfirmDeleteDialog({
  deptId,
  service,
}: {
  deptId: string;
  service: { id: string; code: string };
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const res = await deleteService({ id: service.id, deptId });
      if (res.ok) {
        toast.success(officerServices.deleted);
        setOpen(false);
      } else {
        toast.error(mapError(res.error));
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive">
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{officerServices.deleteService}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete service{" "}
          <span className="font-mono">{service.code}</span>?
        </p>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
