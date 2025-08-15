"use client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DepartmentUpdateSchema } from "@/lib/validation";
import { useState } from "react";
import { uploadDepartmentLogo, updateDepartmentDescription } from "../_actions";
import { Textarea } from "@/components/ui/textarea";
import { BranchesTab } from "./BranchesTab";
import { adminStrings as S } from "@/lib/strings/admin";
import { updateDepartment } from "../_actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
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
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [description, setDescription] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"logo" | "description" | "branches">("logo");
  async function onSubmit(values: z.infer<typeof DepartmentUpdateSchema>) {
    const res = await updateDepartment(values);
    if (res.ok) toast(S.departments.updated);
    else toast(`${S.errors.unknown}: ${res.message ?? res.error}`);
  }
  async function onUploadLogo() {
    if (!logoFile) return;
    const res = await uploadDepartmentLogo({ id, file: logoFile });
    if (res.ok) toast("Logo updated");
    else toast(`${S.errors.unknown}: ${res.message ?? res.error}`);
  }
  async function onSaveDescription() {
    const json = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: description }]}] };
    const res = await updateDepartmentDescription({ id, description_richtext: json });
    if (res.ok) toast("Description saved");
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
        <div className="flex gap-2 mb-2">
          <Button type="button" variant={activeTab === "logo" ? "default" : "outline"} size="sm" onClick={() => setActiveTab("logo")}>
            Logo
          </Button>
          <Button type="button" variant={activeTab === "description" ? "default" : "outline"} size="sm" onClick={() => setActiveTab("description")}>
            Description
          </Button>
          <Button type="button" variant={activeTab === "branches" ? "default" : "outline"} size="sm" onClick={() => setActiveTab("branches")}>
            Branches
          </Button>
        </div>
        {activeTab !== "branches" ? (
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
              {activeTab === "logo" && (
                <div className="space-y-2">
                  <FormLabel>Logo</FormLabel>
                  <Input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} />
                  <Button type="button" variant="secondary" onClick={onUploadLogo} disabled={!logoFile}>
                    Upload Logo
                  </Button>
                </div>
              )}
              {activeTab === "description" && (
                <div className="space-y-2">
                  <FormLabel>Description</FormLabel>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Department description..." />
                  <Button type="button" variant="secondary" onClick={onSaveDescription}>
                    Save Description
                  </Button>
                </div>
              )}
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Saving..." : S.departments.save}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="mt-2">
            <BranchesTab deptId={id} branches={[]} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
