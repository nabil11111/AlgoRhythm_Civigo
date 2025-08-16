"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Calendar,
  Timer,
  CheckCircle
} from "lucide-react";
import { PeakHoursChart } from "./PeakHoursChart";
import { DepartmentLoadChart } from "./DepartmentLoadChart";
import { WeeklyTrendsChart } from "./WeeklyTrendsChart";
import { AnalyticsData } from "../_actions";

interface Department {
  id: string;
  code: string;
  name: string;
}

interface AnalyticsDashboardProps {
  departments: Department[];
  analyticsData: AnalyticsData;
}

export function AnalyticsDashboard({ departments, analyticsData }: AnalyticsDashboardProps) {
  const {
    peakBookingHours,
    departmentLoad,
    noShowRates,
    processingTimes,
    weeklyTrends,
    monthlyStats
  } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">This Month</p>
                <p className="text-3xl font-bold">{monthlyStats.thisMonth}</p>
                <div className="flex items-center gap-1 mt-2">
                  {monthlyStats.growth >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-200" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-200" />
                  )}
                  <span className="text-sm text-blue-100">
                    {Math.abs(monthlyStats.growth)}% vs last month
                  </span>
                </div>
              </div>
              <Calendar className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">No-Show Rate</p>
                <p className="text-3xl font-bold">{noShowRates.rate}%</p>
                <p className="text-sm text-red-100 mt-2">
                  {noShowRates.noShows} of {noShowRates.total} appointments
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Avg. Wait Time</p>
                <p className="text-3xl font-bold">{processingTimes.averageWaitTime}m</p>
                <p className="text-sm text-green-100 mt-2">
                  Processing: {processingTimes.averageProcessingTime}m
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Departments</p>
                <p className="text-3xl font-bold">{departments.length}</p>
                <p className="text-sm text-purple-100 mt-2">
                  Active assignments
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Peak Booking Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PeakHoursChart data={peakBookingHours} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              Department Load
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DepartmentLoadChart data={departmentLoad} />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Weekly Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyTrendsChart data={weeklyTrends} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-orange-600" />
              Service Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {processingTimes.quickestService}m
                </div>
                <div className="text-sm text-gray-600">Quickest Service</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {processingTimes.longestService}m
                </div>
                <div className="text-sm text-gray-600">Longest Service</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Average Wait Time</span>
                <Badge variant="secondary">{processingTimes.averageWaitTime} minutes</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Average Processing</span>
                <Badge variant="secondary">{processingTimes.averageProcessingTime} minutes</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total Service Time</span>
                <Badge variant="outline">
                  {processingTimes.averageWaitTime + processingTimes.averageProcessingTime} minutes
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">High Efficiency</h3>
                <p className="text-sm text-green-700">
                  {processingTimes.averageProcessingTime < 30 
                    ? "Processing times are optimal" 
                    : "Consider optimizing workflows"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Booking Patterns</h3>
                <p className="text-sm text-blue-700">
                  Peak hours: {peakBookingHours
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 2)
                    .map(h => `${h.hour}:00`)
                    .join(", ")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-${noShowRates.rate > 15 ? 'red' : 'yellow'}-200 bg-${noShowRates.rate > 15 ? 'red' : 'yellow'}-50`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 bg-${noShowRates.rate > 15 ? 'red' : 'yellow'}-100 rounded-lg flex items-center justify-center`}>
                <AlertTriangle className={`w-6 h-6 text-${noShowRates.rate > 15 ? 'red' : 'yellow'}-600`} />
              </div>
              <div>
                <h3 className={`font-semibold text-${noShowRates.rate > 15 ? 'red' : 'yellow'}-900`}>
                  {noShowRates.rate > 15 ? "High No-Shows" : "No-Show Status"}
                </h3>
                <p className={`text-sm text-${noShowRates.rate > 15 ? 'red' : 'yellow'}-700`}>
                  {noShowRates.rate > 15 
                    ? "Consider reminder strategies" 
                    : "Acceptable no-show rate"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
