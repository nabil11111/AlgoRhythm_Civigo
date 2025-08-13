"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { createSlot } from "../_actions";

const CreateSchema = z.object({
  serviceId: z.string().uuid(),
  slot_at: z.string().min(1),
  duration_minutes: z.coerce.number().int().min(5).max(240),
  capacity: z.coerce.number().int().min(1).max(100),
});

function mapError(code?: string): string {
  if (code === "unique_violation") return "A slot already exists at this time";
  if (code === "insufficient_privilege") return "Not allowed";
  if (code === "referential_violation")
    return "Cannot delete: referenced by other data";
  return "Something went wrong";
}

export default function CreateSlotDialog({ serviceId }: { serviceId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof CreateSchema>>({
    resolver: zodResolver(CreateSchema),
    defaultValues: {
      serviceId,
      slot_at: "",
      duration_minutes: 15,
      capacity: 1,
    },
  });

  function onSubmit(values: z.infer<typeof CreateSchema>) {
    startTransition(async () => {
      const iso = values.slot_at ? new Date(values.slot_at).toISOString() : "";
      const res = await createSlot({ ...values, slot_at: iso });
      if (res.ok) {
        toast.success("Slot created");
        setOpen(false);
        form.reset({
          serviceId,
          slot_at: "",
          duration_minutes: 15,
          capacity: 1,
        });
      } else {
        toast.error(mapError(res.error));
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">New Slot</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Slot</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="grid gap-3" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="slot_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>When</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={5}
                      max={240}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="mt-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
