"use client";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DepartmentCreateSchema } from "@/lib/validation";
import { adminStrings as S } from "@/lib/strings/admin";
import { createDepartment } from "../_actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function CreateDepartmentDialog() {
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof DepartmentCreateSchema>>({
    resolver: zodResolver(DepartmentCreateSchema),
    defaultValues: { code: "", name: "" },
  });
  async function onSubmit(values: z.infer<typeof DepartmentCreateSchema>) {
    const res = await createDepartment(values);
    if (res.ok) {
      toast(S.departments.created);
      setOpen(false);
      form.reset();
    } else {
      toast(`${S.errors.unknown}: ${res.message ?? res.error}`);
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{S.departments.newDepartment}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{S.departments.newDepartment}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{S.departments.code}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{S.departments.name}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">{S.departments.create}</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
