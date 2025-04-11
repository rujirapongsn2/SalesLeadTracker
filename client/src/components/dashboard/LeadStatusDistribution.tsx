import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

type LeadStatusDistributionProps = {
  dateQueryParams?: string;
};

export const LeadStatusDistribution = ({ dateQueryParams = '' }: LeadStatusDistributionProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/metrics', dateQueryParams],
    queryFn: async () => {
      const url = dateQueryParams ? `/api/metrics?${dateQueryParams}` : '/api/metrics';
      const response = await fetch(url);
      const data = await response.json();
      return data;
    }
  });

  if (isLoading) {
    return (
      <Card className="bg-white h-full">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-6">Lead Status Distribution</h2>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusColors: Record<string, string> = {
    "Website": "bg-blue-500",
    "Referral": "bg-purple-500",
    "Social Media": "bg-pink-500",
    "Event": "bg-green-500",
    "Other": "bg-gray-500"
  };
  
  const chartColors: Record<string, string> = {
    "Website": "rgba(59, 130, 246, 0.8)",
    "Referral": "rgba(168, 85, 247, 0.8)",
    "Social Media": "rgba(236, 72, 153, 0.8)",
    "Event": "rgba(34, 197, 94, 0.8)",
    "Other": "rgba(107, 114, 128, 0.8)"
  };

  const statusDistribution = data?.statusDistribution || [];
  const sourceDistribution = data?.sourceDistribution || [];

  return (
    <Card className="bg-white h-full">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-6">Lead Status Distribution</h2>
        
        <div className="space-y-4">
          {statusDistribution.map((status: any) => (
            <div key={status.status}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{status.status}</span>
                <span className="text-sm text-gray-500">{status.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-[#5efce8] to-[#736efe] rounded-full h-2" 
                  style={{ width: `${status.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-medium mb-4">Lead Sources Distribution</h3>
          
          <div className="h-64 mb-4">
            <Pie 
              data={{
                labels: sourceDistribution
                  .filter((source: any) => source.count > 0)
                  .map((source: any) => source.source),
                datasets: [
                  {
                    data: sourceDistribution
                      .filter((source: any) => source.count > 0)
                      .map((source: any) => source.count),
                    backgroundColor: sourceDistribution
                      .filter((source: any) => source.count > 0)
                      .map((source: any) => chartColors[source.source] || 'rgba(107, 114, 128, 0.8)'),
                    borderColor: sourceDistribution
                      .filter((source: any) => source.count > 0)
                      .map(() => 'rgba(255, 255, 255, 0.8)'),
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      boxWidth: 12,
                      padding: 15,
                      font: {
                        size: 11
                      }
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = Math.round((value as number / total) * 100);
                        return `${label}: ${value} (${percentage}%)`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
          
          <div className="space-y-2">
            {sourceDistribution
              .filter((source: any) => source.count > 0)
              .sort((a: any, b: any) => b.percentage - a.percentage)
              .map((source: any) => (
                <div key={source.source} className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${statusColors[source.source] || 'bg-gray-500'} mr-2`}></div>
                  <span className="text-sm">{source.source} ({source.percentage}%)</span>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadStatusDistribution;
