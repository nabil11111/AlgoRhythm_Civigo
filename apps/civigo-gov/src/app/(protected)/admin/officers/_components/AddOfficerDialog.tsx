"use client";
import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { OfficerCreateSchema } from "@/lib/validation";
import { officersStrings as S } from "@/lib/strings/officers";
import { createOfficerProfile } from "../_actions";

export function AddOfficerDialog() {
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof OfficerCreateSchema>>({
    resolver: zodResolver(OfficerCreateSchema),
    defaultValues: { full_name: "", email: "" },
  });
  async function onSubmit(values: z.infer<typeof OfficerCreateSchema>) {
    const res = await createOfficerProfile(values);
    if (res.ok) { toast(S.created); setOpen(false); form.reset(); }
    else toast(`${S.errors.unknown}: ${res.message ?? res.error}`);
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>{S.addOfficer}</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{S.addOfficer}</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="full_name" render={({ field }) => (
              <FormItem><FormLabel>{S.fullName}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField name="email" render={({ field }) => (
              <FormItem><FormLabel>{S.email}</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <Button type="submit">{S.addOfficer}</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


