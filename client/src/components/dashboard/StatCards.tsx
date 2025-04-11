import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, UserPlus, TrendingUp, Loader2, LoaderPinwheel, CheckCircle, DollarSign } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: number;
    isPositive: boolean;
  };
  gradient?: "primary" | "secondary" | "tertiary";
};

type StatCardsProps = {
  dateQueryParams?: string;
};

const StatCard = ({ title, value, icon, change, gradient }: StatCardProps) => {
  const gradientClass = gradient === "primary" 
    ? "bg-gradient-to-r from-[#5efce8] to-[#736efe]" 
    : gradient === "secondary" 
    ? "bg-gradient-to-r from-[#43E97B] to-[#38F9D7]" 
    : "bg-gradient-to-r from-[#FF69B4] to-[#FFC67D]";

  return (
    <Card className="bg-white relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-20 h-20 ${gradientClass} opacity-10 rounded-bl-3xl`}></div>
      <CardContent className="p-4">
        <div className="flex items-center">
          <div className={`rounded-lg w-12 h-12 ${gradientClass} flex items-center justify-center mr-4`}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
          </div>
        </div>
        {change && (
          <div className="mt-4 flex items-center text-xs">
            <span className={`flex items-center ${change.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {change.isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
              {Math.abs(change.value)}%
            </span>
            <span className="ml-2 text-gray-500">from last week</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const StatCards = ({ dateQueryParams = '' }: StatCardsProps) => {
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
          <h2 className="text-xl font-semibold mb-6">Sales Metrics</h2>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-center h-24">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white h-full">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-6">Sales Metrics</h2>
        <div className="space-y-4">
          <StatCard
            title="New Leads"
            value={data?.metrics?.new || 0}
            icon={<UserPlus className="h-5 w-5 text-white" />}
            change={{ value: 12, isPositive: true }}
            gradient="primary"
          />
          <StatCard
            title="Conversion Rate"
            value={`${data?.metrics?.conversionRate || 0}%`}
            icon={<TrendingUp className="h-5 w-5 text-white" />}
            change={{ value: 3, isPositive: false }}
            gradient="secondary"
          />
          <StatCard
            title="In Progress"
            value={data?.metrics?.inProgress || 0}
            icon={<LoaderPinwheel className="h-5 w-5 text-white" />}
            change={{ value: 8, isPositive: true }}
            gradient="primary"
          />
          <StatCard
            title="Closed Deals"
            value={data?.metrics?.converted || 0}
            icon={<CheckCircle className="h-5 w-5 text-white" />}
            change={{ value: 17, isPositive: true }}
            gradient="secondary"
          />
          <StatCard
            title="Total Budget"
            value={`฿${(data?.metrics?.totalBudget || 0).toLocaleString()}`}
            icon={<DollarSign className="h-5 w-5 text-white" />}
            change={{ value: 5, isPositive: true }}
            gradient="primary"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCards;
