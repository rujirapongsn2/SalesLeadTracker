import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Lead, LeadStatus } from "@shared/schema";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical, 
  Filter,
  SortDesc
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

type BadgeColor = {
  bg: string;
  text: string;
};

const STATUS_COLORS: Record<string, BadgeColor> = {
  New: { bg: "bg-blue-100", text: "text-blue-700" },
  Qualified: { bg: "bg-green-100", text: "text-green-700" },
  "In Progress": { bg: "bg-yellow-100", text: "text-yellow-700" },
  Converted: { bg: "bg-purple-100", text: "text-purple-700" },
  Lost: { bg: "bg-red-100", text: "text-red-700" },
};

const SOURCE_COLORS: Record<string, BadgeColor> = {
  Website: { bg: "bg-blue-50", text: "text-blue-700" },
  Referral: { bg: "bg-purple-50", text: "text-purple-700" },
  "Social Media": { bg: "bg-pink-50", text: "text-pink-700" },
  Event: { bg: "bg-green-50", text: "text-green-700" },
  Other: { bg: "bg-gray-50", text: "text-gray-700" },
};

export const LeadTable = () => {
  const [currentTab, setCurrentTab] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;
  const { toast } = useToast();
  
  const { data, isLoading } = useQuery<{ leads: Lead[] }>({
    queryKey: ['/api/leads'],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-40" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <Skeleton className="h-12 w-full" />
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  const leads = data?.leads || [];
  
  // Filter leads based on the selected tab
  const filteredLeads = currentTab === "All" 
    ? leads 
    : leads.filter(lead => lead.status === currentTab);
  
  // Paginate leads
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  
  const totalPages = Math.ceil(filteredLeads.length / pageSize);

  const getNameInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  const getRelativeTime = (dateString: Date) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const handleStatusChange = async (leadId: number, status: LeadStatus) => {
    try {
      await apiRequest('PATCH', `/api/leads/${leadId}`, { status });
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/metrics'] });
      toast({
        title: "Status updated",
        description: `Lead status changed to ${status}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update lead status",
        variant: "destructive",
      });
    }
  };

  const getRandomColor = (name: string) => {
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-green-100 text-green-700',
      'bg-yellow-100 text-yellow-700',
      'bg-red-100 text-red-700',
      'bg-purple-100 text-purple-700',
      'bg-pink-100 text-pink-700',
    ];
    
    // Simple hash function to get consistent color for the same name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  return (
    <div className="bg-white rounded-md shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Recent Leads</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <SortDesc className="h-4 w-4 mr-2" />
            Sort
          </Button>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="mb-6">
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto pb-0">
          <TabsTrigger 
            value="All"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent px-4 pb-3 data-[state=active]:shadow-none"
          >
            All Leads
          </TabsTrigger>
          <TabsTrigger 
            value="New"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent px-4 pb-3 data-[state=active]:shadow-none"
          >
            New
          </TabsTrigger>
          <TabsTrigger 
            value="In Progress"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent px-4 pb-3 data-[state=active]:shadow-none"
          >
            In Progress
          </TabsTrigger>
          <TabsTrigger 
            value="Converted"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent px-4 pb-3 data-[state=active]:shadow-none"
          >
            Converted
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b hover:bg-transparent">
              <TableHead className="font-medium text-gray-500">Name</TableHead>
              <TableHead className="font-medium text-gray-500">Contact</TableHead>
              <TableHead className="font-medium text-gray-500">Source</TableHead>
              <TableHead className="font-medium text-gray-500">Status</TableHead>
              <TableHead className="font-medium text-gray-500">Added</TableHead>
              <TableHead className="font-medium text-gray-500"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLeads.map((lead) => (
              <TableRow key={lead.id} className="border-b">
                <TableCell>
                  <div className="flex items-center">
                    <div className={`w-8 h-8 ${getRandomColor(lead.name)} rounded-full flex items-center justify-center mr-3`}>
                      <span className="font-medium text-sm">{getNameInitials(lead.name)}</span>
                    </div>
                    <div>
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-sm text-gray-500">{lead.company}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm">{lead.email}</p>
                  <p className="text-sm text-gray-500">{lead.phone}</p>
                </TableCell>
                <TableCell>
                  <span className={`text-sm px-3 py-1 ${SOURCE_COLORS[lead.source]?.bg} ${SOURCE_COLORS[lead.source]?.text} rounded-full`}>
                    {lead.source}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`status-badge ${STATUS_COLORS[lead.status]?.bg} ${STATUS_COLORS[lead.status]?.text}`}>
                    {lead.status}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {lead.createdAt ? getRelativeTime(lead.createdAt) : 'N/A'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => handleStatusChange(lead.id, "New")}>
                        Mark as New
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleStatusChange(lead.id, "Qualified")}>
                        Mark as Qualified
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleStatusChange(lead.id, "In Progress")}>
                        Mark as In Progress
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleStatusChange(lead.id, "Converted")}>
                        Mark as Converted
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleStatusChange(lead.id, "Lost")}>
                        Mark as Lost
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Showing {Math.min(filteredLeads.length, pageSize)} of {filteredLeads.length} leads
        </div>
        <div className="flex space-x-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {[...Array(totalPages)].map((_, i) => (
            <Button
              key={i}
              variant={currentPage === i + 1 ? "default" : "outline"}
              size="icon"
              onClick={() => setCurrentPage(i + 1)}
              className="w-8 h-8 p-0"
            >
              {i + 1}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LeadTable;
