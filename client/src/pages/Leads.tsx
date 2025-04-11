import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Lead } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Search, 
  MoreVertical, 
  Loader2, 
  Filter, 
  SortAsc, 
  Eye,
  Plus
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LeadDetailView } from "@/components/leads/LeadDetailView";
import { DateRangePicker, DateRange } from "@/components/ui/date-range-picker";

export const Leads = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined
  });
  const [dateQueryParams, setDateQueryParams] = useState("");
  const { toast } = useToast();

  // Format date for API query parameters
  const formatDateForQuery = (date: Date | undefined) => {
    if (!date) return undefined;
    return date.toISOString();
  };

  // Update query params when date range changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (dateRange.from) {
      params.append('fromDate', formatDateForQuery(dateRange.from) || '');
    }
    if (dateRange.to) {
      params.append('toDate', formatDateForQuery(dateRange.to) || '');
    }
    setDateQueryParams(params.toString());
  }, [dateRange]);

  const { data, isLoading, error } = useQuery<{ leads: Lead[] }>({
    queryKey: ['/api/leads', dateQueryParams],
    queryFn: async () => {
      const url = dateQueryParams ? `/api/leads?${dateQueryParams}` : '/api/leads';
      const response = await apiRequest('GET', url);
      const data = await response.json();
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const leads = data?.leads || [];

  // Filter leads based on search term and filters
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      searchTerm === "" || 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === "All" || lead.status === statusFilter;
    const matchesSource = sourceFilter === "All" || lead.source === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  const handleStatusChange = async (leadId: number, status: string) => {
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

  const getStatusBadgeClasses = (status: string) => {
    const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
    switch (status) {
      case "New":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "Qualified":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "In Progress":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "Converted":
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case "Lost":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold mb-2">Leads Management</h1>
        <p className="text-gray-500">View and manage all your customer leads</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search leads..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="w-72">
              <DateRangePicker 
                date={dateRange} 
                setDate={setDateRange} 
              />
            </div>
            <div className="flex gap-2">
              <div className="w-40">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Statuses</SelectItem>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Qualified">Qualified</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Converted">Converted</SelectItem>
                    <SelectItem value="Lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-40">
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Sources</SelectItem>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                    <SelectItem value="Event">Event</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <SortAsc className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Project Name</TableHead>
                  <TableHead>End User</TableHead>
                  <TableHead>Partner Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                      No leads found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">
                        <button 
                          onClick={() => {
                            setSelectedLeadId(lead.id);
                            setIsDetailViewOpen(true);
                          }}
                          className="text-left hover:text-primary hover:underline focus:outline-none focus:text-primary"
                        >
                          {lead.name}
                        </button>
                      </TableCell>
                      <TableCell>{lead.projectName || 'N/A'}</TableCell>
                      <TableCell>
                        <div>{lead.endUserOrganization || 'N/A'}</div>
                        <div className="text-sm text-gray-500 truncate max-w-[200px]">{lead.endUserContact || 'N/A'}</div>
                      </TableCell>
                      <TableCell>{lead.company}</TableCell>
                      <TableCell>
                        <span className={getStatusBadgeClasses(lead.status)}>
                          {lead.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => {
                              setSelectedLeadId(lead.id);
                              setIsDetailViewOpen(true);
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Lead Detail View Dialog */}
      <LeadDetailView
        leadId={selectedLeadId}
        isOpen={isDetailViewOpen}
        onClose={() => setIsDetailViewOpen(false)}
      />
      
      {/* Add Lead Button */}
      <Button
        onClick={() => {
          // ในอนาคตเราจะเพิ่มการเปิด Dialog ที่นี่
        }}
        variant="default"
        size="lg"
        className="fixed bottom-6 right-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 h-14 w-14 z-20 p-0 bg-gradient-to-r from-cyan-400 to-blue-500"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </>
  );
};

export default Leads;
