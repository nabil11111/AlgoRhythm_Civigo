"use client";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { officersStrings as S } from "@/lib/strings/officers";
import { resetOfficerPassword } from "../_actions";

const Schema = z.object({ newPassword: z.string().min(8), confirm: z.string().min(8) })
  .refine((v) => v.newPassword === v.confirm, { message: S.errors.mismatch, path: ["confirm"] });

export function ResetPasswordDialog({ userId }:{ userId: string }) {
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof Schema>>({ resolver: zodResolver(Schema), defaultValues: { newPassword: "", confirm: "" } });
  async function onSubmit(values: z.infer<typeof Schema>) {
    const res = await resetOfficerPassword({ user_id: userId, newPassword: values.newPassword });
    if (res.ok) { toast("Password reset"); setOpen(false); form.reset(); }
    else toast(`${S.errors.unknown}: ${res.message ?? res.error}`);
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline">{S.resetPassword}</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{S.resetPassword}</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="newPassword" render={({ field }) => (
              <FormItem><FormLabel>{S.newPassword}</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField name="confirm" render={({ field }) => (
              <FormItem><FormLabel>{S.confirmNewPassword}</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <Button type="submit">{S.resetPassword}</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


