"use client";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { toggleOfficerAssignment } from "../_actions";
import { officersStrings as S } from "@/lib/strings/officers";

export function ActiveSwitch({ officerId, departmentId, active }:{
  officerId: string; departmentId: string; active: boolean;
}) {
  const [checked, setChecked] = useState(active);
  async function onChange(next: boolean) {
    setChecked(next);
    const res = await toggleOfficerAssignment({ officer_id: officerId, department_id: departmentId, active: next });
    if (!res.ok) {
      setChecked(!next);
      toast(`${S.errors.unknown}: ${res.message ?? res.error}`);
    } else {
      toast(S.toggled);
    }
  }
  return <Switch checked={checked} onCheckedChange={onChange} />;
}


