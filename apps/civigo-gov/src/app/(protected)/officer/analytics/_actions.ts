import { getServerClient } from "@/utils/supabase/server";

export interface AnalyticsData {
  peakBookingHours: Array<{ hour: number; count: number }>;
  departmentLoad: Array<{ department: string; count: number; percentage: number }>;
  noShowRates: {
    total: number;
    noShows: number;
    rate: number;
  };
  processingTimes: {
    averageWaitTime: number;
    averageProcessingTime: number;
    quickestService: number;
    longestService: number;
  };
  weeklyTrends: Array<{ day: string; appointments: number; completed: number }>;
  monthlyStats: {
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
}

export async function getAnalyticsData(departmentIds: string[]): Promise<AnalyticsData> {
  const supabase = await getServerClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Get services that belong to officer's departments
  const { data: officerServices } = await supabase
    .from("services")
    .select("id, name, department_id, departments:department_id(name)")
    .in("department_id", departmentIds);
  
  const serviceIds = (officerServices ?? []).map(s => s.id);

  // Get appointments with related data for analytics
  const { data: appointments } = await supabase
    .from("appointments")
    .select(`
      id,
      created_at,
      appointment_at,
      checked_in_at,
      started_at,
      completed_at,
      status,
      no_show,
      service_id
    `)
    .in("service_id", serviceIds)
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: false });

  // Enrich appointments with service data
  const enrichedAppointments = (appointments ?? []).map(apt => {
    const service = officerServices?.find(s => s.id === apt.service_id);
    return {
      ...apt,
      services: service ? {
        name: service.name,
        department_id: service.department_id,
        departments: service.departments
      } : null
    };
  });

  if (!enrichedAppointments || enrichedAppointments.length === 0) {
    return getEmptyAnalyticsData();
  }

  // Calculate peak booking hours
  const hourCounts = new Array(24).fill(0);
  enrichedAppointments.forEach(apt => {
    const hour = new Date(apt.created_at).getHours();
    hourCounts[hour]++;
  });
  const peakBookingHours = hourCounts.map((count, hour) => ({ hour, count }));

  // Calculate department load
  const deptCounts: Record<string, number> = {};
  const totalAppointments = enrichedAppointments.length;
  
  enrichedAppointments.forEach(apt => {
    if (apt.services?.departments?.name) {
      const deptName = apt.services.departments.name;
      deptCounts[deptName] = (deptCounts[deptName] || 0) + 1;
    }
  });

  const departmentLoad = Object.entries(deptCounts).map(([department, count]) => ({
    department,
    count,
    percentage: totalAppointments > 0 ? Math.round((count / totalAppointments) * 100) : 0
  }));

  // Calculate no-show rates
  const completedAppointments = enrichedAppointments.filter(apt => 
    apt.status === 'completed' || apt.status === 'cancelled' || apt.no_show
  );
  const noShows = enrichedAppointments.filter(apt => apt.no_show).length;
  const noShowRates = {
    total: completedAppointments.length,
    noShows,
    rate: completedAppointments.length > 0 ? Math.round((noShows / completedAppointments.length) * 100) : 0
  };

  // Calculate processing times (in minutes)
  const processingTimes = calculateProcessingTimes(enrichedAppointments);

  // Calculate weekly trends
  const weeklyTrends = calculateWeeklyTrends(enrichedAppointments.filter(apt => 
    new Date(apt.created_at) >= sevenDaysAgo
  ));

  // Calculate monthly stats
  const monthlyStats = calculateMonthlyStats(enrichedAppointments);

  return {
    peakBookingHours,
    departmentLoad,
    noShowRates,
    processingTimes,
    weeklyTrends,
    monthlyStats
  };
}

function calculateProcessingTimes(appointments: any[]) {
  const completedAppointments = appointments.filter(apt => 
    apt.started_at && apt.completed_at && apt.checked_in_at
  );

  if (completedAppointments.length === 0) {
    return {
      averageWaitTime: 0,
      averageProcessingTime: 0,
      quickestService: 0,
      longestService: 0
    };
  }

  const waitTimes: number[] = [];
  const processingTimes: number[] = [];

  completedAppointments.forEach(apt => {
    const checkedIn = new Date(apt.checked_in_at).getTime();
    const started = new Date(apt.started_at).getTime();
    const completed = new Date(apt.completed_at).getTime();

    const waitTime = (started - checkedIn) / (1000 * 60); // minutes
    const processTime = (completed - started) / (1000 * 60); // minutes

    if (waitTime >= 0 && waitTime < 300) { // reasonable wait time < 5 hours
      waitTimes.push(waitTime);
    }
    if (processTime >= 0 && processTime < 300) { // reasonable process time < 5 hours
      processingTimes.push(processTime);
    }
  });

  const avgWaitTime = waitTimes.length > 0 
    ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length) 
    : 0;
  
  const avgProcessTime = processingTimes.length > 0
    ? Math.round(processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length)
    : 0;

  return {
    averageWaitTime: avgWaitTime,
    averageProcessingTime: avgProcessTime,
    quickestService: processingTimes.length > 0 ? Math.round(Math.min(...processingTimes)) : 0,
    longestService: processingTimes.length > 0 ? Math.round(Math.max(...processingTimes)) : 0
  };
}

function calculateWeeklyTrends(appointments: any[]) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayCounts = new Array(7).fill(0).map(() => ({ appointments: 0, completed: 0 }));

  appointments.forEach(apt => {
    const dayIndex = (new Date(apt.created_at).getDay() + 6) % 7; // Monday = 0
    dayCounts[dayIndex].appointments++;
    if (apt.status === 'completed') {
      dayCounts[dayIndex].completed++;
    }
  });

  return days.map((day, index) => ({
    day,
    appointments: dayCounts[index].appointments,
    completed: dayCounts[index].completed
  }));
}

function calculateMonthlyStats(appointments: any[]) {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const thisMonth = appointments.filter(apt => 
    new Date(apt.created_at) >= thisMonthStart
  ).length;

  const lastMonth = appointments.filter(apt => {
    const date = new Date(apt.created_at);
    return date >= lastMonthStart && date <= lastMonthEnd;
  }).length;

  const growth = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : 0;

  return {
    thisMonth,
    lastMonth,
    growth
  };
}

function getEmptyAnalyticsData(): AnalyticsData {
  return {
    peakBookingHours: new Array(24).fill(0).map((_, hour) => ({ hour, count: 0 })),
    departmentLoad: [],
    noShowRates: { total: 0, noShows: 0, rate: 0 },
    processingTimes: {
      averageWaitTime: 0,
      averageProcessingTime: 0,
      quickestService: 0,
      longestService: 0
    },
    weeklyTrends: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      .map(day => ({ day, appointments: 0, completed: 0 })),
    monthlyStats: { thisMonth: 0, lastMonth: 0, growth: 0 }
  };
}
