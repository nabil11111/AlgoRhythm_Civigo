"use client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DepartmentUpdateSchema } from "@/lib/validation";
import { adminStrings as S } from "@/lib/strings/admin";
import { updateDepartment } from "../_actions";
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

export function EditDepartmentDialog({
  id,
  code,
  name,
}: {
  id: string;
  code: string;
  name: string;
}) {
  const form = useForm<z.infer<typeof DepartmentUpdateSchema>>({
    resolver: zodResolver(DepartmentUpdateSchema),
    defaultValues: { id, code, name },
  });
  async function onSubmit(values: z.infer<typeof DepartmentUpdateSchema>) {
    const res = await updateDepartment(values);
    if (res.ok) toast(S.departments.updated);
    else toast(`${S.errors.unknown}: ${res.message ?? res.error}`);
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">{S.departments.editDepartment}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{S.departments.editDepartment}</DialogTitle>
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
            <Button type="submit">{S.departments.save}</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
