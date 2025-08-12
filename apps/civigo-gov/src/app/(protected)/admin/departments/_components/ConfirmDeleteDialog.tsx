"use client";
import { adminStrings as S } from "@/lib/strings/admin";
import { deleteDepartment } from "../_actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function ConfirmDeleteDialog({ id }: { id: string }) {
  async function onConfirm() {
    const res = await deleteDepartment({ id });
    if (res.ok) toast(S.departments.deleted);
    else toast(S.errors.hasDependencies, { style: { background: "#fee2e2" } });
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">{S.departments.delete}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{S.departments.deleteConfirmTitle}</DialogTitle>
          <DialogDescription>
            {S.departments.deleteConfirmDesc}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>
            {S.departments.delete}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
