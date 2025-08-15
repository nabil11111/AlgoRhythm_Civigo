"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Building2, 
  Save, 
  ArrowLeft, 
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Department {
  id: string;
  code: string;
  name: string;
}

interface AddBranchFormProps {
  department: Department;
  existingBranchCodes: string[];
  deptId: string;
}

interface BranchFormData {
  code: string;
  name: string;
  address: string;
  location_url: string;
  phone: string;
}

export function AddBranchForm({ department, existingBranchCodes, deptId }: AddBranchFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<BranchFormData>({
    code: "",
    name: "",
    address: "",
    location_url: "",
    phone: "",
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.code.trim()) {
      newErrors.code = "Branch code is required";
    } else if (existingBranchCodes.includes(formData.code.toUpperCase())) {
      newErrors.code = "This branch code already exists";
    } else if (!/^[A-Z0-9-]+$/.test(formData.code.toUpperCase())) {
      newErrors.code = "Branch code must contain only letters, numbers, and hyphens";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Branch name is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    // Location URL validation if provided
    if (formData.location_url && !isValidUrl(formData.location_url)) {
      newErrors.location_url = "Invalid URL format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleInputChange = (field: keyof BranchFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        department_id: deptId,
        code: formData.code.toUpperCase(),
        name: formData.name.trim(),
        address: formData.address.trim() || undefined,
        meta: {
          phone: formData.phone?.trim() || null,
          location_url: formData.location_url?.trim() || null,
        }
      };

      const response = await fetch(`/officer/departments/${deptId}/branches/new/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push(`/officer/departments/${deptId}/branches`);
      } else {
        const errorData = await response.json();
        console.error('Branch creation error:', errorData);
        alert(`Failed to create branch: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to create branch. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/officer/departments/${deptId}/branches`}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Branches
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Branch</h1>
            <p className="text-gray-600 mt-1">{department.name} • {department.code}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Branch Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  Branch Code *
                </label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                  placeholder="e.g. COL-01, KDY-MAIN"
                  className={errors.code ? "border-red-500" : ""}
                />
                {errors.code && (
                  <p className="text-red-500 text-xs mt-1">{errors.code}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Unique identifier for this branch. Letters, numbers, and hyphens only.
                </p>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Branch Name *
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g. Colombo Main Office, Kandy Branch"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter the full address of this branch"
                rows={3}
                className={errors.address ? "border-red-500" : ""}
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="e.g. +94 11 234 5678"
                />
              </div>

              <div>
                <label htmlFor="location_url" className="block text-sm font-medium text-gray-700 mb-1">
                  Location URL
                </label>
                <Input
                  id="location_url"
                  value={formData.location_url}
                  onChange={(e) => handleInputChange('location_url', e.target.value)}
                  placeholder="e.g. https://maps.google.com/..."
                  className={errors.location_url ? "border-red-500" : ""}
                />
                {errors.location_url && (
                  <p className="text-red-500 text-xs mt-1">{errors.location_url}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Google Maps link or other location URL (optional).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <Alert className="flex-1 mr-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              * Required fields. Make sure the branch code is unique within this department.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Creating...' : 'Create Branch'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
