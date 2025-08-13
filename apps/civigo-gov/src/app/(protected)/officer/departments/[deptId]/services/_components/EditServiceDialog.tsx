"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  ServiceUpdateSchema,
  type ServiceUpdateInput,
} from "@/lib/validation";
import { officerServices } from "@/lib/strings/officer-services";
import { updateService } from "../_actions";

function mapError(code?: string): string {
  if (code === "unique_violation") return officerServices.errors.unique;
  if (code === "foreign_key_violation") return officerServices.errors.conflict;
  if (code === "insufficient_privilege") return officerServices.errors.notAllowed;
  return officerServices.errors.unknown;
}

export default function EditServiceDialog({
  deptId,
  service,
}: {
  deptId: string;
  service: { id: string; code: string; name: string };
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ServiceUpdateInput>({
    resolver: zodResolver(ServiceUpdateSchema),
    defaultValues: {
      id: service.id,
      deptId,
      code: service.code,
      name: service.name,
    },
  });

  function onSubmit(values: ServiceUpdateInput) {
    startTransition(async () => {
      const res = await updateService(values);
      if (res.ok) {
        toast.success(officerServices.updated);
        setOpen(false);
      } else {
        toast.error(mapError(res.error));
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
          <DialogTitle>{officerServices.editService}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{officerServices.codeLabel}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{officerServices.nameLabel}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


