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
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function ConfirmDeleteDialog({ id }: { id: string }) {
  async function onConfirm() {
    const res = await deleteDepartment({ id });
    if (res.ok) toast(S.departments.deleted);
    else toast.error(S.errors.hasDependencies);
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
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={onConfirm}>
            {S.departments.delete}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
