import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export const LeadStatusDistribution = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/metrics'],
  });

  if (isLoading) {
    return (
      <Card className="bg-white h-full">
        <CardContent className="p-4 flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
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

  const statusDistribution = data?.statusDistribution || [];
  const sourceDistribution = data?.sourceDistribution || [];

  return (
    <Card className="bg-white">
      <CardContent className="pt-6">
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
          <h3 className="font-medium mb-4">Top Lead Sources</h3>
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
