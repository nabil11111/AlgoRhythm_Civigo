"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Building2, Users, Calendar, Settings, LogOut, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Department {
  id: string;
  code: string;
  name: string;
}

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
}

interface OfficerSidebarProps {
  departments: Department[];
  profile: Profile;
  signOutAction: () => Promise<void>;
}

export function OfficerSidebar({ 
  departments, 
  profile, 
  signOutAction 
}: OfficerSidebarProps) {
  const pathname = usePathname();
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set());

  const toggleDepartment = (deptId: string) => {
    const newExpanded = new Set(expandedDepartments);
    if (newExpanded.has(deptId)) {
      newExpanded.delete(deptId);
    } else {
      newExpanded.add(deptId);
    }
    setExpandedDepartments(newExpanded);
  };

  const handleSignOut = async () => {
    try {
      await signOutAction();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Building2 className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Civigo Gov</h1>
            <p className="text-sm text-gray-500">Officer Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Dashboard Link */}
        <Link
          href="/officer"
          className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            pathname === "/officer"
              ? "bg-blue-100 text-blue-700"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Building2 className="w-5 h-5 mr-3" />
          Dashboard
        </Link>

        {/* Analytics Link */}
        <Link
          href="/officer/analytics"
          className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            pathname === "/officer/analytics"
              ? "bg-blue-100 text-blue-700"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <BarChart3 className="w-5 h-5 mr-3" />
          Analytics
        </Link>

        {/* Departments */}
        <div className="space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Departments
          </div>
          
          {departments.map((dept) => {
            const isExpanded = expandedDepartments.has(dept.id);
            const isDeptActive = pathname.includes(`/departments/${dept.id}`);
            
            return (
              <div key={dept.id} className="space-y-1">
                {/* Department Header */}
                <div className="flex items-center">
                  <button
                    onClick={() => toggleDepartment(dept.id)}
                    className={`flex items-center flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isDeptActive
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 mr-2" />
                    ) : (
                      <ChevronRight className="w-4 h-4 mr-2" />
                    )}
                    <Building2 className="w-4 h-4 mr-2" />
                    <span className="truncate">{dept.name}</span>
                  </button>
                </div>

                {/* Department Submenu */}
                {isExpanded && (
                  <div className="ml-6 space-y-1">
                    <Link
                      href={`/officer/departments/${dept.id}`}
                      className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                        pathname === `/officer/departments/${dept.id}`
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      Overview
                    </Link>

                    <Link
                      href={`/officer/departments/${dept.id}/services`}
                      className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                        pathname.includes(`/departments/${dept.id}/services`)
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Services
                    </Link>

                    <Link
                      href={`/officer/departments/${dept.id}/appointments`}
                      className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                        pathname.includes(`/departments/${dept.id}/appointments`)
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Appointments
                    </Link>

                    <Link
                      href={`/officer/departments/${dept.id}/branches`}
                      className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                        pathname.includes(`/departments/${dept.id}/branches`)
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      Branches
                    </Link>

                    <Link
                      href={`/officer/departments/${dept.id}/settings`}
                      className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                        pathname.includes(`/departments/${dept.id}/settings`)
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src="/placeholder-avatar.jpg" />
            <AvatarFallback>
              {profile.full_name
                ? profile.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                : profile.email[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {profile.full_name || profile.email}
            </p>
            <p className="text-xs text-gray-500 capitalize">{profile.role}</p>
          </div>
        </div>
        
        <Button
          onClick={handleSignOut}
          variant="outline"
          size="sm"
          className="w-full justify-start"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}