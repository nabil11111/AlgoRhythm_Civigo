"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  MapPin,
  Building2,
  Plus,
  Search,
  Settings,
  Users,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  Clock
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
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

interface Department {
  id: string;
  code: string;
  name: string;
}

interface Branch {
  id: string;
  code: string;
  name: string;
  address?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
  created_at: string;
}

interface Service {
  id: string;
  code: string;
  name: string;
}

interface ServiceSetting {
  service_id: string;
  branch_id: string;
  enabled: boolean;
}

interface BranchesManagementProps {
  department: Department;
  branches: Branch[];
  services: Service[];
  serviceSettings: ServiceSetting[];
  activeSlots: { branch_id: string; active: boolean }[];
  deptId: string;
}

export function BranchesManagement({
  department,
  branches,
  services,
  serviceSettings,
  activeSlots,
  deptId
}: BranchesManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBranches = branches.filter(branch => 
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEnabledServicesCount = (branchId: string) => {
    return serviceSettings.filter(setting => 
      setting.branch_id === branchId && setting.enabled
    ).length;
  };

  const getActiveSlotsCount = (branchId: string) => {
    return activeSlots.filter(slot => 
      slot.branch_id === branchId && slot.active
    ).length;
  };

  const getServiceStatus = (serviceId: string, branchId: string) => {
    const setting = serviceSettings.find(s => 
      s.service_id === serviceId && s.branch_id === branchId
    );
    return setting?.enabled ?? true;
  };

  const handleServiceToggle = async (serviceId: string, branchId: string, enabled: boolean) => {
    try {
      const res = await fetch(`/officer/departments/${deptId}/services/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deptId, serviceId, branchId, enabled }),
      });
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
          <h1 className="text-3xl font-bold text-gray-900">Branches</h1>
          <p className="text-gray-600 mt-1">{department.name} • {branches.length} locations</p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link href={`/officer/departments/${deptId}/branches/new`}>
              <Plus className="w-4 h-4 mr-2" />
              New Branch
            </Link>
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search branches by name, code, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branch Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Branches</p>
                <p className="text-2xl font-bold">{branches.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Services</p>
                <p className="text-2xl font-bold">{services.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Slots</p>
                <p className="text-2xl font-bold">
                  {activeSlots.filter(s => s.active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Services/Branch</p>
                <p className="text-2xl font-bold">
                  {branches.length > 0 ? Math.round(serviceSettings.filter(s => s.enabled).length / branches.length) : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branches Grid */}
      {filteredBranches.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No branches found" : "No branches yet"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? "Try adjusting your search criteria." 
                : "Create your first branch to start offering services in multiple locations."
              }
            </p>
            <Button asChild>
              <Link href={`/officer/departments/${deptId}/branches/new`}>
                <Plus className="w-4 h-4 mr-2" />
                Create Branch
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBranches.map((branch) => {
            const enabledServices = getEnabledServicesCount(branch.id);
            const activeSlots = getActiveSlotsCount(branch.id);
            
            return (
              <Card key={branch.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{branch.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs font-mono">
                        {branch.code}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Created {format(new Date(branch.created_at), "MMM d, yyyy")}
                      </span>
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
                        <Link href={`/officer/departments/${deptId}/branches`}>
                          <Settings className="w-4 h-4 mr-2" />
                          Manage Branch
                        </Link>
                      </DropdownMenuItem>
                      {branch.location_lat && branch.location_lng && (
                        <DropdownMenuItem asChild>
                          <a 
                            href={`https://maps.google.com/?q=${branch.location_lat},${branch.location_lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View on Maps
                          </a>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Branch
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Address */}
                  {branch.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600">{branch.address}</p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">Services</span>
                      </div>
                      <p className="text-lg font-bold mt-1">
                        {enabledServices}/{services.length}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">Active Slots</span>
                      </div>
                      <p className="text-lg font-bold mt-1">{getActiveSlotsCount(branch.id)}</p>
                    </div>
                  </div>

                  {/* Service Toggles */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Service Availability</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {services.map((service) => {
                        const isEnabled = getServiceStatus(service.id, branch.id);
                        
                        return (
                          <div key={service.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{service.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {service.code}
                              </Badge>
                            </div>
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={(checked) => handleServiceToggle(service.id, branch.id, checked)}
                              size="sm"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/officer/departments/${deptId}/services`}>
                        <Calendar className="w-4 h-4 mr-1" />
                        Slots
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/officer/departments/${deptId}/appointments`}>
                        <Users className="w-4 h-4 mr-1" />
                        Appointments
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
