import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertLeadSchema, leadSourceEnum } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";

const formSchema = insertLeadSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().min(1, "Company is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(6, "Phone number is required"),
  source: leadSourceEnum,
  product: z.string().optional(),
  endUserContact: z.string().optional(),
  endUserOrganization: z.string().optional(),
  projectName: z.string().optional(),
  budget: z.string().optional(),
  customSource: z.string().optional(),
  productRegister: z.string().optional(),
  partnerContactName: z.string().optional(),
  partnerCompany: z.string().optional(),
});

interface AddLeadFormProps {
  inDialog?: boolean;
}

export const AddLeadForm = ({ inDialog = false }: AddLeadFormProps) => {
  const { toast } = useToast();
  const [showCustomSource, setShowCustomSource] = useState(false);
  const [endUserOrganizations, setEndUserOrganizations] = useState<ComboboxOption[]>([]);
  const [partnerCompanies, setPartnerCompanies] = useState<ComboboxOption[]>([]);
  const [sourcesOptions, setSourcesOptions] = useState<ComboboxOption[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      phone: "",
      source: "Website",
      status: "New",
      product: "",
      endUserContact: "",
      endUserOrganization: "",
      projectName: "",
      budget: "",
      customSource: "",
      productRegister: "",
      partnerContactName: "",
      partnerCompany: "",
    },
  });
  
  // We no longer need this effect since we're using the combobox for sources
  // and allowing custom values directly

  // Fetch existing organizations, companies, and sources for the dropdowns
  useEffect(() => {
    // In a real app, this would be an API call to get existing data
    // For now, we'll use some sample data and localStorage to persist user additions
    const loadSavedOptions = () => {
      const savedOrgs = localStorage.getItem('endUserOrganizations');
      const savedCompanies = localStorage.getItem('partnerCompanies');
      const savedSources = localStorage.getItem('leadSources');
      
      if (savedOrgs) {
        setEndUserOrganizations(JSON.parse(savedOrgs));
      } else {
        // Default sample data
        const defaultOrgs = [
          { value: 'Softnix Technology', label: 'Softnix Technology' },
          { value: 'ABC Corporation', label: 'ABC Corporation' },
          { value: 'XYZ Industries', label: 'XYZ Industries' },
        ];
        setEndUserOrganizations(defaultOrgs);
        localStorage.setItem('endUserOrganizations', JSON.stringify(defaultOrgs));
      }
      
      if (savedCompanies) {
        setPartnerCompanies(JSON.parse(savedCompanies));
      } else {
        // Default sample data
        const defaultCompanies = [
          { value: 'Acme Partners', label: 'Acme Partners' },
          { value: 'Global Solutions', label: 'Global Solutions' },
          { value: 'Tech Innovators', label: 'Tech Innovators' },
        ];
        setPartnerCompanies(defaultCompanies);
        localStorage.setItem('partnerCompanies', JSON.stringify(defaultCompanies));
      }
      
      if (savedSources) {
        setSourcesOptions(JSON.parse(savedSources));
      } else {
        // Default sample data based on the enum values
        const defaultSources = [
          { value: 'Website', label: 'Website' },
          { value: 'Referral', label: 'Referral' },
          { value: 'Social Media', label: 'Social Media' },
          { value: 'Event', label: 'Event' },
          { value: 'Other', label: 'Other' },
        ];
        setSourcesOptions(defaultSources);
        localStorage.setItem('leadSources', JSON.stringify(defaultSources));
      }
    };
    
    loadSavedOptions();
  }, []);

  // Function to add a new organization to the list
  const addEndUserOrganization = (newOrg: string) => {
    const newOption = { value: newOrg, label: newOrg };
    const updatedOptions = [...endUserOrganizations, newOption];
    setEndUserOrganizations(updatedOptions);
    localStorage.setItem('endUserOrganizations', JSON.stringify(updatedOptions));
    return newOrg;
  };

  // Function to add a new partner company to the list
  const addPartnerCompany = (newCompany: string) => {
    const newOption = { value: newCompany, label: newCompany };
    const updatedOptions = [...partnerCompanies, newOption];
    setPartnerCompanies(updatedOptions);
    localStorage.setItem('partnerCompanies', JSON.stringify(updatedOptions));
    return newCompany;
  };
  
  // Function to add a new source to the list
  const addSource = (newSource: string) => {
    const newOption = { value: newSource, label: newSource };
    const updatedOptions = [...sourcesOptions, newOption];
    setSourcesOptions(updatedOptions);
    localStorage.setItem('leadSources', JSON.stringify(updatedOptions));
    return newSource;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return apiRequest("POST", "/api/leads", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/metrics'] });
      toast({
        title: "Lead added successfully",
        description: "The new lead has been added to the system",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to add lead",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Prepare data for submission
    const dataToSubmit = { ...values };
    
    // Remove custom fields that aren't in the original schema
    delete dataToSubmit.customSource;
    
    // Make sure we handle the new fields properly
    // These fields need to be mapped to the existing schema fields or added to the backend
    dataToSubmit.product = dataToSubmit.product || dataToSubmit.productRegister || "";
    
    // Remove custom fields that aren't in the original schema
    delete dataToSubmit.productRegister;
    delete dataToSubmit.partnerContactName;
    delete dataToSubmit.partnerCompany;
    
    mutate(dataToSubmit);
  }

  const formContent = (
    <>
      <h2 className="text-xl font-semibold mb-6">Add New Lead</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            
            {/* Section 1: Project Information */}
            <div>
              <h3 className="text-lg font-medium mb-2">Project Information</h3>
              <Separator className="mb-4" />
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="projectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter project name" {...field} />
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
                      <FormLabel>Product Register</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter product register details" 
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
            
            {/* Section 2: End User */}
            <div>
              <h3 className="text-lg font-medium mb-2">End User</h3>
              <Separator className="mb-4" />
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="endUserContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Contact</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter customer contact details" 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endUserOrganization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End User Organization</FormLabel>
                      <FormControl>
                        <Combobox
                          options={endUserOrganizations}
                          value={field.value || ''}
                          onChange={(value) => {
                            if (!endUserOrganizations.some(opt => opt.value === value)) {
                              // If it's a new value, add it to the options
                              field.onChange(addEndUserOrganization(value));
                            } else {
                              field.onChange(value);
                            }
                          }}
                          placeholder="Select or add organization"
                          emptyMessage="No organization found"
                          allowCreate={true}
                          createMessage="Add new organization"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Section 3: Partner */}
            <div>
              <h3 className="text-lg font-medium mb-2">Partner</h3>
              <Separator className="mb-4" />
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="partnerCompany"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partner Company</FormLabel>
                      <FormControl>
                        <Combobox
                          options={partnerCompanies}
                          value={field.value || ''}
                          onChange={(value) => {
                            if (!partnerCompanies.some(opt => opt.value === value)) {
                              // If it's a new value, add it to the options
                              field.onChange(addPartnerCompany(value));
                            } else {
                              field.onChange(value);
                            }
                          }}
                          placeholder="Select or add partner company"
                          emptyMessage="No company found"
                          allowCreate={true}
                          createMessage="Add new company"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="partnerContactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partner Contact Name</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter partner contact details" 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sources</FormLabel>
                      <FormControl>
                        <Combobox
                          options={sourcesOptions}
                          value={field.value || ''}
                          onChange={(value) => {
                            if (!sourcesOptions.some(opt => opt.value === value)) {
                              // If it's a new value, add it to the options
                              field.onChange(addSource(value));
                            } else {
                              field.onChange(value);
                            }
                          }}
                          placeholder="Select or add source"
                          emptyMessage="No source found"
                          allowCreate={true}
                          createMessage="Add new source"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full mt-6" 
              variant="gradient"
              disabled={isPending}
            >
              {isPending ? "Adding..." : "Add Lead"}
            </Button>
          </form>
        </Form>
    </>
  );

  // If used in a dialog, return just the form content
  if (inDialog) {
    return formContent;
  }

  // If used in the dashboard, wrap in a card
  return (
    <Card className="bg-white h-full">
      <CardContent className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        {formContent}
      </CardContent>
    </Card>
  );
};

export default AddLeadForm;
