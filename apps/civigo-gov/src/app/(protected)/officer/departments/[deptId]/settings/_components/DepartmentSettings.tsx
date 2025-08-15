"use client";

import { useState } from "react";
import { Upload, Settings, Save, Building2, FileText, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";

interface Department {
  id: string;
  code: string;
  name: string;
  description_richtext?: any;
  logo_path?: string | null;
  description_updated_at?: string | null;
  created_at?: string | null;
}

interface DepartmentSettingsProps {
  department: Department;
  deptId: string;
  logoSignedUrl: string | null;
}

export function DepartmentSettings({ department, deptId, logoSignedUrl }: DepartmentSettingsProps) {
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [description, setDescription] = useState(
    department.description_richtext?.content?.[0]?.content?.[0]?.text || ""
  );
  const [isSavingDescription, setIsSavingDescription] = useState(false);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploadingLogo(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress (since we can't track actual upload progress easily)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const response = await fetch(`/officer/departments/${deptId}/settings/upload-logo`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        // Refresh the page to show the new logo
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(`Upload failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploadingLogo(false);
      setUploadProgress(0);
    }
  };

  const handleSaveDescription = async () => {
    setIsSavingDescription(true);
    
    try {
      const formData = new FormData();
      formData.append('description', description);

      const response = await fetch(`/officer/departments/${deptId}/settings/update-description`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // Show success message or refresh
        alert('Description updated successfully!');
      } else {
        const errorData = await response.json();
        alert(`Update failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Update failed. Please try again.');
    } finally {
      setIsSavingDescription(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!confirm('Are you sure you want to remove the department logo?')) return;

    try {
      const response = await fetch(`/officer/departments/${deptId}/settings/remove-logo`, {
        method: 'DELETE',
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert('Failed to remove logo');
      }
    } catch (error) {
      console.error('Remove logo error:', error);
      alert('Failed to remove logo');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Department Settings</h1>
          <p className="text-gray-600 mt-1">{department.name} • {department.code}</p>
        </div>
        <Badge variant="secondary" className="text-xs">
          Department Settings
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logo Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Department Logo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Logo Display */}
            <div className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              {logoSignedUrl ? (
                <div className="text-center space-y-3">
                  <img
                    src={logoSignedUrl}
                    alt={`${department.name} logo`}
                    className="w-24 h-24 object-cover rounded-lg mx-auto border border-gray-200"
                  />
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveLogo}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No logo uploaded yet</p>
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {isUploadingLogo && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Upload Button */}
            <div className="space-y-3">
              <label htmlFor="logo-upload" className="block">
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={isUploadingLogo}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isUploadingLogo}
                  onClick={() => document.getElementById('logo-upload')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {logoSignedUrl ? 'Replace Logo' : 'Upload Logo'}
                </Button>
              </label>
              
              <Alert>
                <AlertDescription className="text-xs">
                  Recommended: 200x200px or larger. Max size: 5MB. Formats: JPG, PNG, GIF, WebP.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* Department Description */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Department Description
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-gray-700">
                Public Description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a public description for your department..."
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                This description will be visible to citizens when browsing services.
              </p>
            </div>

            {department.description_updated_at && (
              <Alert>
                <AlertDescription className="text-xs">
                  Last updated: {format(new Date(department.description_updated_at), "MMM d, yyyy 'at' HH:mm")}
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleSaveDescription}
              disabled={isSavingDescription}
              className="w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSavingDescription ? 'Saving...' : 'Save Description'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Department Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Department Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department Name
              </label>
              <Input
                value={department.name}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Contact an administrator to change the department name.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department Code
              </label>
              <Input
                value={department.code}
                disabled
                className="bg-gray-50 font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                The unique identifier for this department.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
