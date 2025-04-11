import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Lead, leadStatusEnum, leadSourceEnum } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, X, Edit, Save, Trash2, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskList } from "./TaskList";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define a schema for lead updates
const updateLeadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().min(1, "Company is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(6, "Phone number is required"),
  source: leadSourceEnum,
  status: leadStatusEnum,
  projectName: z.string().optional(),
  budget: z.string().optional(),
  endUserContact: z.string().optional(),
  endUserOrganization: z.string().optional(),
  partnerContact: z.string().optional(),
  productRegister: z.string().optional(),
});

type UpdateLeadFormValues = z.infer<typeof updateLeadSchema>;

interface LeadDetailViewProps {
  leadId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LeadDetailView = ({ leadId, isOpen, onClose }: LeadDetailViewProps) => {
  const [activeTab, setActiveTab] = useState<string>("details");
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [, navigate] = useLocation();
  const { currentUser, hasPermission } = useAuth();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery<Lead | null>({
    queryKey: ['/api/leads', leadId],
    queryFn: async () => {
      if (!leadId) return null;
      const response = await apiRequest('GET', `/api/leads/${leadId}`);
      const data = await response.json();
      return data.lead;
    },
    enabled: !!leadId && isOpen,
  });
  
  // Form for editing lead
  const form = useForm<UpdateLeadFormValues>({
    resolver: zodResolver(updateLeadSchema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      phone: "",
      source: "Website",
      status: "New",
      projectName: "",
      budget: "",
      endUserContact: "",
      endUserOrganization: "",
      partnerContact: "",
      productRegister: "",
    },
  });
  
  // Update form values when lead data changes
  useEffect(() => {
    if (data) {
      form.reset({
        name: data.name,
        company: data.company,
        email: data.email,
        phone: data.phone,
        source: data.source as any,
        status: data.status as any,
        projectName: data.projectName || "",
        budget: data.budget || "",
        endUserContact: data.endUserContact || "",
        endUserOrganization: data.endUserOrganization || "",
        partnerContact: data.partnerContact || "",
        productRegister: data.productRegister || "",
      });
    }
  }, [data, form]);
  
  // Mutation for updating lead
  const updateLeadMutation = useMutation({
    mutationFn: async (updatedData: UpdateLeadFormValues) => {
      if (!leadId) throw new Error("Lead ID is required");
      const response = await apiRequest('PATCH', `/api/leads/${leadId}`, updatedData);
      // If response status is 403 (Forbidden), extract the message from the response
      if (response.status === 403) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Permission denied");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/leads', leadId] });
      toast({
        title: "Success",
        description: "Lead updated successfully",
      });
      setIsEditing(false);
    },
    onError: (error: any) => {
      console.error("Error updating lead:", error);
      
      // Check if the error is a permission error
      const errorMessage = error.message || "Failed to update lead";
      const isPermissionError = errorMessage.includes("permission") || 
                               errorMessage.includes("Permission") ||
                               errorMessage.includes("creator") ||
                               errorMessage.includes("Administrator") ||
                               errorMessage.includes("Sales Manager");
      
      toast({
        title: isPermissionError ? "Permission Denied" : "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
  
  // Mutation for deleting lead
  const deleteLeadMutation = useMutation({
    mutationFn: async () => {
      if (!leadId) throw new Error("Lead ID is required");
      const response = await apiRequest('DELETE', `/api/leads/${leadId}`);
      if (response.status === 403) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Permission denied");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      toast({
        title: "Success",
        description: "Lead deleted successfully",
      });
      onClose();
      navigate('/leads');
    },
    onError: (error: any) => {
      console.error("Error deleting lead:", error);
      
      // Check if the error is a permission error
      const errorMessage = error.message || "Failed to delete lead";
      const isPermissionError = errorMessage.includes("permission") || 
                               errorMessage.includes("Permission") ||
                               errorMessage.includes("creator") ||
                               errorMessage.includes("Administrator") ||
                               errorMessage.includes("Sales Manager");
      
      toast({
        title: isPermissionError ? "Permission Denied" : "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  if (!isOpen) return null;
  
  const handleSave = (values: UpdateLeadFormValues) => {
    updateLeadMutation.mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setIsEditing(false);
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{data?.name || 'Lead Details'}</DialogTitle>
          {data && !isLoading && !error && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsEditing(!isEditing)}
              disabled={updateLeadMutation.isPending}
            >
              {isEditing ? (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </>
              )}
            </Button>
          )}
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : error ? (
          <div className="text-red-500">Error loading lead details</div>
        ) : data ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              {isEditing ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium">Basic Information</h3>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="company"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="New">New</SelectItem>
                                  <SelectItem value="Qualified">Qualified</SelectItem>
                                  <SelectItem value="In Progress">In Progress</SelectItem>
                                  <SelectItem value="Converted">Converted</SelectItem>
                                  <SelectItem value="Lost">Lost</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="source"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Source</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a source" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Website">Website</SelectItem>
                                  <SelectItem value="Referral">Referral</SelectItem>
                                  <SelectItem value="Social Media">Social Media</SelectItem>
                                  <SelectItem value="Event">Event</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>


                    <div>
                      <h3 className="text-lg font-medium">Project Information</h3>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <FormField
                          control={form.control}
                          name="projectName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Project Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="budget"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Budget</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter project budget (฿)" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="productRegister"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="productRegister"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product Register</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">End User Information</h3>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <FormField
                          control={form.control}
                          name="endUserOrganization"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End User Organization</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="endUserContact"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End User Contact</FormLabel>
                              <FormControl>
                                <Textarea 
                                  className="min-h-[100px]" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">Partner Information</h3>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <FormField
                          control={form.control}
                          name="partnerContact"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Partner Contact</FormLabel>
                              <FormControl>
                                <Textarea 
                                  className="min-h-[100px]" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
              
                    <div>
                      <h3 className="text-lg font-medium">Record Information</h3>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <p className="text-sm text-gray-500">Created Date</p>
                          <p>{data.createdAt ? format(new Date(data.createdAt), 'PPP p') : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Last Updated</p>
                          <p>{data.updatedAt ? format(new Date(data.updatedAt), 'PPP p') : 'Same as created'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Created By</p>
                          <p>{data.createdBy || 'Admin User'}</p>
                        </div>
                      </div>
                    </div>
              
                    <Button 
                      type="submit" 
                      className="w-full mt-6"
                      disabled={updateLeadMutation.isPending}
                    >
                      {updateLeadMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              ) : (
                <>
                  <div>
                    <h3 className="text-lg font-medium">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p>{data.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Company</p>
                        <p>{data.company}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p>{data.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p>{data.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p>{data.status}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Source</p>
                        <p>{data.source}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Project Information</h3>
                    <div className="grid grid-cols-1 gap-4 mb-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Project Name</h3>
                        <p className="mt-1">{data?.projectName || "Not specified"}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Budget</h3>
                        <p className="mt-1">{data?.budget ? data.budget : "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Product Register</p>
                        <p>{data.productRegister || data.product || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">End User Information</h3>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <p className="text-sm text-gray-500">End User Organization</p>
                        <p>{data.endUserOrganization || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">End User Contact</p>
                        <p className="whitespace-pre-line">{data.endUserContact || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Partner Information</h3>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <p className="text-sm text-gray-500">Partner Company</p>
                        <p>{data.company || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Partner Contact</p>
                        <p className="whitespace-pre-line">{data.partnerContact || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Record Information</h3>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <p className="text-sm text-gray-500">Created Date</p>
                        <p>{data.createdAt ? format(new Date(data.createdAt), 'PPP p') : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Last Updated</p>
                        <p>{data.updatedAt ? format(new Date(data.updatedAt), 'PPP p') : 'Same as created'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Created By</p>
                        <p>{data.createdBy || 'Admin User'}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

            </TabsContent>

            <TabsContent value="tasks">
              {leadId && <TaskList leadId={leadId} />}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No lead data available
          </div>
        )}

        <DialogFooter className="flex justify-between">
          <div>
            {data && !isEditing && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={deleteLeadMutation.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
        
        {/* Confirmation dialog for deleting lead */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  Confirm Deletion
                </div>
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this lead? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                disabled={deleteLeadMutation.isPending}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteLeadMutation.mutate()}
                disabled={deleteLeadMutation.isPending}
                className="bg-red-500 hover:bg-red-600"
              >
                {deleteLeadMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
};


