"use client";
import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { OfficerAssignSchema } from "@/lib/validation";
import { officersStrings as S } from "@/lib/strings/officers";
import { assignOfficerToDepartment } from "../_actions";

export function AssignDepartmentDialog({ officerId, departments }:{
  officerId: string; departments: Array<{ id: string; code: string; name: string }>
}) {
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof OfficerAssignSchema>>({
    resolver: zodResolver(OfficerAssignSchema),
    defaultValues: { officer_id: officerId, department_id: "" },
  });
  async function onSubmit(values: z.infer<typeof OfficerAssignSchema>) {
    const res = await assignOfficerToDepartment(values);
    if (res.ok) { toast(S.assigned); setOpen(false); }
    else toast(`${S.errors.unknown}: ${res.message ?? res.error}`);
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline">{S.assignDepartment}</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{S.assignDepartment}</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="department_id" render={({ field }) => (
              <FormItem><FormLabel>{S.assignDepartment}</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>
                      {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.code} — {d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}/>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Assigning..." : S.assign}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


