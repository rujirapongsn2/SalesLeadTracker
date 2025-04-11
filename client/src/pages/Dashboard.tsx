import React, { useState } from 'react';
import StatCards from "@/components/dashboard/StatCards";
import LeadTable from "@/components/dashboard/LeadTable";
import LeadStatusDistribution from "@/components/dashboard/LeadStatusDistribution";
import AddLeadForm from "@/components/dashboard/AddLeadForm";
import { DateRangePicker, DateRange } from '@/components/ui/date-range-picker';

export const Dashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined
  });

  // Format date for API query parameters
  const formatDateForQuery = (date: Date | undefined) => {
    if (!date) return undefined;
    return date.toISOString();
  };

  // Create query parameters for API calls
  const getDateQueryParams = () => {
    const params = new URLSearchParams();
    if (dateRange.from) {
      params.append('fromDate', formatDateForQuery(dateRange.from) || '');
    }
    if (dateRange.to) {
      params.append('toDate', formatDateForQuery(dateRange.to) || '');
    }
    return params.toString();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sales Lead Dashboard</h1>
        <div className="w-72">
          <DateRangePicker 
            date={dateRange} 
            setDate={setDateRange} 
          />
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* First column: Metrics */}
        <div className="xl:col-span-1">
          <StatCards dateQueryParams={getDateQueryParams()} />
        </div>
        
        {/* Second column: Lead Status Distribution */}
        <div className="xl:col-span-1">
          <LeadStatusDistribution dateQueryParams={getDateQueryParams()} />
        </div>
        
        {/* Third column: Add Lead Form */}
        <div className="xl:col-span-1">
          <AddLeadForm />
        </div>
      </div>

      {/* Lead Table spans full width below the top sections */}
      <div className="w-full">
        <LeadTable />
      </div>
    </div>
  );
};

export default Dashboard;
