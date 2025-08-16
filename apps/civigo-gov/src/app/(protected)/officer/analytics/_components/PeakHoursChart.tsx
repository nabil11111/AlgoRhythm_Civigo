"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PeakHoursData {
  hour: number;
  count: number;
}

interface PeakHoursChartProps {
  data: PeakHoursData[];
}

export function PeakHoursChart({ data }: PeakHoursChartProps) {
  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  const chartData = data.map(item => ({
    ...item,
    hourLabel: formatHour(item.hour)
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="hourLabel" 
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            formatter={(value: number) => [value, 'Bookings']}
            labelFormatter={(label) => `Time: ${label}`}
            contentStyle={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px'
            }}
          />
          <Bar 
            dataKey="count" 
            fill="#3b82f6" 
            radius={[4, 4, 0, 0]}
            className="hover:opacity-80 transition-opacity"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
