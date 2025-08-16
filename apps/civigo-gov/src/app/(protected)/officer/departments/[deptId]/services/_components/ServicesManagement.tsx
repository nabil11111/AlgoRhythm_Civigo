"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Settings,
  Calendar,
  FileText,
  MoreVertical,
  MapPin,
  Clock,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import CreateServiceDialog from "./CreateServiceDialog";

interface Department {
  id: string;
  code: string;
  name: string;
}

interface Service {
  id: string;
  code: string;
  name: string;
  instructions_richtext?: any;
  instructions_pdf_path?: string | null;
}

interface Branch {
  id: string;
  code: string;
  name: string;
  address?: string | null;
}

interface ServiceSetting {
  service_id: string;
  branch_id: string;
  enabled: boolean;
}

interface ServicesManagementProps {
  department: Department;
  services: Service[];
  branches: Branch[];
  serviceSettings: ServiceSetting[];
  activeSlots: { service_id: string; branch_id: string; active: boolean }[];
  deptId: string;
}

export function ServicesManagement({
  department,
  services,
  branches,
  serviceSettings,
  activeSlots,
  deptId,
}: ServicesManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getServiceBranchStatus = (serviceId: string, branchId: string) => {
    const setting = serviceSettings.find(
      (s) => s.service_id === serviceId && s.branch_id === branchId
    );
    return setting?.enabled ?? true;
  };

  const getActiveSlotCount = (serviceId: string, branchId: string) => {
    return activeSlots.filter(
      (slot) =>
        slot.service_id === serviceId &&
        slot.branch_id === branchId &&
        slot.active
    ).length;
  };

  const handleBranchToggle = async (
    serviceId: string,
    branchId: string,
    enabled: boolean
  ) => {
    try {
      const res = await fetch(
        `/officer/departments/${deptId}/services/toggle`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deptId, serviceId, branchId, enabled }),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Toggle failed", err);
        alert("Failed to update availability");
      } else {
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
      alert("Failed to update availability");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600 mt-1">
            {department.name} • {services.length} services
          </p>
        </div>
        <CreateServiceDialog deptId={deptId} />
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Branches</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No services found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm
                ? "Try adjusting your search criteria."
                : "Get started by creating your first service."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card
              key={service.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs font-mono">
                      {service.code}
                    </Badge>
                    {service.instructions_richtext && (
                      <Badge variant="outline" className="text-xs">
                        <FileText className="w-3 h-3 mr-1" />
                        Instructions
                      </Badge>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/officer/departments/${deptId}/services/${service.id}`}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/officer/departments/${deptId}/services/${service.id}`}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Service
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Service
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Branch Availability */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Branch Availability
                  </h4>
                  <div className="space-y-2">
                    {branches.map((branch) => {
                      const isEnabled = getServiceBranchStatus(
                        service.id,
                        branch.id
                      );
                      const slotCount = getActiveSlotCount(
                        service.id,
                        branch.id
                      );

                      return (
                        <div
                          key={branch.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={isEnabled}
                                onCheckedChange={(checked) =>
                                  handleBranchToggle(
                                    service.id,
                                    branch.id,
                                    checked
                                  )
                                }
                                size="sm"
                              />
                              <span className="text-sm font-medium">
                                {branch.name}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {slotCount} slots
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <Link
                      href={`/officer/departments/${deptId}/services/${service.id}/slots`}
                    >
                      <Calendar className="w-4 h-4 mr-1" />
                      Slots
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <Link
                      href={`/officer/departments/${deptId}/services/${service.id}`}
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Setup
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Branch Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Branch Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {branches.map((branch) => {
              const enabledServices = services.filter((service) =>
                getServiceBranchStatus(service.id, branch.id)
              ).length;

              return (
                <div key={branch.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{branch.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {branch.code}
                    </Badge>
                  </div>
                  {branch.address && (
                    <p className="text-sm text-gray-600 mb-2">
                      {branch.address}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>
                      {enabledServices}/{services.length} services
                    </span>
                    <span>
                      {
                        activeSlots.filter(
                          (slot) => slot.branch_id === branch.id
                        ).length
                      }{" "}
                      active slots
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
