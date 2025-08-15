"use client";

import { useTransition } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { createBranch, deleteBranch } from "../_actions";

const BranchSchema = z.object({
  id: z.string().uuid().optional(),
  department_id: z.string().uuid(),
  code: z.string().min(1).max(32),
  name: z.string().min(2).max(120),
  address: z.string().max(500).optional(),
});

export function BranchesTab({ deptId, branches }: { deptId: string; branches: Array<{ id: string; code: string; name: string; address?: string | null }>; }) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof BranchSchema>>({
    resolver: zodResolver(BranchSchema),
    defaultValues: { department_id: deptId, code: "", name: "", address: "" },
  });

  function onCreate(values: z.infer<typeof BranchSchema>) {
    startTransition(async () => {
      await createBranch({ department_id: deptId, code: values.code, name: values.name, address: values.address });
      form.reset({ department_id: deptId, code: "", name: "", address: "" });
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium">Existing branches</h3>
        <ul className="mt-2 space-y-2">
          {branches.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-2">
              <span className="text-sm">{b.code} — {b.name}</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    startTransition(async () => {
                      await deleteBranch({ id: b.id, department_id: deptId });
                    })
                  }
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-sm font-medium">Add branch</h3>
        <Form {...form}>
          <form className="grid gap-2" onSubmit={form.handleSubmit(onCreate)}>
            <FormField name="code" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Code</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField name="name" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField name="address" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div>
              <Button type="submit" disabled={isPending}>Create</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}



